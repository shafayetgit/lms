import math
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.media import Media, MediaType
from app.repositories import media as media_repo
from app.schemas.media import MediaCreate, MediaUpdate


class MediaService:
    @staticmethod
    async def create_media(db: AsyncSession, media_in: MediaCreate) -> Media:
        """
        Create media record (after upload to Cloudinary already done)
        """

        # Ensure public_id is unique
        existing = await media_repo.get_media_by_public_id(db, media_in.public_id)
        if existing:
            raise ValueError(
                f"Media with public_id '{media_in.public_id}' already exists"
            )

        # Validate resource type consistency
        if media_in.type == MediaType.IMAGE and media_in.resource_type != "image":
            raise ValueError("Invalid resource_type for IMAGE")

        if media_in.type == MediaType.VIDEO and media_in.resource_type != "video":
            raise ValueError("Invalid resource_type for VIDEO")

        if media_in.type == MediaType.RAW and media_in.resource_type != "raw":
            raise ValueError("Invalid resource_type for RAW files")

        db_media = Media(
            public_id=media_in.public_id,
            secure_url=media_in.secure_url,
            original_filename=media_in.original_filename,
            mime_type=media_in.mime_type,
            size=media_in.size,
            type=media_in.type,
            resource_type=media_in.resource_type,
            format=media_in.format,
            width=media_in.width,
            height=media_in.height,
        )

        return await media_repo.create_media(db, db_media)

    @staticmethod
    async def get_media(db: AsyncSession, media_id: int) -> Media | None:
        return await media_repo.get_media_by_id(db, media_id)

    @staticmethod
    async def get_media_by_public_id(db: AsyncSession, public_id: str) -> Media | None:
        return await media_repo.get_media_by_public_id(db, public_id)

    @staticmethod
    async def list_media(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        type: MediaType | None = None,
        mime_type: str | None = None,
    ) -> dict:

        query = select(Media).order_by(Media.created_at.desc())

        if type:
            query = query.where(Media.type == type)

        if mime_type:
            query = query.where(Media.mime_type.ilike(f"%{mime_type}%"))

        skip = (page - 1) * size

        total = await media_repo.count_media(db, query=query)

        items = await media_repo.get_media(
            db,
            query=query,
            skip=skip,
            limit=size,
        )

        total_pages = math.ceil(total / size) if total else 0

        return {
            "items": items,
            "meta": {
                "total": total,
                "page": page,
                "size": size,
                "pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    @staticmethod
    async def delete_media(db: AsyncSession, media_id: int) -> None:
        media = await media_repo.get_media_by_id(db, media_id)

        if not media:
            raise ValueError("Media not found")

        # [TODO]: Cloudinary deletion should happen in service layer (future improvement)
        await media_repo.delete_media(db, media)