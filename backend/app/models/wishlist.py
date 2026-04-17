from datetime import datetime

from sqlalchemy import (
    ForeignKey,
    DateTime,
    func,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    __table_args__ = (
        # prevent duplicate wishlist entries
        UniqueConstraint("user_id", "course_id", name="uq_user_course_wishlist"),

        # optimize common queries
        Index("idx_wishlist_user", "user_id"),
        Index("idx_wishlist_course", "course_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now()
    )

    # relationships
    user = relationship("User", back_populates="wishlist_items")
    course = relationship("Course", back_populates="wishlisted_by")