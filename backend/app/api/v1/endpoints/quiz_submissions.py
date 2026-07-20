from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from app.api import deps
from app.api.deps import get_db, get_current_active_user, PermissionChecker
from app.schemas.quiz_submission import (
    QuizSubmissionCreate, 
    QuizSubmissionRead, 
    QuizSubmissionDetail, 
    QuizSubmissionSubmit,
    QuizSubmissionListResponse
)
from app.core.responses import read_response
from fastapi import Query
from app.services import quiz_submission as attempt_service
from app.repositories import quiz as quiz_repo
from app.models.user import User
from app.core.responses import create_response, read_response, update_response, delete_response

router = APIRouter()

@router.post("/", response_model=QuizSubmissionRead, status_code=status.HTTP_201_CREATED)
async def start_quiz_submission(
    attempt_in: QuizSubmissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        attempt = await attempt_service.start_attempt(db, current_user.id, attempt_in)
        return create_response(QuizSubmissionRead.model_validate(attempt).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{attempt_id}/submit", response_model=QuizSubmissionRead)
async def submit_quiz_submission(
    attempt_id: int,
    submit_in: QuizSubmissionSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    try:
        attempt = await attempt_service.submit_attempt(db, attempt_id, submit_in, current_user.id)
        return update_response(QuizSubmissionRead.model_validate(attempt).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/my-attempts", response_model=List[QuizSubmissionRead])
async def read_my_attempts(
    quiz_id: Optional[str | int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    resolved_quiz_id = None
    if quiz_id is not None:
        if isinstance(quiz_id, int) or (isinstance(quiz_id, str) and quiz_id.isdigit()):
            resolved_quiz_id = int(quiz_id)
        else:
            quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
            resolved_quiz_id = quiz.id if quiz else None

    attempts = await attempt_service.get_my_attempts(db, current_user.id, resolved_quiz_id)
    items = [QuizSubmissionRead.model_validate(a).model_dump(by_alias=False) for a in attempts]
    return read_response({"data": items})

@router.get("/", response_model=QuizSubmissionListResponse)
async def read_quiz_submissions(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    quiz_id: Optional[str | int] = None,
    user_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(PermissionChecker("quiz_submission", "read"))
):
    """Get paginated quiz attempts."""
    resolved_quiz_id = None
    if quiz_id is not None:
        if isinstance(quiz_id, int) or (isinstance(quiz_id, str) and quiz_id.isdigit()):
            resolved_quiz_id = int(quiz_id)
        else:
            quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
            resolved_quiz_id = quiz.id if quiz else None

    data = await attempt_service.get_attempts(
        db, page=page, size=size, quiz_id=resolved_quiz_id, user_id=user_id
    )
    return read_response(data)

@router.get("/{attempt_id}", response_model=QuizSubmissionDetail)
async def read_quiz_submission(
    attempt_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    attempt = await attempt_service.get_attempt(db, attempt_id, current_user.id)
    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")
    # Check ownership or admin/superadmin status
    if attempt.user_id != current_user.id and current_user.role not in ["admin", "superadmin", "super_admin", "instructor"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this attempt")
    return read_response({"data": QuizSubmissionDetail.model_validate(attempt).model_dump(by_alias=False)})
