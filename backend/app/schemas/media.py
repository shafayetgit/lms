from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

from app.core.base import BaseSchema, PaginationMeta
from app.models.media import MediaType


class MediaBase(BaseSchema):
    public_id: str
    secure_url: str

    original_filename: Optional[str] = None
    mime_type: Optional[str] = None

    size: int

    type: MediaType
    resource_type: str
    format: str

    width: Optional[int] = None
    height: Optional[int] = None


class MediaCreate(MediaBase):
    """
    Used after uploading file to Cloudinary
    """
    pass


class MediaUpdate(BaseSchema):
    """
    Optional: only if you plan metadata edits
    (usually media is immutable)
    """
    original_filename: Optional[str] = None


class MediaRead(MediaBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MediaListResponse(BaseModel):
    items: List[MediaRead]
    meta: PaginationMeta