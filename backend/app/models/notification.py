from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User

class Notification(Base):
    __tablename__ = "notifications"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    link: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User")
