from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.lesson_progress import LessonProgress
from app.schemas.lesson_progress import LessonProgressCreate, LessonProgressUpdate
from app.repositories import lesson_progress as repo
from app.repositories import lesson as lesson_repo

async def get_or_create_progress(
    db: AsyncSession, 
    user_id: int, 
    lesson_id: int
) -> LessonProgress:
    """Get existing progress or create a new one for a user and lesson."""
    progress = await repo.get_progress(db, user_id, lesson_id)
    
    if not progress:
        # Verify lesson exists
        lesson = await lesson_repo.get_lesson_by_id(db, lesson_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson with id {lesson_id} not found"
            )
        
        progress = LessonProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            current_time=0,
            is_completed=False
        )
        progress = await repo.create_progress(db, progress)
    
    return progress

async def update_lesson_progress(
    db: AsyncSession,
    user_id: int,
    lesson_id: int,
    update_data: LessonProgressUpdate
) -> LessonProgress:
    """Update progress for a lesson. Handles auto-completion timestamp."""
    progress = await get_or_create_progress(db, user_id, lesson_id)
    
    if update_data.current_time is not None:
        progress.current_time = update_data.current_time
        
    if update_data.is_completed is not None:
        # If transitioning to completed, set completed_at
        if update_data.is_completed and not progress.is_completed:
            progress.completed_at = datetime.now(timezone.utc)
        elif not update_data.is_completed:
            progress.completed_at = None
        progress.is_completed = update_data.is_completed
    
    return await repo.update_progress(db, progress)

async def get_user_all_progress(db: AsyncSession, user_id: int) -> List[LessonProgress]:
    """Get all progress records for a user."""
    return await repo.get_user_progress(db, user_id)

async def handle_lesson_completion(db: AsyncSession, user_id: int, lesson_id: int) -> LessonProgress:
    """Mark a lesson as completed."""
    return await update_lesson_progress(
        db, 
        user_id, 
        lesson_id, 
        LessonProgressUpdate(is_completed=True)
    )
