# app/core/dependencies.py
"""
Dependency injection functions for FastAPI routes.

These are shared dependencies used across multiple endpoints for:
- User authentication and authorization
- Database session management
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

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
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that the current user is active.
    
    Prevents inactive/disabled accounts from accessing protected routes.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
