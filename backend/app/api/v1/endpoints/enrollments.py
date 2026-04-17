from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.enrollment import EnrollmentRead, EnrollmentCreate, EnrollmentUpdate
from app.services import enrollment as service

router = APIRouter()

@router.post("/", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment_in: EnrollmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Enroll a student in a course. Admin/Instructor only."""
    return await service.create_enrollment(db, enrollment_in)

@router.get("/{enrollment_id}", response_model=EnrollmentRead)
async def read_enrollment(
    enrollment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve an enrollment record. Admin/Instructor only."""
    return await service.get_enrollment(db, enrollment_id)

@router.get("/user/{user_id}", response_model=List[EnrollmentRead])
async def read_user_enrollments(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve all enrollments for a user. Admin/Instructor only."""
    from app.repositories import enrollment as repo
    return await repo.get_enrollments_by_user(db, user_id, skip=skip, limit=limit)

@router.get("/course/{course_id}", response_model=List[EnrollmentRead])
async def read_course_enrollments(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve all enrollments for a course. Admin/Instructor only."""
    from app.repositories import enrollment as repo
    return await repo.get_enrollments_by_course(db, course_id, skip=skip, limit=limit)

@router.patch("/{enrollment_id}", response_model=EnrollmentRead)
async def update_enrollment(
    enrollment_id: int,
    enrollment_in: EnrollmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update an enrollment record. Admin/Instructor only."""
    return await service.update_enrollment(db, enrollment_id, enrollment_in)

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enrollment(
    enrollment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete an enrollment record. Admin/Instructor only."""
    await service.delete_enrollment(db, enrollment_id)
