from __future__ import annotations
from celery import Celery
from app.core.config import init_settings


def _build_celery_app() -> Celery:
    settings = init_settings()

    celery_app = Celery(
        "app",
        broker=settings.CELERY_BROKER_URL or settings.REDIS_URL,
        backend=settings.CELERY_RESULT_BACKEND or settings.REDIS_URL,
        include=["app.tasks"],  # explicit task module list
    )

    celery_app.conf.update(
        timezone=settings.CELERY_TIMEZONE,
        enable_utc=True,
        accept_content=["json"],
        task_serializer="json",
        result_serializer="json",
        broker_connection_retry_on_startup=True,
        task_track_started=True,
        task_always_eager=settings.CELERY_TASK_ALWAYS_EAGER,
        task_eager_propagates=settings.CELERY_TASK_EAGER_PROPAGATES,
        # production stability
        task_acks_late=True,
        worker_prefetch_multiplier=1,
        task_reject_on_worker_lost=True,
    )

    return celery_app


celery_app: Celery = _build_celery_app()
__all__ = ["celery_app"]
