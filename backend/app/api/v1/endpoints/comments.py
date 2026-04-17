from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_admin_or_instructor
from app.schemas.comment import CommentRead, CommentCreate, CommentUpdate, CommentWithReplies
from app.services import comment as service

router = APIRouter()

@router.post("/", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Create a new comment. Admin/Instructor only."""
    return await service.create_comment(db, comment_in, user_id=current_user.id)

@router.get("/{comment_id}", response_model=CommentRead)
async def read_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve a comment. Admin/Instructor only."""
    return await service.get_comment(db, comment_id)

@router.get("/discussion/{discussion_id}", response_model=List[CommentWithReplies])
async def read_discussion_comments(
    discussion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Retrieve all comments for a discussion as a tree. Admin/Instructor only."""
    from sqlalchemy import select
    from app.models.comment import Comment
    
    # Fetch ALL comments for this discussion
    result = await db.execute(
        select(Comment)
        .where(Comment.discussion_id == discussion_id)
        .order_by(Comment.created_at.asc())
    )
    all_comments = result.scalars().all()
    
    # Build a tree in-memory
    comment_map = {}
    for c in all_comments:
        # Extract data manually to avoid lazy loading of 'replies' or 'user' relationships
        schema_obj = CommentWithReplies(
            id=c.id,
            discussion_id=c.discussion_id,
            user_id=c.user_id,
            parent_id=c.parent_id,
            body=c.body,
            is_active=c.is_active,
            created_at=c.created_at,
            updated_at=c.updated_at,
            replies=[]
        )
        comment_map[c.id] = schema_obj
    
    root_comments = []
    for c in all_comments:
        schema_obj = comment_map[c.id]
        if c.parent_id is None:
            root_comments.append(schema_obj)
        elif c.parent_id in comment_map:
            parent_obj = comment_map[c.parent_id]
            parent_obj.replies.append(schema_obj)
            
    return root_comments

@router.patch("/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: int,
    comment_in: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Update a comment. Admin/Instructor only."""
    return await service.update_comment(
        db, 
        comment_id, 
        comment_in, 
        user_id=current_user.id, 
        is_admin=(current_user.role == "admin")
    )

@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete a comment. Admin/Instructor only."""
    await service.delete_comment(
        db, 
        comment_id, 
        user_id=current_user.id, 
        is_admin=(current_user.role == "admin")
    )
