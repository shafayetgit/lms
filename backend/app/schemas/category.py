from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema, PaginationMeta
from app.models.category import CategoryBadge


class CategoryBase(BaseSchema):
    name: str
    parent_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True
    badge: CategoryBadge = CategoryBadge.NONE
    thumbnail: Optional[str] = None


class CategoryCreate(CategoryBase):
    slug: Optional[str] = None


class CategoryUpdate(BaseSchema):
    name: Optional[str] = None
    parent_id: Optional[int] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    badge: Optional[CategoryBadge] = None
    thumbnail: Optional[str] = None


class CategoryRead(CategoryBase):
    id: int
    # slug: str
    # created_at: datetime
    # updated_at: datetime


class CategoryReadResponse(BaseSchema):
    data: CategoryRead
    success: bool = True


class CategoryListResponse(BaseSchema):
    success: bool = True
    data: list[CategoryRead]
    meta: PaginationMeta
