from pydantic import ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.core.base import BaseSchema, PaginationMeta
from pydantic import BaseModel
from app.schemas.user import UserMinimal

class ReviewBase(BaseSchema):
    course_public_id: str
    student_public_id: Optional[str] = None
    rating: float = Field(..., ge=1, le=5)
    body: Optional[str] = None
    is_active: bool = True

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(BaseSchema):
    rating: Optional[float] = Field(None, ge=1, le=5)
    body: Optional[str] = None
    is_active: Optional[bool] = None

class ReviewRead(ReviewBase):
    public_id: str
    created_at: datetime
    updated_at: datetime
    student: Optional[UserMinimal] = None
    
    model_config = ConfigDict(from_attributes=True)

class ReviewListResponse(BaseModel):
    data: list[ReviewRead]
    meta: PaginationMeta
