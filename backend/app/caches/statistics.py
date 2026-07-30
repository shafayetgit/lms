from typing import Optional, Dict, Any
from app.core.cache import CacheService

CACHE_PREFIX = "lms:dashboard:global_stats_v2"


async def get_cached_statistics() -> Optional[Dict[str, Any]]:
    """Retrieve global dashboard statistics from Redis cache."""
    return await CacheService.get(CACHE_PREFIX)


async def set_cached_statistics(stats_data: Dict[str, Any]) -> None:
    """Store global dashboard statistics into Redis cache for 5 minutes."""
    # 5 minutes TTL (300 seconds)
    await CacheService.set(CACHE_PREFIX, stats_data, ttl=300)


async def invalidate_statistics_cache() -> None:
    """Flush the dashboard statistics cache from Redis."""
    await CacheService.delete(CACHE_PREFIX)
