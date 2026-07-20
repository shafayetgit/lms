from app.models.category import Category
from app.models.user import User
from sqlalchemy import select, func, Select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.course import Course
from app.models.review import Review
from app.models.tracking import RelatedCourse


async def populate_course_lesson_counts(db: AsyncSession, course: Course):
    if not course:
        return
    from app.models.lesson import Lesson, LessonType
    
    quiz_stmt = select(func.count(Lesson.id)).where(
        Lesson.course_id == course.id,
        Lesson.lesson_type == LessonType.QUIZ,
        Lesson.is_active == True
    )
    quiz_count = (await db.execute(quiz_stmt)).scalar() or 0
    
    assignment_stmt = select(func.count(Lesson.id)).where(
        Lesson.course_id == course.id,
        Lesson.lesson_type == LessonType.ASSIGNMENT,
        Lesson.is_active == True
    )
    assignment_count = (await db.execute(assignment_stmt)).scalar() or 0
    
    lesson_stmt = select(func.count(Lesson.id)).where(
        Lesson.course_id == course.id,
        Lesson.lesson_type.in_([LessonType.VIDEO, LessonType.CONTENT]),
        Lesson.is_active == True
    )
    lesson_count = (await db.execute(lesson_stmt)).scalar() or 0
    
    course.total_quizzes = int(quiz_count)
    course.total_assignments = int(assignment_count)
    course.total_lessons = int(lesson_count)


async def create_course(db: AsyncSession, course: Course) -> Course:
    db.add(course)
    await db.commit()
    await db.refresh(course)
    course.avg_rating = 0.0
    course.total_reviews = 0
    course.total_quizzes = 0
    course.total_assignments = 0
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
            joinedload(Course.instructors).load_only(
                User.id, User.public_id, User.first_name, User.last_name
            ),
            joinedload(Course.category).load_only(Category.id, Category.public_id, Category.name),
            joinedload(Course.related_courses).joinedload(RelatedCourse.related_course),
        )
        .where(Course.id == course_id)
    )
    result = await db.execute(query)
    row = result.unique().first()
    if not row:
        return None
    course, avg_rating, total_reviews = row
    course.avg_rating = float(avg_rating)
    course.total_reviews = int(total_reviews)
    await populate_course_lesson_counts(db, course)
    return course


async def get_course_by_public_id(db: AsyncSession, public_id: str) -> Course | None:
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
            joinedload(Course.instructors).load_only(
                User.id, User.public_id, User.first_name, User.last_name
            ),
            joinedload(Course.category).load_only(Category.id, Category.public_id, Category.name),
            joinedload(Course.related_courses).joinedload(RelatedCourse.related_course).joinedload(Course.instructors),
            joinedload(Course.related_courses).joinedload(RelatedCourse.related_course).joinedload(Course.category),
        )
        .where(Course.public_id == public_id)
    )
    result = await db.execute(query)
    row = result.unique().first()
    if not row:
        return None
    course, avg_rating, total_reviews = row
    course.avg_rating = float(avg_rating)
    course.total_reviews = int(total_reviews)
    await populate_course_lesson_counts(db, course)
    return course


async def get_course_by_slug(db: AsyncSession, slug: str) -> Course | None:
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
            joinedload(Course.instructors).load_only(
                User.id, User.public_id, User.first_name, User.last_name
            ),
            joinedload(Course.category).load_only(Category.id, Category.public_id, Category.name),
            joinedload(Course.related_courses).joinedload(RelatedCourse.related_course).joinedload(Course.instructors),
            joinedload(Course.related_courses).joinedload(RelatedCourse.related_course).joinedload(Course.category),
        )
        .where(Course.slug == slug)
    )
    result = await db.execute(query)
    row = result.unique().first()
    if not row:
        return None
    course, avg_rating, total_reviews = row
    course.avg_rating = float(avg_rating)
    course.total_reviews = int(total_reviews)
    await populate_course_lesson_counts(db, course)
    return course


async def get_courses(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Course]:
    q = query if query is not None else select(Course)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.unique().scalars().all()


async def count_courses(db: AsyncSession, query: Select | None = None) -> int:
    q = query if query is not None else select(Course)
    return await db.scalar(select(func.count()).select_from(q.subquery()))


async def update_course(db: AsyncSession, course: Course) -> Course:
    await db.commit()
    await db.refresh(course)
    await populate_course_lesson_counts(db, course)
    return course


async def get_course_choices(
    db: AsyncSession, query: Select | None = None
) -> list[dict]:
    """Get a list of courses for dropdown choices."""
    stmt = select(Course.public_id.label("value"), Course.title.label("label"))
    if query is not None:
        stmt = query
    result = await db.execute(stmt)
    return result.mappings().all()


async def delete_course(db: AsyncSession, course: Course):
    await db.delete(course)
    await db.commit()

