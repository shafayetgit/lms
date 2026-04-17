from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from typing import List, Optional
from app.models.discussion import Discussion

async def create_discussion(db: AsyncSession, discussion: Discussion) -> Discussion:
    db.add(discussion)
    await db.commit()
    await db.refresh(discussion)
    return discussion

async def get_discussion_by_id(db: AsyncSession, discussion_id: int) -> Optional[Discussion]:
    result = await db.execute(select(Discussion).where(Discussion.id == discussion_id))
    return result.scalars().first()

async def get_discussions_by_course(
    db: AsyncSession, course_id: int, skip: int = 0, limit: int = 100
) -> List[Discussion]:
    result = await db.execute(
        select(Discussion)
        .where(Discussion.course_id == course_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_discussions_by_lesson(
    db: AsyncSession, lesson_id: int, skip: int = 0, limit: int = 100
) -> List[Discussion]:
    result = await db.execute(
        select(Discussion)
        .where(Discussion.lesson_id == lesson_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def update_discussion(db: AsyncSession, discussion: Discussion) -> Discussion:
    await db.commit()
    await db.refresh(discussion)
    return discussion

async def delete_discussion(db: AsyncSession, discussion: Discussion) -> None:
    await db.delete(discussion)
    await db.commit()
