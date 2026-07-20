from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.base import BaseSchema, PaginationMeta


class FeatureFlagBase(BaseModel):
    name: str
    description: str | None = None
    is_system: bool | None = False
    is_active: bool | None = True


class FeatureFlagCreate(FeatureFlagBase):
    pass


class FeatureFlagUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_system: bool | None = None
    is_active: bool | None = None


class FeatureFlagRead(FeatureFlagBase):
    public_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeatureFlagDetailResponse(BaseSchema):
    success: bool = True
    data: FeatureFlagRead


class FeatureFlagListResponse(BaseSchema):
    success: bool = True
    data: list[FeatureFlagRead]
    meta: PaginationMeta
