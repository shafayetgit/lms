from typing import Optional
from pydantic import BaseModel, ConfigDict

class LMSSettingsBase(BaseModel):
    default_currency: str = "USD"
    site_logo_dark: Optional[str] = None
    site_logo_light: Optional[str] = None
    site_short_logo_dark: Optional[str] = None
    site_short_logo_light: Optional[str] = None
    certificate_logo: Optional[str] = None

    # General Settings
    prevent_skipping_videos: bool = False
    send_notification_for_published_courses: Optional[str] = None
    send_notification_for_published_batches: Optional[str] = None

    # Course Progress Settings
    lesson_dwell_time: int = 30
    enforce_video_completion: bool = True
    enforce_quiz_completion: bool = True
    enforce_assignment_completion: bool = True

    # Email Template Settings
    certification_template: Optional[str] = None
    batch_confirmation_template: Optional[str] = None
    payment_reminder_template: Optional[str] = None
    email_verification_template: Optional[str] = None
    password_reset_template: Optional[str] = None
    password_changed_template: Optional[str] = None
    welcome_template: Optional[str] = None
    two_factor_auth_template: Optional[str] = None

    # SEO Settings
    meta_description: Optional[str] = None
    meta_image: Optional[str] = None
    meta_keywords: Optional[str] = None

    # Contact Us Settings
    contact_us_email: Optional[str] = None

    # Payment Settings
    send_payment_reminders_for_batch: bool = False
    send_payment_reminders_for_course: bool = False
    payment_gateway: Optional[str] = None
    apply_rounding_on_equivalent: bool = False

class LMSSettingsUpdate(BaseModel):
    default_currency: Optional[str] = None
    site_logo_dark: Optional[str] = None
    site_logo_light: Optional[str] = None
    site_short_logo_dark: Optional[str] = None
    site_short_logo_light: Optional[str] = None
    certificate_logo: Optional[str] = None

    # General Settings
    prevent_skipping_videos: Optional[bool] = None
    send_notification_for_published_courses: Optional[str] = None
    send_notification_for_published_batches: Optional[str] = None

    # Course Progress Settings
    lesson_dwell_time: Optional[int] = None
    enforce_video_completion: Optional[bool] = None
    enforce_quiz_completion: Optional[bool] = None
    enforce_assignment_completion: Optional[bool] = None

    # Email Template Settings
    certification_template: Optional[str] = None
    batch_confirmation_template: Optional[str] = None
    payment_reminder_template: Optional[str] = None
    email_verification_template: Optional[str] = None
    password_reset_template: Optional[str] = None
    password_changed_template: Optional[str] = None
    welcome_template: Optional[str] = None
    two_factor_auth_template: Optional[str] = None

    # SEO Settings
    meta_description: Optional[str] = None
    meta_image: Optional[str] = None
    meta_keywords: Optional[str] = None

    # Contact Us Settings
    contact_us_email: Optional[str] = None

    # Payment Settings
    send_payment_reminders_for_batch: Optional[bool] = None
    send_payment_reminders_for_course: Optional[bool] = None
    payment_gateway: Optional[str] = None
    apply_rounding_on_equivalent: Optional[bool] = None

class LMSSettingsResponse(LMSSettingsBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
