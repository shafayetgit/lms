from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.responses import create_response, read_response, update_response, delete_response
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonRead, LessonReadResponse, LessonListResponse
from app.services import lesson as lesson_service
from app.api.deps import get_db, get_admin_or_instructor

router = APIRouter()

@router.post("/", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson_in: LessonCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Create a new lesson. Admin/Instructor only."""
    try:
        await lesson_service.create_lesson(db, lesson_in)
        return create_response()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/chapter/{chapter_id}", response_model=LessonListResponse)
async def read_lessons_by_chapter(
    chapter_id: str, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve lessons for a chapter."""
    data = await lesson_service.get_lessons_by_chapter(db, chapter_id)
    items = [LessonRead.model_validate(item).model_dump(by_alias=False) for item in data]
    return read_response({"data": items})

@router.get("/{lesson_id}", response_model=LessonReadResponse)
async def read_lesson(
    lesson_id: str, 
    db: AsyncSession = Depends(get_db)
):
    """Get lesson by ID."""
    lesson = await lesson_service.get_lesson(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"success": True, "data": lesson}

from fastapi import Body

@router.put("/chapter/{chapter_id}/reorder", status_code=status.HTTP_200_OK)
async def reorder_chapter_lessons(
    chapter_id: str,
    order: List[dict] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Bulk reorder lessons within a chapter. Expects [{id, order_index}, ...]"""
    await lesson_service.reorder_lessons(db, chapter_id, order)
    return update_response(None, message="Lessons reordered successfully")

@router.put("/{lesson_id}", response_model=LessonRead)
async def update_lesson(
    lesson_id: str, 
    lesson_in: LessonUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update a lesson. Admin/Instructor only."""
    try:
        await lesson_service.update_lesson(db, lesson_id, lesson_in)
        return update_response()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete a lesson. Admin/Instructor only."""
    try:
        await lesson_service.delete_lesson(db, lesson_id)
        return delete_response()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
