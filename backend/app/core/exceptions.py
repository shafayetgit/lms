from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

FIELD_MAP = {}

def to_camel_case(snake_str: str) -> str:
    if not isinstance(snake_str, str):
        return snake_str
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])


def register_exception_handlers(app):

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "message": exc.detail,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ):
        errors = []

        for err in exc.errors():
            raw_field = err["loc"][-1]

            field = FIELD_MAP.get(raw_field, to_camel_case(raw_field))

            errors.append(
                {
                    "field": field,
                    "message": err["msg"],
                    "type": err["type"],
                }
            )

        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "message": "Validation error",
                "errors": errors,
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
            },
        )
