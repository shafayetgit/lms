from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from app.api.deps import get_db
from app.core.dependencies import PermissionChecker
from app.models.invitation import Invitation
from app.models.user import User
from app.schemas.invitation import InvitationCreate, InvitationRead
from app.core.responses import read_response, create_response, delete_response

router = APIRouter()


@router.get("/", tags=["Invitations"])
async def list_invitations(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    limit: Optional[int] = Query(None),
    skip: Optional[int] = Query(None),
    term: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("invitation", "read")),
):
    """List pending invitations with pagination and filtering."""
    actual_size = limit if limit is not None else size
    offset = skip if skip is not None else (page - 1) * actual_size

    stmt = select(Invitation).where(Invitation.status == "pending")

    # Scope invitation search to owner if role requires creator check
    owner_id = (
        current_user.id
        if current_user and getattr(current_user, "_requires_creator_check", False)
        else None
    )
    if owner_id:
        stmt = stmt.where(Invitation.owner_id == owner_id)

    if term:
        search = f"%{term}%"
        stmt = stmt.where(
            or_(
                Invitation.email.ilike(search),
                Invitation.role.ilike(search),
            )
        )

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    stmt = stmt.offset(offset).limit(actual_size).order_by(Invitation.id.desc())
    result = await db.execute(stmt)
    invitations = result.scalars().all()

    items = [InvitationRead.model_validate(inv).model_dump() for inv in invitations]
    pages = (total + actual_size - 1) // actual_size if actual_size > 0 else 1

    meta = {
        "total": total,
        "page": page,
        "size": actual_size,
        "pages": pages,
        "has_next": page < pages,
        "has_prev": page > 1,
    }

    return read_response({"data": items, "meta": meta})


@router.post("/", status_code=status.HTTP_201_CREATED, tags=["Invitations"])
async def create_invitations(
    inv_in: InvitationCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("invitation", "create")),
):
    """Batch send/create user invitations."""
    count = 0
    from app.tasks.emails import send_invitation_email

    for email in inv_in.emails:
        inv = Invitation(
            email=str(email),
            role=inv_in.role,
            status="pending",
            invited_by_id=current_user.id,
        )
        db.add(inv)
        count += 1
        
        # Fire celery task to send the invitation email
        try:
            send_invitation_email.delay(
                to_email=str(email),
                role_name=inv_in.role,
                inviter_name=current_user.full_name,
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to trigger invitation email task: {e}")

    await db.commit()
    return create_response({"invited": count})


@router.delete("/{public_id}", tags=["Invitations"])
async def delete_invitation(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("invitation", "delete")),
):
    """Cancel / delete an invitation."""
    result = await db.execute(select(Invitation).where(Invitation.public_id == public_id))
    inv = result.scalars().first()
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    await db.delete(inv)
    await db.commit()
    return delete_response("Successfully deleted")

