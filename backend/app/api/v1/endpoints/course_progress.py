from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor, get_current_active_user
from app.schemas.course_progress import (
    CourseProgressRead, 
    CourseProgressUpdate,
    CourseProgressCreate
)
from app.services import course_progress as service

router = APIRouter()

@router.get("/my/lesson/{lesson_id}", response_model=CourseProgressRead)
async def read_my_specific_progress(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Get progress for the logged-in user and lesson.
    """
    return await service.get_or_create_progress(db, user_id=current_user.id, lesson_id=lesson_id)

@router.patch("/my/lesson/{lesson_id}", response_model=CourseProgressRead)
async def update_my_progress(
    lesson_id: int,
    update_data: CourseProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Update progress for the logged-in user and lesson.
    """
    try:
        return await service.update_course_progress(
            db, 
            user_id=current_user.id, 
            lesson_id=lesson_id, 
            update_data=update_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/my/lesson/{lesson_id}/complete", response_model=CourseProgressRead)
async def complete_my_lesson(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Mark a lesson as completed for the logged-in user.
    """
    return await service.handle_lesson_completion(db, user_id=current_user.id, lesson_id=lesson_id)

@router.get("/my", response_model=List[CourseProgressRead])
async def read_my_all_progress(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """
    Get all lesson progress records for the logged-in user.
    """
    return await service.get_user_all_progress(db, user_id=current_user.id)

@router.get("/user/{user_id}", response_model=List[CourseProgressRead])
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

@router.get("/user/{user_id}/lesson/{lesson_id}", response_model=CourseProgressRead)
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

@router.patch("/user/{user_id}/lesson/{lesson_id}", response_model=CourseProgressRead)
async def update_progress(
    user_id: int,
    lesson_id: int,
    update_data: CourseProgressUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """
    Update progress for a specific user and lesson.
    Accessible only by Admin and Instructors.
    """
    try:
        return await service.update_course_progress(
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

@router.post("/user/{user_id}/lesson/{lesson_id}/complete", response_model=CourseProgressRead)
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
