from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.comment import Comment
from app.schemas.comment import CommentCreate, CommentUpdate
from app.repositories import comment as repo
from app.repositories import discussion as discussion_repo

async def create_comment(
    db: AsyncSession, comment_in: CommentCreate, user_id: int
) -> Comment:
    # Validate discussion exists
    discussion = await discussion_repo.get_discussion_by_id(db, comment_in.discussion_id)
    if not discussion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Discussion with id {comment_in.discussion_id} not found"
        )
    
    # Validate parent comment if provided
    if comment_in.parent_id:
        parent = await repo.get_comment_by_id(db, comment_in.parent_id)
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Parent comment with id {comment_in.parent_id} not found"
            )
        # Ensure parent belongs to the same discussion
        if parent.discussion_id != comment_in.discussion_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment must belong to the same discussion"
            )
            
    comment = Comment(
        **comment_in.model_dump(),
        user_id=user_id
    )
    return await repo.create_comment(db, comment)

async def get_comment(db: AsyncSession, comment_id: int) -> Comment:
    comment = await repo.get_comment_by_id(db, comment_id)
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Comment with id {comment_id} not found"
        )
    return comment

async def update_comment(
    db: AsyncSession, comment_id: int, comment_in: CommentUpdate, user_id: int, is_admin: bool = False
) -> Comment:
    comment = await get_comment(db, comment_id)
    
    # Only owner or admin can update
    if comment.user_id != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this comment"
        )
        
    update_data = comment_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(comment, field, value)
        
    return await repo.update_comment(db, comment)

async def delete_comment(
    db: AsyncSession, comment_id: int, user_id: int, is_admin: bool = False
) -> None:
    comment = await get_comment(db, comment_id)
    
    # Only owner or admin can delete
    if comment.user_id != user_id and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this comment"
        )
        
    await repo.delete_comment(db, comment)
