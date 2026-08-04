import logging
from typing import Optional
import redis.asyncio as aioredis
from app.core.config import init_settings

logger = logging.getLogger(__name__)


class RedisManager:
    """
    Centralized Redis connection manager utilizing connection pooling.
    """
    _pool: Optional[aioredis.ConnectionPool] = None
    _client: Optional[aioredis.Redis] = None
    _loop = None

    @classmethod
    def get_client(cls) -> Optional[aioredis.Redis]:
        import asyncio
        try:
            current_loop = asyncio.get_running_loop()
        except RuntimeError:
            current_loop = None

        if cls._client is not None and cls._loop is not current_loop:
            if cls._pool:
                try:
                    if current_loop and current_loop.is_running():
                        current_loop.create_task(cls._pool.disconnect())
                except Exception:
                    pass
            cls._client = None
            cls._pool = None
            cls._loop = None

        if cls._client is None:
            try:
                settings = init_settings()
                cls._pool = aioredis.ConnectionPool.from_url(
                    settings.REDIS_URL,
                    decode_responses=True,
                    max_connections=20,
                    socket_timeout=2.0,
                    socket_connect_timeout=2.0,
                )
                cls._client = aioredis.Redis(connection_pool=cls._pool)
                cls._loop = current_loop
                logger.info("Initialized Redis connection pool successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Redis connection pool: {e}")
                return None
        return cls._client

    @classmethod
    async def close(cls) -> None:
        if cls._client:
            await cls._client.close()
            cls._client = None
        if cls._pool:
            await cls._pool.disconnect()
            cls._pool = None
            logger.info("Closed Redis connection pool")


def get_redis_client() -> Optional[aioredis.Redis]:
    return RedisManager.get_client()
