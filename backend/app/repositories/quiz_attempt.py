from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.quiz_attempt import QuizAttempt, QuizAttemptAnswer
from sqlalchemy import func

async def count_attempts(db: AsyncSession, query) -> int:
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    return result.scalar()

async def get_attempts_with_query(
    db: AsyncSession, query, skip: int = 0, limit: int = 10
) -> list[QuizAttempt]:
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

async def create_attempt(db: AsyncSession, attempt: QuizAttempt) -> QuizAttempt:
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt

async def get_attempt(db: AsyncSession, attempt_id: int) -> Optional[QuizAttempt]:
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.id == attempt_id)
        .options(selectinload(QuizAttempt.answers))
    )
    return result.scalars().first()

async def get_user_attempts(db: AsyncSession, user_id: int, quiz_id: Optional[int] = None) -> List[QuizAttempt]:
    stmt = select(QuizAttempt).where(QuizAttempt.user_id == user_id)
    if quiz_id:
        stmt = stmt.where(QuizAttempt.quiz_id == quiz_id)
    result = await db.execute(stmt.order_by(QuizAttempt.start_time.desc()))
    return result.scalars().all()

async def create_answers(db: AsyncSession, answers: List[QuizAttemptAnswer]) -> List[QuizAttemptAnswer]:
    db.add_all(answers)
    await db.commit()
    return answers

async def update_attempt(db: AsyncSession, attempt: QuizAttempt) -> QuizAttempt:
    await db.commit()
    await db.refresh(attempt)
    return attempt
