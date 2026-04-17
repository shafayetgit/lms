from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor, get_current_active_user
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionRead
from app.services import question as question_service
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_in: QuestionCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor)
):
    """Create a new question."""
    return await question_service.create_question(db, question_in, current_user.id)

@router.get("/{question_id}", response_model=QuestionRead)
async def read_question(
    question_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor)
):
    """Get question by ID."""
    return await question_service.get_question(db, question_id)

@router.put("/{question_id}", response_model=QuestionRead)
async def update_question(
    question_id: int, 
    question_in: QuestionUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor)
):
    """Update a question."""
    return await question_service.update_question(db, question_id, question_in)

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor)
):
    """Delete a question."""
    await question_service.delete_question(db, question_id)

@router.get("/quiz/{quiz_id}", response_model=List[QuestionRead])
async def read_quiz_questions(
    quiz_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor)
):
    """Get all questions for a specific quiz."""
    return await question_service.get_questions_by_quiz(db, quiz_id)
