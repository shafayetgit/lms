from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, PermissionChecker, get_current_user
from app.core.responses import read_response, create_response, update_response, delete_response
from app.models.user import User
from app.schemas.user import (
    StudentCreate,
    StudentListResponse,
    StudentReadResponse,
    StudentUpdate,
    StudentRead,
)
from app.services.student import StudentService

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=StudentReadResponse,
    dependencies=[Depends(PermissionChecker("student", "create"))],
)
async def create_student(
    student_in: StudentCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new student."""
    try:
        student = await StudentService.create_student(db, student_in)
        return create_response(StudentRead.model_validate(student).model_dump(by_alias=True))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/",
    response_model=StudentListResponse,
    dependencies=[Depends(PermissionChecker("student", "read"))],
)
async def read_students(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of students with optional filters."""
    data = await StudentService.get_students(
        db, page=page, size=size, term=term, is_active=is_active
    )
    return read_response(data)


@router.get(
    "/{student_id}",
    response_model=StudentReadResponse,
    dependencies=[Depends(PermissionChecker("student", "read"))],
)
async def read_student(student_id: str, db: AsyncSession = Depends(get_db)):
    """Get a student by ID or public_id."""
    student = await StudentService.get_student(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )
    return read_response({"data": StudentRead.model_validate(student).model_dump(by_alias=True)})


@router.put(
    "/{student_id}",
    response_model=StudentReadResponse,
    dependencies=[Depends(PermissionChecker("student", "update"))],
)
async def update_student(
    student_id: str, student_in: StudentUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a student's information."""
    try:
        student = await StudentService.update_student(db, student_id, student_in)
        return update_response(StudentRead.model_validate(student).model_dump(by_alias=True))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete(
    "/{student_id}",
    dependencies=[Depends(PermissionChecker("student", "delete"))],
)
async def delete_student(
    student_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a student."""
    try:
        await StudentService.delete_student(db, student_id)
        return delete_response("Successfully deleted")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/dashboard/summary", response_model=dict)
async def read_student_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get student streak, upcoming evaluations, and live classes."""
    from app.services.student import StudentService
    data = await StudentService.get_student_dashboard_summary(db, current_user.id)
    return read_response({"data": data})
