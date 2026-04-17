from sqlalchemy.ext.asyncio import AsyncSession
from app.models.wishlist import Wishlist
from app.repositories import wishlist as wishlist_repo
from app.repositories import course as course_repo
from app.schemas.wishlist import WishlistCreate
from typing import List

class WishlistService:
    @staticmethod
    async def add_to_wishlist(db: AsyncSession, user_id: int, wishlist_in: WishlistCreate) -> Wishlist:
        """Add a course to user's wishlist."""
        # Check if already in wishlist
        existing = await wishlist_repo.get_wishlist_item(db, user_id, wishlist_in.course_id)
        if existing:
            raise ValueError("Course already in wishlist")

        # Check if course exists
        course = await course_repo.get_course_by_id(db, wishlist_in.course_id)
        if not course:
            raise ValueError("Course not found")

        db_item = Wishlist(user_id=user_id, course_id=wishlist_in.course_id)
        return await wishlist_repo.create_wishlist_item(db, db_item)

    @staticmethod
    async def get_user_wishlist(db: AsyncSession, user_id: int) -> List[Wishlist]:
        """Retrieve all wishlist items for a user."""
        return await wishlist_repo.get_user_wishlist(db, user_id)

    @staticmethod
    async def remove_from_wishlist(db: AsyncSession, user_id: int, course_id: int):
        """Remove a course from user's wishlist."""
        item = await wishlist_repo.get_wishlist_item(db, user_id, course_id)
        if not item:
            raise ValueError("Item not found in wishlist")
        await wishlist_repo.delete_wishlist_item(db, item)

# Functional aliases
async def add_to_wishlist(db: AsyncSession, user_id: int, wishlist_in: WishlistCreate) -> Wishlist:
    return await WishlistService.add_to_wishlist(db, user_id, wishlist_in)

async def get_user_wishlist(db: AsyncSession, user_id: int) -> List[Wishlist]:
    return await WishlistService.get_user_wishlist(db, user_id)

async def remove_from_wishlist(db: AsyncSession, user_id: int, course_id: int):
    return await WishlistService.remove_from_wishlist(db, user_id, course_id)
