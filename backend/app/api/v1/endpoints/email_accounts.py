from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.dependencies import PermissionChecker
from app.schemas.email_account import (
    EmailAccountCreate,
    EmailAccountListResponse,
    EmailAccountRead,
    EmailAccountUpdate,
)
from app.services.email_account import EmailAccountService

router = APIRouter()


@router.get("/default-outgoing")
async def get_default_outgoing_account(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_account", "read")),
) -> Any:
    """Check whether a default outgoing email account is configured."""
    account = await EmailAccountService.get_default_outgoing(db)
    if account:
        return {
            "success": True,
            "data": {
                "configured": True,
                "email_id": account.email_id,
                "email_account_name": account.email_account_name,
                "service": account.service,
            },
        }
    return {"success": True, "data": {"configured": False}}


@router.get("/", response_model=EmailAccountListResponse)
async def list_email_accounts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_account", "read")),
) -> Any:
    """List configured email accounts with pagination."""
    items, total = await EmailAccountService.list(db, skip=skip, limit=limit)
    page = (skip // limit) + 1 if limit > 0 else 1
    pages = (total + limit - 1) // limit if limit > 0 else 1

    serialized = [EmailAccountService.serialize(a) for a in items]

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


@router.post("/", response_model=EmailAccountRead, status_code=status.HTTP_201_CREATED)
async def create_email_account(
    obj_in: EmailAccountCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_account", "create")),
) -> Any:
    """Create a new email account."""
    account = await EmailAccountService.create(db, obj_in=obj_in)
    return EmailAccountService.serialize(account)


@router.get("/{public_id}", response_model=EmailAccountRead)
async def get_email_account(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_account", "read")),
) -> Any:
    """Get email account details by public ID."""
    account = await EmailAccountService.get(db, public_id=public_id)
    return EmailAccountService.serialize(account)


@router.patch("/{public_id}", response_model=EmailAccountRead)
async def update_email_account(
    public_id: str,
    obj_in: EmailAccountUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_account", "update")),
) -> Any:
    """Update an existing email account."""
    account = await EmailAccountService.update(db, public_id=public_id, obj_in=obj_in)
    return EmailAccountService.serialize(account)


@router.delete("/{public_id}")
async def delete_email_account(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("email_account", "delete")),
) -> Any:
    """Delete an email account."""
    await EmailAccountService.delete(db, public_id=public_id)
    return {"success": True, "message": "Successfully deleted"}
