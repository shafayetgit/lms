import pytest
import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.invitation import Invitation


@pytest.fixture
async def admin_user(db_session: AsyncSession):
    user = User(
        username=f"admin_inv_{uuid.uuid4().hex[:8]}",
        email=f"admin_inv_{uuid.uuid4().hex[:8]}@example.com",
        first_name="Admin",
        last_name="Inviter",
        hashed_password="hash",
        role="admin",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_create_and_list_invitations(client: AsyncClient, db_session: AsyncSession, admin_user: User):
    from app.api.deps import get_current_active_user
    from app.main import app

    app.dependency_overrides[get_current_active_user] = lambda: admin_user

    try:
        # Create invitations
        payload = {
            "emails": ["user1@example.com", "user2@example.com"],
            "role": "instructor",
        }
        res = await client.post("/api/v1/invitations/", json=payload)
        assert res.status_code == 201
        assert res.json()["success"] is True
        assert res.json()["data"]["invited"] == 2

        # List invitations
        res = await client.get("/api/v1/invitations/")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert len(data["data"]) >= 2
        assert data["meta"]["total"] >= 2
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_delete_invitation(client: AsyncClient, db_session: AsyncSession, admin_user: User):
    from app.api.deps import get_current_active_user
    from app.main import app

    inv = Invitation(
        email=f"delete_inv_{uuid.uuid4().hex[:8]}@example.com",
        role="student",
        status="pending",
    )
    db_session.add(inv)
    await db_session.commit()
    await db_session.refresh(inv)

    app.dependency_overrides[get_current_active_user] = lambda: admin_user

    try:
        res = await client.delete(f"/api/v1/invitations/{inv.public_id}")
        assert res.status_code == 200
        assert res.json()["success"] is True
    finally:
        app.dependency_overrides.clear()
