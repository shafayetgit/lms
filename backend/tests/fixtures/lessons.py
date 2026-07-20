import pytest_asyncio
from app.models.chapter import Chapter
from app.models.lesson import Lesson
from faker import Faker

fake = Faker()

@pytest_asyncio.fixture
async def test_chapter(db_session, test_course):
    """Create a chapter inside the test course."""
    chapter = Chapter(
        title=f"Module: {fake.bs().title()}",
        course_id=test_course.id,
        order_index=1,
        is_active=True
    )
    db_session.add(chapter)
    await db_session.commit()
    await db_session.refresh(chapter)
    return chapter

@pytest_asyncio.fixture
async def test_lesson(db_session, test_chapter):
    """Create a lesson inside the test chapter."""
    lesson = Lesson(
        title=f"Lesson: {fake.catch_phrase()}",
        slug=f"lesson-{fake.uuid4()[:8]}",
        chapter_id=test_chapter.id,
        course_id=test_chapter.course_id,
        content=fake.paragraph(),
        order_index=1,
        is_active=True,
        include_in_preview=False
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson
