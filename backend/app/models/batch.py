from sqlalchemy import Boolean, Column, Integer, String, Text, Date, Time, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base

class Batch(Base):
    __tablename__ = "batches"

    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    batch_details = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    timezone = Column(String, default="UTC")
    published = Column(Boolean, default=False)
    allow_self_enrollment = Column(Boolean, default=True)
    seat_count = Column(Integer, nullable=True, default=0)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    medium = Column(String, nullable=True) # Online, Offline, Hybrid
    paid_batch = Column(Boolean, default=False)
    amount = Column(Float, nullable=True)
    currency = Column(String, nullable=True)
    amount_usd = Column(Float, nullable=True)
    evaluation = Column(Boolean, default=False)
    evaluation_end_date = Column(Date, nullable=True)
    certification = Column(Boolean, default=False)
    meta_image = Column(String, nullable=True)
    video_link = Column(String, nullable=True)

    category = relationship("Category", back_populates="batches")
    courses = relationship("BatchCourse", back_populates="batch", cascade="all, delete-orphan")
    enrollments = relationship("BatchEnrollment", back_populates="batch", cascade="all, delete-orphan")
    timetables = relationship("BatchTimetable", back_populates="batch", cascade="all, delete-orphan")
    feedbacks = relationship("BatchFeedback", back_populates="batch", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="batch", cascade="all, delete-orphan")
    certificate_evaluations = relationship("CertificateEvaluation", back_populates="batch", cascade="all, delete-orphan")
    certificate_requests = relationship("CertificateRequest", back_populates="batch", cascade="all, delete-orphan")
    live_classes = relationship("LiveClass", back_populates="batch", cascade="all, delete-orphan")


class BatchCourse(Base):
    __tablename__ = "batch_courses"

    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    evaluator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    batch = relationship("Batch", back_populates="courses")
    course = relationship("Course", back_populates="batches")
    evaluator = relationship("User", back_populates="evaluated_batch_courses")


class BatchEnrollment(Base):
    __tablename__ = "batch_enrollments"

    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_paid = Column(Boolean, default=False)

    batch = relationship("Batch", back_populates="enrollments")
    member = relationship("User", back_populates="batch_enrollments")
    payment = relationship(
        "Payment",
        primaryjoin="and_(Payment.payment_for_id == BatchEnrollment.batch_id, "
                    "Payment.member_id == BatchEnrollment.member_id, "
                    "Payment.payment_for_type == 'Batch')",
        foreign_keys="[Payment.payment_for_id, Payment.member_id]",
        uselist=False,
        viewonly=True,
    )


class BatchTimetable(Base):
    __tablename__ = "batch_timetables"

    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    topic = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    meeting_link = Column(String, nullable=True)

    batch = relationship("Batch", back_populates="timetables")


class BatchFeedback(Base):
    __tablename__ = "batch_feedbacks"

    batch_id = Column(Integer, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    feedback = Column(Text, nullable=False)
    rating = Column(Float, nullable=True)

    batch = relationship("Batch", back_populates="feedbacks")
    member = relationship("User", back_populates="batch_feedbacks")
