from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import get_user_by_id
from app.schemas.user import UserRead, UserUpdate
from app.services.user import update_user_info
from app.api.deps import get_db, get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserRead, tags=["Users"])
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.get("/{user_id}", response_model=UserRead, tags=["Users"])
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get user by ID."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserRead, tags=["Users"])
async def update_user(user_id: int, updates: UserUpdate, db: AsyncSession = Depends(get_db)):
    """Update user information."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    try:
        return await update_user_info(db, user, updates)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Update failed")
