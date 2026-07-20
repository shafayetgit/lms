from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.live_class import LiveClassStatus

class LiveClassBase(BaseModel):
    title: str
    description: Optional[str] = None
    batch_id: Optional[int] = None
    course_id: Optional[int] = None
    host_id: int
    date: date
    time: time
    duration: int
    timezone: str = "UTC"
    meeting_link: str
    password: Optional[str] = None
    auto_recording: bool = False

class LiveClassCreate(LiveClassBase):
    pass

class LiveClassUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    batch_id: Optional[int] = None
    course_id: Optional[int] = None
    host_id: Optional[int] = None
    date: Optional[date] = None
    time: Optional[time] = None
    duration: Optional[int] = None
    timezone: Optional[str] = None
    meeting_link: Optional[str] = None
    password: Optional[str] = None
    auto_recording: Optional[bool] = None
    recording_link: Optional[str] = None
    status: Optional[LiveClassStatus] = None

class LiveClassResponse(LiveClassBase):
    id: int
    recording_link: Optional[str] = None
    status: LiveClassStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
