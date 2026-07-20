from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.repositories.user import get_user_by_id, get_user_by_public_id
from app.schemas.user import UserRead, UserUpdate, RoleRead
from app.models.role import Role
from app.services.user import update_user_info
from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.core.responses import read_response, update_response

router = APIRouter()


@router.get("/", tags=["Users"])
async def list_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    limit: Optional[int] = Query(None),
    skip: Optional[int] = Query(None),
    term: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List users with pagination, search filter, and meta response."""
    actual_size = limit if limit is not None else size
    offset = skip if skip is not None else (page - 1) * actual_size

    stmt = select(User).options(
        selectinload(User.roles),
        selectinload(User.feature_flags),
        selectinload(User.role_profiles),
    ).where(
        User.is_deleted == False
    ).where(
        ~User.roles.any(Role.slug == "super-admin")
    )
    if term:
        search = f"%{term}%"
        stmt = stmt.where(
            or_(
                User.first_name.ilike(search),
                User.last_name.ilike(search),
                User.email.ilike(search),
                User.username.ilike(search),
            )
        )

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    stmt = stmt.offset(offset).limit(actual_size).order_by(User.id.desc())
    result = await db.execute(stmt)
    users = result.unique().scalars().all()

    items = [UserRead.model_validate(u).model_dump(by_alias=True) for u in users]
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


@router.get("/me", tags=["Users"])
async def get_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get current user information."""
    stmt = select(User).options(
        selectinload(User.roles),
        selectinload(User.feature_flags),
        selectinload(User.role_profiles),
    ).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.unique().scalars().first() or current_user

    return read_response({"data": UserRead.model_validate(user).model_dump(by_alias=True)})


@router.get("/roles", tags=["Users"])
async def get_roles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all available roles in the system."""
    stmt = select(Role).where(Role.slug != "super-admin").order_by(Role.id.asc())
    result = await db.execute(stmt)
    roles = result.scalars().all()
    
    items = [RoleRead.model_validate(r).model_dump(by_alias=True) for r in roles]
    
    total = len(items)
    meta = {
        "total": total,
        "page": 1,
        "size": total if total > 0 else 10,
        "pages": 1,
        "has_next": False,
        "has_prev": False
    }
    return read_response({"data": items, "meta": meta})


@router.get("/{user_id}", tags=["Users"])
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user by ID or Public ID."""
    user = None
    user = None
    if user_id.isdigit():
        user = await get_user_by_id(db, int(user_id))
    else:
        user = await get_user_by_public_id(db, user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Eagerly load relationships not loaded by default
    from sqlalchemy.orm import selectinload as sil
    stmt = select(User).options(
        sil(User.roles),
        sil(User.feature_flags),
        sil(User.role_profiles),
    )
    if not user_id.isdigit():
        stmt = stmt.where(User.public_id == user.public_id)
    else:
        stmt = stmt.where(User.id == user.id)
    result = await db.execute(stmt)
    user = result.unique().scalars().first() or user

    return read_response({"data": UserRead.model_validate(user).model_dump(by_alias=True)})


@router.patch("/{user_id}", tags=["Users"])
@router.put("/{user_id}", tags=["Users"])
async def update_user(
    user_id: str,
    updates: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update user information (role, profile, active status)."""
    user = None
    if user_id.isdigit():
        user = await get_user_by_id(db, int(user_id))
    else:
        user = await get_user_by_public_id(db, user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if current_user.id != user.id and current_user.role not in ("admin", "superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user",
        )

    try:
        updated_user = await update_user_info(db, user, updates)

        # Handle role assignments
        if updates.role_public_ids is not None:
            from sqlalchemy.orm import selectinload as sil
            from app.models.role import Role, UserRoleAssociation
            from sqlalchemy import delete as sa_delete
            await db.execute(sa_delete(UserRoleAssociation).where(UserRoleAssociation.user_id == user.id))
            for pub_id in updates.role_public_ids:
                role_obj = (await db.execute(select(Role).where(Role.public_id == pub_id))).scalar_one_or_none()
                if role_obj:
                    db.add(UserRoleAssociation(user_id=user.id, role_id=role_obj.id))

        # Handle role profile assignment
        if updates.role_profile_public_id is not None:
            from app.models.role_profile import RoleProfile, UserRoleProfileAssociation
            from sqlalchemy import delete as sa_delete
            await db.execute(sa_delete(UserRoleProfileAssociation).where(UserRoleProfileAssociation.user_id == user.id))
            if updates.role_profile_public_id:
                rp = (await db.execute(select(RoleProfile).where(RoleProfile.public_id == updates.role_profile_public_id))).scalar_one_or_none()
                if rp:
                    db.add(UserRoleProfileAssociation(user_id=user.id, role_profile_id=rp.id))

        # Handle feature flag assignments
        if updates.feature_flag_public_ids is not None:
            from app.models.feature_flag import FeatureFlag, UserFeatureFlag
            from sqlalchemy import delete as sa_delete
            await db.execute(sa_delete(UserFeatureFlag).where(UserFeatureFlag.user_id == user.id))
            for pub_id in updates.feature_flag_public_ids:
                ff = (await db.execute(select(FeatureFlag).where(FeatureFlag.public_id == pub_id))).scalar_one_or_none()
                if ff:
                    db.add(UserFeatureFlag(user_id=user.id, feature_flag_id=ff.id))

        await db.commit()

        # Reload with all relationships
        from sqlalchemy.orm import selectinload as sil
        stmt = select(User).options(
            sil(User.roles), sil(User.feature_flags), sil(User.role_profiles)
        ).where(User.id == user.id)
        updated_user = (await db.execute(stmt)).unique().scalars().first()

        return update_response(UserRead.model_validate(updated_user).model_dump(by_alias=True))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Update failed")
