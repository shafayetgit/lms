from pydantic import ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema

class ModuleBase(BaseSchema):
    course_id: int
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    order_index: int = Field(0, ge=0)
    is_active: bool = True

class ModuleCreate(ModuleBase):
    pass

class ModuleUpdate(BaseSchema):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    order_index: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class ModuleRead(ModuleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
