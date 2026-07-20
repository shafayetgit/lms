from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from sqlalchemy import select, func
from app.models.course_progress import CourseProgress
from app.schemas.course_progress import CourseProgressCreate, CourseProgressUpdate
from app.repositories import course_progress as repo
from app.repositories import lesson as lesson_repo

async def get_or_create_progress(
    db: AsyncSession, 
    user_id: int, 
    lesson_id: int
) -> CourseProgress:
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
        
        progress = CourseProgress(
            user_id=user_id,
            lesson_id=lesson_id,
            course_id=lesson.course_id,
            current_time=0,
            is_completed=False
        )
        progress = await repo.create_progress(db, progress)
        from app.services.badge import process_badges
        await process_badges(db, progress, event="New")
    
    return progress

async def update_course_progress(
    db: AsyncSession,
    user_id: int,
    lesson_id: int,
    update_data: CourseProgressUpdate
) -> CourseProgress:
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
    
    from app.services.badge import process_badges
    await process_badges(db, progress, event="Value Change")
    updated_progress = await repo.update_progress(db, progress)
    await recalculate_enrollment_progress(db, user_id=user_id, course_id=progress.course_id)
    return updated_progress

async def recalculate_enrollment_progress(db: AsyncSession, user_id: int, course_id: int):
    """Recalculate enrollment progress for a user and course."""
    from app.models.lesson import Lesson
    from app.models.enrollment import Enrollment, EnrollmentStatus

    # Count total active lessons in the course
    total_lessons_stmt = select(func.count(Lesson.id)).where(
        Lesson.course_id == course_id,
        Lesson.is_active == True
    )
    total_lessons_res = await db.execute(total_lessons_stmt)
    total_lessons = total_lessons_res.scalar() or 0

    if total_lessons == 0:
        return

    # Count completed lessons for the user in this course
    completed_lessons_stmt = select(func.count(CourseProgress.id)).where(
        CourseProgress.user_id == user_id,
        CourseProgress.course_id == course_id,
        CourseProgress.is_completed == True
    )
    completed_lessons_res = await db.execute(completed_lessons_stmt)
    completed_lessons = completed_lessons_res.scalar() or 0

    # Calculate percentage
    progress_percent = min(100.0, round((completed_lessons / total_lessons) * 100, 2))

    # Update the enrollment
    enrollment_stmt = select(Enrollment).where(
        Enrollment.user_id == user_id,
        Enrollment.course_id == course_id
    )
    enrollment_res = await db.execute(enrollment_stmt)
    enrollment = enrollment_res.scalars().first()
    if enrollment:
        enrollment.progress = progress_percent
        if progress_percent >= 100.0:
            enrollment.status = EnrollmentStatus.COMPLETED
            if not enrollment.completed_at:
                enrollment.completed_at = datetime.now(timezone.utc)
                await db.commit()
                # Notify user on course completion
                from app.models.course import Course
                from app.services import notification as notification_service
                course_res = await db.execute(select(Course).where(Course.id == course_id))
                course = course_res.scalar_one_or_none()
                course_title = course.title if course else "your course"
                await notification_service.create_notification(
                    db=db,
                    user_id=user_id,
                    title="Course Completed! 🎉",
                    message=f"Congratulations! You have successfully completed \"{course_title}\".",
                    link="/academy/courses"
                )
                return
        await db.commit()

async def get_user_all_progress(db: AsyncSession, user_id: int) -> List[CourseProgress]:
    """Get all progress records for a user."""
    return await repo.get_user_progress(db, user_id)

async def handle_lesson_completion(db: AsyncSession, user_id: int, lesson_id: int) -> CourseProgress:
    """Mark a lesson as completed."""
    return await update_course_progress(
        db, 
        user_id, 
        lesson_id, 
        CourseProgressUpdate(is_completed=True)
    )
