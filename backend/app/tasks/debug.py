import time

from celery import shared_task

from app.core.celery import celery_app as _celery_app  # noqa: F401


@shared_task(name="app.tasks.debug.ping")
def ping() -> str:
    return "pong"


@shared_task(name="app.tasks.debug.sleep")
def sleep(seconds: int = 1) -> dict:
    started_at = time.time()
    time.sleep(max(0, int(seconds)))
    return {"slept": max(0, int(seconds)), "elapsed": time.time() - started_at}
