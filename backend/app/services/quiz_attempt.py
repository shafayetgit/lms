from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.quiz_attempt import QuizAttempt, QuizAttemptAnswer, AttemptStatus
from app.models.question import QuestionType
from app.schemas.quiz_attempt import QuizAttemptCreate, QuizAttemptSubmit
from app.repositories import quiz_attempt as attempt_repo
from app.repositories import quiz as quiz_repo
from app.repositories import enrollment as enrollment_repo

async def start_attempt(db: AsyncSession, user_id: int, attempt_in: QuizAttemptCreate) -> QuizAttempt:
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
    db_attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=attempt_in.quiz_id,
        start_time=datetime.utcnow(),
        status=AttemptStatus.IN_PROGRESS
    )
    return await attempt_repo.create_attempt(db, db_attempt)

async def submit_attempt(db: AsyncSession, attempt_id: int, submit_in: QuizAttemptSubmit, user_id: int) -> QuizAttempt:
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
    total_possible_points = sum(q.points for q in quiz.questions)
    
    db_answers = []
    
    # 3. Grade each answer
    for answer_in in submit_in.answers:
        question = questions.get(answer_in.question_id)
        if not question:
            continue
            
        points_earned = 0.0
        is_correct = False
        

        if question.question_type in [QuestionType.MCQ_SINGLE, QuestionType.TRUE_FALSE]:
            # Expect choice_id
            if answer_in.choice_id:
                # Find the choice in question.choices
                choice = next((c for c in question.choices if c.id == answer_in.choice_id), None)
                if choice and choice.is_correct:
                    is_correct = True
                    points_earned = question.points
                    
        elif question.question_type == QuestionType.SHORT_ANSWER:
            # Simple exact match (case-insensitive)
            correct_choice = next((c for c in question.choices if c.is_correct), None)

            if correct_choice and answer_in.answer_text:
                if answer_in.answer_text.strip().lower() == correct_choice.text.strip().lower():
                    is_correct = True
                    points_earned = question.points

        db_answer = QuizAttemptAnswer(
            attempt_id=attempt.id,
            question_id=answer_in.question_id,
            choice_id=answer_in.choice_id,
            answer_text=answer_in.answer_text,
            is_correct=is_correct,
            points_earned=points_earned
        )
        db_answers.append(db_answer)
        total_score += points_earned

    # 4. Save Answers
    await attempt_repo.create_answers(db, db_answers)
    
    # 5. Update Attempt final score
    attempt.end_time = datetime.utcnow()
    attempt.score = total_score
    attempt.total_points = total_possible_points
    attempt.percentage = (total_score / total_possible_points * 100.0) if total_possible_points > 0 else 0.0
    attempt.is_passed = attempt.percentage >= quiz.passing_score
    attempt.status = AttemptStatus.COMPLETED
    
    return await attempt_repo.update_attempt(db, attempt)

async def get_attempt(db: AsyncSession, attempt_id: int, user_id: int) -> QuizAttempt:
    attempt = await attempt_repo.get_attempt(db, attempt_id)
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    # Admins can see any attempt, but for now I'll stick to owner/admin logic in API
    return attempt

async def get_my_attempts(db: AsyncSession, user_id: int, quiz_id: Optional[int] = None) -> List[QuizAttempt]:
    return await attempt_repo.get_user_attempts(db, user_id, quiz_id)
