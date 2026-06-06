from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_or_instructor
from app.core.responses import create_response, read_response, update_response, delete_response
from app.schemas.enrollment import EnrollmentRead, EnrollmentCreate, EnrollmentUpdate, EnrollmentListResponse
from app.models.enrollment import EnrollmentStatus
from app.services import enrollment as service
from fastapi import Query

router = APIRouter()

@router.post("/", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment_in: EnrollmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Enroll a student in a course. Admin/Instructor only."""
    enrollment = await service.create_enrollment(db, enrollment_in)
    return create_response(EnrollmentRead.model_validate(enrollment).model_dump(by_alias=False))

@router.get("/", response_model=EnrollmentListResponse)
async def read_enrollments(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    course_id: int | None = None,
    user_id: int | None = None,
    status: EnrollmentStatus | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Get paginated list of enrollments with optional filters."""
    data = await service.get_enrollments(
        db, page=page, size=size, course_id=course_id, user_id=user_id, status=status
    )
    return read_response(data)

@router.get("/{enrollment_id}", response_model=EnrollmentRead)
async def read_enrollment(
    enrollment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve an enrollment record. Admin/Instructor only."""
    enrollment = await service.get_enrollment(db, enrollment_id)
    return read_response({"data": EnrollmentRead.model_validate(enrollment).model_dump(by_alias=False)})

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
    enrollments = await repo.get_enrollments_by_user(db, user_id, skip=skip, limit=limit)
    items = [EnrollmentRead.model_validate(e).model_dump(by_alias=False) for e in enrollments]
    return read_response({"data": items})

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
    enrollments = await repo.get_enrollments_by_course(db, course_id, skip=skip, limit=limit)
    items = [EnrollmentRead.model_validate(e).model_dump(by_alias=False) for e in enrollments]
    return read_response({"data": items})

@router.patch("/{enrollment_id}", response_model=EnrollmentRead)
async def update_enrollment(
    enrollment_id: int,
    enrollment_in: EnrollmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update an enrollment record. Admin/Instructor only."""
    enrollment = await service.update_enrollment(db, enrollment_id, enrollment_in)
    return update_response(EnrollmentRead.model_validate(enrollment).model_dump(by_alias=False))

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_enrollment(
    enrollment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete an enrollment record. Admin/Instructor only."""
    await service.delete_enrollment(db, enrollment_id)
    return delete_response()
