from pydantic.alias_generators import to_camel
from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class PaginationMeta(BaseModel):
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool
