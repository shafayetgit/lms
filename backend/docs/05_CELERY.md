# Celery (Background Tasks)

This project uses Celery + Redis to run background jobs (emails, long-running work) outside the FastAPI request/response cycle.

## Environment Variables

Add to `.env` (or set via Docker):

```env
REDIS_URL=redis://localhost:6379/0

# Enable enqueueing tasks from the API process
CELERY_ENABLED=True

# Optional (defaults to REDIS_URL)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

CELERY_TIMEZONE=UTC
```

Development-only (no broker needed):

```env
CELERY_TASK_ALWAYS_EAGER=True
CELERY_TASK_EAGER_PROPAGATES=True
```

## Run Worker (Local)

From repo root:

```bash
bash app/worker/start_worker.sh
```

## Run Beat (Local)

```bash
bash app/worker/start_beat.sh
```

Note: beat only runs periodic schedules. If you have no schedules configured, it will idle (this is normal).

## Run With Docker Compose

```bash
docker-compose up --build
```

This starts:
- `redis` (broker/backend)
- `db` (PostgreSQL)
- `backend` (FastAPI)
- `worker` (Celery worker)
- `beat` (Celery beat)

## Smoke Test Tasks

With worker running:

```bash
python -c "from app.tasks.debug import ping; r = ping.delay(); print(r.get(timeout=10))"
```

## Where Tasks Live

- Celery app: `app/core/celery.py`
- Tasks package: `app/tasks/`

Email-related tasks are implemented in `app/tasks/emails.py` and used by the auth endpoints when `CELERY_ENABLED=True`.

