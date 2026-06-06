from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_db, get_admin_or_instructor
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
    dependencies=[Depends(get_admin_or_instructor)],
)
async def create_quiz(quiz_in: QuizCreate, db: AsyncSession = Depends(get_db)):
    """Create a new quiz (Admin/Instructor only)."""
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
    course_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Get all quizzes."""
    data = await QuizService.get_quizzes(
        db, page=page, size=size, term=term, is_active=is_active, course_id=course_id
    )
    return read_response(data)


@router.get("/{quiz_id}", response_model=QuizDetail)
async def read_quiz(quiz_id: int, db: AsyncSession = Depends(get_db)):
    """Get quiz details including questions."""
    quiz_res = await QuizService.get_quiz(db, quiz_id)
    if not quiz_res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
        )

    quiz_pydantic = QuizDetail.model_validate(quiz_res["data"])
    return read_response({"data": quiz_pydantic.model_dump(by_alias=False)})


@router.put("/{quiz_id}", response_model=QuizRead)
async def update_quiz(
    quiz_id: int,
    quiz_in: QuizUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_admin_or_instructor),
):
    """Update quiz (Admin/Instructor only)."""
    try:
        quiz = await QuizService.update_quiz(db, quiz_id, quiz_in)
        return update_response(QuizRead.model_validate(quiz).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_admin_or_instructor),
):
    """Delete quiz (Admin/Instructor only)."""
    try:
        await QuizService.delete_quiz(db, quiz_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/course/{course_id}", response_model=QuizListResponse)
async def read_course_quizzes(course_id: int, db: AsyncSession = Depends(get_db)):
    """Get all quizzes for a course."""
    data = await QuizService.get_quizzes(db, course_id=course_id, size=100)
    return read_response(data)


# ── Quiz-scoped Question endpoints ──

@router.post(
    "/{quiz_id}/questions",
    status_code=status.HTTP_201_CREATED,
)
async def add_question(
    quiz_id: int,
    question_in: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_admin_or_instructor),
):
    """Add a question with choices to a quiz."""
    try:
        question_in.quiz_id = quiz_id
        question = await question_service.create_question(db, question_in, current_user.id)
        return create_response(QuestionRead.model_validate(question).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


from fastapi import Body

@router.put("/{quiz_id}/questions/reorder", status_code=status.HTTP_200_OK)
async def reorder_quiz_questions(
    quiz_id: int,
    order: List[dict] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_admin_or_instructor),
):
    """Bulk reorder questions within a quiz. Expects [{id, order_index}, ...]"""
    await question_service.reorder_questions(db, quiz_id, order)
    return update_response(None, message="Questions reordered successfully")


@router.put("/{quiz_id}/questions/{question_id}")
async def update_quiz_question(
    quiz_id: int,
    question_id: int,
    question_in: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_admin_or_instructor),
):
    """Update a question within a quiz."""
    question = await question_service.update_question(db, question_id, question_in)
    return update_response(QuestionRead.model_validate(question).model_dump(by_alias=False))


@router.delete("/{quiz_id}/questions/{question_id}", status_code=status.HTTP_200_OK)
async def delete_quiz_question(
    quiz_id: int,
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_admin_or_instructor),
):
    """Delete a question from a quiz."""
    await question_service.delete_question(db, question_id)
    return delete_response()

