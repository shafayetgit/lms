from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import (
    create_user_from_schema,
    get_user_by_username,
    get_user_by_email,
    update_user,
)
from app.models.user import User
from app.core.security import get_password_hash, verify_password
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
        """Register a new user with validation and role-specific field handling."""
        # Check username uniqueness
        existing_user = await get_user_by_username(db, user_in.username)
        if existing_user:
            raise ValueError("Username already exists")
        
        # Check email uniqueness
        existing_email = await get_user_by_email(db, user_in.email)
        if existing_email:
            raise ValueError("Email already registered")
        
        # Create user with role-specific fields using the schema-aware function
        return await create_user_from_schema(db, user_in)

    @staticmethod
    async def authenticate_user(db: AsyncSession, username: str, password: str) -> User | None:
        """Authenticate user with credentials."""
        user = await get_user_by_username(db, username)
        if user and verify_password(password, user.hashed_password):
            return user
        return None

    @staticmethod
    async def update_user_info(db: AsyncSession, user: User, updates: UserUpdate) -> User:
        """Update user information with validation."""
        update_data = updates.model_dump(exclude_unset=True)
        
        # Check email uniqueness if email is being updated
        if "email" in update_data and update_data["email"] != user.email:
            existing_email = await get_user_by_email(db, update_data["email"])
            if existing_email:
                raise ValueError("Email already registered")
        
        # Check username uniqueness if username is being updated
        if "username" in update_data and update_data["username"] != user.username:
            existing_user = await get_user_by_username(db, update_data["username"])
            if existing_user:
                raise ValueError("Username already exists")
        
        # Hash password if being updated
        for key, value in update_data.items():
            if key == "password" and value:
                setattr(user, "hashed_password", get_password_hash(value))
            elif value is not None:
                setattr(user, key, value)
        
        return await update_user(db, user)


# Backwards compatibility
async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
    return await UserService.register_user(db, user_in)

async def authenticate_user(db: AsyncSession, username: str, password: str) -> User | None:
    return await UserService.authenticate_user(db, username, password)

async def update_user_info(db: AsyncSession, user: User, updates: UserUpdate) -> User:
    return await UserService.update_user_info(db, user, updates)