from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.user import User

class Program(Base):
    __tablename__ = "programs"

    title: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    enforce_course_order: Mapped[bool] = mapped_column(Boolean, default=False)
    course_count: Mapped[int] = mapped_column(Integer, default=0)
    member_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    courses: Mapped[List["ProgramCourse"]] = relationship(
        "ProgramCourse", back_populates="program", cascade="all, delete-orphan", order_by="ProgramCourse.order_index"
    )
    members: Mapped[List["ProgramMember"]] = relationship(
        "ProgramMember", back_populates="program", cascade="all, delete-orphan"
    )


class ProgramCourse(Base):
    __tablename__ = "program_courses"

    program_id: Mapped[int] = mapped_column(ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    program: Mapped["Program"] = relationship("Program", back_populates="courses")
    course: Mapped["Course"] = relationship("Course", back_populates="programs")


class ProgramMember(Base):
    __tablename__ = "program_members"

    program_id: Mapped[int] = mapped_column(ForeignKey("programs.id", ondelete="CASCADE"), nullable=False)
    member_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    progress: Mapped[float] = mapped_column(Float, default=0.0)

    # Relationships
    program: Mapped["Program"] = relationship("Program", back_populates="members")
    member: Mapped["User"] = relationship("User", back_populates="program_memberships")
