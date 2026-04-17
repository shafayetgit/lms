from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.quiz import Quiz
from app.models.question import Question, Choice
from app.schemas.quiz import QuizCreate, QuizUpdate, QuestionCreate
from app.repositories import quiz as quiz_repo
from app.repositories import course as course_repo
from app.repositories import lesson as lesson_repo

async def create_quiz(db: AsyncSession, quiz_in: QuizCreate) -> Quiz:
    # Validate course exists
    course = await course_repo.get_course_by_id(db, quiz_in.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # Validate lesson exists if provided
    if quiz_in.lesson_id:
        lesson = await lesson_repo.get_lesson_by_id(db, quiz_in.lesson_id)
        if not lesson:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    db_quiz = Quiz(**quiz_in.model_dump())
    return await quiz_repo.create_quiz(db, db_quiz)

async def get_quiz(db: AsyncSession, quiz_id: int) -> Quiz:
    quiz = await quiz_repo.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return quiz

async def update_quiz(db: AsyncSession, quiz_id: int, quiz_in: QuizUpdate) -> Quiz:
    db_quiz = await get_quiz(db, quiz_id)
    
    update_data = quiz_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_quiz, field, value)
    
    await db.commit()
    await db.refresh(db_quiz)
    return db_quiz

async def delete_quiz(db: AsyncSession, quiz_id: int) -> None:
    db_quiz = await get_quiz(db, quiz_id)
    await quiz_repo.delete_quiz(db, db_quiz)

async def add_question(db: AsyncSession, quiz_id: int, question_in: QuestionCreate) -> Question:
    quiz = await get_quiz(db, quiz_id)
    
    question_data = question_in.model_dump(exclude={"choices"})
    choices_data = question_in.choices
    
    db_question = Question(**question_data, quiz_id=quiz_id)
    db_question.choices = [Choice(**choice.model_dump()) for choice in choices_data]
    
    return await quiz_repo.add_question(db, db_question)
