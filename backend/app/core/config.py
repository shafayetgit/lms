from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(..., validation_alias="DATABASE_URL")
    REDIS_URL: str = Field(default="redis://localhost:6379/0", validation_alias="REDIS_URL")

    # Celery (Background Tasks)
    CELERY_ENABLED: bool = Field(default=False, validation_alias="CELERY_ENABLED")
    CELERY_BROKER_URL: str | None = Field(default=None, validation_alias="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str | None = Field(default=None, validation_alias="CELERY_RESULT_BACKEND")
    CELERY_TIMEZONE: str = Field(default="UTC", validation_alias="CELERY_TIMEZONE")
    CELERY_TASK_ALWAYS_EAGER: bool = Field(default=False, validation_alias="CELERY_TASK_ALWAYS_EAGER")
    CELERY_TASK_EAGER_PROPAGATES: bool = Field(
        default=False, validation_alias="CELERY_TASK_EAGER_PROPAGATES"
    )
    
    # JWT
    SECRET_KEY: str = Field(..., validation_alias="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", validation_alias="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, validation_alias="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Application
    DEBUG: bool = Field(default=False, validation_alias="DEBUG")
    APP_TITLE: str = Field(default="LMS Backend", validation_alias="APP_TITLE")
    FRONTEND_URL: str = Field(default="http://localhost:3000", validation_alias="FRONTEND_URL")
    
    # Email Configuration
    EMAIL_PROVIDER: str = Field(default="smtp", validation_alias="EMAIL_PROVIDER")  # 'smtp' or 'sendgrid'
    
    # SMTP Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com", validation_alias="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, validation_alias="SMTP_PORT")
    SMTP_USER: str = Field(default="", validation_alias="SMTP_USER")
    SMTP_PASSWORD: str = Field(default="", validation_alias="SMTP_PASSWORD")
    
    # SendGrid Configuration
    SENDGRID_API_KEY: str = Field(default="", validation_alias="SENDGRID_API_KEY")
    
    # Email Settings
    EMAILS_FROM_EMAIL: str = Field(default="noreply@lms.example.com", validation_alias="EMAILS_FROM_EMAIL")
    EMAILS_FROM_NAME: str = Field(default="LMS Notifications", validation_alias="EMAILS_FROM_NAME")
    
    # OTP Settings
    OTP_EXPIRE_MINUTES: int = Field(default=10, validation_alias="OTP_EXPIRE_MINUTES")
    OTP_LENGTH: int = Field(default=6, validation_alias="OTP_LENGTH")
    OTP_RESEND_MAX_ATTEMPTS: int = Field(default=5, validation_alias="OTP_RESEND_MAX_ATTEMPTS")
    OTP_RESEND_COOLDOWN_SECONDS: int = Field(default=60, validation_alias="OTP_RESEND_COOLDOWN_SECONDS")
    
    # SMS Configuration (Twilio)
    SMS_PROVIDER: str = Field(default="twilio", validation_alias="SMS_PROVIDER")  # 'twilio' or 'vonage'
    TWILIO_ACCOUNT_SID: str = Field(default="", validation_alias="TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = Field(default="", validation_alias="TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: str = Field(default="", validation_alias="TWILIO_PHONE_NUMBER")
    
    # 2FA Settings
    TWO_FA_ENABLED: bool = Field(default=True, validation_alias="TWO_FA_ENABLED")
    TOTP_WINDOW: int = Field(default=1, validation_alias="TOTP_WINDOW")  # Allow 1 time window drift
    
    # Login Settings
    MAX_LOGIN_ATTEMPTS: int = Field(default=5, validation_alias="MAX_LOGIN_ATTEMPTS")
    LOGIN_ATTEMPT_LOCKOUT_MINUTES: int = Field(default=15, validation_alias="LOGIN_ATTEMPT_LOCKOUT_MINUTES")
    
    # Password Settings
    PASSWORD_MIN_LENGTH: int = Field(default=8, validation_alias="PASSWORD_MIN_LENGTH")
    PASSWORD_REQUIRE_UPPERCASE: bool = Field(default=True, validation_alias="PASSWORD_REQUIRE_UPPERCASE")
    PASSWORD_REQUIRE_LOWERCASE: bool = Field(default=True, validation_alias="PASSWORD_REQUIRE_LOWERCASE")
    PASSWORD_REQUIRE_DIGITS: bool = Field(default=True, validation_alias="PASSWORD_REQUIRE_DIGITS")
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = Field(default=True, validation_alias="PASSWORD_REQUIRE_SPECIAL_CHARS")
    
    class Config:
        env_file = Path(__file__).parent.parent.parent / ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "allow"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def _parse_debug(cls, value):
        if isinstance(value, bool):
            return value
        if value is None:
            return False
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "y", "on", "debug", "dev", "development"}:
                return True
            if normalized in {"0", "false", "no", "n", "off", "release", "prod", "production"}:
                return False
        return value


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Lazy load settings only when needed
settings: Settings | None = None

def init_settings() -> Settings:
    global settings
    if settings is None:
        settings = get_settings()
        
        # Merge values from project_settings.yaml if available
        try:
            from app.core.project_settings import get_project_settings
            project_cfg = get_project_settings()
            
            # Application metadata
            settings.APP_TITLE = project_cfg.api.title
            
            # Security & Session
            settings.ACCESS_TOKEN_EXPIRE_MINUTES = project_cfg.security.session.access_token_expire_minutes
            settings.REFRESH_TOKEN_EXPIRE_DAYS = project_cfg.security.session.refresh_token_expire_days
            settings.TWO_FA_ENABLED = project_cfg.features.two_factor_auth.enabled
            
            # Login & Password Policies
            settings.MAX_LOGIN_ATTEMPTS = project_cfg.security.login.max_attempts
            settings.LOGIN_ATTEMPT_LOCKOUT_MINUTES = project_cfg.security.login.lockout_minutes
            settings.PASSWORD_MIN_LENGTH = project_cfg.security.password.min_length
            settings.PASSWORD_REQUIRE_UPPERCASE = project_cfg.security.password.require_uppercase
            settings.PASSWORD_REQUIRE_LOWERCASE = project_cfg.security.password.require_lowercase
            settings.PASSWORD_REQUIRE_DIGITS = project_cfg.security.password.require_digits
            settings.PASSWORD_REQUIRE_SPECIAL_CHARS = project_cfg.security.password.require_special_chars
            
            # OTP Configuration
            settings.OTP_EXPIRE_MINUTES = project_cfg.otp.expiration_minutes
            settings.OTP_LENGTH = project_cfg.otp.length
            settings.OTP_RESEND_MAX_ATTEMPTS = project_cfg.otp.max_resend_attempts
            settings.OTP_RESEND_COOLDOWN_SECONDS = project_cfg.otp.resend_cooldown_seconds
            
            # Email & Providers
            settings.EMAILS_FROM_NAME = project_cfg.email_templates.from_name
            settings.EMAILS_FROM_EMAIL = project_cfg.email_templates.from_address
            settings.EMAIL_PROVIDER = project_cfg.providers.email.get("type", settings.EMAIL_PROVIDER)
            settings.SMS_PROVIDER = project_cfg.providers.sms.get("type", settings.SMS_PROVIDER)
            
        except Exception as e:
            # Fallback to defaults if YAML loading fails, logger might not be ready elsewhere
            print(f"⚠️ Warning: Could not merge project_settings.yaml: {e}")
            
    return settings
