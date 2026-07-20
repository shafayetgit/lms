from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.core.dependencies import PermissionChecker

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
    dependencies=[Depends(PermissionChecker("course", "create"))],
)
async def create_course(course_in: CourseCreate, db: AsyncSession = Depends(get_db)):
    """Create a new course."""
    try:
        course = await CourseService.create_course(db, course_in)
        return create_response(CourseRead.model_validate(course).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/",
    response_model=CourseListResponse,
)
async def read_courses(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    term: str | None = None,
    published: bool | None = None,
    upcoming: bool | None = None,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("course", "read")),
):
    """Retrieve courses with optional pagination and filtering."""
    owner_id = current_user.id if (current_user and getattr(current_user, "_requires_creator_check", False)) else None
    data = await CourseService.get_courses(
        db,
        page=page,
        size=size,
        term=term,
        published=published,
        upcoming=upcoming,
        owner_id=owner_id,
    )
    return read_response(data)


@router.get("/meta")
async def read_meta(db: AsyncSession = Depends(get_db)):
    """Get course metadata."""
    data = await CourseService.meta(db)
    return read_response({"data": data})


@router.get(
    "/{public_id}",
    response_model=CourseRead,
)
async def read_course(
    public_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("course", "read")),
):
    """Get course by public ID."""
    course_data = await CourseService.get_course(db, public_id)
    if not course_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    course = course_data["data"]
    if not course.published:
        is_authorized = False
        if current_user:
            if current_user.role in ("superadmin", "admin", "instructor"):
                is_authorized = True
            elif current_user.id == course.owner_id:
                is_authorized = True
            else:
                from app.core.dependencies import has_permission
                is_authorized = await has_permission(current_user, db, "course", "read", creator_id=course.owner_id)
        
        if not is_authorized:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
            )

    return read_response({"data": CourseRead.model_validate(course).model_dump(by_alias=False)})


@router.put(
    "/{public_id}",
    response_model=CourseRead,
    dependencies=[Depends(PermissionChecker("course", "update"))],
)
async def update_course(
    public_id: str, course_in: CourseUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a course."""
    try:
        course = await CourseService.update_course(db, public_id, course_in)
        return update_response(CourseRead.model_validate(course).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/{public_id}/dashboard",
    dependencies=[Depends(PermissionChecker("course", "read"))],
)
async def read_course_dashboard(public_id: str, db: AsyncSession = Depends(get_db)):
    """Get dashboard analytics for a course."""
    data = await CourseService.get_dashboard(db, public_id)
    return read_response({"data": data})


@router.delete(
    "/{public_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(PermissionChecker("course", "delete"))],
)
async def delete_course(public_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a course."""
    try:
        await CourseService.delete_course(db, public_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

