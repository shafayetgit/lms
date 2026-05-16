from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.media import Media


async def create_media(db: AsyncSession, media: Media) -> Media:
    """Create a new media record"""
    db.add(media)
    await db.commit()
    await db.refresh(media)
    return media


async def get_media_by_id(db: AsyncSession, media_id: int) -> Media | None:
    """Get media by ID"""
    result = await db.execute(select(Media).where(Media.id == media_id))
    return result.scalars().first()


async def get_media_by_public_id(db: AsyncSession, public_id: str) -> Media | None:
    """Get media by Cloudinary public_id from metadata"""
    result = await db.execute(select(Media))
    all_media = result.scalars().all()
    
    for media in all_media:
        if media.meta.get("public_id") == public_id:
            return media
    return None


async def get_media(
    db: AsyncSession, query: Select | None = None, skip: int = 0, limit: int = 10
) -> list[Media]:
    """Get paginated media with optional custom query"""
    q = query if query is not None else select(Media).order_by(Media.created_at.desc())
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


async def count_media(db: AsyncSession, query: Select | None = None) -> int:
    """Count media matching optional query"""
    q = query if query is not None else select(Media)
    return await db.scalar(select(func.count()).select_from(q.subquery()))


async def update_media(db: AsyncSession, media: Media) -> Media:
    """Update existing media record"""
    await db.commit()
    await db.refresh(media)
    return media


async def delete_media(db: AsyncSession, media: Media) -> None:
    """Delete media record"""
    await db.delete(media)
    await db.commit()


async def get_media_by_model_and_id(
    db: AsyncSession, model: str, model_id: int
) -> list[Media]:
    """Get all media attached to a model instance"""
    result = await db.execute(
        select(Media).where(
            (Media.model == model) & (Media.model_id == model_id)
        )
    )
    return result.scalars().all()
