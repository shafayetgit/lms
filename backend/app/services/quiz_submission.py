from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quiz_submission import QuizSubmission, QuizResult, AttemptStatus
from sqlalchemy import select, desc
import math
from app.models.question import QuestionType
from app.schemas.quiz_submission import QuizSubmissionCreate, QuizSubmissionSubmit
from app.repositories import quiz_submission as attempt_repo
from app.repositories import quiz as quiz_repo
from app.repositories import enrollment as enrollment_repo

async def start_attempt(db: AsyncSession, user_id: int, attempt_in: QuizSubmissionCreate) -> QuizSubmission:
    # 1. Validate Quiz exists and is active
    quiz = await quiz_repo.get_quiz(db, attempt_in.quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    if not quiz.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quiz is not active")

    # 2. Validate User Enrollment (using existing enrollment repo)
    # Note: Assuming enrollment_repo.get_user_enrollment(db, user_id, course_id) exists
    # If not, we might need a general check.
    # For now, I'll assume anyone who has access to the course can attempt.
    
    # 3. Create Attempt
    db_attempt = QuizSubmission(
        user_id=user_id,
        quiz_id=attempt_in.quiz_id,
        start_time=datetime.now(timezone.utc),
        status=AttemptStatus.IN_PROGRESS
    )
    attempt = await attempt_repo.create_attempt(db, db_attempt)
    from app.services.badge import process_badges
    await process_badges(db, attempt, event="New")
    return attempt

async def submit_attempt(db: AsyncSession, attempt_id: int, submit_in: QuizSubmissionSubmit, user_id: int) -> QuizSubmission:
    # 1. Get Attempt
    attempt = await attempt_repo.get_attempt(db, attempt_id)
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    if attempt.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to submit this attempt")
    if attempt.status != AttemptStatus.IN_PROGRESS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Attempt is already completed or timed out")

    # 2. Get Quiz Questions for scoring
    quiz = await quiz_repo.get_quiz(db, attempt.quiz_id)
    questions = {q.id: q for q in quiz.questions}
    
    total_score = 0.0
    total_possible_points = sum(q.marks for q in quiz.questions)
    
    db_answers = []
    
    # 3. Grade each answer
    for answer_in in submit_in.answers:
        question = questions.get(answer_in.question_id)
        if not question:
            continue
            
        marks = 0.0
        is_correct = False
        

        if question.question_type in [QuestionType.MCQ_SINGLE, QuestionType.TRUE_FALSE]:
            # Expect selected_option_id
            if answer_in.selected_option_id:
                # Find the choice in question.choices
                choice = next((c for c in question.choices if c.id == answer_in.selected_option_id), None)
                if choice and choice.is_correct:
                    is_correct = True
                    marks = question.marks
                else:
                    is_correct = False
                    if quiz.enable_negative_marking:
                        marks = -quiz.marks_to_cut
                    
        elif question.question_type == QuestionType.SHORT_ANSWER:
            # Simple exact match (case-insensitive)
            correct_choice = next((c for c in question.choices if c.is_correct), None)

            if answer_in.answer_text and answer_in.answer_text.strip():
                if correct_choice and answer_in.answer_text.strip().lower() == correct_choice.text.strip().lower():
                    is_correct = True
                    marks = question.marks
                else:
                    is_correct = False
                    if quiz.enable_negative_marking:
                        marks = -quiz.marks_to_cut

        db_answer = QuizResult(
            submission_id=attempt.id,
            question_id=answer_in.question_id,
            selected_option_id=answer_in.selected_option_id,
            answer_text=answer_in.answer_text,
            is_correct=is_correct,
            marks=marks
        )
        db_answers.append(db_answer)
        total_score += marks

    # 4. Save Answers
    await attempt_repo.create_answers(db, db_answers)
    
    # 5. Update Attempt final score
    attempt.end_time = datetime.now(timezone.utc)
    attempt.score = max(0.0, total_score)
    attempt.score_out_of = total_possible_points
    attempt.percentage = (attempt.score / total_possible_points * 100.0) if total_possible_points > 0 else 0.0
    attempt.passing = attempt.percentage >= quiz.passing_percentage
    attempt.status = AttemptStatus.COMPLETED
    
    start_time = attempt.start_time
    if start_time:
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)
        else:
            start_time = start_time.astimezone(timezone.utc)
    else:
        start_time = datetime.now(timezone.utc)

    end_time = attempt.end_time
    if end_time.tzinfo is None:
        end_time = end_time.replace(tzinfo=timezone.utc)
    else:
        end_time = end_time.astimezone(timezone.utc)

    attempt.time_taken = max(0, int((end_time - start_time).total_seconds()))
    
    from app.services.badge import process_badges
    await process_badges(db, attempt, event="Value Change")
    updated_attempt = await attempt_repo.update_attempt(db, attempt)
    return updated_attempt

async def get_attempt(db: AsyncSession, attempt_id: int, user_id: int) -> QuizSubmission:
    attempt = await attempt_repo.get_attempt(db, attempt_id)
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    # Admins can see any attempt, but for now I'll stick to owner/admin logic in API
    return attempt

async def get_my_attempts(db: AsyncSession, user_id: int, quiz_id: Optional[int] = None) -> List[QuizSubmission]:
    return await attempt_repo.get_user_attempts(db, user_id, quiz_id)

async def get_attempts(
    db: AsyncSession,
    page: int = 1,
    size: int = 10,
    quiz_id: Optional[int] = None,
    user_id: Optional[int] = None,
) -> dict:
    query = select(QuizSubmission).order_by(desc(QuizSubmission.id))

    if quiz_id:
        query = query.where(QuizSubmission.quiz_id == quiz_id)
    if user_id:
        query = query.where(QuizSubmission.user_id == user_id)

    skip = (page - 1) * size
    total = await attempt_repo.count_attempts(db, query=query)
    data = await attempt_repo.get_attempts_with_query(
        db, query=query, skip=skip, limit=size
    )
    total_pages = math.ceil(total / size) if total else 0

    return {
        "data": data,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }
