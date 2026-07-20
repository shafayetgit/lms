import math
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role
from app.repositories import user as user_repo
from app.schemas.user import StudentCreate, StudentUpdate
from app.core.security import get_password_hash


class StudentService:
    @staticmethod
    async def create_student(
        db: AsyncSession, student_in: StudentCreate
    ) -> User:
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

        db_student = User(
            username=student_in.username,
            email=student_in.email,
            first_name=student_in.first_name,
            last_name=student_in.last_name,
            hashed_password=hashed_password,
            role="student",
            is_active=student_in.is_active,
            preferred_language=student_in.preferred_language,
            timezone=student_in.timezone,
            phone_number=student_in.phone_number,
            date_of_birth=student_in.date_of_birth,
            avatar=student_in.avatar,
        )
        return await user_repo.create_user(db, db_student)

    @staticmethod
    async def get_student(db: AsyncSession, student_id: int | str) -> User | None:
        """Get a student by ID."""
        return await user_repo.get_student_by_id(db, student_id)

    @staticmethod
    async def get_students(
        db: AsyncSession,
        page: int = 1,
        size: int = 10,
        term: str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        """Get paginated list of students with optional filters."""
        query = select(User).join(User.roles).where(Role.slug == "student").order_by(desc(User.id))

        if term:
            query = query.where(
                User.username.ilike(f"%{term}%")
                | User.email.ilike(f"%{term}%")
                | User.first_name.ilike(f"%{term}%")
                | User.last_name.ilike(f"%{term}%")
            )
        if is_active is not None:
            query = query.where(User.is_active == is_active)

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
        db: AsyncSession, student_id: int | str, student_in: StudentUpdate
    ) -> User:
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
    async def delete_student(db: AsyncSession, student_id: int | str) -> None:
        """Delete a student."""
        student = await user_repo.get_student_by_id(db, student_id)
        if not student:
            raise ValueError("Student not found")
        await user_repo.delete_user(db, student)

    @staticmethod
    async def get_student_dashboard_summary(db: AsyncSession, user_id: int) -> dict:
        """Get student streak, upcoming evaluations, and live classes."""
        from datetime import date, timedelta
        from sqlalchemy import select, func, or_
        from sqlalchemy.orm import selectinload
        
        from app.models.course_progress import CourseProgress
        from app.models.quiz_submission import QuizSubmission
        from app.models.assignment import AssignmentSubmission
        from app.models.certificate import CertificateEvaluation
        from app.models.live_class import LiveClass
        from app.models.batch import BatchEnrollment
        from app.models.enrollment import Enrollment

        # 1. Calculate Activity Streak
        dates = set()
        
        # Course Progress updated dates
        stmt1 = select(func.date(CourseProgress.updated_at)).where(CourseProgress.user_id == user_id)
        res1 = await db.execute(stmt1)
        for d_val in res1.scalars():
            if d_val:
                dates.add(d_val)
                
        # Quiz Submission created dates
        stmt2 = select(func.date(QuizSubmission.created_at)).where(QuizSubmission.user_id == user_id)
        res2 = await db.execute(stmt2)
        for d_val in res2.scalars():
            if d_val:
                dates.add(d_val)
                
        # Assignment Submission created dates
        stmt3 = select(func.date(AssignmentSubmission.created_at)).where(AssignmentSubmission.member_id == user_id)
        res3 = await db.execute(stmt3)
        for d_val in res3.scalars():
            if d_val:
                dates.add(d_val)
                
        sorted_dates = sorted(list(dates))
        
        current_streak = 0
        longest_streak = 0
        
        if sorted_dates:
            # Longest streak calculation
            temp_streak = 0
            prev_date = None
            for d in sorted_dates:
                if prev_date is None:
                    temp_streak = 1
                else:
                    diff = (d - prev_date).days
                    if diff == 1:
                        temp_streak += 1
                    elif diff > 1:
                        if temp_streak > longest_streak:
                            longest_streak = temp_streak
                        temp_streak = 1
                prev_date = d
            if temp_streak > longest_streak:
                longest_streak = temp_streak

            # Current streak calculation
            today = date.today()
            yesterday = today - timedelta(days=1)
            if sorted_dates[-1] == today or sorted_dates[-1] == yesterday:
                current_streak = 1
                idx = len(sorted_dates) - 1
                while idx > 0:
                    diff = (sorted_dates[idx] - sorted_dates[idx-1]).days
                    if diff == 1:
                        current_streak += 1
                        idx -= 1
                    elif diff == 0:
                        idx -= 1
                    else:
                        break
            else:
                current_streak = 0
                
            longest_streak = max(longest_streak, current_streak)

        streak = {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "active_dates": [str(d) for d in sorted_dates]
        }

        # 2. Upcoming Evaluations
        eval_stmt = select(CertificateEvaluation).where(
            CertificateEvaluation.member_id == user_id,
            CertificateEvaluation.status.in_(["Pending", "In Progress"])
        ).options(
            selectinload(CertificateEvaluation.course),
            selectinload(CertificateEvaluation.batch),
            selectinload(CertificateEvaluation.evaluator)
        )
        eval_res = await db.execute(eval_stmt)
        evals = eval_res.scalars().all()
        upcoming_evaluations = [
            {
                "public_id": e.public_id,
                "date": str(e.date) if e.date else None,
                "start_time": e.start_time,
                "end_time": e.end_time,
                "status": e.status.value if hasattr(e.status, "value") else e.status,
                "course": {"title": e.course.title} if e.course else None,
                "batch": {"title": e.batch.title} if e.batch else None,
                "evaluator": {"full_name": e.evaluator.full_name} if e.evaluator else None
            }
            for e in evals
        ]

        # 3. Upcoming Live Classes
        # Get enrolled batches
        batch_stmt = select(BatchEnrollment.batch_id).where(BatchEnrollment.member_id == user_id)
        batch_res = await db.execute(batch_stmt)
        enrolled_batch_ids = list(batch_res.scalars().all())

        # Get enrolled courses
        course_stmt = select(Enrollment.course_id).where(Enrollment.user_id == user_id, Enrollment.is_active == True)
        course_res = await db.execute(course_stmt)
        enrolled_course_ids = list(course_res.scalars().all())

        upcoming_classes = []
        conditions = []
        if enrolled_batch_ids:
            conditions.append(LiveClass.batch_id.in_(enrolled_batch_ids))
        if enrolled_course_ids:
            conditions.append(LiveClass.course_id.in_(enrolled_course_ids))

        if conditions:
            live_stmt = select(LiveClass).where(
                or_(*conditions),
                LiveClass.status == "Scheduled",
                LiveClass.date >= date.today()
            ).options(
                selectinload(LiveClass.course),
                selectinload(LiveClass.batch),
                selectinload(LiveClass.host)
            ).order_by(LiveClass.date.asc(), LiveClass.time.asc())
            live_res = await db.execute(live_stmt)
            classes = live_res.scalars().all()
            upcoming_classes = [
                {
                    "public_id": c.public_id,
                    "title": c.title,
                    "description": c.description,
                    "date": str(c.date),
                    "time": str(c.time),
                    "duration": c.duration,
                    "meeting_link": c.meeting_link,
                    "status": c.status.value if hasattr(c.status, "value") else c.status,
                    "course": {"title": c.course.title} if c.course else None,
                    "batch": {"title": c.batch.title} if c.batch else None,
                    "host": {"full_name": c.host.full_name} if c.host else None
                }
                for c in classes
            ]

        return {
            "streak": streak,
            "upcoming_evaluations": upcoming_evaluations,
            "upcoming_live_classes": upcoming_classes
        }
