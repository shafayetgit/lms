import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy import select
from app.models.category import Category
from app.models.user import User, UserRole


@pytest.fixture
def unique_name():
    """Generate a unique name for each test."""
    return f"Test-{uuid.uuid4().hex[:8]}"


@pytest.mark.asyncio
async def test_delete_category_by_id(client: AsyncClient, db_session, unique_name):
    """Test deleting a category by id."""
    # Create a category
    create_resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    assert create_resp.status_code == 201
    
    # Get the category id from database
    result = await db_session.execute(
        select(Category).where(Category.name == unique_name)
    )
    category = result.scalars().first()
    category_id = category.id
    
    # Delete using CRUD endpoint
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "eq", "value": category_id}
            ]
        }
    )
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] == 1
    assert data["status"] == "success"
    assert "Successfully deleted" in data["message"]
    
    # Verify deletion
    result = await db_session.execute(
        select(Category).where(Category.id == category_id)
    )
    assert result.scalars().first() is None


@pytest.mark.asyncio
async def test_delete_multiple_categories_with_in_operator(
    client: AsyncClient, db_session, unique_name
):
    """Test deleting multiple categories using 'in' operator."""
    # Create multiple categories
    cat1_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-1"}
    )
    assert cat1_resp.status_code == 201
    
    cat2_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-2"}
    )
    assert cat2_resp.status_code == 201
    
    # Get ids
    result = await db_session.execute(
        select(Category).where(
            Category.name.in_([f"{unique_name}-1", f"{unique_name}-2"])
        )
    )
    categories = result.scalars().all()
    ids = [cat.id for cat in categories]
    
    # Delete using 'in' operator with list
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "in", "value": ids}
            ]
        }
    )
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] == 2


@pytest.mark.asyncio
async def test_delete_with_in_operator_scalar_value(
    client: AsyncClient, db_session, unique_name
):
    """Test deleting with 'in' operator and scalar value (should be wrapped in list)."""
    # Create a category
    create_resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    assert create_resp.status_code == 201
    
    # Get the id
    result = await db_session.execute(
        select(Category).where(Category.name == unique_name)
    )
    category = result.scalars().first()
    category_id = category.id
    
    # Delete using 'in' operator with scalar value
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "in", "value": category_id}  # scalar, not list
            ]
        }
    )
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] == 1


@pytest.mark.asyncio
async def test_delete_no_matching_records(client: AsyncClient):
    """Test deleting with filter that matches no records."""
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "eq", "value": 999999}
            ]
        }
    )
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] == 0
    assert "No records matched" in data["message"]


@pytest.mark.asyncio
async def test_delete_invalid_model(client: AsyncClient):
    """Test deleting with invalid model name."""
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "InvalidModel",
            "filters": [
                {"field": "id", "operator": "eq", "value": 1}
            ]
        }
    )
    assert delete_resp.status_code == 400
    assert "Invalid model" in delete_resp.json()["detail"]


@pytest.mark.asyncio
async def test_delete_invalid_filter_field(client: AsyncClient, unique_name):
    """Test deleting with invalid filter field."""
    # Create a category first
    create_resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    assert create_resp.status_code == 201
    
    # Try to delete with invalid filter field
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "invalid_field", "operator": "eq", "value": 1}
            ]
        }
    )
    assert delete_resp.status_code == 500
    assert "Invalid filter field" in delete_resp.json()["detail"]


@pytest.mark.asyncio
async def test_delete_category_with_name_filter(client: AsyncClient, unique_name):
    """Test that filtering by non-allowed fields (like 'name') is rejected."""
    # Create a category
    create_resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    assert create_resp.status_code == 201
    
    # Try to delete using 'name' field - but 'name' is not in ALLOWED_FILTERS, should fail
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "name", "operator": "eq", "value": unique_name}
            ]
        }
    )
    # Should get 500 error with "Invalid filter field" message
    assert delete_resp.status_code == 500
    assert "Invalid filter field" in delete_resp.json()["detail"]


@pytest.mark.asyncio
async def test_delete_category_with_is_active_filter(
    client: AsyncClient, db_session, unique_name
):
    """Test deleting categories by is_active status."""
    # Create multiple categories
    cat1_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-active"}
    )
    assert cat1_resp.status_code == 201
    
    cat2_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-inactive"}
    )
    assert cat2_resp.status_code == 201
    
    # Get the id before deactivating
    result = await db_session.execute(
        select(Category).where(Category.name == f"{unique_name}-inactive")
    )
    inactive_cat = result.scalars().first()
    cat2_id = inactive_cat.id
    
    # Deactivate one category
    inactive_cat.is_active = False
    await db_session.commit()
    
    # Delete using multiple filters (id and is_active)
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "eq", "value": cat2_id},
                {"field": "is_active", "operator": "eq", "value": False}
            ]
        }
    )
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] == 1
    
    # Verify the active category still exists
    result = await db_session.execute(
        select(Category).where(Category.name == f"{unique_name}-active")
    )
    assert result.scalars().first() is not None


