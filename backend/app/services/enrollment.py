from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.enrollment import Enrollment, EnrollmentStatus
import math
from sqlalchemy import select, desc
from app.schemas.enrollment import EnrollmentCreate, EnrollmentUpdate
from app.repositories import enrollment as repo
from app.repositories import course as course_repo
from app.repositories import user as user_repo

async def create_enrollment(
    db: AsyncSession, enrollment_in: EnrollmentCreate
) -> Enrollment:
    # Validate user exists
    user = await user_repo.get_user_by_id(db, enrollment_in.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {enrollment_in.user_id} not found"
        )
    
    # Validate course exists
    course = await course_repo.get_course_by_id(db, enrollment_in.course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {enrollment_in.course_id} not found"
        )
    
    # Check if already enrolled
    existing = await repo.get_enrollment_by_user_and_course(
        db, enrollment_in.user_id, enrollment_in.course_id
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already enrolled in this course"
        )
        
    enrollment = Enrollment(**enrollment_in.model_dump())
    return await repo.create_enrollment(db, enrollment)

async def get_enrollments(
    db: AsyncSession,
    page: int = 1,
    size: int = 10,
    course_id: Optional[int] = None,
    user_id: Optional[int] = None,
    status: Optional[EnrollmentStatus] = None,
) -> dict:
    query = select(Enrollment).order_by(desc(Enrollment.id))

    if course_id:
        query = query.where(Enrollment.course_id == course_id)
    if user_id:
        query = query.where(Enrollment.user_id == user_id)
    if status:
        query = query.where(Enrollment.status == status)

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

async def get_enrollment(db: AsyncSession, enrollment_id: int) -> Enrollment:
    enrollment = await repo.get_enrollment_by_id(db, enrollment_id)
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Enrollment with id {enrollment_id} not found"
        )
    return enrollment

async def update_enrollment(
    db: AsyncSession, enrollment_id: int, enrollment_in: EnrollmentUpdate
) -> Enrollment:
    enrollment = await get_enrollment(db, enrollment_id)
    
    update_data = enrollment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(enrollment, field, value)
        
    return await repo.update_enrollment(db, enrollment)

async def delete_enrollment(db: AsyncSession, enrollment_id: int) -> None:
    enrollment = await get_enrollment(db, enrollment_id)
    await repo.delete_enrollment(db, enrollment)
