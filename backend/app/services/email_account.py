import builtins
from typing import Any, Optional

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.email_account import EmailAccount
from app.repositories.email_account import email_account_repo
from app.schemas.email_account import EmailAccountCreate, EmailAccountUpdate

# Provider server configuration presets
EMAIL_SERVICE_CONFIG: dict[str, dict[str, Any]] = {
    "GMail": {
        "email_server": "imap.gmail.com",
        "use_ssl": True,
        "use_imap": True,
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "use_tls": True,
    },
    "Outlook": {
        "email_server": "imap-mail.outlook.com",
        "use_ssl": True,
        "use_imap": True,
        "smtp_server": "smtp-mail.outlook.com",
        "smtp_port": 587,
        "use_tls": True,
    },
    "Sendgrid": {
        "email_server": None,
        "smtp_server": "smtp.sendgrid.net",
        "smtp_port": 587,
        "use_tls": True,
    },
    "SparkPost": {
        "email_server": None,
        "smtp_server": "smtp.sparkpostmail.com",
        "smtp_port": 587,
        "use_tls": True,
    },
    "Postmark": {
        "email_server": None,
        "smtp_server": "smtp.postmarkapp.com",
        "smtp_port": 587,
        "use_tls": True,
    },
    "Resend": {
        "email_server": None,
        "smtp_server": "smtp.resend.com",
        "smtp_port": 465,
        "use_ssl": True,
    },
    "Yahoo": {
        "email_server": "imap.mail.yahoo.com",
        "use_ssl": True,
        "use_imap": True,
        "smtp_server": "smtp.mail.yahoo.com",
        "smtp_port": 587,
        "use_tls": True,
    },
    "Yandex": {
        "email_server": "imap.yandex.com",
        "use_ssl": True,
        "use_imap": True,
        "smtp_server": "smtp.yandex.com",
        "smtp_port": 587,
        "use_tls": True,
    },
}


