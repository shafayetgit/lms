import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User, UserRole
from app.models.category import Category
from sqlalchemy import select

@pytest.fixture
def unique_title():
    """Generate a unique course title for each test."""
    return f"Test-Course-{uuid.uuid4().hex[:8]}"

@pytest_asyncio.fixture
async def test_category(db_session):
    """Create a category to use in course tests."""
    category = Category(name=f"Cat-{uuid.uuid4().hex[:4]}", slug=f"cat-{uuid.uuid4().hex[:4]}")
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)
    return category

@pytest_asyncio.fixture
async def test_instructor(db_session):
    """Create an instructor user in the DB to satisfy FK constraints."""
    user = User(
        username=f"instructor_{uuid.uuid4().hex[:4]}",
        email=f"instructor_{uuid.uuid4().hex[:4]}@example.com",
        hashed_password="hashed",
        role=UserRole.INSTRUCTOR,
        is_active=True,
        first_name="Test",
        last_name="Instructor"
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user

@pytest.mark.asyncio
async def test_create_course(client: AsyncClient, unique_title, test_instructor, test_category):
    """Test creating a course."""
    response = await client.post(
        "/api/v1/courses/",
        json={
            "title": unique_title,
            "instructorId": test_instructor.id,
            "categoryId": test_category.id,
            "description": "Integration Test Course",
            "price": 49.99
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == unique_title
    assert data["instructorId"] == test_instructor.id
    assert data["categoryId"] == test_category.id
    assert "slug" in data

@pytest.mark.asyncio
async def test_get_courses(client: AsyncClient, unique_title, test_instructor, test_category):
    """Test listing courses."""
    await client.post(
        "/api/v1/courses/",
        json={"title": f"L1-{unique_title}", "instructorId": test_instructor.id, "categoryId": test_category.id}
    )
    
    response = await client.get("/api/v1/courses/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

@pytest.mark.asyncio
async def test_update_course(client: AsyncClient, unique_title, test_instructor, test_category):
    """Test updating a course."""
    # Create
    resp = await client.post(
        "/api/v1/courses/",
        json={"title": unique_title, "instructorId": test_instructor.id, "categoryId": test_category.id}
    )
    course_id = resp.json()["id"]
    
    # Update
    new_title = f"Updated-{unique_title}"
    update_resp = await client.put(
        f"/api/v1/courses/{course_id}",
        json={"title": new_title}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == new_title

@pytest.mark.asyncio
async def test_delete_course(client: AsyncClient, unique_title, test_instructor, test_category):
    """Test deleting a course."""
    # Create
    resp = await client.post(
        "/api/v1/courses/",
        json={"title": f"Del-{unique_title}", "instructorId": test_instructor.id, "categoryId": test_category.id}
    )
    course_id = resp.json()["id"]
    
    # Delete
    del_resp = await client.delete(f"/api/v1/courses/{course_id}")
    assert del_resp.status_code == 204
    
    # Verify
    get_resp = await client.get(f"/api/v1/courses/{course_id}")
    assert get_resp.status_code == 404
