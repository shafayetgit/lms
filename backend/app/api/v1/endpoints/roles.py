from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.role import (
    RoleCreate,
    RoleDetailResponse,
    RoleListResponse,
    RoleUpdate,
)
from app.services.role import RoleService

router = APIRouter()


@router.get("", response_model=RoleListResponse)
async def list_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = await RoleService.list(db, skip=skip, limit=limit)
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


@router.post("", response_model=RoleDetailResponse)
async def create_role(
    role_in: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = await RoleService.create(db, obj_in=role_in)
    return {"success": True, "data": role}


@router.get("/{public_id}", response_model=RoleDetailResponse)
async def get_role(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = await RoleService.get(db, public_id)
    return {"success": True, "data": role}


@router.patch("/{public_id}", response_model=RoleDetailResponse)
async def update_role(
    public_id: str,
    role_in: RoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = await RoleService.update(db, public_id, obj_in=role_in)
    return {"success": True, "data": role}


@router.delete("/{public_id}")
async def delete_role(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await RoleService.delete(db, public_id)
    return {"success": True, "message": "Successfully deleted"}
