Install alembic:
    uv add alembic

Step 1: Initialize Alembic
    alembic init alembic
Step 2: Configure DB URL
    Edit: alembic.ini
    Add: sqlalchemy.url = postgresql://user:password@localhost:5432/db

Step 3: Link your models In: alembic/env.py
    Add:
        from app.db.base import Base
        from app.models import user  # import all models

    Change: 
        target_metadata = None
                to
        target_metadata = Base.metadata

Step 4: Create migration
    alembic revision --autogenerate -m "create users table"
Step 5: Apply migration
    alembic upgrade head
