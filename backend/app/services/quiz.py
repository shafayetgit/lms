import math
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.quiz import Quiz
from app.models.question import Question, Choice
from app.schemas.quiz import QuizCreate, QuizUpdate
from app.schemas.question import QuestionCreate
from app.repositories import quiz as quiz_repo
from app.repositories import course as course_repo
from app.repositories import lesson as lesson_repo

class QuizService:
    @staticmethod
    async def create_quiz(db: AsyncSession, quiz_in: QuizCreate) -> Quiz:
        # Validate course exists
        course = await course_repo.get_course_by_id(db, quiz_in.course_id)
        if not course:
            raise ValueError("Course not found")
        
        # Validate lesson exists if provided
        if quiz_in.lesson_id:
            lesson = await lesson_repo.get_lesson_by_id(db, quiz_in.lesson_id)
            if not lesson:
                raise ValueError("Lesson not found")

        db_quiz = Quiz(**quiz_in.model_dump())
        return await quiz_repo.create_quiz(db, db_quiz)

    @staticmethod
    async def get_quiz(db: AsyncSession, quiz_id: int) -> dict | None:
        quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
        if not quiz:
            return None
        return {"data": quiz}

    @staticmethod
    async def get_quizzes(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        term: str | None = None,
        is_active: bool | None = None,
        course_id: int | None = None,
    ) -> dict:
        query = select(Quiz).order_by(desc(Quiz.id))

        if term:
            query = query.where(Quiz.title.ilike(f"%{term}%"))
        if is_active is not None:
            query = query.where(Quiz.is_active == is_active)
        if course_id is not None:
            query = query.where(Quiz.course_id == course_id)

        skip = (page - 1) * size
        total = await quiz_repo.count_quizzes(db, query=query)
        data = await quiz_repo.get_quizzes(db, query=query, skip=skip, limit=size)
        total_pages = math.ceil(total / size) if total else 0

        return {
            "data": data,
            "meta": {
                "total": total,
                "page": page,
                "size": size,
                "pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    @staticmethod
    async def update_quiz(db: AsyncSession, quiz_id: int, quiz_in: QuizUpdate) -> Quiz:
        db_quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
        if not db_quiz:
            raise ValueError("Quiz not found")
        
        update_data = quiz_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_quiz, field, value)
        
        return await quiz_repo.update_quiz(db, db_quiz)

    @staticmethod
    async def delete_quiz(db: AsyncSession, quiz_id: int) -> None:
        db_quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
        if not db_quiz:
            raise ValueError("Quiz not found")
        await quiz_repo.delete_quiz(db, db_quiz)

    @staticmethod
    async def add_question(db: AsyncSession, quiz_id: int, question_in: QuestionCreate, user_id: int) -> Question:
        quiz = await quiz_repo.get_quiz_by_id(db, quiz_id)
        if not quiz:
            raise ValueError("Quiz not found")
        
        question_data = question_in.model_dump(exclude={"choices"})
        question_data.pop("quiz_id", None)
        choices_data = question_in.choices
        
        db_question = Question(**question_data, quiz_id=quiz_id, created_by_id=user_id)
        db_question.choices = [Choice(**choice.model_dump()) for choice in choices_data]
        
        return await quiz_repo.add_question(db, db_question)
