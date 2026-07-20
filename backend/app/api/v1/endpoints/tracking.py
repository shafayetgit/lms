from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.tracking import (
    LessonNoteCreate, LessonNoteReadResponse, LessonNoteRead,
    WatchDurationUpdate, WatchDurationResponse,
    CourseInterestCreate, CourseInterestResponse,
    RelatedCoursesBulkUpdate, RelatedCourseResponse
)
from app.repositories import tracking as tracking_repo
from app.repositories import lesson as lesson_repo
from app.services import tracking as tracking_svc

router = APIRouter()

# ---------------- LESSON NOTES ---------------- #
@router.post("/notes", response_model=LessonNoteReadResponse)
async def upsert_note(
    *,
    db: AsyncSession = Depends(get_db),
    note_in: LessonNoteCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    data = await tracking_svc.upsert_note(db, current_user.id, note_in)
    return {
        "success": True,
        "data": data
    }

@router.get("/notes/{lesson_public_id}", response_model=LessonNoteReadResponse)
async def read_note(
    *,
    db: AsyncSession = Depends(get_db),
    lesson_public_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    lesson = await lesson_repo.get_lesson_by_id(db, lesson_public_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    note = await tracking_repo.get_note(db, current_user.id, lesson.id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    return {
        "success": True,
        "data": LessonNoteRead(
            public_id=note.public_id,
            lesson_public_id=lesson.public_id,
            note=note.note
        )
    }

# ---------------- WATCH DURATION ---------------- #
@router.post("/video", response_model=WatchDurationResponse)
async def update_watch_duration(
    *,
    db: AsyncSession = Depends(get_db),
    duration_in: WatchDurationUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    return await tracking_svc.upsert_watch_duration(db, current_user.id, duration_in)

# ---------------- COURSE INTEREST ---------------- #
@router.post("/interest", response_model=CourseInterestResponse, status_code=status.HTTP_201_CREATED)
async def register_interest(
    *,
    db: AsyncSession = Depends(get_db),
    interest_in: CourseInterestCreate
) -> Any:
    return await tracking_svc.register_interest(db, interest_in)

# ---------------- RELATED COURSES ---------------- #
@router.put("/related-courses/{course_id}", response_model=List[RelatedCourseResponse])
async def update_related_courses(
    *,
    db: AsyncSession = Depends(get_db),
    course_id: int,
    update_in: RelatedCoursesBulkUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return await tracking_svc.bulk_update_related_courses(db, course_id, update_in)
