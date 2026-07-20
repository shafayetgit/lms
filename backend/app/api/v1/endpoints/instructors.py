from app.core.responses import create_response, error_response, read_response, update_response
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.user import (
    InstructorCreate,
    InstructorListResponse,
    InstructorUpdate,
    InstructorRead,
)
from app.services.instructor import InstructorService

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=InstructorRead,
    dependencies=[Depends(get_admin_or_instructor)],
)
async def create_instructor(
    instructor_in: InstructorCreate, db: AsyncSession = Depends(get_db)
):
    """Create a new instructor. Only admin or existing instructor can create instructors."""
    try:
        instructor = await InstructorService.create_instructor(db, instructor_in)
        return create_response(InstructorRead.model_validate(instructor).model_dump(by_alias=True))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=InstructorListResponse)
async def read_instructors(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    specialization: str | None = None,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Get paginated list of instructors with optional filters."""
    data = await InstructorService.get_instructors(
        db,
        page=page,
        size=size,
        term=term,
        specialization=specialization,
        is_active=is_active,
    )
    return read_response(data)


@router.get("/specialization/{specialization}", response_model=InstructorListResponse)
async def read_instructors_by_specialization(
    specialization: str,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get instructors by specialization."""
    data = await InstructorService.get_instructors_by_specialization(
        db, specialization=specialization, page=page, size=size
    )
    return read_response(data)


@router.get("/{instructor_id}", response_model=InstructorRead)
async def read_instructor(instructor_id: int, db: AsyncSession = Depends(get_db)):
    """Get an instructor by ID."""
    instructor_data = await InstructorService.get_instructor(db, instructor_id)
    if not instructor_data or not instructor_data.get("data"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Instructor not found"
        )
    return read_response({"data": InstructorRead.model_validate(instructor_data["data"]).model_dump(by_alias=True)})


@router.put("/{instructor_id}", response_model=InstructorRead)
async def update_instructor(
    instructor_id: int,
    instructor_in: InstructorUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update an instructor's information."""
    try:
        instructor = await InstructorService.update_instructor(
            db, instructor_id, instructor_in
        )
        return update_response(InstructorRead.model_validate(instructor).model_dump(by_alias=True))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{instructor_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_admin_or_instructor)])
async def delete_instructor(
    instructor_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete an instructor. Only admin can delete instructors."""
    try:
        await InstructorService.delete_instructor(db, instructor_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
