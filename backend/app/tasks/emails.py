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
    service.send_verification_email(to_email, otp, user_name)


@celery_app.task(
    name="email.send_welcome",
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def send_welcome_email(to_email: str, user_name: str):
    service = get_email_service()
    service.send_welcome_email(to_email, user_name)