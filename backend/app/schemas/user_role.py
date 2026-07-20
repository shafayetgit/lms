from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserRoleAssignmentBase(BaseModel):
    pass


class UserRoleAssignmentCreate(BaseModel):
    user_public_id: str
    role_public_id: str


class UserRoleAssignmentRead(BaseModel):
    public_id: str
    user_id: int
    role_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRoleAssignmentListResponse(BaseModel):
    items: list[UserRoleAssignmentRead]
    total: int
    page: int
    size: int
