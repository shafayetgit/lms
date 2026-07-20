import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from app.core.config import init_settings

# Store engines and session makers by event loop to prevent InterfaceError in async tasks
_engines = {}
_session_makers = {}


def get_engine():
    try:
        loop = asyncio.get_running_loop()
        key = id(loop)
    except RuntimeError:
        key = "default"

    if key not in _engines:
        settings = init_settings()
        _engines[key] = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
        )
    return _engines[key]


def get_session_maker():
    try:
        loop = asyncio.get_running_loop()
        key = id(loop)
    except RuntimeError:
        key = "default"

    if key not in _session_makers:
        engine = get_engine()
        _session_makers[key] = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_makers[key]


async def dispose_current_loop_engine():
    """Dispose of the engine associated with the current event loop and clean up cache."""
    try:
        loop = asyncio.get_running_loop()
        key = id(loop)
    except RuntimeError:
        key = "default"

    if key in _engines:
        engine = _engines.pop(key)
        await engine.dispose()
    if key in _session_makers:
        _session_makers.pop(key)


async def get_db():
    async_session = get_session_maker()
    async with async_session() as session:
        yield session