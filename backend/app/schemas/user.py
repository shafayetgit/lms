from pydantic import BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import date, datetime
from app.models.user import UserRole
from app.core.base import BaseSchema, PaginationMeta

class UserBase(BaseSchema):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool = True
    avatar: Optional[str] = None

class UserCreate(BaseSchema):
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
    avatar: Optional[str] = None
    
    # Student-specific fields
    student_id: Optional[str] = None
    enrollment_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    department: Optional[str] = None
    
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

# ==================== STUDENT SCHEMAS ====================

class StudentBase(BaseSchema):
    """Student base schema with common fields."""
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: Optional[str] = None
    department: Optional[str] = None
    date_of_birth: Optional[date] = None

class StudentCreate(StudentBase):
    """Schema for creating a new student."""
    username: str
    password: str
    student_id: Optional[str] = None
    enrollment_date: Optional[datetime] = None
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
    department: Optional[str] = None
    avatar: Optional[str] = None
    enrollment_date: Optional[datetime] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None

class StudentRead(UserRead):
    """Student-specific read schema with role-specific fields."""
    student_id: str
    enrollment_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    department: Optional[str] = None

class StudentListResponse(BaseModel):
    """Response schema for listing students."""
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
    department: Optional[str] = None

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
    department: Optional[str] = None
    avatar: Optional[str] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None

class InstructorRead(UserRead):
    """Instructor-specific read schema with role-specific fields."""
    qualification: str
    specialization: Optional[str] = None
    bio: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None

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
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None
    preferred_language: Optional[str] = None
    timezone: Optional[str] = None
    two_factor_enabled: Optional[bool] = None
    avatar: Optional[str] = None
    
    # Student-specific fields
    student_id: Optional[str] = None
    enrollment_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    department: Optional[str] = None
    
    # Instructor-specific fields
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None

# class TokenResponse(BaseModel):
#     access_token: str
#     refresh_token: str
#     token_type: str

class RegisterResponse(BaseModel):
    status: str = "success"
    user: UserRead
    message: Optional[str] = None