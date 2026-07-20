from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.base import BaseSchema, PaginationMeta
from app.schemas.role import RoleRead


class RoleProfileBase(BaseModel):
    name: str
    description: str | None = None


class RoleProfileCreate(RoleProfileBase):
    role_public_ids: list[str] | None = None


class RoleProfileUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    role_public_ids: list[str] | None = None


class RoleProfileRead(RoleProfileBase):
    public_id: str
    created_at: datetime
    roles: list[RoleRead] | None = None

    model_config = ConfigDict(from_attributes=True)


class RoleProfileDetailResponse(BaseSchema):
    success: bool = True
    data: RoleProfileRead


class RoleProfileListResponse(BaseSchema):
    success: bool = True
    data: list[RoleProfileRead]
    meta: PaginationMeta
