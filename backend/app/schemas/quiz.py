from datetime import datetime
from pydantic import ConfigDict, Field
from typing import List, Optional
from app.core.base import BaseSchema
from app.schemas.question import ChoiceRead, QuestionRead, QuestionCreate

# Quiz Schemas
class QuizBase(BaseSchema):
    course_id: int
    lesson_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    time_limit: Optional[int] = None
    passing_score: float = 70.0
    is_active: bool = True

class QuizCreate(QuizBase):
    pass

class QuizUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit: Optional[int] = None
    passing_score: Optional[float] = None
    is_active: Optional[bool] = None

class QuizRead(QuizBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class QuizDetail(QuizRead):
    questions: List[QuestionRead] = []
