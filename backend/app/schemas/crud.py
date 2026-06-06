from app.core.base import BaseSchema
from pydantic import BaseModel
from typing import Any, Literal


class FilterRule(BaseSchema):
    field: str

    operator: Literal[
        "eq",
        "ne",
        "gt",
        "gte",
        "lt",
        "lte",
        "like",
        "in",
    ]

    value: Any


class DeleteSchema(BaseSchema):
    model: str
    filters: list[FilterRule]


class DeleteResponse(BaseSchema):
    success: bool = True
    message: str = "Resource(s) deleted successfully"