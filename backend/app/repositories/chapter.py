from shlex import join

from app.models.course import Course
from sqlalchemy import select, Select
from sqlalchemy.orm import joinedload

from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chapter import Chapter


async def create_chapter(db: AsyncSession, chapter: Chapter) -> Chapter:
    db.add(chapter)
    await db.commit()
    return await get_chapter_by_id(db, chapter.id)


async def get_chapter_by_id(db: AsyncSession, chapter_id: int | str) -> Chapter | None:
    query = select(Chapter).options(
        joinedload(Chapter.course).load_only(Course.id, Course.public_id, Course.title)
    )
    if isinstance(chapter_id, str):
        query = query.where(Chapter.public_id == chapter_id)
    else:
        query = query.where(Chapter.id == chapter_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_chapters_by_course(
    db: AsyncSession, course_id: int | str, query: Select | None = None
) -> list[Chapter]:
    q = (
        query
        if query is not None
        else select(Chapter).options(
            joinedload(Chapter.course).load_only(Course.id, Course.public_id, Course.title)
        )
    )
    if isinstance(course_id, str):
        q = q.join(Chapter.course).where(Course.public_id == course_id)
    else:
        q = q.where(Chapter.course_id == course_id)

    q = q.order_by(Chapter.order_index)
    result = await db.execute(q)
    return result.scalars().all()


async def update_chapter(db: AsyncSession, chapter: Chapter) -> Chapter:
    await db.commit()
    return await get_chapter_by_id(db, chapter.id)


async def delete_chapter(db: AsyncSession, chapter: Chapter):
    await db.delete(chapter)
    await db.commit()
