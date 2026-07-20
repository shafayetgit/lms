from typing import Sequence, Optional, List
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tracking import LessonNote, VideoWatchDuration, CourseInterest, RelatedCourse

# ---------------- LESSON NOTES ---------------- #
async def get_note(db: AsyncSession, member_id: int, lesson_id: int) -> Optional[LessonNote]:
    query = select(LessonNote).where(
        LessonNote.member_id == member_id,
        LessonNote.lesson_id == lesson_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_note(db: AsyncSession, note: LessonNote) -> LessonNote:
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note

async def update_note(db: AsyncSession, note: LessonNote) -> LessonNote:
    await db.commit()
    await db.refresh(note)
    return note

# ---------------- WATCH DURATION ---------------- #
async def get_watch_duration(db: AsyncSession, member_id: int, lesson_id: int) -> Optional[VideoWatchDuration]:
    query = select(VideoWatchDuration).where(
        VideoWatchDuration.member_id == member_id,
        VideoWatchDuration.lesson_id == lesson_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def create_watch_duration(db: AsyncSession, duration: VideoWatchDuration) -> VideoWatchDuration:
    db.add(duration)
    await db.commit()
    await db.refresh(duration)
    return duration

async def update_watch_duration(db: AsyncSession, duration: VideoWatchDuration) -> VideoWatchDuration:
    await db.commit()
    await db.refresh(duration)
    return duration

# ---------------- COURSE INTEREST ---------------- #
async def create_interest(db: AsyncSession, interest: CourseInterest) -> CourseInterest:
    db.add(interest)
    await db.commit()
    await db.refresh(interest)
    return interest

async def get_interest_by_email_and_course(db: AsyncSession, email: str, course_id: int) -> Optional[CourseInterest]:
    query = select(CourseInterest).where(
        CourseInterest.user_email == email,
        CourseInterest.course_id == course_id
    )
    result = await db.execute(query)
    return result.scalar_one_or_none()

# ---------------- RELATED COURSES ---------------- #
async def get_related_courses(db: AsyncSession, course_id: int) -> Sequence[RelatedCourse]:
    query = select(RelatedCourse).where(RelatedCourse.course_id == course_id).order_by(RelatedCourse.order_index)
    result = await db.execute(query)
    return result.scalars().all()

async def replace_related_courses(db: AsyncSession, course_id: int, related_courses: List[RelatedCourse]) -> Sequence[RelatedCourse]:
    await db.execute(delete(RelatedCourse).where(RelatedCourse.course_id == course_id))
    db.add_all(related_courses)
    await db.commit()
    return await get_related_courses(db, course_id)
