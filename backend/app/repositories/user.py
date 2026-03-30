from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User, Student, Instructor, UserRole
from app.core.security import get_password_hash
from datetime import datetime

async def create_user(db: AsyncSession, user: User) -> User:
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def create_user_from_schema(db: AsyncSession, user_data) -> User:
    """
    Create a user (Student, Instructor, or base User) based on role and provided data.
    
    Args:
        db: AsyncSession
        user_data: UserCreate schema with base and role-specific fields
        
    Returns:
        User: The created user (Student, Instructor, or base User)
    """
    hashed_password = get_password_hash(user_data.password)
    
    # Common fields for all user types
    common_fields = {
        "username": user_data.username,
        "email": user_data.email,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "hashed_password": hashed_password,
        "role": user_data.role or UserRole.USER,
        "is_active": user_data.is_active,
        "email_verified": user_data.email_verified,
        "preferred_language": user_data.preferred_language,
        "timezone": user_data.timezone,
        "two_factor_enabled": user_data.two_factor_enabled,
    }
    
    if user_data.role == UserRole.STUDENT:
        # Create Student user with role-specific fields
        student_fields = {
            **common_fields,
            "student_id": user_data.student_id or f"{user_data.username}_{int(datetime.utcnow().timestamp())}",
            "enrollment_date": user_data.enrollment_date,
            "phone_number": user_data.phone_number,
            "date_of_birth": user_data.date_of_birth,
            "department": user_data.department,
            "profile_picture_url": user_data.profile_picture_url,
        }
        user = Student(**student_fields)
    elif user_data.role == UserRole.INSTRUCTOR:
        # Create Instructor user (qualification is required)
        if not user_data.qualification:
            raise ValueError("Qualification is required for instructor registration")
        instructor_fields = {
            **common_fields,
            "qualification": user_data.qualification,
            "specialization": user_data.specialization,
            "bio": user_data.bio,
            "phone_number": user_data.phone_number,
            "department": user_data.department,
            "profile_picture_url": user_data.profile_picture_url,
        }
        user = Instructor(**instructor_fields)
    else:
        # Create base User (admin or generic user)
        user = User(**common_fields)
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def get_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[User]:
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()

async def update_user(db: AsyncSession, user: User) -> User:
    await db.commit()
    await db.refresh(user)
    return user

async def delete_user(db: AsyncSession, user: User):
    await db.delete(user)
    await db.commit()


# Student-specific functions
async def get_student_by_id(db: AsyncSession, student_id: int) -> Student | None:
    result = await db.execute(select(Student).where(Student.id == student_id))
    return result.scalars().first()

async def get_student_by_username(db: AsyncSession, username: str) -> Student | None:
    result = await db.execute(select(Student).where(Student.username == username))
    return result.scalars().first()

async def get_students(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Student]:
    result = await db.execute(select(Student).offset(skip).limit(limit))
    return result.scalars().all()


# Instructor-specific functions
async def get_instructor_by_id(db: AsyncSession, instructor_id: int) -> Instructor | None:
    result = await db.execute(select(Instructor).where(Instructor.id == instructor_id))
    return result.scalars().first()

async def get_instructor_by_username(db: AsyncSession, username: str) -> Instructor | None:
    result = await db.execute(select(Instructor).where(Instructor.username == username))
    return result.scalars().first()

async def get_instructors(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Instructor]:
    result = await db.execute(select(Instructor).offset(skip).limit(limit))
    return result.scalars().all()
