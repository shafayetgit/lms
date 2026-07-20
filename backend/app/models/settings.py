from typing import Optional
from sqlalchemy import Boolean, String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class LMSSettings(Base):
    __tablename__ = "lms_settings"

    default_currency: Mapped[str] = mapped_column(String(10), default="USD")
    site_logo_dark: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    site_logo_light: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    site_short_logo_dark: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    site_short_logo_light: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    certificate_logo: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # General Settings
    prevent_skipping_videos: Mapped[bool] = mapped_column(Boolean, default=False)
    send_notification_for_published_courses: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    send_notification_for_published_batches: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Course Progress Settings
    lesson_dwell_time: Mapped[int] = mapped_column(Integer, default=30)
    enforce_video_completion: Mapped[bool] = mapped_column(Boolean, default=True)
    enforce_quiz_completion: Mapped[bool] = mapped_column(Boolean, default=True)
    enforce_assignment_completion: Mapped[bool] = mapped_column(Boolean, default=True)

    # Email Template Settings
    certification_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    batch_confirmation_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    payment_reminder_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email_verification_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_reset_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    password_changed_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    welcome_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    two_factor_auth_template: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # SEO Settings
    meta_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meta_image: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    meta_keywords: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Contact Us Settings
    contact_us_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Payment Settings
    send_payment_reminders_for_batch: Mapped[bool] = mapped_column(Boolean, default=False)
    send_payment_reminders_for_course: Mapped[bool] = mapped_column(Boolean, default=False)
    payment_gateway: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    apply_rounding_on_equivalent: Mapped[bool] = mapped_column(Boolean, default=False)

