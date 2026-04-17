import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy import select
from app.models.category import Category

@pytest.fixture
def unique_name():
    """Generate a unique category name for each test."""
    return f"Test-Category-{uuid.uuid4().hex[:8]}"

@pytest.mark.asyncio
async def test_create_category(client: AsyncClient, unique_name):
    """Test creating a simple category."""
    response = await client.post(
        "/api/v1/categories/",
        json={
            "name": unique_name,
            "description": "Integration Test Category"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == unique_name
    assert "slug" in data

@pytest.mark.asyncio
async def test_create_category_with_parent(client: AsyncClient, db_session, unique_name):
    """Test creating a category with a parent."""
    # 1. Create parent
    p_name = f"Parent-{unique_name}"
    p_resp = await client.post(
        "/api/v1/categories/",
        json={"name": p_name}
    )
    assert p_resp.status_code == 201
    
    result = await db_session.execute(select(Category).where(Category.name == p_name))
    parent_id = result.scalars().first().id

    # 2. Create child
    c_name = f"Child-{unique_name}"
    c_resp = await client.post(
        "/api/v1/categories/",
        json={
            "name": c_name,
            "parentId": parent_id
        }
    )
    assert c_resp.status_code == 201
    data = c_resp.json()
    assert data["name"] == c_name
    assert data["parentId"] == parent_id

@pytest.mark.asyncio
async def test_create_duplicate_category(client: AsyncClient, unique_name):
    """Test creating a category with a duplicate name."""
    await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    
    response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["message"].lower()

@pytest.mark.asyncio
async def test_get_categories(client: AsyncClient, unique_name):
    """Test listing categories."""
    await client.post("/api/v1/categories/", json={"name": f"List-1-{unique_name}"})
    await client.post("/api/v1/categories/", json={"name": f"List-2-{unique_name}"})
    
    response = await client.get("/api/v1/categories/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

@pytest.mark.asyncio
async def test_update_category(client: AsyncClient, db_session, unique_name):
    """Test updating a category."""
    # Create
    resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    
    result = await db_session.execute(select(Category).where(Category.name == unique_name))
    cat_id = result.scalars().first().id
    
    # Update
    new_name = f"Updated-{unique_name}"
    update_resp = await client.put(
        f"/api/v1/categories/{cat_id}",
        json={"name": new_name}
    )
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["name"] == new_name

@pytest.mark.asyncio
async def test_delete_category(client: AsyncClient, db_session, unique_name):
    """Test deleting a category."""
    # Create
    del_name = f"Delete-{unique_name}"
    resp = await client.post(
        "/api/v1/categories/",
        json={"name": del_name}
    )

    result = await db_session.execute(select(Category).where(Category.name == del_name))
    cat_id = result.scalars().first().id
    
    # Delete
    del_resp = await client.delete(f"/api/v1/categories/{cat_id}")
    assert del_resp.status_code == 204
    
    # Verify
    get_resp = await client.get(f"/api/v1/categories/{cat_id}")
    assert get_resp.status_code == 404
