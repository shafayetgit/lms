from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import date, datetime
from app.core.base import BaseSchema, PaginationMeta


class RoleRead(BaseSchema):
    """Schema for reading a Role."""
    id: int
    public_id: str
    name: str
    slug: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseSchema):
    username: Optional[str] = ""
    email: Optional[str] = ""
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    full_name: Optional[str] = ""
    role: Optional[str] = "student"
    is_active: Optional[bool] = True
    avatar: Optional[str] = None
    bio: Optional[str] = None
    headline: Optional[str] = None
    open_to: Optional[str] = None
    country: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class UserMinimal(BaseSchema):
    id: int
    public_id: str
    username: str
    email: str
    first_name: str
    last_name: str
    full_name: str
    avatar: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseSchema):
    """User registration schema supporting dynamic roles."""
    # Core identity
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    password: str
    
    # Base user fields
    role: Optional[str] = "student"
    roles: Optional[list[str]] = None
    is_active: bool = True
    email_verified: bool = False
    preferred_language: str = "en"
    timezone: str = "UTC"
    two_factor_enabled: bool = False
    avatar: Optional[str] = None
    
    # Common profile fields
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    
    # Instructor-specific fields
    qualification: Optional[str] = Field(None, description="Educational qualification/degree")
    specialization: Optional[str] = None


class FeatureFlagRead(BaseSchema):
    """Minimal feature flag read schema."""
    public_id: str
    name: str
    slug: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class RoleProfileRead(BaseSchema):
    """Minimal role profile read schema."""
    public_id: str
    name: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class UserRead(UserBase):
    """User read schema with base fields."""
    id: Optional[int] = None
    public_id: Optional[str] = None
    email_verified: Optional[bool] = False
    is_deleted: Optional[bool] = False
    preferred_language: Optional[str] = "en"
    timezone: Optional[str] = "UTC"
    two_factor_enabled: Optional[bool] = False
    last_password_change: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    roles: list[RoleRead] = []
    feature_flags: list[FeatureFlagRead] = []
    role_profile: Optional[RoleProfileRead] = None
    phone_number: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ==================== STUDENT SCHEMAS ====================

class StudentBase(BaseSchema):
    """Student base schema with common fields."""
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None


class StudentCreate(StudentBase):
    """Schema for creating a new student."""
    username: str
    password: str
    avatar: Optional[str] = None
    preferred_language: str = "en"
    timezone: str = "UTC"
    is_active: bool = True


class StudentUpdate(BaseSchema):
    """Schema for updating student information."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    avatar: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class StudentRead(UserRead):
    """Student-specific read schema with role-specific fields."""
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None


class StudentReadResponse(BaseSchema):
    """Response schema for single student."""
    success: bool = True
    data: StudentRead


class StudentListResponse(BaseSchema):
    """Response schema for listing students."""
    success: bool = True
    data: list[StudentRead]
    meta: PaginationMeta


# ==================== INSTRUCTOR SCHEMAS ====================

class InstructorBase(BaseSchema):
    """Instructor base schema with common fields."""
    first_name: str
    last_name: str
    email: EmailStr
    qualification: str = Field(..., description="Educational qualification/degree")
    specialization: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None


class InstructorCreate(InstructorBase):
    """Schema for creating a new instructor."""
    username: str
    password: str
    avatar: Optional[str] = None
    preferred_language: str = "en"
    timezone: str = "UTC"
    is_active: bool = True


class InstructorUpdate(BaseSchema):
    """Schema for updating instructor information."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None
    avatar: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class InstructorRead(UserRead):
    """Instructor-specific read schema with role-specific fields."""
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None


class InstructorListResponse(BaseModel):
    """Response schema for listing instructors."""
    data: list[InstructorRead]
    meta: PaginationMeta


class UserUpdate(BaseSchema):
    """User update schema - all fields optional."""
    # Core identity (limited updates)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = None
    
    # Base user fields
    role: Optional[str] = None
    roles: Optional[list[str]] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    two_factor_enabled: Optional[bool] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    headline: Optional[str] = None
    open_to: Optional[str] = None
    country: Optional[str] = None
    
    # Common profile fields
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    
    # Instructor-specific fields
    qualification: Optional[str] = None
    specialization: Optional[str] = None

    # Role / Feature Flag assignments from Core Users tabs
    role_public_ids: Optional[list[str]] = None
    role_profile_public_id: Optional[str] = None
    feature_flag_public_ids: Optional[list[str]] = None
    username: Optional[str] = None


class RegisterResponse(BaseModel):
    status: str = "success"
    user: UserRead
    message: Optional[str] = None