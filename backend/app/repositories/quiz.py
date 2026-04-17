from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models.quiz import Quiz
from app.models.question import Question, Choice

# Quiz CRUD
async def create_quiz(db: AsyncSession, quiz: Quiz) -> Quiz:
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    return quiz

async def get_quiz(db: AsyncSession, quiz_id: int) -> Optional[Quiz]:
    result = await db.execute(
        select(Quiz)
        .where(Quiz.id == quiz_id)
        .options(selectinload(Quiz.questions).selectinload(Question.choices))
    )
    return result.scalars().first()

async def get_quizzes_by_course(db: AsyncSession, course_id: int) -> List[Quiz]:
    result = await db.execute(
        select(Quiz).where(Quiz.course_id == course_id)
    )
    return result.scalars().all()

async def delete_quiz(db: AsyncSession, quiz: Quiz) -> None:
    await db.delete(quiz)
    await db.commit()

# Question CRUD
async def add_question(db: AsyncSession, question: Question) -> Question:
    db.add(question)
    await db.commit()
    # Eagerly load choices for the response
    stmt = (
        select(Question)
        .where(Question.id == question.id)
        .options(selectinload(Question.choices))
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_question(db: AsyncSession, question_id: int) -> Optional[Question]:
    result = await db.execute(
        select(Question)
        .where(Question.id == question_id)
        .options(selectinload(Question.choices))
    )
    return result.scalars().first()

async def delete_question(db: AsyncSession, question: Question) -> None:
    await db.delete(question)
    await db.commit()
