from datetime import datetime
from typing import List, Optional
from pydantic import ConfigDict
from app.core.base import BaseSchema
from app.models.quiz_submission import AttemptStatus

# Result Schemas
class QuizResultBase(BaseSchema):
    question_id: int
    selected_option_id: Optional[int] = None
    answer_text: Optional[str] = None

class QuizResultCreate(QuizResultBase):
    pass

class QuizResultRead(QuizResultBase):
    id: int
    is_correct: bool
    marks: float
    model_config = ConfigDict(from_attributes=True)

# Attempt Schemas
class QuizSubmissionBase(BaseSchema):
    quiz_id: int

class QuizSubmissionCreate(QuizSubmissionBase):
    pass

class QuizSubmissionUpdate(BaseSchema):
    status: Optional[AttemptStatus] = None
    end_time: Optional[datetime] = None

class QuizSubmissionRead(QuizSubmissionBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    score: float
    score_out_of: float
    percentage: float
    passing: bool
    time_taken: int
    status: AttemptStatus
    model_config = ConfigDict(from_attributes=True)

class QuizSubmissionDetail(QuizSubmissionRead):
    answers: List[QuizResultRead] = []

class QuizSubmissionSubmit(BaseSchema):
    answers: List[QuizResultCreate]

class QuizSubmissionListResponse(BaseSchema):
    data: List[QuizSubmissionRead]
    meta: dict
