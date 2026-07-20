from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class InvitationCreate(BaseModel):
    emails: List[EmailStr]
    role: str = "student"


class InvitationRead(BaseModel):
    public_id: str
    email: str
    role: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvitationListMeta(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool


class InvitationListResponse(BaseModel):
    success: bool = True
    data: List[InvitationRead]
    meta: InvitationListMeta
