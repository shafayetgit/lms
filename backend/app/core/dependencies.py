# app/core/dependencies.py
"""
Dependency injection functions for FastAPI routes.

These are shared dependencies used across multiple endpoints for:
- User authentication and authorization
- Database session management
"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

from app.db.session import get_db
from app.models.user import User
from app.core.security import oauth2_scheme, get_user_by_username
import jwt
from jwt.exceptions import InvalidTokenError
from app.core.config import init_settings


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """
    Extract and validate JWT token from Authorization header.
    
    Returns the authenticated user if token is valid.
    Raises 401 Unauthorized if token is invalid or expired.
    """
    settings = init_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception

    user = await get_user_by_username(db, username)
    if user is None:
        raise credentials_exception
    
    from app.core.context import current_user_id
    current_user_id.set(user.id)
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that the current user is active.
    
    Prevents inactive/disabled accounts from accessing protected routes.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


async def get_admin_or_instructor(
    user: User = Depends(get_current_active_user),
) -> User:
    """
    Verify that the current user is either an Admin or an Instructor.
    """
    if user.role not in ["admin", "superadmin", "instructor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return user


from app.caches.permission import (
    get_cached_role_permissions,
    set_cached_role_permissions,
)


async def get_permissions_for_roles(db: AsyncSession, role_ids: list[int]) -> list[dict]:
    if not role_ids:
        return []

    cached = await get_cached_role_permissions(role_ids)
    if cached is not None:
        logger.debug(f"⚡ [Redis Cache HIT] Permissions loaded for role_ids={role_ids}")
        return cached

    logger.debug(f"🐘 [PostgreSQL Cache MISS] Fetching permissions from DB for role_ids={role_ids}")

    from app.models.permission import Permission
    from sqlalchemy import select

    query = select(Permission).where(Permission.role_id.in_(role_ids))
    result = await db.execute(query)
    permissions = result.scalars().all()

    perms_data = [
        {
            "resource": p.resource,
            "read": p.read,
            "create": p.create,
            "update": p.update,
            "delete": p.delete,
            "export": p.export,
            "import_perm": p.import_perm,
            "only_if_creator": p.only_if_creator,
        }
        for p in permissions
    ]

    await set_cached_role_permissions(role_ids, perms_data)
    return perms_data


async def has_permission(
    user: User,
    db: AsyncSession,
    resource: str,
    action: str,
    creator_id: Optional[int | str] = None
) -> bool:
    """
    Check if a user has a specific permission on a resource using Redis cache.
    """
    if user.role == "superadmin":
        return True

    roles = user.all_roles
    role_ids = [r.id for r in roles]
    if not role_ids:
        return False

    permissions = await get_permissions_for_roles(db, role_ids)
    action_attr = "import_perm" if action == "import" else action

    for perm in permissions:
        if perm.get("resource") == resource and perm.get(action_attr, False) is True:
            if perm.get("only_if_creator"):
                if action in ("create", "read") and creator_id is None:
                    return True
                if creator_id is not None:
                    if str(user.id) == str(creator_id) or str(user.public_id) == str(creator_id):
                        return True
                    return False
                else:
                    return False
            else:
                return True

    return False


from fastapi.security import OAuth2PasswordBearer
from fastapi import Request

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)


async def get_optional_current_user(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme_optional),
) -> Optional[User]:
    if not token:
        return None
    try:
        settings = init_settings()
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if username is None:
            return None
        user = await get_user_by_username(db, username)
        if user and user.is_active:
            from app.core.context import current_user_id
            current_user_id.set(user.id)
            return user
    except Exception:
        return None
    return None


class PermissionChecker:
    """
    FastAPI dependency to verify if the current user has access to a resource/action.
    Utilizes Redis caching for high performance authorization checks.
    """
    def __init__(self, resource: str, action: str):
        self.resource = resource
        self.action = action

    async def __call__(
        self,
        request: Request = None,
        user: Any = None,
        db: AsyncSession = Depends(get_db),
        optional_user: Any = Depends(get_optional_current_user),
    ) -> Any:
        is_portal = False
        if request is not None and hasattr(request, "query_params"):
            is_portal = request.query_params.get("is_portal", "").lower() in ("true", "1")

        target_user = user or optional_user

        if is_portal:
            if request is not None and target_user:
                request.state.user = target_user
            return target_user

        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if request is not None:
            request.state.user = target_user

        if target_user.role in ("superadmin", "admin"):
            return target_user

        roles = target_user.all_roles
        role_ids = [r.id for r in roles]
        if not role_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="The user doesn't have enough privileges"
            )

        permissions = await get_permissions_for_roles(db, role_ids)
        action_attr = "import_perm" if self.action == "import" else self.action
        requires_creator_check = False

        for perm in permissions:
            if perm.get("resource") == self.resource and perm.get(action_attr, False) is True:
                if perm.get("only_if_creator"):
                    requires_creator_check = True
                else:
                    return target_user

        if requires_creator_check:
            target_user._requires_creator_check = True
            return target_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
