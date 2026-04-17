from datetime import datetime
from typing import Optional

from sqlalchemy import (
    ForeignKey,
    Text,
    DateTime,
    func,
    Boolean,
    Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Comment(Base):
    __tablename__ = "comments"

    __table_args__ = (
        Index("idx_comment_discussion", "discussion_id"),
        Index("idx_comment_user", "user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # 🔗 relations
    discussion_id: Mapped[int] = mapped_column(
        ForeignKey("discussions.id", ondelete="CASCADE"),
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    # Nested replies
    parent_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("comments.id", ondelete="CASCADE"),
        nullable=True
    )

    # 🧠 content
    body: Mapped[str] = mapped_column(Text)

    # ⚙️ control
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


    # 🔗 relationships
    discussion = relationship("Discussion", back_populates="comments")
    user = relationship("User", back_populates="comments")

    parent = relationship("Comment", remote_side="Comment.id", back_populates="replies")
    replies = relationship("Comment", back_populates="parent", cascade="all, delete-orphan", lazy="selectin")