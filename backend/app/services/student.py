import math
from sqlalchemy import desc, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import Student, UserRole
from app.repositories import user as user_repo
from app.schemas.user import StudentCreate, StudentUpdate
from app.core.security import get_password_hash


class StudentService:
    @staticmethod
    async def create_student(
        db: AsyncSession, student_in: StudentCreate
    ) -> Student:
        """Create a new student."""
        # Check username uniqueness
        existing_user = await user_repo.get_user_by_username(db, student_in.username)
        if existing_user:
            raise ValueError(f"Username '{student_in.username}' already exists")

        # Check email uniqueness
        existing_email = await user_repo.get_user_by_email(db, student_in.email)
        if existing_email:
            raise ValueError(f"Email '{student_in.email}' already registered")

        # Hash password
        hashed_password = get_password_hash(student_in.password)

        # Generate student_id if not provided
        student_id = student_in.student_id or f"STU_{student_in.username}_{int(__import__('time').time())}"

        db_student = Student(
            username=student_in.username,
            email=student_in.email,
            first_name=student_in.first_name,
            last_name=student_in.last_name,
            hashed_password=hashed_password,
            role=UserRole.STUDENT,
            is_active=student_in.is_active,
            preferred_language=student_in.preferred_language,
            timezone=student_in.timezone,
            student_id=student_id,
            enrollment_date=student_in.enrollment_date,
            phone_number=student_in.phone_number,
            date_of_birth=student_in.date_of_birth,
            department=student_in.department,
            avatar=student_in.avatar,
        )
        return await user_repo.create_user(db, db_student)

    @staticmethod
    async def get_student(db: AsyncSession, student_id: int) -> Student | None:
        """Get a student by ID."""
        return await user_repo.get_student_by_id(db, student_id)

    @staticmethod
    async def get_students(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        term: str | None = None,
        department: str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        """Get paginated list of students with optional filters."""
        query = select(Student).order_by(desc(Student.id))

        if term:
            query = query.where(
                Student.username.ilike(f"%{term}%")
                | Student.email.ilike(f"%{term}%")
                | Student.first_name.ilike(f"%{term}%")
                | Student.last_name.ilike(f"%{term}%")
            )
        if department:
            query = query.where(Student.department == department)
        if is_active is not None:
            query = query.where(Student.is_active == is_active)

        skip = (page - 1) * size
        total = await user_repo.count_students(db, query=query)
        data = await user_repo.get_students_with_query(
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
    async def update_student(
        db: AsyncSession, student_id: int, student_in: StudentUpdate
    ) -> Student:
        """Update a student."""
        student = await user_repo.get_student_by_id(db, student_id)
        if not student:
            raise ValueError("Student not found")

        update_data = student_in.model_dump(exclude_unset=True)

        # Check email uniqueness if being updated
        if "email" in update_data and update_data["email"] != student.email:
            existing_email = await user_repo.get_user_by_email(db, update_data["email"])
            if existing_email:
                raise ValueError(f"Email '{update_data['email']}' already registered")

        for key, value in update_data.items():
            if value is not None:
                setattr(student, key, value)

        return await user_repo.update_user(db, student)

    @staticmethod
    async def delete_student(db: AsyncSession, student_id: int) -> None:
        """Delete a student."""
        student = await user_repo.get_student_by_id(db, student_id)
        if not student:
            raise ValueError("Student not found")
        await user_repo.delete_user(db, student)

    @staticmethod
    async def get_students_by_department(
        db: AsyncSession, department: str, page: int = 1, size: int = 10
    ) -> dict:
        """Get students by department."""
        query = select(Student).where(Student.department == department)
        skip = (page - 1) * size
        total = await user_repo.count_students(db, query=query)
        data = await user_repo.get_students_with_query(
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
