from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.discussion import Discussion
from app.schemas.discussion import DiscussionCreate, DiscussionUpdate
from app.repositories import discussion as repo
from app.repositories import course as course_repo
from app.repositories import lesson as lesson_repo

async def create_discussion(
    db: AsyncSession, discussion_in: DiscussionCreate, user_id: int
) -> Discussion:
    # Validate course exists
    course = await course_repo.get_course_by_id(db, discussion_in.course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with id {discussion_in.course_id} not found"
        )
    
    # Validate lesson exists if provided
    if discussion_in.lesson_id:
        lesson = await lesson_repo.get_lesson_by_id(db, discussion_in.lesson_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson with id {discussion_in.lesson_id} not found"
            )
            
    discussion = Discussion(
        **discussion_in.model_dump(),
        user_id=user_id
    )
    return await repo.create_discussion(db, discussion)

async def get_discussion(db: AsyncSession, discussion_id: int) -> Discussion:
    discussion = await repo.get_discussion_by_id(db, discussion_id)
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Discussion with id {discussion_id} not found"
        )
    return discussion

async def update_discussion(
    db: AsyncSession, discussion_id: int, discussion_in: DiscussionUpdate, user_id: int, is_admin: bool = False
) -> Discussion:
    discussion = await get_discussion(db, discussion_id)
    
    # Only owner or admin can update
    if discussion.user_id != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this discussion"
        )
        
    update_data = discussion_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(discussion, field, value)
        
    return await repo.update_discussion(db, discussion)

async def delete_discussion(
    db: AsyncSession, discussion_id: int, user_id: int, is_admin: bool = False
) -> None:
    discussion = await get_discussion(db, discussion_id)
    
    # Only owner or admin can delete
    if discussion.user_id != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this discussion"
        )
        
    await repo.delete_discussion(db, discussion)
