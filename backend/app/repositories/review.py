from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review

async def create_review(db: AsyncSession, review: Review) -> Review:
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review

async def get_review_by_id(db: AsyncSession, review_id: int) -> Review | None:
    result = await db.execute(select(Review).where(Review.id == review_id))
    return result.scalars().first()

async def get_review_by_user_and_course(db: AsyncSession, student_id: int, course_id: int) -> Review | None:
    result = await db.execute(
        select(Review).where(Review.student_id == student_id, Review.course_id == course_id)
    )
    return result.scalars().first()

async def get_reviews(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Review]:
    result = await db.execute(select(Review).offset(skip).limit(limit))
    return result.scalars().all()

async def get_reviews_by_course(db: AsyncSession, course_id: int, skip: int = 0, limit: int = 100) -> list[Review]:
    result = await db.execute(
        select(Review).where(Review.course_id == course_id).offset(skip).limit(limit)
    )
    return result.scalars().all()

async def update_review(db: AsyncSession, review: Review) -> Review:
    await db.commit()
    await db.refresh(review)
    return review

async def delete_review(db: AsyncSession, review: Review):
    await db.delete(review)
    await db.commit()
