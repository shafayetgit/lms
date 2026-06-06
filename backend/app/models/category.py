from enum import Enum
from typing import Optional, List
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class CategoryBadge(str, Enum):
    NONE = "none"
    FEATURED = "featured"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(default=False, index=True)

    badge: Mapped[CategoryBadge] = mapped_column(
        String(20), default=CategoryBadge.NONE.value, index=True
    )
    thumbnail: Mapped[Optional[str]] = mapped_column(String(255), index=True)

    # Relationships
    courses: Mapped[List["Course"]] = relationship("Course", back_populates="category")
