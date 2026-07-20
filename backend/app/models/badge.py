from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    ForeignKey,
    String,
    Text,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User

class Badge(Base):
    __tablename__ = "badges"

    title: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    reference_table: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    event: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    user_field: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    field_to_check: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    condition: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    grant_only_once: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    assignments: Mapped[list["BadgeAssignment"]] = relationship("BadgeAssignment", back_populates="badge", cascade="all, delete-orphan")


class BadgeAssignment(Base):
    __tablename__ = "badge_assignments"

    badge_id: Mapped[int] = mapped_column(
        ForeignKey("badges.id", ondelete="CASCADE")
    )
    member_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE")
    )
    assigned_by_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    badge: Mapped["Badge"] = relationship("Badge", back_populates="assignments")
    member: Mapped["User"] = relationship("User", foreign_keys=[member_id], back_populates="badges")
    assigned_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_by_id], back_populates="badges_assigned")
