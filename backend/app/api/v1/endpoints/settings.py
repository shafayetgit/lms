from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.settings import LMSSettingsResponse, LMSSettingsUpdate
from app.repositories import settings as settings_repo
from app.services import settings as settings_svc

router = APIRouter()

@router.get("/", response_model=LMSSettingsResponse)
async def read_settings(
    db: AsyncSession = Depends(get_db)
) -> Any:
    return await settings_repo.get_settings(db)

@router.put("/", response_model=LMSSettingsResponse)
async def update_settings(
    *,
    db: AsyncSession = Depends(get_db),
    settings_in: LMSSettingsUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return await settings_svc.update_settings(db, settings_in=settings_in)

@router.delete("/cache")
async def flush_all_cache(
    current_user: User = Depends(get_current_user)
) -> Any:
    """Manually flush the entire Redis cache for the application."""
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    from app.core.cache import CacheService
    if await CacheService.flush_all():
        return {"success": True, "message": "Successfully deleted"}
        
    return {"success": False, "message": "Failed to flush cache"}
