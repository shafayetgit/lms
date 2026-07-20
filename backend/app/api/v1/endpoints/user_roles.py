from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user_role import (
    UserRoleAssignmentCreate,
    UserRoleAssignmentListResponse,
    UserRoleAssignmentRead,
)
from app.services.user_role import UserRoleAssignmentService

router = APIRouter()


@router.get("", response_model=UserRoleAssignmentListResponse)
async def list_user_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = await UserRoleAssignmentService.list(db, skip=skip, limit=limit)
    return {"items": items, "total": total, "page": skip // limit + 1, "size": limit}


@router.post("", response_model=UserRoleAssignmentRead)
async def create_user_role(
    assignment_in: UserRoleAssignmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await UserRoleAssignmentService.create(db, obj_in=assignment_in)


@router.delete("/{public_id}")
async def delete_user_role(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await UserRoleAssignmentService.delete(db, public_id)
    return {"success": True}
