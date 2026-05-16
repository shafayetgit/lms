from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.core.base import BaseSchema, PaginationMeta


class MediaBase(BaseSchema):
    """Base schema for media with common fields"""
    pass


class MediaCreate(BaseSchema):
    """Schema for creating media from provider upload response"""
    meta: Dict[str, Any] = Field(default_factory=dict)


class MediaUpdate(BaseSchema):
    """Schema for updating media"""
    is_used: Optional[bool] = None


class MediaAttach(BaseSchema):
    """
    Schema for attaching media to a model.
    Used when receiving payload with field, model, and model_id
    """
    field: str
    model: str
    model_id: int
    meta: Dict[str, Any]

    # @field_validator("meta", mode="before")
    # @classmethod
    # def unwrap_meta(cls, v):
    #     """Unwrap nested meta if present (prevents double-wrapping bugs)"""
    #     if isinstance(v, dict) and "meta" in v and isinstance(v["meta"], dict):
    #         nested = v["meta"]
    #         if any(k in nested for k in ["secure_url", "url", "Location", "location"]):
    #             return nested
    #     return v


class MediaRead(BaseSchema):
    """Schema for reading media"""
    id: int
    provider: str
    model: Optional[str] = None
    model_id: Optional[int] = None
    is_used: bool
    meta: Dict[str, Any]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class MediaListResponse(BaseModel):
    """Paginated list of media items"""
    items: List[MediaRead]
    meta: PaginationMeta

