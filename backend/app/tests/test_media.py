import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy import select
from app.models.media import Media
from app.models.category import Category


@pytest.fixture
def unique_category_name():
    """Generate a unique category name for each test."""
    return f"Test-Category-{uuid.uuid4().hex[:8]}"


@pytest.mark.asyncio
async def test_attach_media_to_category(client: AsyncClient, db_session, unique_category_name):
    """Test attaching media to a category."""
    # 1. Create a category
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_category_name}
    )
    assert cat_response.status_code == 201
    category_id = cat_response.json()["id"]
    
    # 2. Attach media
    media_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": category_id,
            "meta": {
                "asset_id": "815fe976251c0fd03f6a1770828b5826",
                "public_id": "uploads/cnjmodrdyhq1htwau5ik",
                "version": 1777908621,
                "width": 720,
                "height": 720,
                "format": "jpg",
                "resource_type": "image",
                "bytes": 33250,
                "url": "http://res.cloudinary.com/deu2mmdzj/image/upload/v1777908621/uploads/cnjmodrdyhq1htwau5ik.jpg",
                "secure_url": "https://res.cloudinary.com/deu2mmdzj/image/upload/v1777908621/uploads/cnjmodrdyhq1htwau5ik.jpg",
                "original_filename": "avatar",
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data) == 1
    assert data[0]["model"] == "Category"
    assert data[0]["modelId"] == category_id
    assert data[0]["isUsed"] is True
    
    # 3. Verify category thumbnail was updated
    category_response = await client.get(f"/api/v1/categories/{category_id}")
    assert category_response.status_code == 200
    category_data = category_response.json()
    assert category_data["thumbnail"] == "https://res.cloudinary.com/deu2mmdzj/image/upload/v1777908621/uploads/cnjmodrdyhq1htwau5ik.jpg"


