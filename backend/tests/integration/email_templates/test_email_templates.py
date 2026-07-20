import pytest
import uuid
from httpx import AsyncClient


@pytest.fixture
def unique_name():
    return f"template-{uuid.uuid4().hex[:8]}"


@pytest.mark.asyncio
async def test_create_email_template(client: AsyncClient, unique_name):
    """Test creating an email template."""
    response = await client.post(
        "/api/v1/email-templates/",
        json={
            "name": unique_name,
            "subject": "Hello {{ student_name }}",
            "content_type": "plain_text",
            "content": "Welcome to our course {{ title }}",
            "enabled": True,
        },
    )
    assert response.status_code == 201
    res_json = response.json()
    assert res_json["success"] is True
    data = res_json["data"]
    assert data["name"] == unique_name
    assert data["subject"] == "Hello {{ student_name }}"
    assert data["content_type"] == "plain_text"
    assert data["enabled"] is True


@pytest.mark.asyncio
async def test_list_email_templates(client: AsyncClient, unique_name):
    """Test listing email templates."""
    await client.post(
        "/api/v1/email-templates/",
        json={
            "name": f"list-1-{unique_name}",
            "subject": "Test subject",
            "content_type": "plain_text",
            "content": "Hello",
            "enabled": True,
        },
    )

    response = await client.get("/api/v1/email-templates/")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["success"] is True
    assert len(res_json["data"]) >= 1


@pytest.mark.asyncio
async def test_get_and_update_email_template(client: AsyncClient, unique_name):
    """Test fetching and updating an email template."""
    create_resp = await client.post(
        "/api/v1/email-templates/",
        json={
            "name": unique_name,
            "subject": "Original subject",
            "content_type": "plain_text",
            "content": "Original response",
            "enabled": True,
        },
    )
    public_id = create_resp.json()["data"]["public_id"]

    get_resp = await client.get(f"/api/v1/email-templates/{public_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["subject"] == "Original subject"

    update_resp = await client.patch(
        f"/api/v1/email-templates/{public_id}",
        json={
            "subject": "Updated subject",
            "content_type": "html",
            "content": "<h1>Updated HTML</h1>",
            "enabled": False,
        },
    )
    assert update_resp.status_code == 200
    data = update_resp.json()["data"]
    assert data["subject"] == "Updated subject"
    assert data["content_type"] == "html"
    assert data["enabled"] is False


@pytest.mark.asyncio
async def test_delete_email_template(client: AsyncClient, unique_name):
    """Test deleting an email template."""
    create_resp = await client.post(
        "/api/v1/email-templates/",
        json={
            "name": unique_name,
            "subject": "To delete",
            "content_type": "plain_text",
            "content": "Delete me",
            "enabled": True,
        },
    )
    public_id = create_resp.json()["data"]["public_id"]

    del_resp = await client.delete(f"/api/v1/email-templates/{public_id}")
    assert del_resp.status_code == 200
    assert del_resp.json() == {
        "success": True,
        "message": "Successfully deleted",
    }

    get_resp = await client.get(f"/api/v1/email-templates/{public_id}")
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_dynamic_email_rendering(client: AsyncClient, db_session):
    from app.services.email import get_email_service
    from app.models.email_template import EmailTemplate

    # Insert a custom template in the database
    custom_tmpl = EmailTemplate(
        name="email_verification",
        subject="Welcome to our platform {{ user_name }}",
        content_type="html",
        content="<div>Your OTP code is {{ otp }}</div>",
        enabled=True,
    )
    db_session.add(custom_tmpl)
    await db_session.commit()

    email_service = get_email_service()
    subject, html_content, plain_text = await email_service._get_compiled_template(
        template_name="email_verification",
        db=db_session,
        default_subject="Fallback subject",
        default_html_file="verify_email.html",
        default_plain_text="Fallback plain text",
        user_name="John Doe",
        otp="123456"
    )

    assert subject == "Welcome to our platform John Doe"
    assert "Your OTP code is 123456" in html_content
    assert "Your OTP code is 123456" in plain_text
