from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from app.models.comment import Comment
from sqlalchemy import and_


async def create_comment(db: AsyncSession, comment: Comment) -> Comment:
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment

async def get_comment_by_id(db: AsyncSession, comment_id: int) -> Optional[Comment]:
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    return result.scalars().first()

async def get_comments_by_discussion(
    db: AsyncSession, discussion_id: int, skip: int = 0, limit: int = 100
) -> List[Comment]:
    """Get top-level comments for a discussion."""
    result = await db.execute(
        select(Comment)
        .where(and_(Comment.discussion_id == discussion_id, Comment.parent_id == None))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def update_comment(db: AsyncSession, comment: Comment) -> Comment:
    await db.commit()
    await db.refresh(comment)
    return comment

async def delete_comment(db: AsyncSession, comment: Comment) -> None:
    await db.delete(comment)
    await db.commit()

