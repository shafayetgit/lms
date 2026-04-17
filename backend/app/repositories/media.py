from sqlalchemy import select, func, Select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.media import Media


async def create_media(db: AsyncSession, media: Media) -> Media:
    db.add(media)
    await db.commit()
    await db.refresh(media)
    return media


async def get_media_by_id(db: AsyncSession, media_id: int) -> Media | None:
    result = await db.execute(select(Media).where(Media.id == media_id))
    return result.scalars().first()


async def get_media_by_public_id(db: AsyncSession, public_id: str) -> Media | None:
    result = await db.execute(select(Media).where(Media.public_id == public_id))
    return result.scalars().first()


async def get_media(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Media]:
    q = query if query is not None else select(Media)

    result = await db.execute(q.offset(skip).limit(limit))

    return result.scalars().all()


async def count_media(db: AsyncSession, query: Select | None = None) -> int:
    q = query if query is not None else select(Media)

    return await db.scalar(select(func.count()).select_from(q.subquery()))


async def delete_media(db: AsyncSession, media: Media) -> None:
    await db.delete(media)
    await db.commit()
