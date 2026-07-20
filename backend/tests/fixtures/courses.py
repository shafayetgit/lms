import pytest_asyncio
import uuid
import re
from app.models.course import Course
from app.models.course_instructor import CourseInstructor
from faker import Faker

fake = Faker()

@pytest_asyncio.fixture
async def test_course(db_session, test_instructor, test_category):
    """Create a course with realistic mock data."""
    title = f"{fake.catch_phrase()} {uuid.uuid4().hex}"
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower())

    course = Course(
        title=title,
        slug=slug,
        short_introduction=fake.sentence(),
        overview=fake.paragraph(),
        course_price=49.99,
        published=True,
        category_id=test_category.id
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)

    # Link the instructor
    course_instructor = CourseInstructor(
        course_id=course.id,
        instructor_id=test_instructor.id,
        order_index=1
    )
    db_session.add(course_instructor)
    await db_session.commit()

    return course
