import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.course import Course

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
async def test_course(db_session):
    """Create a course."""
    category = Category(name=f"Cat-{uuid.uuid4().hex[:4]}", slug=f"cat-{uuid.uuid4().hex[:4]}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex[:4]}",
        email=f"ins_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.INSTRUCTOR,
        is_active=True,
        first_name="Test",
        last_name="Instructor"
    )
    db_session.add(category)
    db_session.add(instructor)
    await db_session.commit()
    await db_session.refresh(category)
    await db_session.refresh(instructor)
    
    course = Course(title=f"Course-{uuid.uuid4().hex[:4]}", slug=f"course-{uuid.uuid4().hex[:4]}", instructor_id=instructor.id, category_id=category.id)
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest.mark.asyncio
async def test_create_module(client: AsyncClient, test_admin, test_course):
    """Test creating a module."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    response = await client.post(
        "/api/v1/modules/",
        json={
            "courseId": test_course.id,
            "title": "Intro to LMS",
            "description": "Welcome to the course",
            "orderIndex": 1
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Intro to LMS"
    assert data["orderIndex"] == 1
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_duplicate_order_module(client: AsyncClient, test_admin, test_course):
    """Test creating a module with duplicate order index."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    # First module
    await client.post(
        "/api/v1/modules/",
        json={"courseId": test_course.id, "title": "M1", "orderIndex": 1}
    )
    
    # Duplicate order
    response = await client.post(
        "/api/v1/modules/",
        json={"courseId": test_course.id, "title": "M2", "orderIndex": 1}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["message"].lower()
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_modules_by_course(client: AsyncClient, test_admin, test_course):
    """Test listing modules for a course."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    await client.post("/api/v1/modules/", json={"courseId": test_course.id, "title": "M2", "orderIndex": 2})
    await client.post("/api/v1/modules/", json={"courseId": test_course.id, "title": "M1", "orderIndex": 1})
    
    response = await client.get(f"/api/v1/modules/course/{test_course.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Check ordering
    assert data[0]["orderIndex"] == 1
    assert data[1]["orderIndex"] == 2
    
    app.dependency_overrides.clear()
