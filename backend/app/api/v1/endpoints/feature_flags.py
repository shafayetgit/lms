from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.feature_flag import (
    FeatureFlagCreate,
    FeatureFlagDetailResponse,
    FeatureFlagListResponse,
    FeatureFlagUpdate,
)
from app.services.feature_flag import FeatureFlagService

router = APIRouter()


@router.get("", response_model=FeatureFlagListResponse)
async def list_feature_flags(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = await FeatureFlagService.list(db, skip=skip, limit=limit)
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


@router.post("", response_model=FeatureFlagDetailResponse)
async def create_feature_flag(
    feature_flag_in: FeatureFlagCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feature_flag = await FeatureFlagService.create(db, obj_in=feature_flag_in)
    return {"success": True, "data": feature_flag}


@router.get("/{public_id}", response_model=FeatureFlagDetailResponse)
async def get_feature_flag(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feature_flag = await FeatureFlagService.get(db, public_id)
    return {"success": True, "data": feature_flag}


@router.patch("/{public_id}", response_model=FeatureFlagDetailResponse)
async def update_feature_flag(
    public_id: str,
    feature_flag_in: FeatureFlagUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feature_flag = await FeatureFlagService.update(db, public_id, obj_in=feature_flag_in)
    return {"success": True, "data": feature_flag}


@router.delete("/{public_id}")
async def delete_feature_flag(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await FeatureFlagService.delete(db, public_id)
    return {"success": True, "message": "Successfully deleted"}
