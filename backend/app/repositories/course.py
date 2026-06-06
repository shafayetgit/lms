from app.models.category import Category
from app.models.user import Instructor, User
from sqlalchemy import select, func, Select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.course import Course
from app.models.review import Review


async def create_course(db: AsyncSession, course: Course) -> Course:
    db.add(course)
    await db.commit()
    await db.refresh(course)
    course.avg_rating = 0.0
    course.total_reviews = 0
    return course


async def get_course_by_id(db: AsyncSession, course_id: int) -> Course | None:
    review_stats = (
        select(
            Review.course_id,
            func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
            func.count(Review.id).label("total_reviews"),
        )
        .group_by(Review.course_id)
        .subquery()
    )
    query = (
        select(
            Course,
            func.coalesce(review_stats.c.avg_rating, 0.0).label("avg_rating"),
            func.coalesce(review_stats.c.total_reviews, 0).label("total_reviews"),
        )
        .outerjoin(review_stats, Course.id == review_stats.c.course_id)
        .options(
            joinedload(Course.instructor).load_only(
                User.id, User.first_name, User.last_name
            ),
            joinedload(Course.category).load_only(Category.id, Category.name),
        )
        .where(Course.id == course_id)
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        return None
    course, avg_rating, total_reviews = row
    course.avg_rating = float(avg_rating)
    course.total_reviews = int(total_reviews)
    return course


async def get_course_by_slug(db: AsyncSession, slug: str) -> Course | None:
    query = (
        select(
            Course,
            func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
            func.count(Review.id).label("total_reviews"),
        )
        .outerjoin(Review, Course.id == Review.course_id)
        .where(Course.slug == slug)
        .group_by(Course.id)
    )
    result = await db.execute(query)
    row = result.first()
    if not row:
        return None
    course, avg_rating, total_reviews = row
    course.avg_rating = float(avg_rating)
    course.total_reviews = int(total_reviews)
    return course


async def get_courses(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Course]:
    q = query if query is not None else select(Course)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


async def count_courses(db: AsyncSession, query: Select | None = None) -> int:
    q = query if query is not None else select(Course)
    return await db.scalar(select(func.count()).select_from(q.subquery()))


async def update_course(db: AsyncSession, course: Course) -> Course:
    await db.commit()
    await db.refresh(course)
    return course


async def delete_course(db: AsyncSession, course: Course):
    await db.delete(course)
    await db.commit()
