from datetime import date as dt_date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.certificate import EvaluationStatus, RequestStatus
from app.schemas.user import UserMinimal
from app.schemas.course import CourseSimple

# ---------------- SIMPLE BATCH SCHEMA ---------------- #
class BatchSimple(BaseModel):
    public_id: str
    title: str

    model_config = ConfigDict(from_attributes=True)


# ---------------- CERTIFICATES ---------------- #

class CertificateBase(BaseModel):
    member_id: int
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    issue_date: dt_date
    expiry_date: Optional[dt_date] = None
    published: bool = False
    template: Optional[str] = None

class CertificateCreate(BaseModel):
    member_public_id: str
    course_public_id: Optional[str] = None
    batch_public_id: Optional[str] = None
    issue_date: dt_date
    expiry_date: Optional[dt_date] = None
    published: bool = False
    template: Optional[str] = None

class CertificateUpdate(BaseModel):
    issue_date: Optional[dt_date] = None
    expiry_date: Optional[dt_date] = None
    published: Optional[bool] = None
    template: Optional[str] = None

class CertificateResponse(BaseModel):
    id: int
    public_id: str
    issue_date: dt_date
    expiry_date: Optional[dt_date] = None
    published: bool = False
    template: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    member: Optional[UserMinimal] = None
    course: Optional[CourseSimple] = None
    batch: Optional[BatchSimple] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- EVALUATIONS ---------------- #

class CertificateEvaluationBase(BaseModel):
    member_id: int
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    evaluator_id: Optional[int] = None
    date: Optional[dt_date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class CertificateEvaluationCreate(BaseModel):
    member_public_id: str
    course_public_id: Optional[str] = None
    batch_public_id: Optional[str] = None
    evaluator_public_id: Optional[str] = None
    date: Optional[dt_date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class CertificateEvaluationUpdate(BaseModel):
    status: Optional[EvaluationStatus] = None
    rating: Optional[float] = None
    summary: Optional[str] = None
    date: Optional[dt_date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    evaluator_public_id: Optional[str] = None

class CertificateEvaluationResponse(BaseModel):
    id: int
    public_id: str
    date: Optional[dt_date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    status: EvaluationStatus
    rating: Optional[float] = None
    summary: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    member: Optional[UserMinimal] = None
    evaluator: Optional[UserMinimal] = None
    course: Optional[CourseSimple] = None
    batch: Optional[BatchSimple] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- REQUESTS ---------------- #

class CertificateRequestBase(BaseModel):
    course_id: Optional[int] = None
    batch_id: Optional[int] = None

class CertificateRequestCreate(BaseModel):
    member_public_id: Optional[str] = None
    course_public_id: Optional[str] = None
    batch_public_id: Optional[str] = None

class CertificateRequestUpdate(BaseModel):
    status: Optional[RequestStatus] = None
    evaluator_public_id: Optional[str] = None

class CertificateRequestResponse(BaseModel):
    id: int
    public_id: str
    status: RequestStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    member: Optional[UserMinimal] = None
    evaluator: Optional[UserMinimal] = None
    course: Optional[CourseSimple] = None
    batch: Optional[BatchSimple] = None

    model_config = ConfigDict(from_attributes=True)
