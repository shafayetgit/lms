from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_admin_or_instructor, get_current_active_user
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewRead, ReviewListResponse
from app.core.responses import create_response, read_response, update_response, delete_response
from fastapi import Query
from app.services import review as review_service

router = APIRouter()

@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_in: ReviewCreate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Create a new review. Authenticated user only."""
    review_in.student_public_id = current_user.public_id
    try:
        review = await review_service.create_review(db, review_in)
        return create_response(ReviewRead.model_validate(review).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        if "uq_course_student_review" in str(e) or "unique" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User has already reviewed this course")
        raise e

@router.get("/", response_model=ReviewListResponse)
async def read_reviews(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    course_public_id: str | None = None,
    student_public_id: str | None = None,
    is_active: bool | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all reviews (Public)."""
    data = await review_service.get_reviews(db, page=page, size=size, course_public_id=course_public_id, student_public_id=student_public_id, is_active=is_active)
    return read_response(data)

@router.get("/{public_id}", response_model=ReviewRead)
async def read_review(
    public_id: str, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific review."""
    review = await review_service.get_review(db, public_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return read_response({"data": ReviewRead.model_validate(review).model_dump(by_alias=False)})

@router.get("/course/{course_public_id}", response_model=List[ReviewRead])
async def read_reviews_by_course(
    course_public_id: str,
    skip: int = 0, 
    limit: int = 100, 
    db: AsyncSession = Depends(get_db)
):
    """Retrieve reviews for a specific course (Public)."""
    reviews = await review_service.get_reviews_by_course(db, course_public_id, skip=skip, limit=limit)
    items = [ReviewRead.model_validate(r).model_dump(by_alias=False) for r in reviews]
    return read_response({"data": items})

@router.put("/{public_id}", response_model=ReviewRead)
async def update_review(
    public_id: str, 
    review_in: ReviewUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Update a review. Only owner or Admin/Instructor can update."""
    review = await review_service.get_review(db, public_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    if review.student_id != current_user.id and current_user.role not in ["admin", "instructor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    try:
        review = await review_service.update_review(db, public_id, review_in)
        return update_response(ReviewRead.model_validate(review).model_dump(by_alias=False))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{public_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    public_id: str, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_admin_or_instructor)
):
    """Delete a review (Moderation). Admin/Instructor only."""
    try:
        await review_service.delete_review(db, public_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

