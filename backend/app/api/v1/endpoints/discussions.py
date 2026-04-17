from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.discussion import DiscussionRead, DiscussionCreate, DiscussionUpdate
from app.services import discussion as service

router = APIRouter()

@router.post("/", response_model=DiscussionRead, status_code=status.HTTP_201_CREATED)
async def create_discussion(
    discussion_in: DiscussionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Create a new discussion. Admin/Instructor only."""
    return await service.create_discussion(db, discussion_in, user_id=current_user.id)

@router.get("/{discussion_id}", response_model=DiscussionRead)
async def read_discussion(
    discussion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve a discussion. Admin/Instructor only."""
    return await service.get_discussion(db, discussion_id)

@router.get("/course/{course_id}", response_model=List[DiscussionRead])
async def read_course_discussions(
    course_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve all discussions for a course. Admin/Instructor only."""
    from app.repositories import discussion as repo
    return await repo.get_discussions_by_course(db, course_id, skip=skip, limit=limit)

@router.patch("/{discussion_id}", response_model=DiscussionRead)
async def update_discussion(
    discussion_id: int,
    discussion_in: DiscussionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update a discussion. Admin/Instructor only."""
    return await service.update_discussion(
        db, 
        discussion_id, 
        discussion_in, 
        user_id=current_user.id, 
        is_admin=(current_user.role == "admin")
    )

@router.delete("/{discussion_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_discussion(
    discussion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete a discussion. Admin/Instructor only."""
    await service.delete_discussion(
        db, 
        discussion_id, 
        user_id=current_user.id, 
        is_admin=(current_user.role == "admin")
    )
