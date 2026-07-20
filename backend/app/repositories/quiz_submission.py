from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.quiz_submission import QuizSubmission, QuizResult
from sqlalchemy import func

async def count_attempts(db: AsyncSession, query) -> int:
    count_query = select(func.count()).select_from(query.subquery())
    result = await db.execute(count_query)
    return result.scalar()

async def get_attempts_with_query(
    db: AsyncSession, query, skip: int = 0, limit: int = 10
) -> list[QuizSubmission]:
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

async def create_attempt(db: AsyncSession, attempt: QuizSubmission) -> QuizSubmission:
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt

async def get_attempt(db: AsyncSession, attempt_id: int) -> Optional[QuizSubmission]:
    result = await db.execute(
        select(QuizSubmission)
        .where(QuizSubmission.id == attempt_id)
        .options(selectinload(QuizSubmission.answers))
    )
    return result.scalars().first()

async def get_user_attempts(db: AsyncSession, user_id: int, quiz_id: Optional[int] = None) -> List[QuizSubmission]:
    stmt = select(QuizSubmission).where(QuizSubmission.user_id == user_id)
    if quiz_id:
        stmt = stmt.where(QuizSubmission.quiz_id == quiz_id)
    result = await db.execute(stmt.order_by(QuizSubmission.start_time.desc()))
    return result.scalars().all()

async def create_answers(db: AsyncSession, answers: List[QuizResult]) -> List[QuizResult]:
    db.add_all(answers)
    await db.commit()
    return answers

async def update_attempt(db: AsyncSession, attempt: QuizSubmission) -> QuizSubmission:
    await db.commit()
    await db.refresh(attempt)
    return attempt
