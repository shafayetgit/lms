from sqlalchemy.ext.asyncio import AsyncSession
from app.models.review import Review
from app.repositories import review as review_repo
from app.repositories import course as course_repo
from app.repositories import user as user_repo
from app.schemas.review import ReviewCreate, ReviewUpdate
from typing import List, Optional
from sqlalchemy import select, desc, func, update
from app.models.course import Course
import math

class ReviewService:
    @staticmethod
    async def create_review(db: AsyncSession, review_in: ReviewCreate) -> Review:
        """Create a new review with validation."""
        # Validate Course
        course = await course_repo.get_course_by_public_id(db, review_in.course_public_id)
        if not course:
            raise ValueError(f"Course with public id {review_in.course_public_id} does not exist")

        # Validate Student
        student = await user_repo.get_user_by_public_id(db, review_in.student_public_id)
        if not student:
            raise ValueError(f"Student with public id {review_in.student_public_id} does not exist")

        # Validate Enrollment
        from app.repositories import enrollment as enrollment_repo
        enrollment = await enrollment_repo.get_enrollment_by_user_and_course(
            db, student.id, course.id
        )
        if not enrollment:
            raise ValueError("Only enrolled students can review this course")

        # Check if user already reviewed this course
        existing = await review_repo.get_review_by_user_and_course(
            db, student.id, course.id
        )
        if existing:
            raise ValueError("User has already reviewed this course")

        db_review = Review(
            course_id=course.id,
            student_id=student.id,
            rating=review_in.rating,
            body=review_in.body,
            is_active=review_in.is_active,
        )
        created = await review_repo.create_review(db, db_review)
        await ReviewService.update_course_rating(db, course.id)
        return created

    @staticmethod
    async def get_review(db: AsyncSession, public_id: str) -> Optional[Review]:
        return await review_repo.get_review_by_public_id(db, public_id)

    @staticmethod
    async def get_reviews(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        course_public_id: Optional[str] = None,
        student_public_id: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> dict:
        query = select(Review).order_by(desc(Review.id))

        if course_public_id:
            course = await course_repo.get_course_by_public_id(db, course_public_id)
            if course:
                query = query.where(Review.course_id == course.id)
            else:
                query = query.where(Review.course_id == -1)
        if student_public_id:
            student = await user_repo.get_user_by_public_id(db, student_public_id)
            if student:
                query = query.where(Review.student_id == student.id)
            else:
                query = query.where(Review.student_id == -1)
        if is_active is not None:
            query = query.where(Review.is_active == is_active)

        skip = (page - 1) * size
        total = await review_repo.count_reviews(db, query=query)
        data = await review_repo.get_reviews_with_query(
            db, query=query, skip=skip, limit=size
        )
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
    async def get_reviews_by_course(db: AsyncSession, course_public_id: str, skip: int = 0, limit: int = 100) -> List[Review]:
        course = await course_repo.get_course_by_public_id(db, course_public_id)
        if not course:
            return []
        return await review_repo.get_reviews_by_course(db, course.id, skip=skip, limit=limit)

    @staticmethod
    async def update_review(db: AsyncSession, public_id: str, review_in: ReviewUpdate) -> Review:
        review = await review_repo.get_review_by_public_id(db, public_id)
        if not review:
            raise ValueError("Review not found")

        update_data = review_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(review, field, value)

        updated = await review_repo.update_review(db, review)
        await ReviewService.update_course_rating(db, review.course_id)
        return updated

    @staticmethod
    async def delete_review(db: AsyncSession, public_id: str):
        review = await review_repo.get_review_by_public_id(db, public_id)
        if not review:
            raise ValueError("Review not found")
        course_id = review.course_id
        await review_repo.delete_review(db, review)
        await ReviewService.update_course_rating(db, course_id)

    @staticmethod
    async def update_course_rating(db: AsyncSession, course_id: int):
        """Recalculate and update the average rating of a course."""
        result = await db.execute(
            select(func.avg(Review.rating))
            .where(Review.course_id == course_id, Review.is_active == True)
        )
        avg_rating = result.scalar()
        avg_rating_val = round(float(avg_rating or 0.0), 1)
        
        await db.execute(
            update(Course)
            .where(Course.id == course_id)
            .values(rating=avg_rating_val)
        )
        await db.commit()

# Functional aliases
async def create_review(db: AsyncSession, review_in: ReviewCreate) -> Review:
    return await ReviewService.create_review(db, review_in)

async def get_review(db: AsyncSession, public_id: str) -> Optional[Review]:
    return await ReviewService.get_review(db, public_id)

async def get_reviews(
    db: AsyncSession,
    page: int = 1,
    size: int = 10,
    course_public_id: Optional[str] = None,
    student_public_id: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> dict:
    return await ReviewService.get_reviews(
        db, page=page, size=size, course_public_id=course_public_id, student_public_id=student_public_id, is_active=is_active
    )

async def get_reviews_by_course(db: AsyncSession, course_public_id: str, skip: int = 0, limit: int = 100) -> List[Review]:
    return await ReviewService.get_reviews_by_course(db, course_public_id, skip=skip, limit=limit)

async def update_review(db: AsyncSession, public_id: str, review_in: ReviewUpdate) -> Review:
    return await ReviewService.update_review(db, public_id, review_in)

async def delete_review(db: AsyncSession, public_id: str):
    return await ReviewService.delete_review(db, public_id)

