from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonRead
from app.services import lesson as lesson_service

router = APIRouter()

@router.post("/", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_in: LessonCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Create a new lesson. Admin/Instructor only."""
    try:
        return await lesson_service.create_lesson(db, lesson_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/module/{module_id}", response_model=List[LessonRead])
async def read_lessons_by_module(
    module_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve lessons for a module."""
    return await lesson_service.get_lessons_by_module(db, module_id)

@router.get("/{lesson_id}", response_model=LessonRead)
async def read_lesson(
    lesson_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get lesson by ID."""
    lesson = await lesson_service.get_lesson(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.put("/{lesson_id}", response_model=LessonRead)
async def update_lesson(
    lesson_id: int, 
    lesson_in: LessonUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update a lesson. Admin/Instructor only."""
    try:
        return await lesson_service.update_lesson(db, lesson_id, lesson_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete a lesson. Admin/Instructor only."""
    try:
        await lesson_service.delete_lesson(db, lesson_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
