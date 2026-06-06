from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor, get_current_active_user
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionRead
from app.services import question as question_service
from app.models.user import User
from app.core.responses import create_response, read_response, update_response, delete_response

router = APIRouter()


@router.post("/", response_model=QuestionRead, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_in: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor),
):
    try:
        question = await question_service.create_question(db, question_in, current_user.id)
        return create_response(QuestionRead.model_validate(question).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{question_id}", response_model=QuestionRead)
async def read_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor),
):
    question = await question_service.get_question(db, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return read_response({"data": QuestionRead.model_validate(question).model_dump(by_alias=False)})


@router.put("/{question_id}", response_model=QuestionRead)
async def update_question(
    question_id: int,
    question_in: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor),
):
    try:
        question = await question_service.update_question(db, question_id, question_in)
        return update_response(QuestionRead.model_validate(question).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor),
):
    try:
        await question_service.delete_question(db, question_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/quiz/{quiz_id}", response_model=List[QuestionRead])
async def read_quiz_questions(
    quiz_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_admin_or_instructor),
):
    questions = await question_service.get_questions_by_quiz(db, quiz_id)
    items = [QuestionRead.model_validate(q).model_dump(by_alias=False) for q in questions]
    return read_response({"data": items})
