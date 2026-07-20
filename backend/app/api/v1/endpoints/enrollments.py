from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_or_instructor, get_current_active_user
from app.core.responses import create_response, read_response, update_response, delete_response
from app.schemas.enrollment import EnrollmentRead, EnrollmentCreate, EnrollmentUpdate, EnrollmentListResponse
from app.models.enrollment import EnrollmentStatus
from app.services import enrollment as service

router = APIRouter()

@router.post("/", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def create_enrollment(
    enrollment_in: EnrollmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Enroll a student in a course. Admin/Instructor only."""
    enrollment = await service.create_enrollment(db, enrollment_in, is_admin=True)
    return create_response(EnrollmentRead.model_validate(enrollment).model_dump(by_alias=False))

@router.post("/self", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED)
async def self_enrollment(
    enrollment_in: EnrollmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Self-enroll in a course as active user."""
    enrollment_in.user_id = current_user.id
    is_admin = getattr(current_user, "role", "student") in ["admin", "instructor", "moderator"]
    enrollment = await service.create_enrollment(db, enrollment_in, is_admin=is_admin)
    return create_response(EnrollmentRead.model_validate(enrollment).model_dump(by_alias=False))

@router.get("/", response_model=EnrollmentListResponse)
async def read_enrollments(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    course_id: str | None = None,
    user_id: int | None = None,
    status: EnrollmentStatus | None = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Get paginated list of enrollments with optional filters."""
    from app.repositories import course as course_repo

    course_id_int = None
    if course_id is not None:
        if isinstance(course_id, str) and not course_id.isdigit():
            course = await course_repo.get_course_by_public_id(db, course_id)
            if not course:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Course '{course_id}' not found",
                )
            course_id_int = course.id
        else:
            course_id_int = int(course_id)

    data = await service.get_enrollments(
        db, page=page, size=size, course_id=course_id_int, user_id=user_id, status=status
    )
    return read_response(data)

@router.get("/meta")
async def read_enrollment_meta(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Get metadata options for enrollments (users, courses, batches)."""
    data = await service.get_enrollment_meta(db)
    return read_response({"data": data})

@router.get("/my")
async def read_my_enrollments(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user),
):
    """Get enrolled courses for the currently authenticated user."""
    data = await service.get_enrollments(db, page=page, size=size, user_id=current_user.id, is_active=True)
    return read_response(data)

@router.get("/students/{course_public_id}")
async def read_enrolled_students(
    course_public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor),
):
    """Get enrolled students for a course as autocomplete options."""
    from sqlalchemy import select
    from app.models.enrollment import Enrollment
    from app.models.user import User
    from app.repositories import course as course_repo

    course = await course_repo.get_course_by_public_id(db, course_public_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    result = await db.execute(
        select(User.public_id, User.first_name, User.last_name, User.email)
        .join(Enrollment, Enrollment.user_id == User.id)
        .where(Enrollment.course_id == course.id)
        .order_by(User.first_name)
    )
    students = [
        {
            "label": f"{row.first_name} {row.last_name}".strip() or row.email,
            "value": row.public_id,
        }
        for row in result.fetchall()
    ]
    return read_response({"data": students})

@router.get("/{enrollment_id}", response_model=EnrollmentRead)
async def read_enrollment(
    enrollment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve an enrollment record by ID or public_id. Admin/Instructor only."""
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
    enrollment_id: str,
    enrollment_in: EnrollmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update an enrollment record. Admin/Instructor only."""
    enrollment = await service.update_enrollment(db, enrollment_id, enrollment_in)
    return update_response(EnrollmentRead.model_validate(enrollment).model_dump(by_alias=False))

@router.delete("/{enrollment_id}")
async def delete_enrollment(
    enrollment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete an enrollment record. Admin/Instructor only."""
    await service.delete_enrollment(db, enrollment_id)
    return delete_response("Successfully deleted")

