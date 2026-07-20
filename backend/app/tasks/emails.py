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
    service.run_async_task("send_verification_email", to_email, otp, user_name)


@celery_app.task(
    name="email.send_welcome",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_welcome_email(to_email: str, user_name: str):
    service = get_email_service()
    service.run_async_task("send_welcome_email", to_email, user_name)


@celery_app.task(
    name="email.send_password_reset",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_password_reset_email(to_email: str, otp: str, user_name: str):
    service = get_email_service()
    service.run_async_task("send_password_reset_email", to_email, otp, user_name)


@celery_app.task(
    name="email.send_password_changed",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_password_changed_email(to_email: str, user_name: str):
    service = get_email_service()
    service.run_async_task("send_password_changed_email", to_email, user_name)


@celery_app.task(
    name="email.send_2fa_otp",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_2fa_otp_email(to_email: str, otp: str, user_name: str):
    service = get_email_service()
    service.run_async_task("send_2fa_otp_email", to_email, otp, user_name)