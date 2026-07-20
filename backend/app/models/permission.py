from __future__ import annotations

from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.role import Role


class Permission(Base):
    """
    Permission model defining access rights for resources by Role.
    """

    __tablename__ = "permissions"

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    resource: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    
    read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    create: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    update: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    delete: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    export: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    import_perm: Mapped[bool] = mapped_column("import", Boolean, default=False, nullable=False)
    only_if_creator: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    role: Mapped[Role] = relationship("Role", back_populates="permissions")
