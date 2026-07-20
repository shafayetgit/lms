from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_db
from app.core.dependencies import PermissionChecker
from app.schemas.quiz import (
    QuizCreate,
    QuizUpdate,
    QuizRead,
    QuizDetail,
    QuizListResponse,
)
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionRead
from app.services.quiz import QuizService
from app.services import question as question_service
from app.repositories import quiz as quiz_repo
from app.core.responses import create_response, read_response, update_response, delete_response

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker("quiz", "create"))],
)
async def create_quiz(quiz_in: QuizCreate, db: AsyncSession = Depends(get_db)):
    """Create a new quiz."""
    try:
        quiz = await QuizService.create_quiz(db, quiz_in)
        return create_response(QuizRead.model_validate(quiz).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=QuizListResponse)
async def read_quizzes(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    is_active: bool | None = None,
    course_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("quiz", "read")),
):
    """Get all quizzes (filtered by owner if only_if_creator is enforced)."""
    owner_id = (
        current_user.id
        if current_user and getattr(current_user, "_requires_creator_check", False)
        else None
    )
    data = await QuizService.get_quizzes(
        db, page=page, size=size, term=term, is_active=is_active, course_id=course_id, owner_id=owner_id
    )
    return read_response(data)


@router.get("/{quiz_id}", response_model=QuizDetail)
async def read_quiz(
    quiz_id: int | str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("quiz", "read")),
):
    """Get quiz details including questions."""
    quiz_res = await QuizService.get_quiz(db, quiz_id)
    if not quiz_res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
        )
    quiz_data = quiz_res["data"]
    if current_user and getattr(current_user, "_requires_creator_check", False):
        if quiz_data.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this quiz"
            )

    quiz_pydantic = QuizDetail.model_validate(quiz_data)
    return read_response({"data": quiz_pydantic.model_dump(by_alias=False)})


@router.put("/{quiz_id}", response_model=QuizRead)
async def update_quiz(
    quiz_id: int | str,
    quiz_in: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("quiz", "update")),
):
    """Update quiz."""
    quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    if current_user and getattr(current_user, "_requires_creator_check", False):
        if quiz.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the creator of this quiz"
            )

    try:
        updated_quiz = await QuizService.update_quiz(db, quiz.id, quiz_in)
        return update_response(QuizRead.model_validate(updated_quiz).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: int | str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("quiz", "delete")),
):
    """Delete quiz."""
    quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    if current_user and getattr(current_user, "_requires_creator_check", False):
        if quiz.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the creator of this quiz"
            )

    try:
        await QuizService.delete_quiz(db, quiz.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/course/{course_id}", response_model=QuizListResponse)
async def read_course_quizzes(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("quiz", "read")),
):
    """Get all quizzes for a course."""
    owner_id = (
        current_user.id
        if current_user and getattr(current_user, "_requires_creator_check", False)
        else None
    )
    data = await QuizService.get_quizzes(db, course_id=course_id, size=100, owner_id=owner_id)
    return read_response(data)


# ── Quiz-scoped Question endpoints ──

@router.post(
    "/{quiz_id}/questions",
    status_code=status.HTTP_201_CREATED,
)
async def add_question(
    quiz_id: int | str,
    question_in: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("question", "create")),
):
    """Add a question with choices to a quiz."""
    try:
        quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
        if not quiz:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

        question_in.quiz_id = quiz.id
        question = await question_service.create_question(db, question_in, current_user.id)
        return create_response(QuestionRead.model_validate(question).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/{quiz_id}/questions/reorder", status_code=status.HTTP_200_OK)
async def reorder_quiz_questions(
    quiz_id: int | str,
    order: List[dict] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("question", "update")),
):
    """Bulk reorder questions within a quiz. Expects [{id, order_index}, ...]"""
    quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    await question_service.reorder_questions(db, quiz.id, order)
    return update_response(None, message="Questions reordered successfully")


@router.put("/{quiz_id}/questions/{question_id}")
async def update_quiz_question(
    quiz_id: int | str,
    question_id: int,
    question_in: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("question", "update")),
):
    """Update a question within a quiz."""
    question = await question_service.update_question(db, question_id, question_in)
    return update_response(QuestionRead.model_validate(question).model_dump(by_alias=False))


@router.delete("/{quiz_id}/questions/{question_id}", status_code=status.HTTP_200_OK)
async def delete_quiz_question(
    quiz_id: int | str,
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("question", "delete")),
):
    """Delete a question from a quiz."""
    await question_service.delete_question(db, question_id)
    return delete_response()
