import json
import logging
from typing import Any, Optional, List
from app.core.redis import get_redis_client

logger = logging.getLogger(__name__)


class CacheService:
    """
    Generic, reusable cache service for Redis.
    Provides automatic JSON serialization/deserialization, non-blocking pattern deletion,
    TTL management, and fail-safe exception handling across the application.
    """

    @staticmethod
    async def get(key: str, default: Any = None) -> Any:
        """Get and deserialize a JSON-encoded value from Redis."""
        try:
            redis = get_redis_client()
            if not redis:
                return default
            data = await redis.get(key)
            if data is not None:
                return json.loads(data)
        except Exception as e:
            logger.warning(f"Cache get error for key '{key}': {e}")
        return default

    @staticmethod
    async def set(key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Serialize and store a value in Redis with optional TTL (in seconds)."""
        try:
            redis = get_redis_client()
            if not redis:
                return False
            serialized = json.dumps(value)
            if ttl is not None:
                await redis.set(key, serialized, ex=ttl)
            else:
                await redis.set(key, serialized)
            return True
        except Exception as e:
            logger.warning(f"Cache set error for key '{key}': {e}")
            return False

    @staticmethod
    async def delete(*keys: str) -> int:
        """Delete one or more specific keys from Redis."""
        if not keys:
            return 0
        try:
            redis = get_redis_client()
            if not redis:
                return 0
            return await redis.delete(*keys)
        except Exception as e:
            logger.warning(f"Cache delete error: {e}")
            return 0

    @staticmethod
    async def delete_by_pattern(pattern: str) -> int:
        """
        Deletes all keys matching the given pattern using non-blocking SCAN iteration.
        """
        try:
            redis = get_redis_client()
            if not redis:
                return 0
            keys_to_delete: List[str] = []
            async for key in redis.scan_iter(match=pattern, count=100):
                keys_to_delete.append(key)
            if keys_to_delete:
                return await redis.delete(*keys_to_delete)
        except Exception as e:
            logger.warning(f"Cache delete_by_pattern error for pattern '{pattern}': {e}")
        return 0

    @staticmethod
    async def exists(key: str) -> bool:
        """Check if a key exists in Redis."""
        try:
            redis = get_redis_client()
            if not redis:
                return False
            return bool(await redis.exists(key))
        except Exception as e:
            logger.warning(f"Cache exists error for key '{key}': {e}")
            return False

    @staticmethod
    async def flush_all() -> bool:
        """Flush the entire Redis database."""
        try:
            redis = get_redis_client()
            if not redis:
                return False
            await redis.flushdb()
            return True
        except Exception as e:
            logger.warning(f"Cache flush_all error: {e}")
            return False
