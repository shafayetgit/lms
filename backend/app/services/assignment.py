from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.models.assignment import Assignment, AssignmentSubmission, SubmissionStatus
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentSubmissionCreate,
    AssignmentSubmissionUpdate,
)
from app.repositories import assignment as assignment_repo
from app.repositories import course as course_repo

async def create_assignment(db: AsyncSession, assignment_in: AssignmentCreate) -> Assignment:
    if assignment_in.course_id is not None:
        course = await course_repo.get_course_by_id(db, assignment_in.course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

    assignment = Assignment(**assignment_in.model_dump())
    return await assignment_repo.create_assignment(db, assignment)

async def update_assignment(
    db: AsyncSession, assignment: Assignment, assignment_in: AssignmentUpdate
) -> Assignment:
    if assignment_in.course_id is not None and assignment_in.course_id != assignment.course_id:
        course = await course_repo.get_course_by_id(db, assignment_in.course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")

    update_data = assignment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assignment, field, value)

    return await assignment_repo.update_assignment(db, assignment)

async def submit_assignment(
    db: AsyncSession, assignment: Assignment, user_id: int, submission_in: AssignmentSubmissionCreate
) -> AssignmentSubmission:
    if not submission_in.answer or not str(submission_in.answer).strip():
         raise HTTPException(status_code=400, detail="Answer cannot be empty")

    existing_submission = await assignment_repo.get_submission(db, assignment.id, user_id)
    if existing_submission:
        if existing_submission.status == SubmissionStatus.ACCEPTED:
            raise HTTPException(status_code=400, detail="Assignment already accepted and graded")
        if existing_submission.status == SubmissionStatus.PENDING:
            raise HTTPException(status_code=400, detail="Assignment submission is pending review")

        # Allow resubmitting/updating for REJECTED status
        existing_submission.answer = submission_in.answer
        existing_submission.status = SubmissionStatus.PENDING
        existing_submission.grade = None
        existing_submission.comments = None
        submission = await assignment_repo.update_submission(db, existing_submission)
    else:
        submission = AssignmentSubmission(
            assignment_id=assignment.id,
            member_id=user_id,
            answer=submission_in.answer,
            status=SubmissionStatus.PENDING
        )
        submission = await assignment_repo.create_submission(db, submission)

    # When submitting, status is PENDING, so the lesson is NOT completed
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.lesson import Lesson
    from app.models.course import Course
    from app.models.user import User

    lesson_query = select(Lesson).where(Lesson.assignment_id == assignment.id).options(
        selectinload(Lesson.course).selectinload(Course.instructors)
    )
    lesson_res = await db.execute(lesson_query)
    lesson = lesson_res.scalar_one_or_none()
    
    if lesson:
        from app.services import course_progress as progress_service
        from app.schemas.course_progress import CourseProgressUpdate
        await progress_service.update_course_progress(
            db=db,
            user_id=user_id,
            lesson_id=lesson.id,
            update_data=CourseProgressUpdate(is_completed=False)
        )

        # Send notification to instructors
        if lesson.course and getattr(lesson.course, "instructors", None):
            from app.services import notification as notification_service
            
            user_query = select(User).where(User.id == user_id)
            user_res = await db.execute(user_query)
            user = user_res.scalar_one_or_none()
            student_name = f"{user.first_name or ''} {user.last_name or ''}".strip() if user else "A student"
            
            # The LMS route for checking assignment submissions
            link = f"/lms/assignments/{assignment.public_id}/submissions"
            
            for instructor in lesson.course.instructors:
                await notification_service.create_notification(
                    db=db,
                    user_id=instructor.id,
                    title="New Assignment Submission",
                    message=f"{student_name} submitted the assignment '{assignment.title}' in '{lesson.course.title}'.",
                    link=link
                )

    return submission

async def grade_submission(
    db: AsyncSession, submission: AssignmentSubmission, update_in: AssignmentSubmissionUpdate
) -> AssignmentSubmission:
    assignment = await assignment_repo.get_assignment_by_id(db, submission.assignment_id)
    # Ensure the parent assignment requires grading if grade is provided
    if update_in.grade is not None:
        if not assignment or not assignment.grade_assignment:
            raise HTTPException(status_code=400, detail="This assignment does not require grading")
            
        if update_in.grade < 0 or update_in.grade > 100:
            raise HTTPException(status_code=400, detail="Grade must be between 0 and 100")

    update_data = update_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(submission, field, value)

    submission = await assignment_repo.update_submission(db, submission)

    # Trigger a notification for the student
    if assignment:
        from sqlalchemy import select
        from sqlalchemy.orm import selectinload
        from app.models.lesson import Lesson
        from app.services import notification as notification_service

        lesson_query = select(Lesson).where(Lesson.assignment_id == assignment.id).options(selectinload(Lesson.course))
        lesson_res = await db.execute(lesson_query)
        lesson = lesson_res.scalar_one_or_none()
        
        link = None
        if lesson and lesson.course:
            link = f"/academy/courses/{lesson.course.slug}/lessons/{lesson.public_id}"
            
        status_text = submission.status.value if hasattr(submission.status, "value") else str(submission.status)
        title = f"Assignment Graded" if status_text == "Accepted" else f"Assignment {status_text}"
        
        message = f"Your submission for assignment '{assignment.title}' has been reviewed. Status: {status_text}."
        if submission.grade is not None:
            message += f" Grade: {submission.grade}/100."
        if submission.comments:
            message += f" Comments: {submission.comments}"
            
        await notification_service.create_notification(
            db=db,
            user_id=submission.member_id,
            title=title,
            message=message,
            link=link
        )

        # Update course progress based on status
        if lesson:
            from app.services import course_progress as progress_service
            from app.schemas.course_progress import CourseProgressUpdate
            
            is_completed = (
                submission.status == SubmissionStatus.ACCEPTED
                if hasattr(submission.status, "value")
                else submission.status == "Accepted"
            )
            await progress_service.update_course_progress(
                db=db,
                user_id=submission.member_id,
                lesson_id=lesson.id,
                update_data=CourseProgressUpdate(is_completed=is_completed)
            )

    return submission

async def get_revealed_answer(
    db: AsyncSession, assignment: Assignment, user_id: int
) -> Optional[str]:
    # Returns the assignment answer only if show_answer is True AND the user has submitted the assignment.
    if not assignment.show_answer:
        return None

    submission = await assignment_repo.get_submission(db, assignment.id, user_id)
    if submission:
        return assignment.answer

    return None

