from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.permission import (
    PermissionCreate,
    PermissionDetailResponse,
    PermissionListResponse,
    PermissionUpdate,
)
from app.services.permission import PermissionService

router = APIRouter()


@router.get("", response_model=PermissionListResponse)
async def list_permissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = await PermissionService.list(db, skip=skip, limit=limit)
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


@router.post("", response_model=PermissionDetailResponse)
async def create_permission(
    permission_in: PermissionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    permission = await PermissionService.create(db, obj_in=permission_in)
    return {"success": True, "data": permission}


@router.get("/{public_id}", response_model=PermissionDetailResponse)
async def get_permission(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    permission = await PermissionService.get(db, public_id)
    return {"success": True, "data": permission}


@router.patch("/{public_id}", response_model=PermissionDetailResponse)
async def update_permission(
    public_id: str,
    permission_in: PermissionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    permission = await PermissionService.update(db, public_id, obj_in=permission_in)
    return {"success": True, "data": permission}


@router.delete("/{public_id}")
async def delete_permission(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await PermissionService.delete(db, public_id)
    return {"success": True, "message": "Successfully deleted"}
