from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EmailAccountBase(BaseModel):
    email_account_name: str
    email_id: str
    service: str

    # Feature flags
    enable_incoming: bool = False
    enable_outgoing: bool = False
    default_incoming: bool = False
    default_outgoing: bool = False
    create_lead_from_incoming_email: bool = False


class EmailAccountCreate(EmailAccountBase):
    password: Optional[str] = None


class EmailAccountUpdate(BaseModel):
    email_account_name: Optional[str] = None
    email_id: Optional[str] = None
    password: Optional[str] = None
    enable_incoming: Optional[bool] = None
    enable_outgoing: Optional[bool] = None
    default_incoming: Optional[bool] = None
    default_outgoing: Optional[bool] = None
    create_lead_from_incoming_email: Optional[bool] = None


class EmailAccountRead(EmailAccountBase):
    public_id: str
    # Server info (non-secret)
    email_server: Optional[str] = None
    smtp_server: Optional[str] = None
    smtp_port: int = 587
    use_ssl: bool = True
    use_tls: bool = True
    use_imap: bool = True
    email_sync_option: str = "ALL"
    initial_sync_count: int = 100
    track_email_status: bool = True

    # Auth presence flag
    has_password: Optional[bool] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EmailAccountListResponse(BaseModel):
    success: bool = True
    data: list[EmailAccountRead]
    meta: dict
