from __future__ import annotations

from datetime import datetime
from typing import Optional, Dict, Any
import enum

from sqlalchemy import (
    Boolean,
    String,
    Text,
    Integer,
    Enum,
    Index,
    DateTime,
    func,
    text,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


# -------------------------
# Enums
# -------------------------

class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    RAW = "raw"


class MediaProvider(str, enum.Enum):
    CLOUDINARY = "cloudinary"
    S3 = "s3"
    IMAGEKIT = "imagekit"
    LOCAL = "local"


# -------------------------
# Model
# -------------------------

class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)

    provider: Mapped[MediaProvider] = mapped_column(
        Enum(MediaProvider, name="media_provider_enum"),
        nullable=False,
    )

    # Avoid SQLAlchemy reserved name collision
    meta: Mapped[Dict[str, Any]] = mapped_column(
        "metadata",
        JSONB,
        default=dict,
        server_default=text("'{}'::jsonb"),
        nullable=False,
    )

    # Polymorphic reference (soft relation)
    model: Mapped[Optional[str]] = mapped_column(String(100))
    model_id: Mapped[Optional[int]] = mapped_column(Integer)

    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        index=True,
    )

    # Common media fields
    url: Mapped[Optional[str]] = mapped_column(Text)
    public_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)

    resource_type: Mapped[Optional[MediaType]] = mapped_column(
        Enum(MediaType, name="media_type_enum")
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # -------------------------
    # Constraints & Indexes
    # -------------------------
    __table_args__ = (
        Index("idx_media_model_model_id", "model", "model_id"),
        Index("idx_media_provider", "provider"),
        CheckConstraint(
            "(model IS NULL AND model_id IS NULL) OR (model IS NOT NULL AND model_id IS NOT NULL)",
            name="ck_media_model_pair",
        ),
    )

    # -------------------------
    # Representation
    # -------------------------
    def __repr__(self) -> str:
        return (
            f"<Media id={self.id} provider={self.provider.value} "
            f"model={self.model} model_id={self.model_id}>"
        )