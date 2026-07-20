from __future__ import annotations

from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.role import Role


class RoleProfileRoleAssociation(Base):
    """
    Junction table for RoleProfile and Role.
    """

    __tablename__ = "role_profile_roles"

    role_profile_id: Mapped[int] = mapped_column(
        ForeignKey("role_profiles.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )


class UserRoleProfileAssociation(Base):
    """
    Junction table for User and RoleProfile.
    """

    __tablename__ = "user_role_profiles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_profile_id: Mapped[int] = mapped_column(
        ForeignKey("role_profiles.id", ondelete="CASCADE"), primary_key=True
    )


class RoleProfile(Base):
    """
    Role Profile model that bundles multiple roles together.
    """

    __tablename__ = "role_profiles"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(200))

    # Relationships
    roles: Mapped[List[Role]] = relationship(
        "Role", secondary="role_profile_roles", back_populates="role_profiles"
    )
    users: Mapped[List[User]] = relationship(
        "User", secondary="user_role_profiles", back_populates="role_profiles"
    )
