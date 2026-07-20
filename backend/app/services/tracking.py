from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Sequence

from app.models.tracking import LessonNote, VideoWatchDuration, CourseInterest, RelatedCourse
from app.schemas.tracking import (
    LessonNoteCreate, 
    LessonNoteRead,
    WatchDurationUpdate, 
    CourseInterestCreate,
    RelatedCoursesBulkUpdate
)
from app.repositories import tracking as tracking_repo
from app.repositories import course as course_repo
from app.repositories import lesson as lesson_repo

# ---------------- LESSON NOTES ---------------- #
async def upsert_note(db: AsyncSession, member_id: int, note_in: LessonNoteCreate) -> LessonNoteRead:
    lesson = await lesson_repo.get_lesson_by_id(db, note_in.lesson_public_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    note = await tracking_repo.get_note(db, member_id, lesson.id)
    if note:
        note.note = note_in.note
        note = await tracking_repo.update_note(db, note)
    else:
        new_note = LessonNote(
            member_id=member_id,
            lesson_id=lesson.id,
            note=note_in.note
        )
        note = await tracking_repo.create_note(db, new_note)
        
    return LessonNoteRead(
        public_id=note.public_id,
        lesson_public_id=lesson.public_id,
        note=note.note
    )

# ---------------- WATCH DURATION ---------------- #
async def upsert_watch_duration(db: AsyncSession, member_id: int, duration_in: WatchDurationUpdate) -> VideoWatchDuration:
    lesson = await lesson_repo.get_lesson_by_id(db, duration_in.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    duration = await tracking_repo.get_watch_duration(db, member_id, duration_in.lesson_id)
    if duration:
        duration.duration_seconds = max(duration.duration_seconds, duration_in.duration_seconds)
        return await tracking_repo.update_watch_duration(db, duration)
    else:
        new_duration = VideoWatchDuration(
            member_id=member_id,
            lesson_id=duration_in.lesson_id,
            duration_seconds=duration_in.duration_seconds
        )
        return await tracking_repo.create_watch_duration(db, new_duration)

# ---------------- COURSE INTEREST ---------------- #
async def register_interest(db: AsyncSession, interest_in: CourseInterestCreate) -> CourseInterest:
    course = await course_repo.get_course_by_id(db, interest_in.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    existing = await tracking_repo.get_interest_by_email_and_course(db, interest_in.user_email, interest_in.course_id)
    if existing:
        return existing
        
    interest = CourseInterest(**interest_in.model_dump())
    return await tracking_repo.create_interest(db, interest)

# ---------------- RELATED COURSES ---------------- #
async def bulk_update_related_courses(
    db: AsyncSession, course_id: int, update_in: RelatedCoursesBulkUpdate
) -> Sequence[RelatedCourse]:
    course = await course_repo.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    related_list = []
    for item in update_in.related_courses:
        if item.related_course_id == course_id:
            raise HTTPException(status_code=400, detail="A course cannot be related to itself")
            
        rel_course = await course_repo.get_course_by_id(db, item.related_course_id)
        if not rel_course:
            raise HTTPException(status_code=404, detail=f"Related course ID {item.related_course_id} not found")
            
        related_list.append(
            RelatedCourse(
                course_id=course_id,
                related_course_id=item.related_course_id,
                order_index=item.order_index
            )
        )
        
    return await tracking_repo.replace_related_courses(db, course_id, related_list)