class EmailAccountService:
    @staticmethod
    async def list(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[dict[str, Any]] = None,
    ) -> tuple[list[EmailAccount], int]:
        items = await email_account_repo.get_multi(
            db, skip=skip, limit=limit, filters=filters, order_by="created_at"
        )
        total = await email_account_repo.count(db, filters=filters)
        return items, total

    @staticmethod
    async def get(db: AsyncSession, public_id: str) -> EmailAccount:
        obj = await email_account_repo.get_by_public_id(db, public_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Email account not found")
        return obj

    @staticmethod
    async def get_default_outgoing(db: AsyncSession) -> Optional[EmailAccount]:
        """Return the default outgoing email account."""
        stmt = select(EmailAccount).where(
            EmailAccount.default_outgoing == True,
            EmailAccount.enable_outgoing == True,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_default_incoming(db: AsyncSession) -> Optional[EmailAccount]:
        """Return the default incoming email account."""
        stmt = select(EmailAccount).where(
            EmailAccount.default_incoming == True,
            EmailAccount.enable_incoming == True,
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_incoming_accounts(db: AsyncSession) -> builtins.list[EmailAccount]:
        """Return all enabled incoming email accounts."""
        stmt = select(EmailAccount).where(
            EmailAccount.enable_incoming == True,
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    def validate_credentials(
        service: str,
        email_id: str,
        password: Optional[str],
        enable_incoming: bool,
        enable_outgoing: bool,
    ) -> None:
        import imaplib
        import smtplib

        if not password:
            raise HTTPException(
                status_code=400,
                detail="Password is required to configure email account.",
            )

        config = EMAIL_SERVICE_CONFIG.get(service)
        if not config:
            raise HTTPException(
                status_code=400, detail=f"Unsupported email service: {service}"
            )

        if enable_incoming and config.get("email_server"):
            email_server = config["email_server"]
            use_ssl = config.get("use_ssl", False)
            try:
                if use_ssl:
                    imap = imaplib.IMAP4_SSL(email_server, timeout=10)
                else:
                    imap = imaplib.IMAP4(email_server, timeout=10)

                try:
                    imap.login(email_id, password)
                finally:
                    try:
                        imap.logout()
                    except Exception:
                        pass
            except (TimeoutError, imaplib.IMAP4.error, Exception) as e:
                err_msg = str(e)
                if (
                    "authentication failed" in err_msg.lower()
                    or "login failed" in err_msg.lower()
                    or "credentials" in err_msg.lower()
                ):
                    raise HTTPException(
                        status_code=400,
                        detail="Incoming email validation failed: Invalid username or password.",
                    )
                raise HTTPException(
                    status_code=400,
                    detail=f"Incoming email server connection failed: {err_msg}",
                )

        if enable_outgoing and config.get("smtp_server"):
            smtp_server = config["smtp_server"]
            smtp_port = config.get("smtp_port", 587)
            use_ssl = config.get("use_ssl", False)
            use_tls = config.get("use_tls", False)

            try:
                if use_ssl and smtp_port == 465:
                    smtp = smtplib.SMTP_SSL(smtp_server, smtp_port, timeout=10)
                else:
                    smtp = smtplib.SMTP(smtp_server, smtp_port, timeout=10)

                try:
                    if use_tls:
                        smtp.ehlo()
                        smtp.starttls()
                        smtp.ehlo()
                    
                    # Determine correct SMTP username based on the provider
                    srv = service.lower()
                    if srv == "sendgrid":
                        smtp_user = "apikey"
                    elif srv == "sparkpost":
                        smtp_user = "SMTP_Injection"
                    elif srv == "resend":
                        smtp_user = "resend"
                    elif srv == "postmark":
                        smtp_user = password
                    else:
                        smtp_user = email_id

                    smtp.login(smtp_user, password)
                finally:
                    try:
                        smtp.quit()
                    except Exception:
                        pass
            except (TimeoutError, smtplib.SMTPException, Exception) as e:
                err_msg = str(e)
                if (
                    "authentication failed" in err_msg.lower()
                    or "login failed" in err_msg.lower()
                    or "535" in err_msg
                    or "credentials" in err_msg.lower()
                ):
                    raise HTTPException(
                        status_code=400,
                        detail="Outgoing email validation failed: Invalid username or password.",
                    )
                raise HTTPException(
                    status_code=400,
                    detail=f"Outgoing email server connection failed: {err_msg}",
                )

    @staticmethod
    async def create(db: AsyncSession, obj_in: EmailAccountCreate) -> EmailAccount:
        stmt = select(EmailAccount).where(
            EmailAccount.email_account_name == obj_in.email_account_name
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"An email account named '{obj_in.email_account_name}' already exists.",
            )

        service = obj_in.service
        if service not in EMAIL_SERVICE_CONFIG:
            raise HTTPException(
                status_code=400, detail=f"Unsupported email service: {service}"
            )

        if not obj_in.enable_incoming and not obj_in.enable_outgoing:
            raise HTTPException(
                status_code=400,
                detail="Please enable at least Incoming or Outgoing for this email account.",
            )

        EmailAccountService.validate_credentials(
            service=obj_in.service,
            email_id=obj_in.email_id,
            password=obj_in.password,
            enable_incoming=obj_in.enable_incoming,
            enable_outgoing=obj_in.enable_outgoing,
        )

        server_config = EMAIL_SERVICE_CONFIG[service]
        data = obj_in.model_dump(exclude_unset=False)
        data.update(server_config)

        if data.get("default_incoming"):
            await EmailAccountService._unset_default_incoming(db)

        if data.get("default_outgoing"):
            await EmailAccountService._unset_default_outgoing(db)

        db_obj = await email_account_repo.create(db, obj_in=data)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def update(
        db: AsyncSession, public_id: str, obj_in: EmailAccountUpdate
    ) -> EmailAccount:
        account = await EmailAccountService.get(db, public_id)
        update_data = obj_in.model_dump(exclude_unset=True)

        email_id = update_data.get("email_id", account.email_id)
        password = update_data.get("password")
        password_changed = "password" in update_data

        if not password_changed:
            password = account.password

        service = account.service
        enable_incoming = update_data.get("enable_incoming", account.enable_incoming)
        enable_outgoing = update_data.get("enable_outgoing", account.enable_outgoing)

        if not enable_incoming and not enable_outgoing:
            raise HTTPException(
                status_code=400,
                detail="Please enable at least Incoming or Outgoing for this email account.",
            )

        if password and (
            password_changed
            or "email_id" in update_data
            or "enable_incoming" in update_data
            or "enable_outgoing" in update_data
        ):
            EmailAccountService.validate_credentials(
                service=service,
                email_id=email_id,
                password=password,
                enable_incoming=enable_incoming,
                enable_outgoing=enable_outgoing,
            )

        if update_data.get("default_incoming"):
            await EmailAccountService._unset_default_incoming(db, exclude_id=account.id)

        if update_data.get("default_outgoing"):
            await EmailAccountService._unset_default_outgoing(db, exclude_id=account.id)

        db_obj = await email_account_repo.update(db, db_obj=account, obj_in=update_data)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    @staticmethod
    async def delete(db: AsyncSession, public_id: str) -> None:
        account = await EmailAccountService.get(db, public_id)
        await email_account_repo.remove(db, id=account.id)
        await db.commit()

    @staticmethod
    async def _unset_default_incoming(
        db: AsyncSession, exclude_id: Optional[int] = None
    ) -> None:
        stmt = select(EmailAccount).where(EmailAccount.default_incoming == True)
        result = await db.execute(stmt)
        accounts = result.scalars().all()
        for acc in accounts:
            if exclude_id and acc.id == exclude_id:
                continue
            acc.default_incoming = False
            db.add(acc)
        await db.flush()

    @staticmethod
    async def _unset_default_outgoing(
        db: AsyncSession, exclude_id: Optional[int] = None
    ) -> None:
        stmt = select(EmailAccount).where(EmailAccount.default_outgoing == True)
        result = await db.execute(stmt)
        accounts = result.scalars().all()
        for acc in accounts:
            if exclude_id and acc.id == exclude_id:
                continue
            acc.default_outgoing = False
            db.add(acc)
        await db.flush()

    @staticmethod
    def serialize(account: EmailAccount) -> dict:
        """Serialize EmailAccount model while masking sensitive password."""
        return {
            "public_id": account.public_id,
            "email_account_name": account.email_account_name,
            "email_id": account.email_id,
            "service": account.service,
            "email_server": account.email_server,
            "smtp_server": account.smtp_server,
            "smtp_port": account.smtp_port,
            "use_ssl": account.use_ssl,
            "use_tls": account.use_tls,
            "use_imap": account.use_imap,
            "email_sync_option": account.email_sync_option,
            "initial_sync_count": account.initial_sync_count,
            "track_email_status": account.track_email_status,
            "enable_incoming": account.enable_incoming,
            "enable_outgoing": account.enable_outgoing,
            "default_incoming": account.default_incoming,
            "default_outgoing": account.default_outgoing,
            "create_lead_from_incoming_email": account.create_lead_from_incoming_email,
            "has_password": bool(account.password),
            "created_at": account.created_at,
            "updated_at": account.updated_at,
        }
