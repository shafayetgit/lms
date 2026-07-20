import math
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.badge import (
    BadgeCreate,
    BadgeUpdate,
    BadgeReadResponse,
    BadgeListResponse,
    BadgeAssignmentCreate,
    BadgeAssignmentReadResponse,
    BadgeAssignmentListResponse,
)
from app.repositories import badge as badge_repo
from app.services import badge as badge_svc

router = APIRouter()

# ---------------- BADGES ---------------- #

@router.post("/", response_model=BadgeReadResponse, status_code=status.HTTP_201_CREATED)
async def create_badge(
    *,
    db: AsyncSession = Depends(get_db),
    badge_in: BadgeCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    badge = await badge_svc.create_badge(db, badge_in=badge_in)
    return {"success": True, "data": badge}

@router.get("/", response_model=BadgeListResponse)
async def read_badges(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role == "student":
        is_active = True
        
    skip = (page - 1) * size
    total = await badge_repo.count_badges(db, is_active=is_active)
    badges = await badge_repo.get_badges(db, skip=skip, limit=size, is_active=is_active)
    pages = math.ceil(total / size) if total else 0
    
    return {
        "success": True,
        "data": badges,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }

# ---------------- ASSIGNMENTS ---------------- #

@router.post("/assign", response_model=BadgeAssignmentReadResponse, status_code=status.HTTP_201_CREATED)
async def assign_badge(
    *,
    db: AsyncSession = Depends(get_db),
    assignment_in: BadgeAssignmentCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    assignment = await badge_svc.assign_badge(db, assignment_in=assignment_in, assigned_by_id=current_user.id)
    return {"success": True, "data": assignment}

@router.get("/assignments", response_model=BadgeAssignmentListResponse)
async def read_badge_assignments(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    member_public_id: Optional[str] = None,
    badge_public_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    from app.repositories import user as user_repo
    resolved_member_id = None
    resolved_badge_id = None

    if current_user.role == "student":
        resolved_member_id = current_user.id
    elif member_public_id:
        user = await user_repo.get_user_by_public_id(db, member_public_id)
        if user:
            resolved_member_id = user.id
        else:
            resolved_member_id = -1

    if badge_public_id:
        badge = await badge_repo.get_badge_by_public_id(db, badge_public_id)
        if badge:
            resolved_badge_id = badge.id
        else:
            resolved_badge_id = -1

    skip = (page - 1) * size
    total = await badge_repo.count_assignments(db, member_id=resolved_member_id, badge_id=resolved_badge_id)
    assignments = await badge_repo.get_assignments(db, skip=skip, limit=size, member_id=resolved_member_id, badge_id=resolved_badge_id)
    pages = math.ceil(total / size) if total else 0
    
    return {
        "success": True,
        "data": assignments,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }

@router.delete("/assignments/{public_id}", status_code=status.HTTP_200_OK)
async def revoke_badge(
    *,
    db: AsyncSession = Depends(get_db),
    public_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    assignment = await badge_repo.get_assignment_by_public_id(db, public_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    await badge_repo.delete_assignment(db, assignment=assignment)
    return {"success": True, "message": "Successfully deleted"}


# ---------------- INDIVIDUAL BADGES ---------------- #

@router.get("/{public_id}", response_model=BadgeReadResponse)
async def read_badge(
    *,
    db: AsyncSession = Depends(get_db),
    public_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    badge = await badge_repo.get_badge_by_public_id(db, public_id)
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
        
    if current_user.role == "student" and not badge.is_active:
        raise HTTPException(status_code=403, detail="Badge is inactive")
        
    return {"success": True, "data": badge}

@router.put("/{public_id}", response_model=BadgeReadResponse)
async def update_badge(
    *,
    db: AsyncSession = Depends(get_db),
    public_id: str,
    badge_in: BadgeUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    badge = await badge_repo.get_badge_by_public_id(db, public_id)
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
        
    updated = await badge_svc.update_badge(db, badge=badge, badge_in=badge_in)
    return {"success": True, "data": updated}

@router.delete("/{public_id}", status_code=status.HTTP_200_OK)
async def delete_badge(
    *,
    db: AsyncSession = Depends(get_db),
    public_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    badge = await badge_repo.get_badge_by_public_id(db, public_id)
    if not badge:
        raise HTTPException(status_code=404, detail="Badge not found")
        
    await badge_repo.delete_badge(db, badge=badge)
    return {"success": True, "message": "Successfully deleted"}
