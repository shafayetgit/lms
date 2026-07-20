from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import (
    ForeignKey,
    Integer,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.course import Course
    from app.models.user import User

class CourseInstructor(Base):
    __tablename__ = "course_instructors"

    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    instructor_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    course = relationship("Course", overlaps="courses,instructors")
    instructor = relationship("User", overlaps="courses,instructors")
