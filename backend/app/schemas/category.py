from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema, PaginationMeta
from app.models.category import CategoryType


class CategoryBase(BaseSchema):
    name: str
    parent_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True
    type: CategoryType = CategoryType.NORMAL
    thumbnail: Optional[str] = None


class CategoryCreate(CategoryBase):
    slug: Optional[str] = None


class CategoryUpdate(BaseSchema):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    type: Optional[CategoryType] = None
    thumbnail: Optional[str] = None


class CategoryRead(CategoryBase):
    id:int
    slug: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



class CategoryListResponse(BaseModel):
    items: list[CategoryRead]
    meta: PaginationMeta