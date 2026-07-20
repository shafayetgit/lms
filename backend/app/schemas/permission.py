from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.base import BaseSchema, PaginationMeta


class PermissionBase(BaseModel):
    resource: str
    read: bool | None = False
    create: bool | None = False
    write: bool | None = False
    delete: bool | None = False
    export: bool | None = False
    import_: bool | None = Field(default=False, alias="import")
    only_if_creator: bool | None = False

    model_config = ConfigDict(populate_by_name=True)


class PermissionCreate(PermissionBase):
    role_public_id: str


class PermissionUpdate(BaseModel):
    read: bool | None = None
    create: bool | None = None
    write: bool | None = None
    delete: bool | None = None
    export: bool | None = None
    import_: bool | None = Field(default=None, alias="import")
    only_if_creator: bool | None = None

    model_config = ConfigDict(populate_by_name=True)


class PermissionRead(PermissionBase):
    public_id: str
    role_public_id: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class PermissionDetailResponse(BaseSchema):
    success: bool = True
    data: PermissionRead


class PermissionListResponse(BaseSchema):
    success: bool = True
    data: list[PermissionRead]
    meta: PaginationMeta
