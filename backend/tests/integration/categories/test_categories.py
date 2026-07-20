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
    data = response.json()["data"]
    print("DEBUG_DATA_CATEGORIES:", data)
    assert data["name"] == unique_name

@pytest.mark.asyncio
async def test_create_category_with_parent(client: AsyncClient, db_session, unique_name):
    p_name = f"Parent-{unique_name}"
    p_resp = await client.post(
        "/api/v1/categories/",
        json={"name": p_name}
    )
    assert p_resp.status_code == 201
    
    result = await db_session.execute(select(Category).where(Category.name == p_name))
    parent_public_id = result.scalars().first().public_id

    c_name = f"Child-{unique_name}"
    c_resp = await client.post(
        "/api/v1/categories/",
        json={
            "name": c_name,
            "parent_public_id": parent_public_id
        }
    )
    assert c_resp.status_code == 201
    data = c_resp.json()["data"]
    assert data["name"] == c_name
    assert data.get("parent_public_id") == parent_public_id

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
    assert "already exists" in str(response.json()).lower()

@pytest.mark.asyncio
async def test_get_categories(client: AsyncClient, unique_name):
    """Test listing categories."""
    await client.post("/api/v1/categories/", json={"name": f"List-1-{unique_name}"})
    await client.post("/api/v1/categories/", json={"name": f"List-2-{unique_name}"})
    
    response = await client.get("/api/v1/categories/")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 2

@pytest.mark.asyncio
async def test_update_category(client: AsyncClient, db_session, unique_name):
    resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    
    result = await db_session.execute(select(Category).where(Category.name == unique_name))
    cat_public_id = result.scalars().first().public_id
    
    new_name = f"Updated-{unique_name}"
    update_resp = await client.put(
        f"/api/v1/categories/{cat_public_id}",
        json={"name": new_name}
    )
    assert update_resp.status_code == 200
    data = update_resp.json()["data"]
    assert data["name"] == new_name

@pytest.mark.asyncio
async def test_delete_category(client: AsyncClient, db_session, unique_name):
    del_name = f"Delete-{unique_name}"
    resp = await client.post(
        "/api/v1/categories/",
        json={"name": del_name}
    )

    result = await db_session.execute(select(Category).where(Category.name == del_name))
    cat_public_id = result.scalars().first().public_id
    
    del_resp = await client.delete(f"/api/v1/categories/{cat_public_id}")
    assert del_resp.status_code == 200
    assert del_resp.json() == {
        "success": True,
        "message": "Successfully deleted"
    }
    
    get_resp = await client.get(f"/api/v1/categories/{cat_public_id}")
    assert get_resp.status_code == 404

@pytest.mark.asyncio
async def test_get_category_by_public_id(client: AsyncClient, unique_name):
    resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name, "description": "Single category test"}
    )
    assert resp.status_code == 201
    cat_public_id = resp.json()["data"]["public_id"]
    
    get_resp = await client.get(f"/api/v1/categories/{cat_public_id}")
    assert get_resp.status_code == 200
    res_json = get_resp.json()
    assert res_json["success"] is True
    assert res_json["data"]["public_id"] == cat_public_id
    assert res_json["data"]["name"] == unique_name

@pytest.mark.asyncio
async def test_get_category_not_found(client: AsyncClient):
    """Test retrieving a non-existent category."""
    response = await client.get("/api/v1/categories/nonexistent-uuid")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_categories_is_portal(unauthenticated_client: AsyncClient, client: AsyncClient, unique_name):
    """Test listing categories with is_portal=true without permission or authentication."""
    await client.post("/api/v1/categories/", json={"name": f"Portal-Cat-{unique_name}", "is_active": True})
    
    response = await unauthenticated_client.get("/api/v1/categories/?is_portal=true&size=8")
    assert response.status_code == 200
    res_json = response.json()
    assert "data" in res_json
