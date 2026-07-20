import math
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.course import Course
from app.models.batch import BatchCourse, BatchEnrollment
from app.models.payment import Payment, PaymentStatus
from app.models.program import ProgramCourse, ProgramMember
from app.schemas.enrollment import EnrollmentCreate, EnrollmentUpdate
from app.repositories import enrollment as repo
from app.repositories import course as course_repo
from app.repositories import user as user_repo


async def validate_course_enrollment_eligibility(
    db: AsyncSession,
    user,
    course,
    batch_id: Optional[int] = None,
    payment_id: Optional[int] = None,
    is_admin: bool = False,
):
    """Validate course enrollment eligibility mirroring frappe-lms rules."""
    if getattr(course, "disable_self_learning", False) and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot enroll in this course as self-learning is disabled. Please contact the Administrator.",
        )

    if not getattr(course, "published", True) and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot enroll in an unpublished course.",
        )

    if batch_id:
        # Verify batch is associated with this course
        batch_course_res = await db.execute(
            select(BatchCourse).where(
                BatchCourse.batch_id == batch_id, BatchCourse.course_id == course.id
            )
        )
        if not batch_course_res.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This batch is not associated with this course.",
            )

        # Check batch enrollment
        batch_enr_res = await db.execute(
            select(BatchEnrollment).where(
                BatchEnrollment.batch_id == batch_id, BatchEnrollment.member_id == user.id
            )
        )
        if not batch_enr_res.scalars().first() and not is_admin:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student is not enrolled in the specified batch.",
            )

    if getattr(course, "paid_course", False) and not is_admin:
        has_payment = False
        if payment_id:
            pmt_res = await db.execute(
                select(Payment).where(
                    Payment.id == payment_id,
                    Payment.member_id == user.id,
                    Payment.status == PaymentStatus.COMPLETED,
                )
            )
            has_payment = pmt_res.scalars().first() is not None
        else:
            pmt_res = await db.execute(
                select(Payment).where(
                    Payment.member_id == user.id,
                    Payment.payment_for_id == course.id,
                    Payment.status == PaymentStatus.COMPLETED,
                )
            )
            has_payment = pmt_res.scalars().first() is not None

        if not has_payment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You need to complete the payment for this course before enrolling.",
            )


async def update_program_progress(db: AsyncSession, user_id: int):
    """Recalculate and update program progress for all programs the member belongs to."""
    try:
        mem_res = await db.execute(
            select(ProgramMember).where(ProgramMember.member_id == user_id)
        )
        memberships = mem_res.scalars().all()
        for mem in memberships:
            pc_res = await db.execute(
                select(ProgramCourse.course_id).where(
                    ProgramCourse.program_id == mem.program_id
                )
            )
            course_ids = pc_res.scalars().all()
            if not course_ids:
                continue

            enr_res = await db.execute(
                select(Enrollment.progress).where(
                    Enrollment.user_id == user_id,
                    Enrollment.course_id.in_(course_ids),
                )
            )
            progresses = enr_res.scalars().all()
            total_progress = sum(p or 0.0 for p in progresses)
            mem.progress = math.ceil(total_progress / len(course_ids))
        await db.commit()
    except Exception:
        pass


async def create_enrollment(
    db: AsyncSession, enrollment_in: EnrollmentCreate, is_admin: bool = True
) -> Enrollment:
    if not enrollment_in.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required"
        )

    user = await user_repo.get_user_by_id(db, enrollment_in.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {enrollment_in.user_id} not found",
        )

    course = await course_repo.get_course_by_id(db, enrollment_in.course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {enrollment_in.course_id} not found",
        )

    existing = await repo.get_enrollment_by_user_and_course(
        db, enrollment_in.user_id, enrollment_in.course_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student is already enrolled in this course.",
        )

    await validate_course_enrollment_eligibility(
        db=db,
        user=user,
        course=course,
        batch_id=enrollment_in.batch_id,
        payment_id=enrollment_in.payment_id,
        is_admin=is_admin,
    )

    data = enrollment_in.model_dump()
    if enrollment_in.batch_id and not data.get("enrollment_from_batch"):
        data["enrollment_from_batch"] = True

    enrollment = Enrollment(**data)
    created = await repo.create_enrollment(db, enrollment)

    # Increment course total enrollments count
    if course:
        course.total_enrollments = (course.total_enrollments or 0) + 1
        await db.commit()

    return created


async def get_enrollments(
    db: AsyncSession,
    page: int = 1,
    size: int = 10,
    course_id: Optional[int] = None,
    user_id: Optional[int] = None,
    status: Optional[EnrollmentStatus] = None,
    is_active: Optional[bool] = None,
) -> dict:
    query = select(Enrollment).options(
        selectinload(Enrollment.user),
        selectinload(Enrollment.course).selectinload(Course.instructors)
    ).order_by(desc(Enrollment.id))

    if course_id:
        query = query.where(Enrollment.course_id == course_id)
    if user_id:
        query = query.where(Enrollment.user_id == user_id)
    if status:
        query = query.where(Enrollment.status == status)
    if is_active is not None:
        query = query.where(Enrollment.is_active == is_active)

    skip = (page - 1) * size
    total = await repo.count_enrollments(db, query=query)
    data = await repo.get_enrollments_with_query(
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


async def get_enrollment(db: AsyncSession, identifier: int | str) -> Enrollment:
    enrollment = await repo.get_enrollment_by_id_or_public_id(db, identifier)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enrollment '{identifier}' not found",
        )
    return enrollment


async def update_enrollment(
    db: AsyncSession, identifier: int | str, enrollment_in: EnrollmentUpdate
) -> Enrollment:
    enrollment = await get_enrollment(db, identifier)

    update_data = enrollment_in.model_dump(exclude_unset=True)
    progress_changed = "progress" in update_data

    for field, value in update_data.items():
        setattr(enrollment, field, value)

    updated = await repo.update_enrollment(db, enrollment)

    if progress_changed and updated.user_id:
        await update_program_progress(db, updated.user_id)

    return updated


async def delete_enrollment(db: AsyncSession, identifier: int | str) -> None:
    enrollment = await get_enrollment(db, identifier)
    await repo.delete_enrollment(db, enrollment)


async def get_enrollment_meta(db: AsyncSession) -> dict:
    from app.models.user import User
    from app.models.role import Role
    from app.models.course import Course
    from app.models.batch import Batch
    from sqlalchemy import func

    users_res = await db.execute(
        select(
            User.id.label("value"),
            func.concat(User.first_name, " ", User.last_name, " (", User.email, ")").label("label"),
            User.public_id.label("public_id"),
            User.email.label("email"),
        )
        .join(User.roles)
        .where(
            Role.slug == "student",
            User.is_active,
        )
        .order_by(User.first_name)
    )
    users = [dict(r._mapping) for r in users_res.all()]

    courses_res = await db.execute(
        select(
            Course.id.label("value"),
            Course.title.label("label"),
            Course.public_id.label("public_id"),
        ).order_by(Course.title)
    )
    courses = [dict(r._mapping) for r in courses_res.all()]

    batches_res = await db.execute(
        select(
            Batch.id.label("value"),
            Batch.title.label("label"),
        ).order_by(Batch.title)
    )
    batches = [dict(r._mapping) for r in batches_res.all()]

    return {
        "users": users,
        "courses": courses,
        "batches": batches,
    }


