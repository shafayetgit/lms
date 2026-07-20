from datetime import datetime
from pydantic import ConfigDict, Field
from typing import List, Optional
from app.core.base import BaseSchema, PaginationMeta
from app.schemas.question import QuestionRead


class QuizBase(BaseSchema):
    title: str
    description: Optional[str] = None
    max_attempts: int = Field(1, ge=1)
    show_answers: bool = False
    show_submission_history: bool = True
    total_marks: float = Field(100.0, ge=0.0)
    passing_percentage: float = Field(70.0, ge=0.0, le=100.0)
    duration: int = Field(0, description="Duration in seconds. 0 means unlimited.")
    shuffle_questions: bool = False
    limit_questions_to: int = Field(0, description="0 means show all questions")
    enable_negative_marking: bool = False
    marks_to_cut: float = Field(0.0, ge=0.0)
    is_active: bool = True


class QuizCreate(QuizBase):
    pass


class QuizUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    max_attempts: Optional[int] = Field(None, ge=1)
    show_answers: Optional[bool] = None
    show_submission_history: Optional[bool] = None
    total_marks: Optional[float] = Field(None, ge=0.0)
    passing_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    duration: Optional[int] = None
    shuffle_questions: Optional[bool] = None
    limit_questions_to: Optional[int] = None
    enable_negative_marking: Optional[bool] = None
    marks_to_cut: Optional[float] = Field(None, ge=0.0)
    is_active: Optional[bool] = None


class QuizRead(QuizBase):
    id: int
    public_id: str
    owner_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class QuizDetail(QuizRead):
    questions: List[QuestionRead] = []


class QuizReadResponse(BaseSchema):
    success: bool = True
    data: QuizRead


class QuizListResponse(BaseSchema):
    success: bool = True
    data: List[QuizRead]
    meta: PaginationMeta
