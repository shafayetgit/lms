import math
from typing import List, Optional, Type
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.models.media import Media
from app.repositories import media as media_repo
from app.schemas.media import MediaCreate, MediaUpdate, MediaAttach


class MediaService:
    """Service for managing media uploads and attachments"""

    @staticmethod
    async def create_media(db: AsyncSession, payload: MediaCreate) -> Media:
        """
        Create a media record from upload response.
        
        Args:
            db: Database session
            payload: MediaCreate schema with metadata
            
        Returns:
            Created Media instance
        """
        media = Media(
            meta=payload.meta if payload.meta else {},
        )
        
        return await media_repo.create_media(db, media)

    @staticmethod
    async def attach_media_to_model(
        db: AsyncSession,
        media_payload: MediaAttach,
        model_class: Type[DeclarativeBase],
    ) -> Media:
        """
        Attach media to a model instance and update the model field.
        
        Args:
            db: Database session
            media_payload: MediaAttach schema with field, model, model_id, and meta
            model_class: The SQLAlchemy model class to attach media to
            
        Returns:
            Created Media instance with model reference
            
        Raises:
            ValueError: If the model instance doesn't exist
        """
        # Verify the model instance exists
        result = await db.execute(
            select(model_class).where(model_class.id == media_payload.model_id)
        )
        model_instance = result.scalars().first()
        
        if not model_instance:
            raise ValueError(
                f"{media_payload.model} with id {media_payload.model_id} not found"
            )
        
        # Extract key fields from metadata
        meta_dict = media_payload.meta if media_payload.meta else {}
        
        # Try different possible URL fields, prioritizing secure_url
        secure_url = (
            meta_dict.get("secure_url") or 
            meta_dict.get("url") or 
            meta_dict.get("Location") or
            meta_dict.get("location")
        )
        
        if not secure_url:
            raise ValueError("Meta must contain 'secure_url' or 'url'")
        
        existing_media = await media_repo.get_media_by_model_and_id(
            db, media_payload.model, media_payload.model_id
        )
        
        # Mark existing media as not used if any
        if len(existing_media):
            for media in existing_media:
                media.is_used = False
                await media_repo.update_media(db, media)
        
        # Create media record
        media = Media(
            model=media_payload.model,
            model_id=media_payload.model_id,
            meta=meta_dict,
            is_used=True,
        )
        
        created_media = await media_repo.create_media(db, media)
        
        # Update the model's field with the secure_url
        await MediaService._update_model_field(
            db, model_class, media_payload.model_id, media_payload.field, secure_url
        )
        
        return created_media

    @staticmethod
    async def _update_model_field(
        db: AsyncSession,
        model_class: Type[DeclarativeBase],
        model_id: int,
        field_name: str,
        value: str,
    ) -> None:
        """
        Update a specific field on a model instance.
        
        Args:
            db: Database session
            model_class: The model class
            model_id: ID of the model instance
            field_name: Name of the field to update
            value: Value to set
        """
        # Verify the field exists on the model
        if not hasattr(model_class, field_name):
            raise ValueError(
                f"Model {model_class.__name__} has no field '{field_name}'"
            )
        
        # Update the model field
        stmt = (
            update(model_class)
            .where(model_class.id == model_id)
            .values({getattr(model_class, field_name): value})
        )
        await db.execute(stmt)
        await db.commit()

    @staticmethod
    async def get_media(db: AsyncSession, media_id: int) -> Media | None:
        """Get media by ID"""
        return await media_repo.get_media_by_id(db, media_id)

    @staticmethod
    async def get_model_media(
        db: AsyncSession, model: str, model_id: int
    ) -> List[Media]:
        """
        Get media attached to a model.
        
        Args:
            db: Database session
            model: Model class name (e.g., "Category")
            model_id: ID of the model instance
            
        Returns:
            List of Media instances
        """
        return await media_repo.get_media_by_model(db, model, model_id)

    @staticmethod
    async def list_media(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        model: Optional[str] = None,
    ) -> dict:
        """
        List media with filtering and pagination.
        
        Args:
            db: Database session
            page: Page number (1-indexed)
            size: Items per page
            model: Filter by model name
            
        Returns:
            Dict with items and pagination metadata
        """
        query = select(Media).order_by(Media.created_at.desc())

        if model:
            query = query.where(Media.model == model)

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
    async def update_media(
        db: AsyncSession, media_id: int, payload: MediaUpdate
    ) -> Media:
        """
        Update media record.
        
        Args:
            db: Database session
            media_id: Media ID to update
            payload: Update payload
            
        Returns:
            Updated Media instance
            
        Raises:
            ValueError: If media not found
        """
        media = await media_repo.get_media_by_id(db, media_id)

        if not media:
            raise ValueError(f"Media with id {media_id} not found")

        if payload.is_used is not None:
            media.is_used = payload.is_used

        return await media_repo.update_media(db, media)

    @staticmethod
    async def delete_media(db: AsyncSession, media_id: int) -> None:
        """
        Delete media record.
        
        Args:
            db: Database session
            media_id: Media ID to delete
            
        Raises:
            ValueError: If media not found
        """
        media = await media_repo.get_media_by_id(db, media_id)

        if not media:
            raise ValueError(f"Media with id {media_id} not found")

        # [TODO]: Cloudinary deletion should happen before DB deletion (future improvement)
        await media_repo.delete_media(db, media)

