import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.course import Course
from app.models.module import Module

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
async def test_module(db_session):
    """Create a course and module."""
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
    
    course = Course(title=f"C-{uuid.uuid4().hex[:4]}", slug=f"c-{uuid.uuid4().hex[:4]}", instructor_id=instructor.id, category_id=category.id)
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    
    module = Module(course_id=course.id, title="Module 1", order_index=1)
    db_session.add(module)
    await db_session.commit()
    await db_session.refresh(module)
    return module

@pytest.mark.asyncio
async def test_create_lesson(client: AsyncClient, test_admin, test_module):
    """Test creating a lesson."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    title = f"Intro-{uuid.uuid4().hex[:4]}"
    response = await client.post(
        "/api/v1/lessons/",
        json={
            "moduleId": test_module.id,
            "title": title,
            "content": "Welcome!",
            "orderIndex": 1
        }
    )
    if response.status_code != 201:
        print(f"Error: {response.json()}")
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == title
    assert "slug" in data
    assert data["slug"].startswith("intro-")
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_duplicate_order_lesson(client: AsyncClient, test_admin, test_module):
    """Test duplicate order prevention."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    await client.post("/api/v1/lessons/", json={"moduleId": test_module.id, "title": "L1", "orderIndex": 1})
    
    response = await client.post("/api/v1/lessons/", json={"moduleId": test_module.id, "title": "L2", "orderIndex": 1})
    assert response.status_code == 400
    assert "already exists" in response.json()["message"].lower()
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_lessons_by_module(client: AsyncClient, test_admin, test_module):
    """Test listing lessons for a module."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    await client.post("/api/v1/lessons/", json={"moduleId": test_module.id, "title": f"L2-{uuid.uuid4().hex[:4]}", "orderIndex": 2})
    await client.post("/api/v1/lessons/", json={"moduleId": test_module.id, "title": f"L1-{uuid.uuid4().hex[:4]}", "orderIndex": 1})
    
    response = await client.get(f"/api/v1/lessons/module/{test_module.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["orderIndex"] == 1
    assert data[1]["orderIndex"] == 2
    
    app.dependency_overrides.clear()
