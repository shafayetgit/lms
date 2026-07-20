from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.role_profile import (
    RoleProfileCreate,
    RoleProfileDetailResponse,
    RoleProfileListResponse,
    RoleProfileUpdate,
)
from app.services.role_profile import RoleProfileService

router = APIRouter()


@router.get("", response_model=RoleProfileListResponse)
async def list_role_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = await RoleProfileService.list(db, skip=skip, limit=limit)
    page = skip // limit + 1 if limit > 0 else 1
    pages = (total + limit - 1) // limit if limit > 0 else 1
    return {
        "success": True,
        "data": items,
        "meta": {
            "total": total,
            "page": page,
            "size": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        },
    }


@router.post("", response_model=RoleProfileDetailResponse)
async def create_role_profile(
    profile_in: RoleProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await RoleProfileService.create(db, obj_in=profile_in)
    return {"success": True, "data": profile}


@router.get("/{public_id}", response_model=RoleProfileDetailResponse)
async def get_role_profile(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await RoleProfileService.get(db, public_id)
    return {"success": True, "data": profile}


@router.patch("/{public_id}", response_model=RoleProfileDetailResponse)
async def update_role_profile(
    public_id: str,
    profile_in: RoleProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = await RoleProfileService.update(db, public_id, obj_in=profile_in)
    return {"success": True, "data": profile}


@router.delete("/{public_id}")
async def delete_role_profile(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await RoleProfileService.delete(db, public_id)
    return {"success": True, "message": "Successfully deleted"}
