from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user, PermissionChecker
from app.models.user import User
from app.schemas.assignment import (
    AssignmentCreate,
    AssignmentUpdate,
    AssignmentReadResponse,
    AssignmentSubmissionCreate,
    AssignmentSubmissionUpdate,
    AssignmentSubmissionReadResponse,
    AssignmentListResponse,
    AssignmentSubmissionListResponse,
)
from app.repositories import assignment as assignment_repo
from app.services import assignment as assignment_svc

router = APIRouter()

@router.post("/", response_model=AssignmentReadResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    *,
    db: AsyncSession = Depends(get_db),
    assignment_in: AssignmentCreate,
    current_user: User = Depends(PermissionChecker("assignment", "create"))
) -> Any:
    assignment = await assignment_svc.create_assignment(db, assignment_in=assignment_in)
    return {"success": True, "data": assignment}

@router.get("/", response_model=AssignmentListResponse)
async def read_assignments(
    db: AsyncSession = Depends(get_db),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    course_id: Optional[str] = None,
    current_user: User = Depends(PermissionChecker("assignment", "read"))
) -> Any:
    skip = (page - 1) * size
    
    resolved_course_id = None
    if course_id:
        if course_id.isdigit():
            resolved_course_id = int(course_id)
        else:
            from app.repositories import course as course_repo
            course = await course_repo.get_course_by_public_id(db, course_id)
            if not course:
                course = await course_repo.get_course_by_slug(db, course_id)
            if course:
                resolved_course_id = course.id
            else:
                return {
                    "success": True,
                    "data": [],
                    "meta": {
                        "total": 0,
                        "page": page,
                        "size": size,
                        "pages": 0,
                        "has_next": False,
                        "has_prev": False,
                    }
                }

    total = await assignment_repo.count_assignments(db, course_id=resolved_course_id)
    assignments = await assignment_repo.get_assignments(db, skip=skip, limit=size, course_id=resolved_course_id)
    
    # Hide answers for students in the list response
    if current_user.role == "student":
        for assignment in assignments:
            db.expunge(assignment)
            assignment.answer = await assignment_svc.get_revealed_answer(db, assignment, current_user.id)
            
    pages = (total + size - 1) // size if size else 1
    
    return {
        "success": True,
        "data": assignments,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }

@router.get("/{id}", response_model=AssignmentReadResponse)
async def read_assignment(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(PermissionChecker("assignment", "read"))
) -> Any:
    assignment = await assignment_repo.get_assignment_by_id(db, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    my_submission = await assignment_repo.get_submission(db, assignment.id, current_user.id)
    assignment.my_submission = my_submission

    # Prevent leaking answer based on business rules
    if current_user.role == "student":
        db.expunge(assignment)
        revealed_answer = await assignment_svc.get_revealed_answer(db, assignment, current_user.id)
        assignment.answer = revealed_answer
        
    return {"success": True, "data": assignment}

@router.put("/{id}", response_model=AssignmentReadResponse)
async def update_assignment(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    assignment_in: AssignmentUpdate,
    current_user: User = Depends(PermissionChecker("assignment", "update"))
) -> Any:
    assignment = await assignment_repo.get_assignment_by_id(db, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    assignment = await assignment_svc.update_assignment(db, assignment=assignment, assignment_in=assignment_in)
    return {"success": True, "data": assignment}

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_assignment(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    current_user: User = Depends(PermissionChecker("assignment", "delete"))
) -> Any:
    assignment = await assignment_repo.get_assignment_by_id(db, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    await assignment_repo.delete_assignment(db, assignment=assignment)
    return {"success": True, "message": "Successfully deleted"}

@router.post("/{id}/submit", response_model=AssignmentSubmissionReadResponse, status_code=status.HTTP_201_CREATED)
async def submit_assignment(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    submission_in: AssignmentSubmissionCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    assignment = await assignment_repo.get_assignment_by_id(db, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    submission = await assignment_svc.submit_assignment(
        db, assignment=assignment, user_id=current_user.id, submission_in=submission_in
    )
    return {"success": True, "data": submission}

@router.get("/{id}/submissions", response_model=AssignmentSubmissionListResponse)
async def read_assignment_submissions(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(PermissionChecker("assignment", "read"))
) -> Any:
    assignment = await assignment_repo.get_assignment_by_id(db, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    skip = (page - 1) * size
    total = await assignment_repo.count_submissions_by_assignment(db, assignment_id=assignment.id)
    submissions = await assignment_repo.get_submissions_by_assignment(db, assignment_id=assignment.id, skip=skip, limit=size)
    
    pages = (total + size - 1) // size if size else 1
    
    return {
        "success": True,
        "data": submissions,
        "meta": {
            "total": total,
            "page": page,
            "size": size,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        }
    }

@router.put("/{id}/submissions/{sub_id}", response_model=AssignmentSubmissionReadResponse)
async def grade_assignment_submission(
    *,
    db: AsyncSession = Depends(get_db),
    id: str,
    sub_id: str,
    update_in: AssignmentSubmissionUpdate,
    current_user: User = Depends(PermissionChecker("assignment", "update"))
) -> Any:
    assignment = await assignment_repo.get_assignment_by_id(db, id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submission = await assignment_repo.get_submission_by_id(db, sub_id=sub_id)
    if not submission or submission.assignment_id != assignment.id:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    submission = await assignment_svc.grade_submission(db, submission=submission, update_in=update_in)
    return {"success": True, "data": submission}
