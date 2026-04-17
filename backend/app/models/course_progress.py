# from datetime import datetime
# from typing import Optional

# from sqlalchemy import (
#     ForeignKey,
#     DateTime,
#     func,
#     Float,
#     Boolean,
#     UniqueConstraint,
#     Index,
# )
# from sqlalchemy.orm import Mapped, mapped_column, relationship

# from app.db.base import Base


# class CourseProgress(Base):
#     __tablename__ = "course_progress"

#     __table_args__ = (
#         # one progress row per user per course
#         UniqueConstraint(
#             "user_id",
#             "course_id",
#             name="uq_user_course_progress"
#         ),

#         Index("idx_course_progress_user", "user_id"),
#         Index("idx_course_progress_course", "course_id"),
#         Index("idx_course_progress_updated", "updated_at"),
#         Index("idx_course_progress_user_course", "user_id", "course_id"),
#     )

#     id: Mapped[int] = mapped_column(primary_key=True)

#     # 🔗 relationships
#     user_id: Mapped[int] = mapped_column(
#         ForeignKey("users.id", ondelete="CASCADE"),
#         index=True
#     )

#     course_id: Mapped[int] = mapped_column(
#         ForeignKey("courses.id", ondelete="CASCADE"),
#         index=True
#     )

#     # 📊 PROGRESS (cached value)
#     progress_percentage: Mapped[float] = mapped_column(
#         Float,
#         default=0.0
#     )

#     completed_lessons: Mapped[int] = mapped_column(
#         default=0
#     )

#     total_lessons: Mapped[int] = mapped_column(
#         default=0
#     )

#     is_completed: Mapped[bool] = mapped_column(
#         Boolean,
#         default=False,
#         index=True
#     )

#     completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

#     # 🔗 relationships
#     user = relationship("User", backref="course_progress")
#     course = relationship("Course", backref="progress_records")