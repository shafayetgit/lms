import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User
from app.models.category import Category
from app.models.course import Course

@pytest_asyncio.fixture
async def test_admin(db_session):
    """Create a test admin user."""
    user = User(
        username=f"admin_{uuid.uuid4().hex}",
        email=f"admin_{uuid.uuid4().hex}@example.com",
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
async def test_course(db_session):
    """Create a course."""
    category = Category(name=f"Cat-{uuid.uuid4().hex}", slug=f"cat-{uuid.uuid4().hex}")
    instructor = User(
        username=f"ins_{uuid.uuid4().hex}",
        email=f"ins_{uuid.uuid4().hex}@example.com",
        hashed_password="hashed",
        role="instructor",
        is_active=True,
        first_name="Test",
        last_name="Instructor"
    )
    db_session.add(category)
    db_session.add(instructor)
    await db_session.commit()
    await db_session.refresh(category)
    await db_session.refresh(instructor)
    
    course = Course(title=f"Course-{uuid.uuid4().hex}", slug=f"course-{uuid.uuid4().hex}", instructors=[instructor], category_id=category.id)
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest.mark.asyncio
async def test_create_chapter(client: AsyncClient, test_admin, test_course):
    """Test creating a chapter."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    response = await client.post(
        "/api/v1/chapters/",
        json={
            "course_id": test_course.id,
            "title": "Intro to LMS",
            "description": "Welcome to the course",
            "order_index": 1
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["success"] == True
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_create_duplicate_order_chapter(client: AsyncClient, test_admin, test_course):
    """Test creating a chapter with duplicate order index."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    # First chapter
    await client.post(
        "/api/v1/chapters/",
        json={"course_id": test_course.id, "title": "M1", "order_index": 1}
    )
    
    # Duplicate order
    response = await client.post(
        "/api/v1/chapters/",
        json={"course_id": test_course.id, "title": "M2", "order_index": 1}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["message"].lower()
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_chapters_by_course(client: AsyncClient, test_admin, test_course):
    """Test listing chapters for a course."""
    from app.api.deps import get_admin_or_instructor
    from app.main import app
    app.dependency_overrides[get_admin_or_instructor] = lambda: test_admin
    
    await client.post("/api/v1/chapters/", json={"course_id": test_course.id, "title": "M2", "order_index": 2})
    await client.post("/api/v1/chapters/", json={"course_id": test_course.id, "title": "M1", "order_index": 1})
    
    response = await client.get(f"/api/v1/chapters/course/{test_course.public_id}")
    assert response.status_code == 200
    data = response.json()
    items = data["data"]
    assert len(items) == 2
    # Check ordering
    assert items[0]["order_index"] == 1
    assert items[1]["order_index"] == 2
    
    app.dependency_overrides.clear()
