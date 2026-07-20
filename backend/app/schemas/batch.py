from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, model_validator
from datetime import date, time, datetime


# ---------------- BatchCourse Schemas ---------------- #

class BatchCourseBase(BaseModel):
    course_id: int
    evaluator_id: Optional[int] = None

class BatchCourseCreate(BatchCourseBase):
    pass

class BatchCourseResponse(BatchCourseBase):
    id: int
    batch_id: int
    
    model_config = ConfigDict(from_attributes=True)


# ---------------- BatchTimetable Schemas ---------------- #

class BatchTimetableBase(BaseModel):
    date: date
    start_time: time
    end_time: time
    topic: str
    description: Optional[str] = None
    meeting_link: Optional[str] = None

class BatchTimetableCreate(BatchTimetableBase):
    pass

class BatchTimetableUpdate(BaseModel):
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    meeting_link: Optional[str] = None

class BatchTimetableResponse(BatchTimetableBase):
    id: int
    public_id: Optional[str] = None
    batch_id: int
    
    model_config = ConfigDict(from_attributes=True)


# ---------------- BatchEnrollment Schemas ---------------- #

class BatchMemberResponse(BaseModel):
    id: int
    public_id: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = ""
    full_name: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)

class BatchEnrollmentBase(BaseModel):
    member_id: int
    is_paid: bool = False

class BatchEnrollmentCreate(BatchEnrollmentBase):
    pass

class BatchEnrollmentAdminCreate(BaseModel):
    member_public_id: str
    is_paid: bool = False
    payment_public_id: Optional[str] = None

class BatchPaymentResponse(BaseModel):
    id: int
    public_id: str
    amount: float
    currency: str
    status: str
    source: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BatchEnrollmentResponse(BatchEnrollmentBase):
    id: int
    public_id: str
    batch_id: int
    created_at: datetime
    member: Optional[BatchMemberResponse] = None
    payment: Optional[BatchPaymentResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_payment(cls, data: Any) -> Any:
        if isinstance(data, dict):
            return data
        
        # Fallback to course payment if batch-specific payment does not exist
        payment = getattr(data, "payment", None)
        course_payment = getattr(data, "course_payment", None)
        if not payment and course_payment:
            res_dict = {
                "id": data.id,
                "public_id": data.public_id,
                "batch_id": data.batch_id,
                "created_at": data.created_at,
                "member_id": data.member_id,
                "is_paid": data.is_paid or course_payment.status == "Completed",
                "member": data.member,
                "payment": BatchPaymentResponse.model_validate(course_payment)
            }
            return res_dict
        return data


# ---------------- BatchFeedback Schemas ---------------- #

class BatchFeedbackBase(BaseModel):
    feedback: str
    rating: Optional[float] = None

class BatchFeedbackCreate(BatchFeedbackBase):
    pass

class BatchFeedbackResponse(BatchFeedbackBase):
    id: int
    batch_id: int
    member_id: int
    
    model_config = ConfigDict(from_attributes=True)


# ---------------- Batch Schemas ---------------- #

class BatchBase(BaseModel):
    title: str
    description: Optional[str] = None
    batch_details: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: str = "UTC"
    published: bool = False
    allow_self_enrollment: bool = True
    seat_count: Optional[int] = 0
    category_id: Optional[int] = None
    medium: Optional[str] = None
    paid_batch: bool = False
    amount: Optional[float] = None
    currency: Optional[str] = None
    amount_usd: Optional[float] = None
    evaluation: bool = False
    evaluation_end_date: Optional[date] = None
    certification: bool = False
    meta_image: Optional[str] = None
    video_link: Optional[str] = None

class BatchCreate(BatchBase):
    courses: Optional[List[BatchCourseCreate]] = None

class BatchUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    batch_details: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    timezone: Optional[str] = None
    published: Optional[bool] = None
    allow_self_enrollment: Optional[bool] = None
    seat_count: Optional[int] = None
    category_id: Optional[int] = None
    medium: Optional[str] = None
    paid_batch: Optional[bool] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    amount_usd: Optional[float] = None
    evaluation: Optional[bool] = None
    evaluation_end_date: Optional[date] = None
    certification: Optional[bool] = None
    meta_image: Optional[str] = None
    video_link: Optional[str] = None
    courses: Optional[List[BatchCourseCreate]] = None

class BatchResponse(BatchBase):
    id: int
    public_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    courses: List[BatchCourseResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class BatchDetailResponse(BatchResponse):
    timetables: List[BatchTimetableResponse] = []
    enrollment_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)
