"""
Authentication Schemas
Request and response models for authentication endpoints.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import re

from app.core.base import BaseSchema


class TokenResponse(BaseSchema):
    """Token response with access and refresh tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class VerifyEmailRequest(BaseModel):
    """Email verification request with OTP."""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")


class ResendOTPRequest(BaseModel):
    """Request to resend OTP."""
    email: EmailStr
    method: str = Field(
        default="email",
        description="'email' or 'sms' for OTP delivery method"
    )

    @field_validator("method")
    @classmethod
    def validate_method(cls, v):
        if v not in ["email", "sms"]:
            raise ValueError("Method must be 'email' or 'sms'")
        return v


class ForgotPasswordRequest(BaseModel):
    """Forgot password request."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password with OTP."""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\",.<>?/\\|`~]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class ChangePasswordRequest(BaseModel):
    """Change password request (authenticated user)."""
    current_password: str
    new_password: str = Field(..., min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\",.<>?/\\|`~]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class Enable2FARequest(BaseModel):
    """Request to enable 2FA."""
    method: str = Field(
        default="email",
        description="'email' or 'sms' for 2FA method"
    )
    phone_number: Optional[str] = None  # Required if method is 'sms'

    @field_validator("method")
    @classmethod
    def validate_method(cls, v):
        if v not in ["email", "sms"]:
            raise ValueError("Method must be 'email' or 'sms'")
        return v


class Verify2FARequest(BaseModel):
    """Request to verify 2FA code."""
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class GenerateTOTPRequest(BaseModel):
    """Request to generate TOTP secret."""
    method: str = "totp"


class VerifyTOTPRequest(BaseModel):
    """Request to verify TOTP code."""
    totp_code: str = Field(..., min_length=6, max_length=6)


class Disable2FARequest(BaseModel):
    """Request to disable 2FA."""
    password: str


class LoginAuditResponse(BaseModel):
    """Login attempt audit response."""
    id: int
    user_id: int
    ip_address: str
    user_agent: str
    success: bool
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordStrengthResponse(BaseModel):
    """Password strength validation response."""
    is_strong: bool
    score: int  # 0-4
    feedback: list[str]


class PasswordPolicyResponse(BaseModel):
    """Password policy requirements."""
    min_length: int
    require_uppercase: bool
    require_lowercase: bool
    require_digits: bool
    require_special_chars: bool


class SignInSchema(BaseModel):
    """Sign-in request schema."""
    username: str
    password: str