import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from app.models.user import User
from app.models.category import Category
from sqlalchemy import select

@pytest.fixture
def unique_title():
    """Generate a unique course title for each test."""
    return f"Test-Course-{uuid.uuid4().hex[:8]}"


@pytest.mark.asyncio
async def test_create_course(client: AsyncClient, unique_title, test_instructor, test_category):
    """Test creating a course."""
    response = await client.post(
        "/api/v1/courses/",
        json={
            "title": unique_title,
            "instructor_public_ids": [test_instructor.public_id],
            "category_public_id": test_category.public_id,
            "description": "Integration Test Course",
            "course_price": 49.99
        }
    )
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["title"] == unique_title
    assert data["instructors"][0]["public_id"] == test_instructor.public_id
    assert data["category"]["public_id"] == test_category.public_id
    assert "slug" in data

@pytest.mark.asyncio
async def test_get_courses(client: AsyncClient, unique_title, test_instructor, test_category):
    """Test listing courses."""
    await client.post(
        "/api/v1/courses/",
        json={"title": f"L1-{unique_title}", "instructor_public_ids": [test_instructor.public_id], "category_public_id": test_category.public_id}
    )
    
    response = await client.get("/api/v1/courses/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) >= 1

@pytest.mark.asyncio
async def test_update_course(client: AsyncClient, unique_title, test_instructor, test_category):
    resp = await client.post(
        "/api/v1/courses/",
        json={"title": unique_title, "instructor_public_ids": [test_instructor.public_id], "category_public_id": test_category.public_id}
    )
    course_public_id = resp.json()["data"]["public_id"]
    
    new_title = f"Updated-{unique_title}"
    update_resp = await client.put(
        f"/api/v1/courses/{course_public_id}",
        json={"title": new_title}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["data"]["title"] == new_title

@pytest.mark.asyncio
async def test_delete_course(client: AsyncClient, unique_title, test_instructor, test_category):
    resp = await client.post(
        "/api/v1/courses/",
        json={"title": f"Del-{unique_title}", "instructor_public_ids": [test_instructor.public_id], "category_public_id": test_category.public_id}
    )
    course_public_id = resp.json()["data"]["public_id"]
    
    del_resp = await client.delete(f"/api/v1/courses/{course_public_id}")
    assert del_resp.status_code == 204
    
    get_resp = await client.get(f"/api/v1/courses/{course_public_id}")
    assert get_resp.status_code == 404
