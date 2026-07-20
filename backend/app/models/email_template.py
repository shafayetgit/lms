from typing import Optional
from sqlalchemy import Boolean, Text, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmailTemplate(Base):
    __tablename__ = "email_templates"

    name: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), default="rich_text", nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<EmailTemplate id={self.id} name={self.name}>"
