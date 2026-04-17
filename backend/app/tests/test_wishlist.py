import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.category import Category
from app.models.course import Course

@pytest_asyncio.fixture
async def test_user(db_session):
    """Create a test user."""
    user = User(
        username=f"u_{uuid.uuid4().hex[:4]}",
        email=f"u_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.STUDENT,
        is_active=True,
        first_name="Test",
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
    
    course = Course(
        title=f"Course-{uuid.uuid4().hex[:4]}",
        slug=f"course-{uuid.uuid4().hex[:4]}",
        instructor_id=instructor.id,
        category_id=category.id,
        price=10.0
    )
    db_session.add(course)
    await db_session.commit()
    await db_session.refresh(course)
    return course

@pytest.mark.asyncio
async def test_add_to_wishlist(client: AsyncClient, test_user, test_course):
    """Test adding a course to wishlist."""
    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: test_user
    
    response = await client.post(
        "/api/v1/wishlist/",
        json={"courseId": test_course.id}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["courseId"] == test_course.id
    assert "course" in data
    assert data["course"]["id"] == test_course.id
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_wishlist(client: AsyncClient, test_user, test_course):
    """Test retrieving user wishlist."""
    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: test_user
    
    await client.post("/api/v1/wishlist/", json={"courseId": test_course.id})
    
    response = await client.get("/api/v1/wishlist/")
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_delete_from_wishlist(client: AsyncClient, test_user, test_course):
    """Test removing from wishlist."""
    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: test_user
    
    await client.post("/api/v1/wishlist/", json={"courseId": test_course.id})
    
    response = await client.delete(f"/api/v1/wishlist/{test_course.id}")
    assert response.status_code == 204
    
    # Verify empty
    get_resp = await client.get("/api/v1/wishlist/")
    assert len(get_resp.json()) == 0
    
    app.dependency_overrides.clear()
