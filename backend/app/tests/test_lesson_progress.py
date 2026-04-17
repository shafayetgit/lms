import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.course import Course
from app.models.module import Module
from app.models.lesson import Lesson

@pytest_asyncio.fixture
async def test_admin(db_session):
    """Create a test admin user."""
    user = User(
        username=f"admin_{uuid.uuid4().hex[:4]}",
        email=f"admin_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.ADMIN,
        is_active=True,
        first_name="Admin",
        last_name="User"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_student(db_session):
    """Create a test student user."""
    user = User(
        username=f"student_{uuid.uuid4().hex[:4]}",
        email=f"student_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.STUDENT,
        is_active=True,
        first_name="Student",
        last_name="User"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest_asyncio.fixture
async def test_lesson(db_session):
    """Create a course, module, and lesson."""
    category = Category(name=f"Cat-{uuid.uuid4().hex[:4]}", slug=f"cat-{uuid.uuid4().hex[:4]}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex[:4]}",
        email=f"ins_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.INSTRUCTOR,
        is_active=True,
        first_name="I", last_name="N"
    )
    db_session.add(category)
    db_session.add(instructor)
    await db_session.commit()
    
    course = Course(
        title=f"C-{uuid.uuid4().hex[:4]}", 
        slug=f"c-{uuid.uuid4().hex[:4]}", 
        instructor_id=instructor.id, 
        category_id=category.id
    )
    db_session.add(course)
    await db_session.commit()
    
    module = Module(course_id=course.id, title="Module 1", order_index=1)
    db_session.add(module)
    await db_session.commit()
    
    lesson = Lesson(
        module_id=module.id, 
        title="Lesson 1", 
        slug=f"lesson-1-{uuid.uuid4().hex[:4]}",
        order_index=1
    )
    db_session.add(lesson)
    await db_session.commit()
    await db_session.refresh(lesson)
    return lesson

@pytest.mark.asyncio
async def test_get_or_create_progress(client: AsyncClient, test_admin, test_student, test_lesson):
    """Test getting/creating progress as admin."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    response = await client.get(
        f"/api/v1/lesson-progress/user/{test_student.id}/lesson/{test_lesson.id}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["lessonId"] == test_lesson.id
    assert data["userId"] == test_student.id
    assert data["isCompleted"] is False
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_update_progress(client: AsyncClient, test_admin, test_student, test_lesson):
    """Test updating progress as admin."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    # Update current time
    response = await client.patch(
        f"/api/v1/lesson-progress/user/{test_student.id}/lesson/{test_lesson.id}",
        json={"currentTime": 150}
    )
    assert response.status_code == 200
    assert response.json()["currentTime"] == 150
    
    # Mark as completed
    response = await client.patch(
        f"/api/v1/lesson-progress/user/{test_student.id}/lesson/{test_lesson.id}",
        json={"isCompleted": True}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["isCompleted"] is True
    assert data["completedAt"] is not None
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_complete_lesson_endpoint(client: AsyncClient, test_admin, test_student, test_lesson):
    """Test specific completion endpoint."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    response = await client.post(
        f"/api/v1/lesson-progress/user/{test_student.id}/lesson/{test_lesson.id}/complete"
    )
    assert response.status_code == 200
    assert response.json()["isCompleted"] is True
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_security_access_denied_for_student(client: AsyncClient, test_student, test_lesson):
    """Test that a student cannot access these management endpoints."""
    # We don't override dependency, so it uses real logic which should fail if not admin/instructor
    # But usually in tests, we need to provide a token or override.
    # Since we want to test that it fails for non-admin, let's override with a student.
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides.pop(get_admin_or_instructor, None) # Reset to real
    
    # Actually, the real dependency will look for a token.
    # We can override get_current_active_user to return a student.
    from app.api.deps import get_current_active_user
    app.dependency_overrides[get_current_active_user] = lambda: test_student
    
    response = await client.get(
        f"/api/v1/lesson-progress/user/{test_student.id}/lesson/{test_lesson.id}"
    )
    # It should return 403 Forbidden because student is not admin/instructor
    assert response.status_code == 403
    
    app.dependency_overrides.clear()
