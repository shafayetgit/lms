from datetime import datetime
from typing import Optional

import enum
from sqlalchemy import String, Text, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MediaType(str, enum.Enum):
    IMAGE = "image"
    VIDEO = "video"
    RAW = "raw"  # pdf, docx, zip, etc.


class Media(Base):
    __tablename__ = "media"

    id: Mapped[int] = mapped_column(primary_key=True)

    public_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )
    
    secure_url: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    
    original_filename: Mapped[Optional[str]] = mapped_column(String(255))
    mime_type: Mapped[Optional[str]] = mapped_column(String(100))
    size: Mapped[int] = mapped_column(Integer)  # bytes

    type: Mapped[MediaType] = mapped_column(
        Enum(MediaType),
        index=True,
        nullable=False
    )

    resource_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    format: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    width: Mapped[Optional[int]] = mapped_column(Integer)
    height: Mapped[Optional[int]] = mapped_column(Integer)

