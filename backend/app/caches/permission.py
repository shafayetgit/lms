from typing import Optional, List, Dict, Any
from app.core.cache import CacheService
from app.core.config import init_settings

CACHE_PREFIX = "permissions:roles:"


async def get_cached_role_permissions(role_ids: List[int]) -> Optional[List[Dict[str, Any]]]:
    """Retrieve permissions for role IDs from Redis cache."""
    sorted_ids = ",".join(map(str, sorted(role_ids)))
    key = f"{CACHE_PREFIX}{sorted_ids}"
    return await CacheService.get(key)


async def set_cached_role_permissions(role_ids: List[int], permissions_data: List[Dict[str, Any]]) -> None:
    """Store permissions for role IDs into Redis cache using global CACHE_TTL."""
    sorted_ids = ",".join(map(str, sorted(role_ids)))
    key = f"{CACHE_PREFIX}{sorted_ids}"
    ttl = init_settings().CACHE_TTL
    await CacheService.set(key, permissions_data, ttl=ttl)


async def invalidate_permission_cache() -> None:
    """Flush all cached role permissions from Redis when permissions are created/updated/deleted."""
    await CacheService.delete_by_pattern(f"{CACHE_PREFIX}*")
