from contextvars import ContextVar
from typing import Optional

# Context variable to hold the current authenticated user's ID
current_user_id: ContextVar[Optional[int]] = ContextVar("current_user_id", default=None)
