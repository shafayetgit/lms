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
    course = await course_repo.get_course_by_public_id(db, discussion_in.course_public_id)
    if not course:
        # Fall back to slug lookup
        course = await course_repo.get_course_by_slug(db, discussion_in.course_public_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with public id {discussion_in.course_public_id} not found"
        )
    
    # Validate lesson exists if provided
    lesson_id = None
    if discussion_in.lesson_public_id:
        lesson = await lesson_repo.get_lesson_by_id(db, discussion_in.lesson_public_id)
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lesson with public id {discussion_in.lesson_public_id} not found"
            )
        lesson_id = lesson.id
            
    discussion = Discussion(
        course_id=course.id,
        lesson_id=lesson_id,
        title=discussion_in.title,
        body=discussion_in.body,
        is_active=discussion_in.is_active,
        is_pinned=discussion_in.is_pinned,
        is_locked=discussion_in.is_locked,
        reference_doctype=discussion_in.reference_doctype,
        reference_docname=discussion_in.reference_docname,
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
