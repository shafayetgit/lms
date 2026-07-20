from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.live_class import (
    LiveClassCreate,
    LiveClassUpdate,
    LiveClassResponse
)
from app.repositories import live_class as live_class_repo
from app.services import live_class as live_class_svc

router = APIRouter()

@router.post("/", response_model=LiveClassResponse, status_code=status.HTTP_201_CREATED)
async def create_live_class(
    *,
    db: AsyncSession = Depends(get_db),
    class_in: LiveClassCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    if current_user.role == "instructor" and class_in.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Instructors can only schedule classes for themselves")
        
    return await live_class_svc.schedule_class(db, class_in=class_in)

@router.get("/", response_model=dict[str, Any])
async def read_live_classes(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    batch_id: Optional[int] = None,
    course_id: Optional[int] = None,
    host_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role == "instructor":
        host_id = current_user.id
        
    total = await live_class_repo.count_live_classes(
        db, batch_id=batch_id, course_id=course_id, host_id=host_id, status=status_filter
    )
    classes = await live_class_repo.get_live_classes(
        db, skip=skip, limit=limit, batch_id=batch_id, course_id=course_id, host_id=host_id, status=status_filter
    )
    return {"total": total, "data": classes}

@router.get("/{id}", response_model=LiveClassResponse)
async def read_live_class(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    live_class = await live_class_repo.get_live_class_by_id(db, id)
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")
        
    if current_user.role == "instructor" and live_class.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return live_class

@router.put("/{id}", response_model=LiveClassResponse)
async def update_live_class(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    update_in: LiveClassUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    live_class = await live_class_repo.get_live_class_by_id(db, id)
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")
        
    if current_user.role not in ["superadmin", "admin"]:
        if current_user.role != "instructor" or live_class.host_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
            
    return await live_class_svc.update_class(db, live_class=live_class, update_in=update_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
async def delete_live_class(
    *,
    db: AsyncSession = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    live_class = await live_class_repo.get_live_class_by_id(db, id)
    if not live_class:
        raise HTTPException(status_code=404, detail="Live class not found")
        
    await live_class_repo.delete_live_class(db, live_class=live_class)
    return None
