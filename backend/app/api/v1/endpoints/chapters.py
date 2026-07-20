from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.core.dependencies import PermissionChecker
from app.core.responses import (
    create_response,
    read_response,
    update_response,
    delete_response,
)
from app.schemas.chapter import (
    ChapterCreate,
    ChapterUpdate,
    ChapterRead,
    ChapterReadResponse,
    ChapterListResponse,
)
from app.services import chapter as chapter_service

router = APIRouter()


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(PermissionChecker("chapter", "create"))],
)
async def create_chapter(chapter_in: ChapterCreate, db: AsyncSession = Depends(get_db)):
    """Create a new chapter. Requires chapter:create permission."""
    try:
        await chapter_service.create_chapter(db, chapter_in)
        return create_response()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "/course/{course_id}",
    response_model=ChapterListResponse,
)
async def read_chapters_by_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(PermissionChecker("chapter", "read")),
):
    """Retrieve chapters for a course. Accepts integer ID or public_id string."""
    from app.services.course import CourseService
    course_data = await CourseService.get_course(db, course_id)
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

    data = await chapter_service.get_chapters_by_course(db, course_id)
    return {"success": True, "data": data}


@router.get(
    "/{chapter_id}",
    response_model=ChapterReadResponse,
    dependencies=[Depends(PermissionChecker("chapter", "read"))],
)
async def read_chapter(chapter_id: str, db: AsyncSession = Depends(get_db)):
    """Get chapter by ID or public_id."""
    chapter = await chapter_service.get_chapter(db, chapter_id)
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found"
        )
    return {"success": True, "data": chapter}


@router.put(
    "/course/{course_id}/reorder",
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(PermissionChecker("chapter", "update"))],
)
async def reorder_course_chapters(
    course_id: str,
    order: List[dict] = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Bulk reorder chapters within a course. Requires chapter:update permission."""
    await chapter_service.reorder_chapters(db, course_id, order)
    return update_response(None, message="Chapters reordered successfully")


@router.put(
    "/{chapter_id}",
    dependencies=[Depends(PermissionChecker("chapter", "update"))],
)
async def update_chapter(
    chapter_id: str,
    chapter_in: ChapterUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a chapter. Requires chapter:update permission."""
    try:
        await chapter_service.update_chapter(db, chapter_id, chapter_in)
        return update_response()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete(
    "/{chapter_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(PermissionChecker("chapter", "delete"))],
)
async def delete_chapter(
    chapter_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a chapter. Requires chapter:delete permission."""
    try:
        await chapter_service.delete_chapter(db, chapter_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