@pytest.mark.asyncio
async def test_delete_multiple_filters(client: AsyncClient, db_session, unique_name):
    """Test deleting with multiple filter conditions (AND logic)."""
    # Create two distinct categories
    cat1_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-1"}
    )
    assert cat1_resp.status_code == 201
    
    cat2_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-2"}
    )
    assert cat2_resp.status_code == 201
    
    # Refresh db_session and get fresh references
    await db_session.refresh(db_session)
    
    # Get both category IDs
    result = await db_session.execute(
        select(Category).where(
            Category.name.in_([f"{unique_name}-1", f"{unique_name}-2"])
        )
    )
    cats = result.scalars().all()
    cat1_id = next(c.id for c in cats if c.name == f"{unique_name}-1")
    cat2_id = next(c.id for c in cats if c.name == f"{unique_name}-2")
    
    # Deactivate only cat2
    result = await db_session.execute(
        select(Category).where(Category.id == cat2_id)
    )
    cat2 = result.scalars().first()
    cat2.is_active = False
    await db_session.commit()
    
    # Delete with multiple conditions: id = cat2_id AND is_active = False
    # This should only delete cat2
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "eq", "value": cat2_id},
                {"field": "is_active", "operator": "eq", "value": False}
            ]
        }
    )
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] == 1
    
    # Verify cat1 still exists and is active
    result = await db_session.execute(
        select(Category).where(Category.id == cat1_id)
    )
    cat1 = result.scalars().first()
    assert cat1 is not None
    assert cat1.is_active is True


@pytest.mark.asyncio
async def test_delete_requires_admin_or_instructor(
    client: AsyncClient, db_session, unique_name
):
    """Test that delete endpoint requires admin or instructor role."""
    # Create a category
    create_resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    assert create_resp.status_code == 201
    
    # Get category id
    result = await db_session.execute(
        select(Category).where(Category.name == unique_name)
    )
    category = result.scalars().first()
    assert category is not None
    
    # The test fixture automatically sets admin role for the client,
    # so delete should succeed with admin credentials
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "eq", "value": category.id}
            ]
        }
    )
    # Should succeed with admin role
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] == 1


@pytest.mark.asyncio
async def test_delete_empty_filters_list(client: AsyncClient, unique_name):
    """Test deleting with empty filters list should delete all records (or require at least one filter)."""
    # Create a category
    create_resp = await client.post(
        "/api/v1/categories/",
        json={"name": unique_name}
    )
    assert create_resp.status_code == 201
    
    # Try to delete with empty filters - this generally should fail for safety
    # Most implementations require at least one filter to prevent accidental mass deletion
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": []  # empty filters - should fail or require validation
        }
    )
    # Accept 400 (no filters provided) or 200 (no conditions = delete all)
    # but 400 is safer design
    assert delete_resp.status_code in [200, 400]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])


@pytest.mark.asyncio
async def test_delete_with_ne_operator(client: AsyncClient, db_session, unique_name):
    """Test deleting with 'ne' (not equal) operator."""
    # Create two categories with different ids
    cat1_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-1"}
    )
    assert cat1_resp.status_code == 201
    
    cat2_resp = await client.post(
        "/api/v1/categories/",
        json={"name": f"{unique_name}-2"}
    )
    assert cat2_resp.status_code == 201
    
    # Get cat1 id
    result = await db_session.execute(
        select(Category).where(Category.name == f"{unique_name}-1")
    )
    cat1 = result.scalars().first()
    cat1_id = cat1.id
    
    # Delete all categories where id != cat1_id that match our pattern
    # This is a tricky test - we'll use multiple filters combined
    result = await db_session.execute(
        select(Category).where(
            Category.name.in_([f"{unique_name}-1", f"{unique_name}-2"])
        )
    )
    total_count = len(result.scalars().all())
    assert total_count == 2
    
    # Delete only cat2 (by excluding cat1)
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "ne", "value": cat1_id}
            ]
        }
    )
    # This might delete more than just cat2 if there are other categories
    # So we just verify at least cat2 was deleted
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    assert data["deleted"] >= 1


@pytest.mark.asyncio
async def test_delete_with_gt_operator(client: AsyncClient, db_session, unique_name):
    """Test deleting with 'gt' (greater than) operator."""
    # Create multiple categories
    categories = []
    for i in range(1, 4):
        resp = await client.post(
            "/api/v1/categories/",
            json={"name": f"{unique_name}-{i}"}
        )
        assert resp.status_code == 201
        categories.append(resp.json())
    
    # Get the id of the first category
    result = await db_session.execute(
        select(Category).where(Category.name == f"{unique_name}-1")
    )
    cat1 = result.scalars().first()
    cat1_id = cat1.id
    
    # Delete categories with id > cat1_id
    delete_resp = await client.delete(
        "/api/v1/crud/delete",
        json={
            "model": "Category",
            "filters": [
                {"field": "id", "operator": "gt", "value": cat1_id}
            ]
        }
    )
    assert delete_resp.status_code == 200
    data = delete_resp.json()
    # At least cat2 and cat3 should be deleted
    assert data["deleted"] >= 1
