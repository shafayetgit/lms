from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.repositories import review as review_repo
from app.repositories import course as course_repo
from app.repositories import user as user_repo
from app.schemas.review import ReviewCreate, ReviewUpdate
from typing import List, Optional

class ReviewService:
    @staticmethod
    async def create_review(db: AsyncSession, review_in: ReviewCreate) -> Review:
        """Create a new review with validation."""
        # Check if user already reviewed this course
        existing = await review_repo.get_review_by_user_and_course(
            db, review_in.student_id, review_in.course_id
        )
        if existing:
            raise ValueError("User has already reviewed this course")

        # Validate Course
        course = await course_repo.get_course_by_id(db, review_in.course_id)
        if not course:
            raise ValueError(f"Course with id {review_in.course_id} does not exist")

        # Validate Student
        student = await user_repo.get_user_by_id(db, review_in.student_id)
        if not student:
            raise ValueError(f"Student with id {review_in.student_id} does not exist")

        db_review = Review(
            **review_in.model_dump()
        )
        return await review_repo.create_review(db, db_review)

    @staticmethod
    async def get_review(db: AsyncSession, review_id: int) -> Optional[Review]:
        return await review_repo.get_review_by_id(db, review_id)

    @staticmethod
    async def get_reviews(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Review]:
        return await review_repo.get_reviews(db, skip=skip, limit=limit)

    @staticmethod
    async def get_reviews_by_course(db: AsyncSession, course_id: int, skip: int = 0, limit: int = 100) -> List[Review]:
        return await review_repo.get_reviews_by_course(db, course_id, skip=skip, limit=limit)

    @staticmethod
    async def update_review(db: AsyncSession, review_id: int, review_in: ReviewUpdate) -> Review:
        review = await review_repo.get_review_by_id(db, review_id)
        if not review:
            raise ValueError("Review not found")

        update_data = review_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(review, field, value)

        return await review_repo.update_review(db, review)

    @staticmethod
    async def delete_review(db: AsyncSession, review_id: int):
        review = await review_repo.get_review_by_id(db, review_id)
        if not review:
            raise ValueError("Review not found")
        await review_repo.delete_review(db, review)

# Functional aliases
async def create_review(db: AsyncSession, review_in: ReviewCreate) -> Review:
    return await ReviewService.create_review(db, review_in)

async def get_review(db: AsyncSession, review_id: int) -> Optional[Review]:
    return await ReviewService.get_review(db, review_id)

async def get_reviews(db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Review]:
    return await ReviewService.get_reviews(db, skip=skip, limit=limit)

async def get_reviews_by_course(db: AsyncSession, course_id: int, skip: int = 0, limit: int = 100) -> List[Review]:
    return await ReviewService.get_reviews_by_course(db, course_id, skip=skip, limit=limit)

async def update_review(db: AsyncSession, review_id: int, review_in: ReviewUpdate) -> Review:
    return await ReviewService.update_review(db, review_id, review_in)

async def delete_review(db: AsyncSession, review_id: int):
    return await ReviewService.delete_review(db, review_id)
