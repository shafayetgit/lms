from datetime import datetime
from typing import Optional, Dict, Any
import enum

from sqlalchemy import (
    Boolean, String, Text, Integer, Enum,
    Index, DateTime, func, text, CheckConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    RAW = "raw"


class MediaProvider(str, enum.Enum):
    CLOUDINARY = "cloudinary"
    S3 = "s3"
    IMAGEKIT = "imagekit"
    LOCAL = "local"


class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)

    # -------------------------
    # Core identity
    # -------------------------
    provider: Mapped[MediaProvider] = mapped_column(
        Enum(MediaProvider), nullable=False
    )
    external_id: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    # Cloudinary → public_id  |  S3 → object key
    # ImageKit  → fileId      |  Local → filename / uuid

    url: Mapped[str] = mapped_column(Text, nullable=False)

    media_type: Mapped[MediaType] = mapped_column(
        "type", Enum(MediaType), index=True, nullable=False
    )
    mime_type: Mapped[Optional[str]] = mapped_column(String(100))
    original_filename: Mapped[Optional[str]] = mapped_column(String(255))
    size: Mapped[Optional[int]] = mapped_column(Integer)  # bytes

    # -------------------------
    # provider metadata
    # -------------------------
    media_metadata: Mapped[Dict[str, Any]] = mapped_column(
        "metadata",
        JSONB,
        default=dict,
        server_default=text("'{}'::jsonb"),
        nullable=False,
    )
    # {
    #   "width": 800, "height": 600, "format": "jpg",
    #   "cloudinary": {...}, "s3": {...}
    # }

    # -------------------------
    # Generic polymorphic relation
    # -------------------------
    model: Mapped[Optional[str]] = mapped_column(String(100))
    model_id: Mapped[Optional[int]] = mapped_column(Integer)

    # -------------------------
    # Status flags
    # -------------------------
    is_used: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", index=True
    )


    # -------------------------
    # Indexes & constraints
    # -------------------------
    __table_args__ = (
        # Composite indexes
        Index("idx_media_model_model_id", "model", "model_id"),
        Index("idx_media_provider_external_id", "provider", "external_id", unique=True),

        # GIN index for JSONB queries (.contains, .has_key, etc.)
        Index("idx_media_metadata_gin", "metadata", postgresql_using="gin"),

        # Expression index for the most commonly queried metadata key
        Index("idx_media_metadata_format", text("(metadata->>'format')")),

        # DB-level guard: size must be positive if provided
        CheckConstraint("size IS NULL OR size > 0", name="ck_media_size_positive"),
    )

    def __repr__(self) -> str:
        return (
            f"<Media id={self.id} "
            f"provider={self.provider.value} "
            f"type={self.media_type.value} "
        )