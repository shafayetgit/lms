from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_active_user
from app.schemas.wishlist import WishlistCreate, WishlistRead
from app.services import wishlist as wishlist_service

router = APIRouter()

@router.post("/", response_model=WishlistRead, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    wishlist_in: WishlistCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Add a course to current user's wishlist."""
    try:
        return await wishlist_service.add_to_wishlist(db, current_user.id, wishlist_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=List[WishlistRead])
async def get_my_wishlist(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Retrieve current user's wishlist."""
    return await wishlist_service.get_user_wishlist(db, current_user.id)

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    course_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Remove a course from current user's wishlist by course ID."""
    try:
        await wishlist_service.remove_from_wishlist(db, current_user.id, course_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
