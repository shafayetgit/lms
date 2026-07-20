from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lesson import Lesson

async def create_lesson(db: AsyncSession, lesson: Lesson) -> Lesson:
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson

async def get_lesson_by_id(db: AsyncSession, lesson_id: int | str) -> Lesson | None:
    if isinstance(lesson_id, str):
        result = await db.execute(select(Lesson).where(Lesson.public_id == lesson_id))
    else:
        result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    return result.scalars().first()

async def get_lesson_by_slug(db: AsyncSession, slug: str) -> Lesson | None:
    result = await db.execute(select(Lesson).where(Lesson.slug == slug))
    return result.scalars().first()

async def get_lesson_by_slug_and_chapter(db: AsyncSession, slug: str, chapter_id: int | str) -> Lesson | None:
    if isinstance(chapter_id, str):
        from app.models.chapter import Chapter
        result = await db.execute(
            select(Lesson).join(Lesson.chapter).where(Lesson.slug == slug, Chapter.public_id == chapter_id)
        )
    else:
        result = await db.execute(
            select(Lesson).where(Lesson.slug == slug, Lesson.chapter_id == chapter_id)
        )
    return result.scalars().first()

async def get_lessons_by_chapter(db: AsyncSession, chapter_id: int | str) -> list[Lesson]:
    if isinstance(chapter_id, str):
        from app.models.chapter import Chapter
        result = await db.execute(
            select(Lesson).join(Lesson.chapter).where(Chapter.public_id == chapter_id).order_by(Lesson.order_index)
        )
    else:
        result = await db.execute(
            select(Lesson).where(Lesson.chapter_id == chapter_id).order_by(Lesson.order_index)
        )
    return result.scalars().all()

async def update_lesson(db: AsyncSession, lesson: Lesson) -> Lesson:
    await db.commit()
    await db.refresh(lesson)
    return lesson

async def delete_lesson(db: AsyncSession, lesson: Lesson):
    await db.delete(lesson)
    await db.commit()
