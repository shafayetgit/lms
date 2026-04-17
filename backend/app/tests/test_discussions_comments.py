import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.course import Course
from app.models.category import Category
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.discussion import Discussion
from app.models.comment import Comment
import uuid

@pytest_asyncio.fixture
async def test_admin(db_session: AsyncSession):
    user = User(
        username=f"admin_{uuid.uuid4().hex[:4]}",
        email=f"admin_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role="admin",
        is_active=True,
        first_name="Admin",
        last_name="User"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_student(db_session: AsyncSession):
    user = User(
        username=f"student_{uuid.uuid4().hex[:4]}",
        email=f"student_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role="student",
        is_active=True,
        first_name="Student",
        last_name="User"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_category(db_session: AsyncSession):
    category = Category(name=f"Test Cat {uuid.uuid4().hex[:4]}", slug=f"test-cat-{uuid.uuid4().hex[:4]}")
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category

@pytest_asyncio.fixture
async def test_course(db_session: AsyncSession, test_admin, test_category):
    # Using admin as instructor for convenience
    course = Course(
        title="Test Course",
        slug=f"test-course-{uuid.uuid4().hex[:4]}",
        instructor_id=test_admin.id,
        category_id=test_category.id
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest_asyncio.fixture
async def test_module(db_session: AsyncSession, test_course):
    module = Module(title="Test Module", course_id=test_course.id, order_index=1)
    db_session.add(module)
    await db_session.commit()
    await db_session.refresh(module)
    return module

@pytest_asyncio.fixture
async def test_lesson(db_session: AsyncSession, test_module):
    lesson = Lesson(title="Test Lesson", slug=f"test-lesson-{uuid.uuid4().hex[:4]}", module_id=test_module.id, order_index=1)
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson

@pytest.mark.asyncio
async def test_create_discussion(client: AsyncClient, test_admin, test_course, test_lesson):
    """Test creating a discussion."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    payload = {
        "course_id": test_course.id,
        "lesson_id": test_lesson.id,
        "title": "Welcome Discussion",
        "body": "Let's talk about the course"
    }
    response = await client.post("/api/v1/discussions/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Welcome Discussion"
    assert data["courseId"] == test_course.id
    assert data["lessonId"] == test_lesson.id
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_comment(client: AsyncClient, test_admin, test_course):
    """Test creating a comment on a discussion."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin

    # Create discussion first
    disc_payload = {"course_id": test_course.id, "title": "Discussion 1"}
    disc_res = await client.post("/api/v1/discussions/", json=disc_payload)
    discussion_id = disc_res.json()["id"]

    # Create comment
    comment_payload = {
        "discussion_id": discussion_id,
        "body": "This is a comment"
    }
    response = await client.post("/api/v1/comments/", json=comment_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["body"] == "This is a comment"
    assert data["discussionId"] == discussion_id
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_nested_comments(client: AsyncClient, test_admin, test_course):
    """Test creating nested comments (replies)."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin

    # Create discussion
    disc_payload = {"course_id": test_course.id, "title": "Discussion 1"}
    disc_res = await client.post("/api/v1/discussions/", json=disc_payload)
    discussion_id = disc_res.json()["id"]

    # Create parent comment
    p_payload = {"discussion_id": discussion_id, "body": "Parent"}
    p_res = await client.post("/api/v1/comments/", json=p_payload)
    parent_id = p_res.json()["id"]

    # Create reply
    r_payload = {"discussion_id": discussion_id, "parent_id": parent_id, "body": "Reply"}
    r_res = await client.post("/api/v1/comments/", json=r_payload)
    assert r_res.status_code == 201
    assert r_res.json()["parentId"] == parent_id

    # Get discussion comments with replies
    list_res = await client.get(f"/api/v1/comments/discussion/{discussion_id}")
    assert list_res.status_code == 200
    data = list_res.json()
    assert len(data) == 1
    assert data[0]["body"] == "Parent"
    assert len(data[0]["replies"]) == 1
    assert data[0]["replies"][0]["body"] == "Reply"
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_security_access_denied_for_student(client: AsyncClient, test_student, test_course):
    """Test that a student cannot access these endpoints if restricted."""
    from app.api.deps import get_current_active_user
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    
    app.dependency_overrides[get_current_active_user] = lambda: test_student
    app.dependency_overrides.pop(get_admin_or_instructor, None) # Ensure real logic runs
    
    payload = {"course_id": test_course.id, "title": "Secret Discussion"}
    response = await client.post("/api/v1/discussions/", json=payload)
    # The real get_admin_or_instructor dependency will check the role of current_user (test_student)
    # and should return 403 because it's not admin or instructor.
    assert response.status_code == 403 
    
    app.dependency_overrides.clear()
