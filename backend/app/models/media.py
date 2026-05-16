from __future__ import annotations

from datetime import datetime
from email.policy import default
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
from app.core.config import init_settings

# -------------------------
# Enums
# -------------------------

class MediaProvider(str, enum.Enum):
    CLOUDINARY = "cloudinary"
    S3 = "s3"
    IMAGEKIT = "imagekit"
    LOCAL = "local"

settings = init_settings()

# -------------------------
# Model
# -------------------------

class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)

    provider: Mapped[MediaProvider] = mapped_column(
        Enum(MediaProvider, name="media_provider_enum"),
        default=settings.MEDIA_PROVIDER,
    )

    meta: Mapped[Dict[str, Any]] = mapped_column(
        "metadata",
        JSONB,
        default=dict,
        server_default=text("'{}'::jsonb"),
        nullable=False,
    )

    model: Mapped[Optional[str]] = mapped_column(String(100))
    model_id: Mapped[Optional[int]] = mapped_column(Integer)

    is_used: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
        index=True,
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