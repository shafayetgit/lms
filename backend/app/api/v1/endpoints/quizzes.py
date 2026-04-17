from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api import deps
from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizRead, QuizDetail, QuestionCreate, QuestionRead
from app.services import quiz as quiz_service
from app.repositories import quiz as quiz_repo

router = APIRouter()

@router.post("/", response_model=QuizRead, status_code=status.HTTP_201_CREATED)
async def create_quiz(
    quiz_in: QuizCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Create a new quiz (Admin/Instructor only)."""
    return await quiz_service.create_quiz(db, quiz_in)

@router.get("/{quiz_id}", response_model=QuizDetail)
async def read_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get quiz details including questions."""
    return await quiz_service.get_quiz(db, quiz_id)

@router.patch("/{quiz_id}", response_model=QuizRead)
async def update_quiz(
    quiz_id: int,
    quiz_in: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update quiz (Admin/Instructor only)."""
    return await quiz_service.update_quiz(db, quiz_id, quiz_in)

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete quiz (Admin/Instructor only)."""
    await quiz_service.delete_quiz(db, quiz_id)

@router.get("/course/{course_id}", response_model=List[QuizRead])
async def read_course_quizzes(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all quizzes for a course."""
    return await quiz_repo.get_quizzes_by_course(db, course_id)

@router.post("/{quiz_id}/questions", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def add_question(
    quiz_id: int,
    question_in: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Add a question with choices to a quiz (Admin/Instructor only)."""
    return await quiz_service.add_question(db, quiz_id, question_in)
