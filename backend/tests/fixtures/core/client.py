import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.api.deps import (
    get_db,
    get_admin_or_instructor,
    get_current_user,
    get_current_active_user,
    get_optional_current_user,
)
from app.models.user import User

@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Provide an AsyncClient for testing the app with session override."""
    async def override_get_db():
        yield db_session

    admin_user = User(id=1, role="superadmin", is_active=True)

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_admin_or_instructor] = lambda: admin_user
    app.dependency_overrides[get_current_user] = lambda: admin_user
    app.dependency_overrides[get_current_active_user] = lambda: admin_user
    app.dependency_overrides[get_optional_current_user] = lambda: admin_user
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def unauthenticated_client(db_session):
    """Provide an AsyncClient without admin dependency overrides for testing public/guest requests."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
