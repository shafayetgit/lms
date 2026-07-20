from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EmailTemplateBase(BaseModel):
    name: str
    subject: str
    content_type: str = "rich_text"
    content: Optional[str] = None
    enabled: bool = True


class EmailTemplateCreate(EmailTemplateBase):
    pass


class EmailTemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject: Optional[str] = None
    content_type: Optional[str] = None
    content: Optional[str] = None
    enabled: Optional[bool] = None


class EmailTemplateRead(EmailTemplateBase):
    public_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EmailTemplateListResponse(BaseModel):
    success: bool = True
    data: list[EmailTemplateRead]
    meta: dict
