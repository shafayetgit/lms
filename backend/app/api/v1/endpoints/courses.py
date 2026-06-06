from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.models.course import CourseBadge, CourseLevel
from app.core.responses import create_response, read_response, update_response
from app.schemas.course import (
    CourseCreate,
    CourseUpdate,
    CourseRead,
    CourseListResponse,
)
from app.services.course import CourseService

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(get_admin_or_instructor)],
)
async def create_course(course_in: CourseCreate, db: AsyncSession = Depends(get_db)):
    """Create a new course."""
    try:
        course = await CourseService.create_course(db, course_in)
        return create_response(CourseRead.model_validate(course).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/", response_model=CourseListResponse)
async def read_courses(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    is_active: bool | None = None,
    badge: CourseBadge | None = None,
    level: CourseLevel | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve courses with optional pagination and filtering."""
    data = await CourseService.get_courses(
        db,
        page=page,
        size=size,
        term=term,
        is_active=is_active,
        badge=badge,
        level=level,
    )
    return read_response(data)


@router.get("/meta")
async def read_meta(db: AsyncSession = Depends(get_db)):
    """Get course metadata."""
    data = await CourseService.meta(db)
    return read_response(data)


@router.get("/{course_id}", response_model=CourseRead)
async def read_course(course_id: int, db: AsyncSession = Depends(get_db)):
    """Get course by ID."""
    course_data = await CourseService.get_course(db, course_id)
    if not course_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    return read_response({"data": CourseRead.model_validate(course_data["data"]).model_dump(by_alias=False)})


@router.put("/{course_id}", response_model=CourseRead)
async def update_course(
    course_id: int, course_in: CourseUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a course."""
    try:
        course = await CourseService.update_course(db, course_id, course_in)
        return update_response(CourseRead.model_validate(course).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a course."""
    try:
        await CourseService.delete_course(db, course_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
