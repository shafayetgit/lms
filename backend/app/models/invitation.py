from typing import Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Invitation(Base):
    __tablename__ = "invitations"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="student", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    invitation_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    invited_by_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True)

    invited_by = relationship("User", foreign_keys=[invited_by_id])
