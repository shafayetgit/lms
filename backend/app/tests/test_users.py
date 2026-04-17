import pytest
import pytest_asyncio
from httpx import AsyncClient
from unittest.mock import MagicMock, patch, AsyncMock
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.models.user import User, UserRole
from app.core.security import get_password_hash

@pytest_asyncio.fixture(autouse=True)
async def cleanup_test_users(db_session: AsyncSession):
    """Clean up test users before and after each test."""
    emails = [
        "testreg_unique@example.com",
        "testverify_unique@example.com",
        "testlogin_unique@example.com",
        "testupdate_unique@example.com",
        "testunverified_unique@example.com"
    ]
    # Clean before
    await db_session.execute(delete(User).where(User.email.in_(emails)))
    await db_session.commit()
    yield
    # Clean after
    await db_session.execute(delete(User).where(User.email.in_(emails)))
    await db_session.commit()

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, db_session: AsyncSession):
    # Mock OTP and Email services
    with patch("app.api.v1.endpoints.auth.get_otp_service") as mock_otp_service, \
         patch("app.api.v1.endpoints.auth.get_email_service") as mock_email_service:
        
        mock_otp = MagicMock()
        mock_otp.send_email_otp = AsyncMock(return_value="123456")
        mock_otp_service.return_value = mock_otp
        
        mock_email = MagicMock()
        mock_email.send_verification_email = AsyncMock()
        mock_email_service.return_value = mock_email
        
        payload = {
            "username": "testuser_reg_unique",
            "email": "testreg_unique@example.com",
            "password": "StrongPassword123!",
            "firstName": "Test",
            "lastName": "User"
        }
        
        response = await client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "success"
        assert data["user"]["username"] == "testuser_reg_unique"
        assert "message" in data

@pytest.mark.asyncio
async def test_verify_email(client: AsyncClient, db_session: AsyncSession):
    # 1. Create a user manually
    user = User(
        username="testuser_verify_unique",
        email="testverify_unique@example.com",
        first_name="Verify",
        last_name="User",
        hashed_password=get_password_hash("Password123!"),
        email_verified=False,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()

    # 2. Mock OTP verification
    with patch("app.api.v1.endpoints.auth.get_otp_service") as mock_otp_service, \
         patch("app.api.v1.endpoints.auth.get_email_service") as mock_email_service:
        
        mock_otp = MagicMock()
        mock_otp.verify_email_otp = AsyncMock(return_value=True)
        mock_otp_service.return_value = mock_otp
        
        mock_email = MagicMock()
        mock_email.send_welcome_email = AsyncMock()
        mock_email_service.return_value = mock_email
        
        payload = {
            "email": "testverify_unique@example.com",
            "otp": "123456"
        }
        
        response = await client.post("/api/v1/auth/verify-email", json=payload)
        assert response.status_code == 200
        assert response.json()["message"] == "Email verified successfully"
        
        # Verify DB update
        await db_session.refresh(user)
        assert user.email_verified is True

@pytest.mark.asyncio
async def test_login_and_me(client: AsyncClient, db_session: AsyncSession):
    # 1. Create a verified user
    username = "testuser_login_unique"
    password = "Password123!"
    user = User(
        username=username,
        email="testlogin_unique@example.com",
        first_name="Login",
        last_name="User",
        hashed_password=get_password_hash(password),
        email_verified=True,
        is_active=True,
        role=UserRole.STUDENT
    )
    db_session.add(user)
    await db_session.commit()

    # 2. Login
    login_payload = {
        "username": username,
        "password": password
    }
    response = await client.post("/api/v1/auth/token", json=login_payload)
    assert response.status_code == 200
    token_data = response.json()
    assert "accessToken" in token_data
    access_token = token_data["accessToken"]

    # 3. Get /me
    headers = {"Authorization": f"Bearer {access_token}"}
    response_me = await client.get("/api/v1/users/me", headers=headers)
    assert response_me.status_code == 200
    assert response_me.json()["username"] == username

@pytest.mark.asyncio
async def test_update_user(client: AsyncClient, db_session: AsyncSession):
    # 1. Create a user
    user = User(
        username="testuser_update_unique",
        email="testupdate_unique@example.com",
        hashed_password=get_password_hash("Password123!"),
        first_name="Old",
        last_name="Name",
        email_verified=True,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    # 2. Update user
    update_payload = {
        "firstName": "New",
        "lastName": "Name"
    }
    
    from app.api.deps import get_current_active_user
    from app.main import app
    app.dependency_overrides[get_current_active_user] = lambda: user

    try:
        response = await client.put(f"/api/v1/users/{user.id}", json=update_payload)
        assert response.status_code == 200
        assert response.json()["firstName"] == "New"
    finally:
        app.dependency_overrides.clear()
    
    # Verify DB
    await db_session.refresh(user)
    assert user.first_name == "New"

@pytest.mark.asyncio
async def test_login_unverified_fails(client: AsyncClient, db_session: AsyncSession):
    # 1. Create unverified user
    username = "testuser_unverified_unique"
    password = "Password123!"
    user = User(
        username=username,
        email="testunverified_unique@example.com",
        first_name="Unverified",
        last_name="User",
        hashed_password=get_password_hash(password),
        email_verified=False,
        is_active=True
    )
    db_session.add(user)
    await db_session.commit()

    # 2. Attempt Login
    login_payload = {
        "username": username,
        "password": password
    }
    response = await client.post("/api/v1/auth/token", json=login_payload)
    assert response.status_code == 403
    # Flexible check for error message
    details = response.json()
    assert "Email not verified" in str(details)
