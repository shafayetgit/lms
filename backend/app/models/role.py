from typing import Optional, List, TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.role_profile import RoleProfile
    from app.models.permission import Permission



class Role(Base):

    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(200))

    users: Mapped[List["User"]] = relationship(
        "User", secondary="user_roles", back_populates="roles"
    )
    role_profiles: Mapped[List["RoleProfile"]] = relationship(
        "RoleProfile", secondary="role_profile_roles", back_populates="roles"
    )
    permissions: Mapped[List["Permission"]] = relationship(
        "Permission", back_populates="role", cascade="all, delete-orphan"
    )


class UserRoleAssociation(Base):
    
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )



