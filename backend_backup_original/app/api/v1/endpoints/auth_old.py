from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.core.dependencies import get_current_active_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    authenticate_user,
    verify_password,
)
from app.repositories.user import get_user_by_email
from app.core.config import init_settings
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, TokenResponse

router = APIRouter(tags=["Auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    from app.services.user import register_user
    
    try:
        user = await register_user(db, user_in)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed")


@router.post("/token", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Login with username OR email and password to get access token.
    
    **OAuth2 Password Grant Type**
    
    The `username` field is flexible and accepts:
    - **Username** (e.g., `john_doe`)
    - **Email address** (e.g., `john@example.com`)
    
    **Request Parameters:**
    - `username` (required): Username or email address
    - `password` (required): User password
    - `grant_type` (optional): Should be "password" per OAuth2 spec
    - `scope` (optional): Space-separated list of scopes
    - `client_id` (optional): OAuth2 client identifier
    - `client_secret` (optional): OAuth2 client secret
    
    **Returns:**
    - `access_token`: JWT token for accessing protected routes (expires in 30 minutes)
    - `refresh_token`: JWT token for refreshing access token (expires in 7 days)
    - `token_type`: Always "bearer"
    
    **Errors:**
    - `401 Unauthorized`: Incorrect username/email or password
    """
    settings = init_settings()
    
    # Try to authenticate with username first
    user = await authenticate_user(db, form_data.username, form_data.password)
    
    # If not found, try to authenticate with email
    if not user:
        # Get user by email
        user_by_email = await get_user_by_email(db, form_data.username)
        # Verify password if user found
        if user_by_email and verify_password(form_data.password, user_by_email.hashed_password):
            user = user_by_email
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(refresh_token: str):
    """Get a new access token using refresh token."""
    settings = init_settings()
    username = verify_refresh_token(refresh_token)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": username}, expires_delta=access_token_expires)
    new_refresh_token = create_refresh_token(data={"sub": username})
    
    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user
