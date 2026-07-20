import math
from sqlalchemy import desc, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role
from app.repositories import user as user_repo
from app.schemas.user import InstructorCreate, InstructorUpdate
from app.core.security import get_password_hash


class InstructorService:
    @staticmethod
    async def create_instructor(
        db: AsyncSession, instructor_in: InstructorCreate
    ) -> User:
        """Create a new instructor."""
        # Check username uniqueness
        existing_user = await user_repo.get_user_by_username(db, instructor_in.username)
        if existing_user:
            raise ValueError(f"Username '{instructor_in.username}' already exists")

        # Check email uniqueness
        existing_email = await user_repo.get_user_by_email(db, instructor_in.email)
        if existing_email:
            raise ValueError(f"Email '{instructor_in.email}' already registered")

        # Hash password
        hashed_password = get_password_hash(instructor_in.password)

        db_instructor = User(
            username=instructor_in.username,
            email=instructor_in.email,
            first_name=instructor_in.first_name,
            last_name=instructor_in.last_name,
            hashed_password=hashed_password,
            role="instructor",
            is_active=instructor_in.is_active,
            preferred_language=instructor_in.preferred_language,
            timezone=instructor_in.timezone,
            qualification=instructor_in.qualification,
            specialization=instructor_in.specialization,
            bio=instructor_in.bio,
            phone_number=instructor_in.phone_number,
            avatar=instructor_in.avatar,
        )
        return await user_repo.create_user(db, db_instructor)

    @staticmethod
    async def get_instructor(db: AsyncSession, instructor_id: int) -> dict:
        """Get an instructor by ID."""
        return {"data": await user_repo.get_instructor_by_id(db, instructor_id)}

    @staticmethod
    async def get_instructors(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        term: str | None = None,
        specialization: str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        """Get paginated list of instructors with optional filters."""
        query = select(User).join(User.roles).where(Role.slug == "instructor").order_by(desc(User.id))

        if term:
            query = query.where(
                User.username.ilike(f"%{term}%")
                | User.email.ilike(f"%{term}%")
                | User.first_name.ilike(f"%{term}%")
                | User.last_name.ilike(f"%{term}%")
                | User.specialization.ilike(f"%{term}%")
            )
        if specialization:
            query = query.where(User.specialization.ilike(f"%{specialization}%"))
        if is_active is not None:
            query = query.where(User.is_active == is_active)

        skip = (page - 1) * size
        total = await user_repo.count_instructors(db, query=query)
        data = await user_repo.get_instructors_with_query(
            db, query=query, skip=skip, limit=size
        )
        total_pages = math.ceil(total / size) if total else 0

        return {
            "data": data,
            "meta": {
                "total": total,
                "page": page,
                "size": size,
                "pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }

    @staticmethod
    async def update_instructor(
        db: AsyncSession, instructor_id: int, instructor_in: InstructorUpdate
    ) -> User:
        """Update an instructor."""
        instructor = await user_repo.get_instructor_by_id(db, instructor_id)
        if not instructor:
            raise ValueError("Instructor not found")

        update_data = instructor_in.model_dump(exclude_unset=True)

        # Check email uniqueness if being updated
        if "email" in update_data and update_data["email"] != instructor.email:
            existing_email = await user_repo.get_user_by_email(db, update_data["email"])
            if existing_email:
                raise ValueError(f"Email '{update_data['email']}' already registered")

        for key, value in update_data.items():
            if value is not None:
                setattr(instructor, key, value)

        return await user_repo.update_user(db, instructor)

    @staticmethod
    async def delete_instructor(db: AsyncSession, instructor_id: int) -> None:
        """Delete an instructor."""
        instructor = await user_repo.get_instructor_by_id(db, instructor_id)
        if not instructor:
            raise ValueError("Instructor not found")
        await user_repo.delete_user(db, instructor)

    @staticmethod
    async def get_instructors_by_specialization(
        db: AsyncSession, specialization: str, page: int = 1, size: int = 10
    ) -> dict:
        """Get instructors by specialization."""
        query = select(User).join(User.roles).where(
            Role.slug == "instructor", User.specialization.ilike(f"%{specialization}%")
        )
        skip = (page - 1) * size
        total = await user_repo.count_instructors(db, query=query)
        data = await user_repo.get_instructors_with_query(
            db, query=query, skip=skip, limit=size
        )
        total_pages = math.ceil(total / size) if total else 0

        return {
            "data": data,
            "meta": {
                "total": total,
                "page": page,
                "size": size,
                "pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1,
            },
        }
