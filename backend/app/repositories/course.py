from sqlalchemy import select, func
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
    query = (
        select(
            Course,
            func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
            func.count(Review.id).label("total_reviews")
        )
        .outerjoin(Review, Course.id == Review.course_id)
        .where(Course.id == course_id)
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

async def get_course_by_slug(db: AsyncSession, slug: str) -> Course | None:
    query = (
        select(
            Course,
            func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
            func.count(Review.id).label("total_reviews")
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

async def get_courses(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Course]:
    query = (
        select(
            Course,
            func.coalesce(func.avg(Review.rating), 0.0).label("avg_rating"),
            func.count(Review.id).label("total_reviews")
        )
        .outerjoin(Review, Course.id == Review.course_id)
        .group_by(Course.id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    courses_with_stats = []
    for row in result:
        course, avg_rating, total_reviews = row
        course.avg_rating = float(avg_rating)
        course.total_reviews = int(total_reviews)
        courses_with_stats.append(course)
    return courses_with_stats

async def update_course(db: AsyncSession, course: Course) -> Course:
    await db.commit()
    await db.refresh(course)
    return course

async def delete_course(db: AsyncSession, course: Course):
    await db.delete(course)
    await db.commit()
