from unittest.mock import patch
import pytest
import uuid
from httpx import AsyncClient


@pytest.fixture
def unique_name():
    return f"Test-Account-{uuid.uuid4().hex[:8]}"


@pytest.mark.asyncio
async def test_get_default_outgoing_account(client: AsyncClient):
    """Test getting default outgoing email account when none exists."""
    response = await client.get("/api/v1/email-accounts/default-outgoing")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert res_json["data"]["configured"] is False


@pytest.mark.asyncio
async def test_create_email_account(client: AsyncClient, unique_name):
    """Test creating an email account with mocked credential validation."""
    with patch(
        "app.services.email_account.EmailAccountService.validate_credentials",
        return_value=None,
    ):
        response = await client.post(
            "/api/v1/email-accounts/",
            json={
                "email_account_name": unique_name,
                "email_id": "test@example.com",
                "service": "GMail",
                "password": "secretpassword",
                "enable_incoming": True,
                "enable_outgoing": True,
                "default_outgoing": True,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email_account_name"] == unique_name
        assert data["email_id"] == "test@example.com"
        assert data["service"] == "GMail"
        assert data["default_outgoing"] is True
        assert "password" not in data
        assert data["has_password"] is True


@pytest.mark.asyncio
async def test_list_email_accounts(client: AsyncClient, unique_name):
    """Test listing email accounts."""
    with patch(
        "app.services.email_account.EmailAccountService.validate_credentials",
        return_value=None,
    ):
        await client.post(
            "/api/v1/email-accounts/",
            json={
                "email_account_name": f"List-1-{unique_name}",
                "email_id": "list1@example.com",
                "service": "Outlook",
                "password": "secretpassword",
                "enable_outgoing": True,
            },
        )

    response = await client.get("/api/v1/email-accounts/")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert len(res_json["data"]) >= 1


@pytest.mark.asyncio
async def test_get_and_update_email_account(client: AsyncClient, unique_name):
    """Test fetching and updating an email account."""
    with patch(
        "app.services.email_account.EmailAccountService.validate_credentials",
        return_value=None,
    ):
        create_resp = await client.post(
            "/api/v1/email-accounts/",
            json={
                "email_account_name": unique_name,
                "email_id": "update@example.com",
                "service": "Resend",
                "password": "secretpassword",
                "enable_outgoing": True,
            },
        )
        public_id = create_resp.json()["public_id"]

        get_resp = await client.get(f"/api/v1/email-accounts/{public_id}")
        assert get_resp.status_code == 200
        assert get_resp.json()["email_account_name"] == unique_name

        update_resp = await client.patch(
            f"/api/v1/email-accounts/{public_id}",
            json={
                "email_account_name": f"Updated-{unique_name}",
                "enable_incoming": True,
            },
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["email_account_name"] == f"Updated-{unique_name}"


@pytest.mark.asyncio
async def test_delete_email_account(client: AsyncClient, unique_name):
    """Test deleting an email account."""
    with patch(
        "app.services.email_account.EmailAccountService.validate_credentials",
        return_value=None,
    ):
        create_resp = await client.post(
            "/api/v1/email-accounts/",
            json={
                "email_account_name": unique_name,
                "email_id": "delete@example.com",
                "service": "SparkPost",
                "password": "secretpassword",
                "enable_outgoing": True,
            },
        )
        public_id = create_resp.json()["public_id"]

        del_resp = await client.delete(f"/api/v1/email-accounts/{public_id}")
        assert del_resp.status_code == 200
        assert del_resp.json() == {
            "success": True,
            "message": "Successfully deleted",
        }

        get_resp = await client.get(f"/api/v1/email-accounts/{public_id}")
        assert get_resp.status_code == 404
