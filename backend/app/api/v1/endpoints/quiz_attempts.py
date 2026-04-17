from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.api.deps import get_db, get_current_active_user
from app.schemas.quiz_attempt import (
    QuizAttemptCreate, 
    QuizAttemptRead, 
    QuizAttemptDetail, 
    QuizAttemptSubmit
)
from app.services import quiz_attempt as attempt_service
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=QuizAttemptRead, status_code=status.HTTP_201_CREATED)
async def start_quiz_attempt(
    attempt_in: QuizAttemptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Start a new quiz attempt."""
    return await attempt_service.start_attempt(db, current_user.id, attempt_in)

@router.post("/{attempt_id}/submit", response_model=QuizAttemptRead)
async def submit_quiz_attempt(
    attempt_id: int,
    submit_in: QuizAttemptSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit answers for a quiz attempt and get final score."""
    return await attempt_service.submit_attempt(db, attempt_id, submit_in, current_user.id)

@router.get("/my-attempts", response_model=List[QuizAttemptRead])
async def read_my_attempts(
    quiz_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all quiz attempts for the current user."""
    return await attempt_service.get_my_attempts(db, current_user.id, quiz_id)

@router.get("/{attempt_id}", response_model=QuizAttemptDetail)
async def read_quiz_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get details of a specific quiz attempt including answers."""
    attempt = await attempt_service.get_attempt(db, attempt_id, current_user.id)
    # Check ownership or admin status
    if attempt.user_id != current_user.id and current_user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this attempt")
    return attempt
