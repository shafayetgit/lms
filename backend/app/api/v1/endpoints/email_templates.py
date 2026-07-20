from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.dependencies import PermissionChecker
from app.schemas.email_template import (
    EmailTemplateCreate,
    EmailTemplateRead,
    EmailTemplateUpdate,
)
from app.services.email_template import EmailTemplateService

router = APIRouter()


@router.get("/")
async def list_email_templates(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_template", "read")),
) -> Any:
    """List configured email templates with pagination."""
    items, total = await EmailTemplateService.list(db, skip=skip, limit=limit)
    page = (skip // limit) + 1 if limit > 0 else 1
    pages = (total + limit - 1) // limit if limit > 0 else 1

    serialized = [EmailTemplateRead.model_validate(item) for item in items]

    return {
        "success": True,
        "data": serialized,
        "meta": {
            "total": total,
            "page": page,
            "size": limit,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        },
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_email_template(
    obj_in: EmailTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_template", "create")),
) -> Any:
    """Create a new email template."""
    template = await EmailTemplateService.create(db, obj_in=obj_in)
    return {"success": True, "data": EmailTemplateRead.model_validate(template)}


@router.get("/{public_id}")
async def get_email_template(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_template", "read")),
) -> Any:
    """Get email template details by public ID."""
    template = await EmailTemplateService.get(db, public_id=public_id)
    return {"success": True, "data": EmailTemplateRead.model_validate(template)}


@router.patch("/{public_id}")
async def update_email_template(
    public_id: str,
    obj_in: EmailTemplateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_template", "update")),
) -> Any:
    """Update an existing email template."""
    template = await EmailTemplateService.update(db, public_id=public_id, obj_in=obj_in)
    return {"success": True, "data": EmailTemplateRead.model_validate(template)}


@router.delete("/{public_id}")
async def delete_email_template(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_template", "delete")),
) -> Any:
    """Delete an email template."""
    await EmailTemplateService.delete(db, public_id=public_id)
    return {"success": True, "message": "Successfully deleted"}
