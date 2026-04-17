from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.course import CourseCreate, CourseUpdate, CourseRead
from app.services import course as course_service

router = APIRouter(dependencies=[Depends(get_admin_or_instructor)])

@router.post("/", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate, 
    db: AsyncSession = Depends(get_db)
):
    """Create a new course."""
    try:
        return await course_service.create_course(db, course_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=List[CourseRead])
async def read_courses(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve courses."""
    return await course_service.get_courses(db, skip=skip, limit=limit)

@router.get("/{course_id}", response_model=CourseRead)
async def read_course(
    course_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Get course by ID."""
    course = await course_service.get_course(db, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Course not found"
        )
    return course

@router.put("/{course_id}", response_model=CourseRead)
async def update_course(
    course_id: int, 
    course_in: CourseUpdate, 
    db: AsyncSession = Depends(get_db)
):
    """Update a course."""
    try:
        return await course_service.update_course(db, course_id, course_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int, 
    db: AsyncSession = Depends(get_db)
):
    """Delete a course."""
    try:
        await course_service.delete_course(db, course_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
