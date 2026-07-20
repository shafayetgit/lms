"""
Email Service
Handles sending emails dynamically using the configured database email accounts.
"""

from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import init_settings


class EmailService:
    """Service for sending emails via dynamically configured database email accounts."""

    def __init__(self):
        """Initialize email service."""
        self.settings = init_settings()

        # Setup Jinja2 template environment
        template_dir = Path(__file__).parent.parent / "templates" / "emails"
        self.template_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=True,
        )

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """
        Send email using the default outgoing email account from the database.

        Args:
            to_email: Recipient's email address
            subject: Email subject
            html_content: HTML email body
            plain_text: Plain text email body (optional)
            db: Optional database session

        Returns:
            bool: True if sent successfully
        """
        if db is None:
            from app.db.session import get_session_maker, dispose_current_loop_engine
            session_maker = get_session_maker()
            async with session_maker() as session:
                try:
                    return await self._send_email_dynamic(
                        to_email, subject, html_content, plain_text, session
                    )
                finally:
                    await dispose_current_loop_engine()
        else:
            return await self._send_email_dynamic(
                to_email, subject, html_content, plain_text, db
            )

    async def _send_email_dynamic(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str],
        db: AsyncSession,
    ) -> bool:
        """Fetch settings from default dynamic outgoing email account and send SMTP email."""
        from app.services.email_account import EmailAccountService
        account = await EmailAccountService.get_default_outgoing(db)
        if not account:
            print("Error: No default outgoing email account configured in the database.")
            return False

        service = account.service
        smtp_server = account.smtp_server
        smtp_port = account.smtp_port
        use_ssl = account.use_ssl
        use_tls = account.use_tls
        email_id = account.email_id
        password = account.password

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

        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            # Use the account name or fallback
            from_name = account.email_account_name or "LMS Notifications"
            message["From"] = f"{from_name} <{email_id}>"
            message["To"] = to_email

            if plain_text:
                message.attach(MIMEText(plain_text, "plain"))
            message.attach(MIMEText(html_content, "html"))

            # Send via SMTP
            if use_ssl and smtp_port == 465:
                async with aiosmtplib.SMTP(
                    hostname=smtp_server,
                    port=smtp_port,
                    use_tls=True,
                ) as smtp:
                    if password:
                        await smtp.login(smtp_user, password)
                    await smtp.sendmail(email_id, to_email, message.as_string())
            else:
                async with aiosmtplib.SMTP(
                    hostname=smtp_server,
                    port=smtp_port,
                    use_tls=False,
                ) as smtp:
                    if password:
                        await smtp.login(smtp_user, password)
                    await smtp.sendmail(email_id, to_email, message.as_string())
            return True
        except Exception as e:
            print(f"Error sending email via dynamic account: {e}")
            return False

    def _render_template(self, template_name: str, **kwargs) -> str:
        """Render email template."""
        template = self.template_env.get_template(template_name)
        return template.render(**kwargs)

    async def send_verification_email(
        self,
        to_email: str,
        otp: str,
        user_name: str,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Send email verification OTP."""
        html_content = self._render_template(
            "verify_email.html",
            user_name=user_name,
            otp=otp,
            frontend_url=self.settings.FRONTEND_URL,
        )

        plain_text = f"""
Hello {user_name},

Your email verification code is: {otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
LMS Team
        """

        return await self.send_email(
            to_email,
            "Email Verification",
            html_content,
            plain_text,
            db=db,
        )

    async def send_password_reset_email(
        self,
        to_email: str,
        otp: str,
        user_name: str,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Send password reset OTP."""
        html_content = self._render_template(
            "password_reset.html",
            user_name=user_name,
            otp=otp,
            frontend_url=self.settings.FRONTEND_URL,
        )

        plain_text = f"""
Hello {user_name},

Your password reset code is: {otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email and your password will remain unchanged.

Best regards,
LMS Team
        """

        return await self.send_email(
            to_email,
            "Password Reset Request",
            html_content,
            plain_text,
            db=db,
        )

    async def send_password_changed_email(
        self,
        to_email: str,
        user_name: str,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Send password change confirmation."""
        html_content = self._render_template(
            "password_changed.html",
            user_name=user_name,
            frontend_url=self.settings.FRONTEND_URL,
        )

        plain_text = f"""
Hello {user_name},

Your password has been changed successfully.

If you didn't make this change, please reset your password immediately.

Best regards,
LMS Team
        """

        return await self.send_email(
            to_email,
            "Password Changed",
            html_content,
            plain_text,
            db=db,
        )

    async def send_welcome_email(
        self,
        to_email: str,
        user_name: str,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Send welcome email."""
        html_content = self._render_template(
            "welcome.html",
            user_name=user_name,
            frontend_url=self.settings.FRONTEND_URL,
        )

        plain_text = f"""
Hello {user_name},

Welcome to LMS!

Your account has been created successfully. 
Verify your email to get started.

Best regards,
LMS Team
        """

        return await self.send_email(
            to_email,
            "Welcome to LMS",
            html_content,
            plain_text,
            db=db,
        )

    async def send_2fa_otp_email(
        self,
        to_email: str,
        otp: str,
        user_name: str,
        db: Optional[AsyncSession] = None,
    ) -> bool:
        """Send 2FA OTP."""
        html_content = self._render_template(
            "2fa_otp.html",
            user_name=user_name,
            otp=otp,
            frontend_url=self.settings.FRONTEND_URL,
        )

        plain_text = f"""
Hello {user_name},

Your 2FA verification code is: {otp}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
LMS Team
        """

        return await self.send_email(
            to_email,
            "2FA Verification Code",
            html_content,
            plain_text,
            db=db,
        )


# Global email service instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get email service instance."""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
