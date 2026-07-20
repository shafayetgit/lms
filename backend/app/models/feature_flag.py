from typing import TYPE_CHECKING, List
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class UserFeatureFlag(Base):
    """Junction table linking users to their enabled feature flags."""

    __tablename__ = "user_feature_flags"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    feature_flag_id: Mapped[int] = mapped_column(
        ForeignKey("feature_flags.id", ondelete="CASCADE"), primary_key=True
    )


from sqlalchemy import Index

class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    name: Mapped[str] = mapped_column(String(100), index=True)
    slug: Mapped[str] = mapped_column(String(100), index=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    __table_args__ = (
        Index("ix_feature_flags_slug_owner_id", "slug", "owner_id", unique=True),
    )

    users: Mapped[List["User"]] = relationship(
        "User", secondary="user_feature_flags", back_populates="feature_flags"
    )
