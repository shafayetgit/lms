from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lesson import Lesson

async def create_lesson(db: AsyncSession, lesson: Lesson) -> Lesson:
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson

async def get_lesson_by_id(db: AsyncSession, lesson_id: int) -> Lesson | None:
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    return result.scalars().first()

async def get_lesson_by_slug(db: AsyncSession, slug: str) -> Lesson | None:
    result = await db.execute(select(Lesson).where(Lesson.slug == slug))
    return result.scalars().first()

async def get_lessons_by_module(db: AsyncSession, module_id: int) -> list[Lesson]:
    result = await db.execute(
        select(Lesson).where(Lesson.module_id == module_id).order_by(Lesson.order_index)
    )
    return result.scalars().all()

async def update_lesson(db: AsyncSession, lesson: Lesson) -> Lesson:
    await db.commit()
    await db.refresh(lesson)
    return lesson

async def delete_lesson(db: AsyncSession, lesson: Lesson):
    await db.delete(lesson)
    await db.commit()
