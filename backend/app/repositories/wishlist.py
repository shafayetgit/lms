from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.wishlist import Wishlist

async def create_wishlist_item(db: AsyncSession, item: Wishlist) -> Wishlist:
    db.add(item)
    await db.commit()
    await db.refresh(item)
    # Re-fetch with course joined for the schema
    query = select(Wishlist).options(joinedload(Wishlist.course)).where(Wishlist.id == item.id)
    result = await db.execute(query)
    return result.scalars().first()

async def get_wishlist_item(db: AsyncSession, user_id: int, course_id: int) -> Wishlist | None:
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == user_id, Wishlist.course_id == course_id)
    )
    return result.scalars().first()

async def get_wishlist_by_id(db: AsyncSession, wishlist_id: int) -> Wishlist | None:
    result = await db.execute(select(Wishlist).where(Wishlist.id == wishlist_id))
    return result.scalars().first()

async def get_user_wishlist(db: AsyncSession, user_id: int) -> list[Wishlist]:
    query = select(Wishlist).options(joinedload(Wishlist.course)).where(Wishlist.user_id == user_id)
    result = await db.execute(query)
    return result.scalars().all()

async def delete_wishlist_item(db: AsyncSession, item: Wishlist):
    await db.delete(item)
    await db.commit()
