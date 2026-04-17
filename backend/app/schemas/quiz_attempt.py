from datetime import datetime
from typing import List, Optional
from pydantic import ConfigDict
from app.core.base import BaseSchema
from app.models.quiz_attempt import AttemptStatus

# Answer Schemas
class QuizAttemptAnswerBase(BaseSchema):
    question_id: int
    choice_id: Optional[int] = None
    answer_text: Optional[str] = None

class QuizAttemptAnswerCreate(QuizAttemptAnswerBase):
    pass

class QuizAttemptAnswerRead(QuizAttemptAnswerBase):
    id: int
    is_correct: bool
    points_earned: float
    model_config = ConfigDict(from_attributes=True)

# Attempt Schemas
class QuizAttemptBase(BaseSchema):
    quiz_id: int

class QuizAttemptCreate(QuizAttemptBase):
    pass

class QuizAttemptUpdate(BaseSchema):
    status: Optional[AttemptStatus] = None
    end_time: Optional[datetime] = None

class QuizAttemptRead(QuizAttemptBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    score: float
    total_points: float
    percentage: float
    is_passed: bool
    status: AttemptStatus
    model_config = ConfigDict(from_attributes=True)

class QuizAttemptDetail(QuizAttemptRead):
    answers: List[QuizAttemptAnswerRead] = []

class QuizAttemptSubmit(BaseSchema):
    answers: List[QuizAttemptAnswerCreate]
