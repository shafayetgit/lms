from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.lesson_progress import (
    LessonProgressRead, 
    LessonProgressUpdate,
    LessonProgressCreate
)
from app.services import lesson_progress as service

router = APIRouter()

@router.get("/user/{user_id}", response_model=List[LessonProgressRead])
async def read_user_progress(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """
    Get all lesson progress for a specific user.
    Accessible only by Admin and Instructors.
    """
    return await service.get_user_all_progress(db, user_id=user_id)

@router.get("/user/{user_id}/lesson/{lesson_id}", response_model=LessonProgressRead)
async def read_specific_progress(
    user_id: int,
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """
    Get progress for a specific user and lesson.
    Accessible only by Admin and Instructors.
    """
    progress = await service.get_or_create_progress(db, user_id=user_id, lesson_id=lesson_id)
    return progress

@router.patch("/user/{user_id}/lesson/{lesson_id}", response_model=LessonProgressRead)
async def update_progress(
    user_id: int,
    lesson_id: int,
    update_data: LessonProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """
    Update progress for a specific user and lesson.
    Accessible only by Admin and Instructors.
    """
    try:
        return await service.update_lesson_progress(
            db, 
            user_id=user_id, 
            lesson_id=lesson_id, 
            update_data=update_data
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/user/{user_id}/lesson/{lesson_id}/complete", response_model=LessonProgressRead)
async def complete_lesson(
    user_id: int,
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """
    Mark a lesson as completed for a user.
    Accessible only by Admin and Instructors.
    """
    return await service.handle_lesson_completion(db, user_id=user_id, lesson_id=lesson_id)
