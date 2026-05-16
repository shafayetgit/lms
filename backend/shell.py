from sqlalchemy import select, update, delete, func

from app.db.session import get_session_maker
from app import models

from IPython import start_ipython


SessionLocal = get_session_maker()


def main():
    db = SessionLocal()

    print("⚡ SQLAlchemy Shell Loaded")

    user_ns = {
        "db": db,
        "select": select,
        "update": update,
        "delete": delete,
        "func": func,
    }

    user_ns.update({
        name: getattr(models, name)
        for name in dir(models)
        if not name.startswith("_")
    })

    start_ipython(argv=[], user_ns=user_ns)


if __name__ == "__main__":
    main()
    
# Usage:
#     uv run python -m shell 