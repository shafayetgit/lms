import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.main import app
from app.api.deps import get_db, get_admin_or_instructor
from app.models.user import User, UserRole
from app.core.config import init_settings

settings = init_settings()

@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create an engine for each test function to avoid loop scoping issues."""
    engine = create_async_engine(
        settings.DATABASE_URL,
        poolclass=NullPool
    )
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    """Provide a database session. 
    Note: We avoid pre-starting transactions here to prevent asyncpg InterfaceErrors.
    """
    async_session = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session() as session:
        yield session

@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Provide an AsyncClient for testing the app with session override."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_admin_or_instructor] = lambda: User(id=1, role=UserRole.ADMIN, is_active=True)
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac
    app.dependency_overrides.clear()
