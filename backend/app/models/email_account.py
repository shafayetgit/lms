from typing import Optional
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmailAccount(Base):
    __tablename__ = "email_accounts"

    # Identity
    email_account_name: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    email_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    service: Mapped[str] = mapped_column(String(100), nullable=False)

    # Auth — password-based
    password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # IMAP (incoming)
    email_server: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    use_ssl: Mapped[bool] = mapped_column(Boolean, default=True)
    use_imap: Mapped[bool] = mapped_column(Boolean, default=True)
    incoming_port: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # SMTP (outgoing)
    smtp_server: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    smtp_port: Mapped[int] = mapped_column(Integer, default=587)
    use_tls: Mapped[bool] = mapped_column(Boolean, default=True)

    # Feature flags
    enable_incoming: Mapped[bool] = mapped_column(Boolean, default=False)
    enable_outgoing: Mapped[bool] = mapped_column(Boolean, default=False)
    default_incoming: Mapped[bool] = mapped_column(Boolean, default=False)
    default_outgoing: Mapped[bool] = mapped_column(Boolean, default=False)
    create_lead_from_incoming_email: Mapped[bool] = mapped_column(
        Boolean, default=False
    )

    # Sync settings
    email_sync_option: Mapped[str] = mapped_column(String(50), default="ALL")
    initial_sync_count: Mapped[int] = mapped_column(Integer, default=100)
    track_email_status: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<EmailAccount id={self.id} name={self.email_account_name} service={self.service}>"
