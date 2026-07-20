
from pydantic.alias_generators import to_camel
from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
    )

class PaginationMeta(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

