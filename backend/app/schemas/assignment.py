from datetime import datetime
from typing import Optional
from app.core.base import BaseSchema, PaginationMeta
from app.models.assignment import AssignmentType, SubmissionStatus
from app.schemas.user import UserMinimal

class AssignmentSubmissionBase(BaseSchema):
    answer: Optional[str] = None

class AssignmentSubmissionCreate(AssignmentSubmissionBase):
    pass

class AssignmentSubmissionUpdate(BaseSchema):
    status: Optional[SubmissionStatus] = None
    grade: Optional[float] = None
    comments: Optional[str] = None

class AssignmentSubmissionRead(AssignmentSubmissionBase):
    public_id: str
    id: int
    assignment_id: int
    member_id: int
    member: Optional[UserMinimal] = None
    status: SubmissionStatus
    grade: Optional[float] = None
    comments: Optional[str] = None
    created_at: datetime

# Alias for compatibility
AssignmentSubmissionResponse = AssignmentSubmissionRead


class AssignmentSubmissionReadResponse(BaseSchema):
    success: bool = True
    data: AssignmentSubmissionRead


class AssignmentBase(BaseSchema):
    title: str
    type: AssignmentType
    question: str
    course_id: Optional[int] = None
    show_answer: bool = False
    answer: Optional[str] = None
    grade_assignment: bool = False

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseSchema):
    title: Optional[str] = None
    type: Optional[AssignmentType] = None
    question: Optional[str] = None
    course_id: Optional[int] = None
    show_answer: Optional[bool] = None
    answer: Optional[str] = None
    grade_assignment: Optional[bool] = None

class AssignmentRead(AssignmentBase):
    public_id: str
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    my_submission: Optional[AssignmentSubmissionRead] = None

# Alias for compatibility
AssignmentResponse = AssignmentRead


class AssignmentReadResponse(BaseSchema):
    success: bool = True
    data: AssignmentRead


class AssignmentListResponse(BaseSchema):
    success: bool = True
    data: list[AssignmentRead]
    meta: PaginationMeta


class AssignmentSubmissionListResponse(BaseSchema):
    success: bool = True
    data: list[AssignmentSubmissionRead]
    meta: PaginationMeta
