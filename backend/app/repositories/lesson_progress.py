from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.lesson_progress import LessonProgress

async def get_progress(db: AsyncSession, user_id: int, lesson_id: int) -> Optional[LessonProgress]:
    """Get progress for a specific user and lesson."""
    result = await db.execute(
        select(LessonProgress).where(
            and_(
                LessonProgress.user_id == user_id,
                LessonProgress.lesson_id == lesson_id
            )
        )
    )
    return result.scalars().first()

async def get_user_progress(db: AsyncSession, user_id: int) -> List[LessonProgress]:
    """Get all lesson progress records for a user."""
    result = await db.execute(
        select(LessonProgress).where(LessonProgress.user_id == user_id)
    )
    return result.scalars().all()

async def create_progress(db: AsyncSession, progress_data: LessonProgress) -> LessonProgress:
    """Create a new progress record."""
    db.add(progress_data)
    await db.commit()
    await db.refresh(progress_data)
    return progress_data

async def update_progress(db: AsyncSession, progress: LessonProgress) -> LessonProgress:
    """Update an existing progress record."""
    await db.commit()
    await db.refresh(progress)
    return progress

async def delete_progress(db: AsyncSession, progress: LessonProgress) -> None:
    """Delete a progress record."""
    await db.delete(progress)
    await db.commit()