@pytest.mark.asyncio
async def test_attach_multiple_media(client: AsyncClient, db_session, unique_category_name):
    """Test attaching multiple media items."""
    # Create a category
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_category_name}
    )
    category_id = cat_response.json()["id"]
    
    # Attach multiple media
    media_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": category_id,
            "meta": {
                "public_id": "uploads/media1",
                "secure_url": "https://res.cloudinary.com/media1.jpg",
                "format": "jpg",
                "resource_type": "image",
            }
        },
        {
            "field": "banner",
            "model": "Category",
            "model_id": category_id,
            "meta": {
                "public_id": "uploads/media2",
                "secure_url": "https://res.cloudinary.com/media2.jpg",
                "format": "jpg",
                "resource_type": "image",
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data) == 2
    assert data[0]["isUsed"] is True
    assert data[1]["isUsed"] is True


@pytest.mark.asyncio
async def test_attach_media_model_not_found(client: AsyncClient):
    """Test attaching media to a non-existent model."""
    media_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": 99999,  # Non-existent ID
            "meta": {
                "public_id": "uploads/test",
                "secure_url": "https://res.cloudinary.com/test.jpg",
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 400
    assert "not found" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_attach_media_invalid_model(client: AsyncClient):
    """Test attaching media to an invalid model type."""
    media_payload = [
        {
            "field": "thumbnail",
            "model": "InvalidModel",
            "model_id": 1,
            "meta": {
                "public_id": "uploads/test",
                "secure_url": "https://res.cloudinary.com/test.jpg",
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 400
    assert "unknown model" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_attach_media_missing_secure_url(client: AsyncClient, db_session, unique_category_name):
    """Test attaching media without secure_url in metadata."""
    # Create a category
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_category_name}
    )
    category_id = cat_response.json()["id"]
    
    # Try to attach media without secure_url
    media_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": category_id,
            "meta": {
                "public_id": "uploads/test",
                # Missing secure_url
                "format": "jpg",
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 400
    assert "secure_url" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_attach_media_full_payload(client: AsyncClient, db_session, unique_category_name):
    """Test attaching media with complete Cloudinary payload."""
    # Create a category
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_category_name}
    )
    category_id = cat_response.json()["id"]
    
    # Attach media with full payload
    full_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": category_id,
            "meta": {
                "asset_id": "815fe976251c0fd03f6a1770828b5826",
                "public_id": "uploads/cnjmodrdyhq1htwau5ik",
                "version": 1777908621,
                "version_id": "94a0ec3e5b210bf330d153038eb1222c",
                "signature": "63e000a57fb0211337777ba9f3d90c06c98a7e83",
                "width": 720,
                "height": 720,
                "format": "jpg",
                "resource_type": "image",
                "created_at": "2026-05-04T15:30:21Z",
                "tags": [],
                "bytes": 33250,
                "type": "upload",
                "etag": "2a26ce47122bb1f5841890d5a153d56e",
                "placeholder": False,
                "url": "http://res.cloudinary.com/deu2mmdzj/image/upload/v1777908621/uploads/cnjmodrdyhq1htwau5ik.jpg",
                "secure_url": "https://res.cloudinary.com/deu2mmdzj/image/upload/v1777908621/uploads/cnjmodrdyhq1htwau5ik.jpg",
                "asset_folder": "ecofin_institute",
                "display_name": "avatar",
                "original_filename": "avatar",
                "original_extension": "jpeg"
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=full_payload
    )
    assert response.status_code == 201
    data = response.json()
    assert len(data) == 1
    media = data[0]
    
    # Verify metadata is stored
    assert media["meta"]["asset_id"] == "815fe976251c0fd03f6a1770828b5826"
    assert media["meta"]["public_id"] == "uploads/cnjmodrdyhq1htwau5ik"
    assert media["meta"]["width"] == 720
    assert media["meta"]["height"] == 720


@pytest.mark.asyncio
async def test_media_is_used_flag(client: AsyncClient, db_session, unique_category_name):
    """Test that media is marked as used when attached."""
    # Create a category
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_category_name}
    )
    category_id = cat_response.json()["id"]
    
    # Attach media
    media_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": category_id,
            "meta": {
                "public_id": "uploads/test",
                "secure_url": "https://res.cloudinary.com/test.jpg",
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 201
    
    # Verify is_used is True
    media = response.json()[0]
    assert media["isUsed"] is True
    
    # Verify in database
    result = await db_session.execute(select(Media).where(Media.id == media["id"]))
    db_media = result.scalars().first()
    assert db_media.is_used is True


@pytest.mark.asyncio
async def test_media_meta_stored_correctly(client: AsyncClient, db_session, unique_category_name):
    """Test that media metadata is stored correctly in database."""
    # Create a category
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_category_name}
    )
    category_id = cat_response.json()["id"]
    
    # Attach media
    meta_data = {
        "public_id": "uploads/test123",
        "secure_url": "https://res.cloudinary.com/test.jpg",
        "width": 800,
        "height": 600,
        "format": "png",
        "bytes": 50000,
        "custom_field": "custom_value"
    }
    
    media_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": category_id,
            "meta": meta_data
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 201
    
    # Verify in database
    media_id = response.json()[0]["id"]
    result = await db_session.execute(select(Media).where(Media.id == media_id))
    db_media = result.scalars().first()
    
    assert db_media.meta["public_id"] == "uploads/test123"
    assert db_media.meta["secure_url"] == "https://res.cloudinary.com/test.jpg"
    assert db_media.meta["width"] == 800
    assert db_media.meta["custom_field"] == "custom_value"


@pytest.mark.asyncio
async def test_attach_media_model_references(client: AsyncClient, db_session, unique_category_name):
    """Test that media model and model_id references are correct."""
    # Create a category
    cat_response = await client.post(
        "/api/v1/categories/",
        json={"name": unique_category_name}
    )
    category_id = cat_response.json()["id"]
    
    # Attach media
    media_payload = [
        {
            "field": "thumbnail",
            "model": "Category",
            "model_id": category_id,
            "meta": {
                "public_id": "uploads/test",
                "secure_url": "https://res.cloudinary.com/test.jpg",
            }
        }
    ]
    
    response = await client.post(
        "/api/v1/media/attach",
        json=media_payload
    )
    assert response.status_code == 201
    
    # Get media from database
    result = await db_session.execute(
        select(Media).where(Media.model == "Category").where(Media.model_id == category_id)
    )
    media_list = result.scalars().all()
    
    assert len(media_list) == 1
    assert media_list[0].model == "Category"
    assert media_list[0].model_id == category_id
