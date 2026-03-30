from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import date, datetime
from app.models.user import UserRole

class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool = True

class UserCreate(BaseModel):
    """User registration schema supporting role-specific fields in child tables."""
    # Core identity
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    
    # Base user fields
    role: Optional[UserRole] = UserRole.STUDENT
    is_active: bool = True
    email_verified: bool = False
    preferred_language: str = "en"
    timezone: str = "UTC"
    two_factor_enabled: bool = False
    
    # Student-specific fields
    student_id: Optional[str] = None
    enrollment_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    department: Optional[str] = None
    profile_picture_url: Optional[str] = None
    
    # Instructor-specific fields
    qualification: Optional[str] = Field(None, description="Educational qualification/degree")
    specialization: Optional[str] = None
    bio: Optional[str] = None

class UserRead(UserBase):
    """User read schema with base fields."""
    id: int
    email_verified: bool
    is_deleted: bool
    preferred_language: str
    timezone: str
    two_factor_enabled: bool
    last_password_change: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class StudentRead(UserRead):
    """Student-specific read schema with role-specific fields."""
    student_id: str
    enrollment_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    department: Optional[str] = None
    profile_picture_url: Optional[str] = None

class InstructorRead(UserRead):
    """Instructor-specific read schema with role-specific fields."""
    qualification: str
    specialization: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    profile_picture_url: Optional[str] = None

class UserUpdate(BaseModel):
    """User update schema - all fields optional."""
    # Core identity (limited updates)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    
    # Base user fields
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    two_factor_enabled: Optional[bool] = None
    
    # Student-specific fields
    student_id: Optional[str] = None
    enrollment_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    department: Optional[str] = None
    profile_picture_url: Optional[str] = None
    
    # Instructor-specific fields
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
