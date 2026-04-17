from datetime import datetime
from typing import List, Optional
from pydantic import ConfigDict, Field
from app.core.base import BaseSchema
from app.models.question import QuestionType

# Choice Schemas
class ChoiceBase(BaseSchema):
    text: str
    is_correct: bool = False
    explanation: Optional[str] = None

class ChoiceCreate(ChoiceBase):
    pass

class ChoiceUpdate(BaseSchema):
    text: Optional[str] = None
    is_correct: Optional[bool] = None
    explanation: Optional[str] = None

class ChoiceRead(ChoiceBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Question Schemas
class QuestionBase(BaseSchema):
    text: str
    question_type: QuestionType = QuestionType.MCQ_SINGLE
    points: float = 1.0
    order_index: int = 0
    explanation: Optional[str] = None
    is_active: bool = True
    quiz_id: Optional[int] = None
    course_id: Optional[int] = None
    category_id: Optional[int] = None

class QuestionCreate(QuestionBase):
    choices: List[ChoiceCreate]

class QuestionUpdate(BaseSchema):
    text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    points: Optional[float] = None
    order_index: Optional[int] = None
    explanation: Optional[str] = None
    is_active: Optional[bool] = None
    quiz_id: Optional[int] = None
    course_id: Optional[int] = None
    category_id: Optional[int] = None
    choices: Optional[List[ChoiceCreate]] = None

class QuestionRead(QuestionBase):
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    choices: List[ChoiceRead] = []
    model_config = ConfigDict(from_attributes=True)
