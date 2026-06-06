from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.api.deps import get_db, get_current_active_user
from app.schemas.quiz_attempt import (
    QuizAttemptCreate, 
    QuizAttemptRead, 
    QuizAttemptDetail, 
    QuizAttemptSubmit,
    QuizAttemptListResponse
)
from app.core.responses import read_response
from fastapi import Query
from app.services import quiz_attempt as attempt_service
from app.models.user import User
from app.core.responses import create_response, read_response, update_response, delete_response

router = APIRouter()

@router.post("/", response_model=QuizAttemptRead, status_code=status.HTTP_201_CREATED)
async def start_quiz_attempt(
    attempt_in: QuizAttemptCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        attempt = await attempt_service.start_attempt(db, current_user.id, attempt_in)
        return create_response(QuizAttemptRead.model_validate(attempt).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{attempt_id}/submit", response_model=QuizAttemptRead)
async def submit_quiz_attempt(
    attempt_id: int,
    submit_in: QuizAttemptSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        attempt = await attempt_service.submit_attempt(db, attempt_id, submit_in, current_user.id)
        return update_response(QuizAttemptRead.model_validate(attempt).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/my-attempts", response_model=List[QuizAttemptRead])
async def read_my_attempts(
    quiz_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    attempts = await attempt_service.get_my_attempts(db, current_user.id, quiz_id)
    items = [QuizAttemptRead.model_validate(a).model_dump(by_alias=False) for a in attempts]
    return read_response({"data": items})

@router.get("/", response_model=QuizAttemptListResponse)
async def read_quiz_attempts(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    quiz_id: Optional[int] = None,
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get paginated quiz attempts (Admin/Instructor)."""
    if current_user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    data = await attempt_service.get_attempts(
        db, page=page, size=size, quiz_id=quiz_id, user_id=user_id
    )
    return read_response(data)

@router.get("/{attempt_id}", response_model=QuizAttemptDetail)
async def read_quiz_attempt(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    attempt = await attempt_service.get_attempt(db, attempt_id, current_user.id)
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    # Check ownership or admin status
    if attempt.user_id != current_user.id and current_user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this attempt")
    return read_response({"data": QuizAttemptDetail.model_validate(attempt).model_dump(by_alias=False)})
