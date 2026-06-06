from app.core.responses import read_response, update_response
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.user import (
    StudentCreate,
    StudentListResponse,
    StudentUpdate,
    StudentRead,
)
from app.services.student import StudentService

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=StudentRead,
    dependencies=[Depends(get_admin_or_instructor)],
)
async def create_student(
    student_in: StudentCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new student. Only admin or instructor can create students."""
    try:
        student = await StudentService.create_student(db, student_in)
        from app.core.responses import create_response
        return create_response(StudentRead.model_validate(student).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=StudentListResponse)
async def read_students(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    department: str | None = None,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of students with optional filters."""
    data = await StudentService.get_students(
        db, page=page, size=size, term=term, department=department, is_active=is_active
    )
    return read_response(data)


@router.get("/department/{department}", response_model=StudentListResponse)
async def read_students_by_department(
    department: str,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get students by department."""
    data = await StudentService.get_students_by_department(
        db, department=department, page=page, size=size
    )
    return read_response(data)


@router.get("/{student_id}", response_model=StudentRead)
async def read_student(student_id: int, db: AsyncSession = Depends(get_db)):
    """Get a student by ID."""
    student = await StudentService.get_student(db, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )
    return read_response({"data": StudentRead.model_validate(student).model_dump(by_alias=False)})


@router.put("/{student_id}", response_model=StudentRead)
async def update_student(
    student_id: int, student_in: StudentUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a student's information."""
    try:
        student = await StudentService.update_student(db, student_id, student_in)
        return update_response(StudentRead.model_validate(student).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_admin_or_instructor)])
async def delete_student(
    student_id: int, 
    db: AsyncSession = Depends(get_db),
):
    """Delete a student. Only admin or instructor can delete students."""
    try:
        await StudentService.delete_student(db, student_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
