"""
Email Service
Handles sending emails via SMTP or SendGrid.
"""

from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from jinja2 import Environment, FileSystemLoader
from pathlib import Path

from app.core.config import init_settings


class EmailService:
    """Service for sending emails via SMTP or SendGrid."""

    def __init__(self):
        self.settings = init_settings()
        self.provider = self.settings.EMAIL_PROVIDER.lower()

        template_dir = Path(__file__).parent.parent / "templates" / "emails"
        self.template_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=True,
        )

        if self.provider == "sendgrid":
            self._init_sendgrid()

    def _init_sendgrid(self):
        try:
            from sendgrid import SendGridAPIClient

            self.sg_client = SendGridAPIClient(self.settings.SENDGRID_API_KEY)
        except ImportError:
            raise ImportError(
                "sendgrid package is required. Install it with: pip install sendgrid"
            )

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None,
    ) -> bool:
        try:
            if self.provider == "smtp":
                return self._send_smtp_email(
                    to_email, subject, html_content, plain_text
                )
            elif self.provider == "sendgrid":
                return self._send_sendgrid_email(
                    to_email, subject, html_content, plain_text
                )
            else:
                raise ValueError(f"Unsupported email provider: {self.provider}")
        except Exception as e:
            print(f"Error sending email: {e}")
            return False

    def _send_smtp_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None,
    ) -> bool:
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = (
                f"{self.settings.EMAILS_FROM_NAME} <{self.settings.EMAILS_FROM_EMAIL}>"
            )
            message["To"] = to_email

            if plain_text:
                message.attach(MIMEText(plain_text, "plain"))

            message.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(
                self.settings.SMTP_HOST,
                self.settings.SMTP_PORT,
            ) as smtp:
                smtp.starttls()
                smtp.login(
                    self.settings.SMTP_USER,
                    self.settings.SMTP_PASSWORD,
                )
                smtp.send_message(message)

            return True
        except Exception as e:
            print(f"SMTP email error: {e}")
            return False

    def _send_sendgrid_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_text: Optional[str] = None,
    ) -> bool:
        try:
            from sendgrid.helpers.mail import Mail, Email, To

            message = Mail(
                from_email=Email(
                    self.settings.EMAILS_FROM_EMAIL,
                    self.settings.EMAILS_FROM_NAME,
                ),
                to_emails=To(to_email),
                subject=subject,
                plain_text_content=plain_text or "",
                html_content=html_content,
            )

            response = self.sg_client.send(message)
            return 200 <= response.status_code < 300
        except Exception as e:
            print(f"SendGrid email error: {e}")
            return False

    def _render_template(self, template_name: str, **kwargs) -> str:
        template = self.template_env.get_template(template_name)
        return template.render(**kwargs)

    def send_verification_email(
        self,
        to_email: str,
        otp: str,
        user_name: str,
    ) -> bool:
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

        return self.send_email(
            to_email,
            "Email Verification",
            html_content,
            plain_text,
        )

    def send_password_reset_email(
        self,
        to_email: str,
        otp: str,
        user_name: str,
    ) -> bool:
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

If you didn't request this, please ignore this email.

Best regards,
LMS Team
        """

        return self.send_email(
            to_email,
            "Password Reset Request",
            html_content,
            plain_text,
        )

    def send_password_changed_email(
        self,
        to_email: str,
        user_name: str,
    ) -> bool:
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

        return self.send_email(
            to_email,
            "Password Changed",
            html_content,
            plain_text,
        )

    def send_welcome_email(
        self,
        to_email: str,
        user_name: str,
    ) -> bool:
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

        return self.send_email(
            to_email,
            "Welcome to LMS",
            html_content,
            plain_text,
        )

    def send_2fa_otp_email(
        self,
        to_email: str,
        otp: str,
        user_name: str,
    ) -> bool:
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

        return self.send_email(
            to_email,
            "2FA Verification Code",
            html_content,
            plain_text,
        )


_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
