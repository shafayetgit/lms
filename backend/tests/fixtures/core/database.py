import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
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
    """Provide a database session."""
    async_session = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session() as session:
        yield session
