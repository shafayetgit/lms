from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
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

async def get_quiz_by_id(db: AsyncSession, quiz_id: int | str) -> Optional[Quiz]:
    stmt = (
        select(Quiz)
        .options(selectinload(Quiz.questions).selectinload(Question.choices))
        .execution_options(populate_existing=True)
    )
    if isinstance(quiz_id, int) or (isinstance(quiz_id, str) and quiz_id.isdigit()):
        stmt = stmt.where(Quiz.id == int(quiz_id))
    else:
        stmt = stmt.where(Quiz.public_id == str(quiz_id))
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_quizzes_by_course(db: AsyncSession, course_id: int) -> List[Quiz]:
    result = await db.execute(
        select(Quiz).where(Quiz.course_id == course_id)
    )
    return result.scalars().all()

async def get_quizzes(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Quiz]:
    q = query if query is not None else select(Quiz)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()

async def count_quizzes(db: AsyncSession, query: Select | None = None) -> int:
    q = query if query is not None else select(Quiz)
    return await db.scalar(select(func.count()).select_from(q.subquery()))

async def update_quiz(db: AsyncSession, quiz: Quiz) -> Quiz:
    await db.commit()
    await db.refresh(quiz)
    return quiz

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

# Functional aliases
get_quiz = get_quiz_by_id
