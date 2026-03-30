from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
from pathlib import Path


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(..., validation_alias="DATABASE_URL")
    REDIS_URL: str = Field(default="redis://localhost:6379/0", validation_alias="REDIS_URL")
    
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
    
    # OAuth2 Configuration (Google)
    GOOGLE_OAUTH_CLIENT_ID: str = Field(default="", validation_alias="GOOGLE_OAUTH_CLIENT_ID")
    GOOGLE_OAUTH_CLIENT_SECRET: str = Field(default="", validation_alias="GOOGLE_OAUTH_CLIENT_SECRET")
    GOOGLE_OAUTH_REDIRECT_URL: str = Field(default="http://localhost:8000/api/v1/auth/callback/google", validation_alias="GOOGLE_OAUTH_REDIRECT_URL")
    
    # OAuth2 Configuration (GitHub)
    GITHUB_OAUTH_CLIENT_ID: str = Field(default="", validation_alias="GITHUB_OAUTH_CLIENT_ID")
    GITHUB_OAUTH_CLIENT_SECRET: str = Field(default="", validation_alias="GITHUB_OAUTH_CLIENT_SECRET")
    GITHUB_OAUTH_REDIRECT_URL: str = Field(default="http://localhost:8000/api/v1/auth/callback/github", validation_alias="GITHUB_OAUTH_REDIRECT_URL")
    
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


@lru_cache()
def get_settings() -> Settings:
    return Settings()


# Lazy load settings only when needed
settings: Settings | None = None

def init_settings() -> Settings:
    global settings
    if settings is None:
        settings = get_settings()
    return settings
