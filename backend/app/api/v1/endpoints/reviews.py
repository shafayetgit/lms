from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor, get_current_active_user
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewRead
from app.services import review as review_service

router = APIRouter()

@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_in: ReviewCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new review. Authenticated user only."""
    # Ensure user can only create review for themselves (unless admin)
    if review_in.student_id != current_user.id and current_user.role != "admin":
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Cannot create review for another user"
        )
    try:
        return await review_service.create_review(db, review_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/", response_model=List[ReviewRead])
async def read_reviews(
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all reviews (Public)."""
    return await review_service.get_reviews(db, skip=skip, limit=limit)

@router.get("/course/{course_id}", response_model=List[ReviewRead])
async def read_reviews_by_course(
    course_id: int,
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve reviews for a specific course (Public)."""
    return await review_service.get_reviews_by_course(db, course_id, skip=skip, limit=limit)

@router.put("/{review_id}", response_model=ReviewRead)
async def update_review(
    review_id: int, 
    review_in: ReviewUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update a review. Only owner or Admin/Instructor can update."""
    review = await review_service.get_review(db, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.student_id != current_user.id and current_user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    try:
        return await review_service.update_review(db, review_id, review_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete a review (Moderation). Admin/Instructor only."""
    try:
        await review_service.delete_review(db, review_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
