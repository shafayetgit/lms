from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import init_settings

# Lazy initialization
_engine = None
_session_maker = None


def get_engine():
    global _engine
    if _engine is None:
        settings = init_settings()
        _engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
        )
    return _engine


def get_session_maker():
    global _session_maker
    if _session_maker is None:
        engine = get_engine()
        _session_maker = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_maker


async def get_db():
    async_session = get_session_maker()
    async with async_session() as session:
        yield session