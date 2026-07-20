from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.discussion import DiscussionRead, DiscussionCreate, DiscussionUpdate
from app.services import discussion as service

router = APIRouter()

@router.post("/", response_model=DiscussionRead, status_code=status.HTTP_201_CREATED)
async def create_discussion(
    discussion_in: DiscussionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new discussion."""
    return await service.create_discussion(db, discussion_in, user_id=current_user.id)

@router.get("/{discussion_id}", response_model=DiscussionRead)
async def read_discussion(
    discussion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve a discussion."""
    return await service.get_discussion(db, discussion_id)

@router.get("/course/{course_public_id}")
async def read_course_discussions(
    course_public_id: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Retrieve all discussions for a course by public ID or slug."""
    from sqlalchemy import select, func
    from app.repositories import course as course_repo
    from app.repositories import discussion as repo
    from app.models.comment import Comment
    
    course = await course_repo.get_course_by_public_id(db, course_public_id)
    if not course:
        course = await course_repo.get_course_by_slug(db, course_public_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with public id {course_public_id} not found"
        )
    discussions = await repo.get_discussions_by_course(db, course.id, skip=skip, limit=limit)
    
    # Compute comment counts
    disc_ids = [d.id for d in discussions]
    counts_map = {}
    if disc_ids:
        count_result = await db.execute(
            select(Comment.discussion_id, func.count(Comment.id))
            .where(Comment.discussion_id.in_(disc_ids))
            .group_by(Comment.discussion_id)
        )
        counts_map = dict(count_result.all())
    
    result = []
    for d in discussions:
        data = DiscussionRead.model_validate(d).model_dump()
        data["comment_count"] = counts_map.get(d.id, 0)
        result.append(data)
    
    return result

@router.patch("/{discussion_id}", response_model=DiscussionRead)
async def update_discussion(
    discussion_id: int,
    discussion_in: DiscussionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a discussion."""
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
    current_user = Depends(get_current_user)
):
    """Delete a discussion."""
    await service.delete_discussion(
        db, 
        discussion_id, 
        user_id=current_user.id, 
        is_admin=(current_user.role == "admin")
    )
