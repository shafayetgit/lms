import asyncio
from app.core.celery import celery_app
from app.services.email import get_email_service


@celery_app.task(
    name="email.send_verification",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_verification_email(to_email: str, otp: str, user_name: str):
    service = get_email_service()
    res = service.run_async_task("send_verification_email", to_email, otp, user_name)
    if res is False:
        raise RuntimeError(f"Failed to send verification email to {to_email}")


@celery_app.task(
    name="email.send_welcome",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_welcome_email(to_email: str, user_name: str):
    service = get_email_service()
    res = service.run_async_task("send_welcome_email", to_email, user_name)
    if res is False:
        raise RuntimeError(f"Failed to send welcome email to {to_email}")


@celery_app.task(
    name="email.send_password_reset",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_password_reset_email(to_email: str, otp: str, user_name: str):
    service = get_email_service()
    res = service.run_async_task("send_password_reset_email", to_email, otp, user_name)
    if res is False:
        raise RuntimeError(f"Failed to send password reset email to {to_email}")


@celery_app.task(
    name="email.send_password_changed",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_password_changed_email(to_email: str, user_name: str):
    service = get_email_service()
    res = service.run_async_task("send_password_changed_email", to_email, user_name)
    if res is False:
        raise RuntimeError(f"Failed to send password changed email to {to_email}")


@celery_app.task(
    name="email.send_2fa_otp",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_2fa_otp_email(to_email: str, otp: str, user_name: str):
    service = get_email_service()
    res = service.run_async_task("send_2fa_otp_email", to_email, otp, user_name)
    if res is False:
        raise RuntimeError(f"Failed to send 2FA OTP email to {to_email}")


@celery_app.task(
    name="email.send_invitation",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_invitation_email(to_email: str, role_name: str, inviter_name: str, invitation_code: str = None):
    service = get_email_service()
    res = service.run_async_task("send_invitation_email", to_email, role_name, inviter_name, invitation_code)
    if res is False:
        raise RuntimeError(f"Failed to send invitation email to {to_email}")