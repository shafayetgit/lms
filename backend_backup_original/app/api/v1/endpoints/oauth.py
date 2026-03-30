"""
OAuth2 Callback Endpoints
Handles OAuth2 callback from Google and GitHub.
"""

import secrets
import json
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.api.deps import get_db
from app.core.security import create_access_token, create_refresh_token
from app.core.config import init_settings
from app.models.user import UserRole
from app.repositories.user import (
    get_user_by_email,
    create_user_from_schema,
    update_user,
)
from app.repositories.oauth import (
    create_oauth_account,
    get_user_by_oauth,
    get_oauth_account_by_user_and_provider,
    update_oauth_account_last_used,
)
from app.schemas.user import UserCreate, TokenResponse
from app.services.oauth import (
    get_google_oauth_service,
    get_github_oauth_service,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/oauth", tags=["OAuth2"])


@router.get("/google/authorize")
async def google_authorize(state: str = Query(...)):
    """
    Initiate Google OAuth flow.
    
    Redirect user to this endpoint to start OAuth process.
    """
    oauth_service = get_google_oauth_service()
    auth_url = oauth_service.get_authorization_url(state)
    return {"authorization_url": auth_url}


@router.post("/google/callback")
async def google_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Google OAuth callback.
    
    Exchange authorization code for user data and create/update user.
    Supports linking multiple OAuth providers to one account.
    """
    try:
        oauth_service = get_google_oauth_service()
        
        # Exchange code for token
        token_response = await oauth_service.exchange_code_for_token(code)
        access_token = token_response.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to obtain access token",
            )
        
        # Get user info from Google
        user_info = await oauth_service.get_user_info(access_token)
        google_id = user_info.get("id")
        email = user_info.get("email")
        name = user_info.get("name", "").split(" ", 1)
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve user information from Google",
            )
        
        # Try to find existing user by OAuth account
        user = await get_user_by_oauth(db, "google", google_id)
        
        if not user:
            # Try to find by email
            user = await get_user_by_email(db, email)
            
            if not user:
                # Create new user from Google data
                first_name = name[0] if name else email.split("@")[0]
                last_name = name[1] if len(name) > 1 else ""
                
                user_create = UserCreate(
                    username=email.split("@")[0],
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=secrets.token_urlsafe(32),  # Random password
                    role=UserRole.STUDENT,
                    email_verified=True,  # Trust Google's email verification
                )
                
                user = await create_user_from_schema(db, user_create)
        
        # Create or update OAuth account
        oauth_account = await get_oauth_account_by_user_and_provider(
            db, user.id, "google"
        )
        
        if not oauth_account:
            # Store profile data as JSON
            profile_data = json.dumps({
                "name": user_info.get("name"),
                "picture": user_info.get("picture"),
                "locale": user_info.get("locale"),
            })
            
            await create_oauth_account(
                db=db,
                user_id=user.id,
                provider="google",
                provider_user_id=google_id,
                provider_email=email,
                profile_data=profile_data,
            )
        else:
            # Update last used timestamp
            await update_oauth_account_last_used(db, oauth_account)
        
        # Ensure email is verified
        if not user.email_verified:
            user.email_verified = True
            await update_user(db, user)
        
        # Generate tokens
        settings = init_settings()
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_jwt = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires,
        )
        refresh_token = create_refresh_token(data={"sub": user.username})
        
        return TokenResponse(
            access_token=access_token_jwt,
            refresh_token=refresh_token,
            token_type="bearer",
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth callback failed",
        )


@router.get("/github/authorize")
async def github_authorize(state: str = Query(...)):
    """
    Initiate GitHub OAuth flow.
    
    Redirect user to this endpoint to start OAuth process.
    """
    oauth_service = get_github_oauth_service()
    auth_url = oauth_service.get_authorization_url(state)
    return {"authorization_url": auth_url}


@router.post("/github/callback")
async def github_callback(
    code: str = Query(...),
    state: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Handle GitHub OAuth callback.
    
    Exchange authorization code for user data and create/update user.
    Supports linking multiple OAuth providers to one account.
    """
    try:
        oauth_service = get_github_oauth_service()
        
        # Exchange code for token
        token_response = await oauth_service.exchange_code_for_token(code)
        access_token = token_response.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to obtain access token",
            )
        
        # Get user info from GitHub
        user_info = await oauth_service.get_user_info(access_token)
        github_id = str(user_info.get("id"))
        github_username = user_info.get("login")
        email = user_info.get("email")
        name = user_info.get("name", "").split(" ", 1) if user_info.get("name") else []
        
        if not github_id or not github_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to retrieve user information from GitHub",
            )
        
        # Use GitHub email or generate one
        if not email:
            email = f"{github_username}@github.local"
        
        # Try to find existing user by OAuth account
        user = await get_user_by_oauth(db, "github", github_id)
        
        if not user:
            # Try to find by email
            user = await get_user_by_email(db, email)
            
            if not user:
                # Create new user from GitHub data
                first_name = name[0] if name else github_username
                last_name = name[1] if len(name) > 1 else ""
                
                user_create = UserCreate(
                    username=github_username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=secrets.token_urlsafe(32),  # Random password
                    role=UserRole.STUDENT,
                    email_verified=True,  # Trust GitHub's email
                )
                
                user = await create_user_from_schema(db, user_create)
        
        # Create or update OAuth account
        oauth_account = await get_oauth_account_by_user_and_provider(
            db, user.id, "github"
        )
        
        if not oauth_account:
            # Store profile data as JSON
            profile_data = json.dumps({
                "username": github_username,
                "avatar_url": user_info.get("avatar_url"),
                "bio": user_info.get("bio"),
                "location": user_info.get("location"),
                "blog": user_info.get("blog"),
                "followers": user_info.get("followers"),
                "following": user_info.get("following"),
            })
            
            await create_oauth_account(
                db=db,
                user_id=user.id,
                provider="github",
                provider_user_id=github_id,
                provider_email=email,
                profile_data=profile_data,
            )
        else:
            # Update last used timestamp
            await update_oauth_account_last_used(db, oauth_account)
        
        # Ensure email is verified
        if not user.email_verified:
            user.email_verified = True
            await update_user(db, user)
        
        # Generate tokens
        settings = init_settings()
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token_jwt = create_access_token(
            data={"sub": user.username},
            expires_delta=access_token_expires,
        )
        refresh_token = create_refresh_token(data={"sub": user.username})
        
        return TokenResponse(
            access_token=access_token_jwt,
            refresh_token=refresh_token,
            token_type="bearer",
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GitHub OAuth callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth callback failed",
        )

