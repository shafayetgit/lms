from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

FIELD_MAP = {
    "first_name": "firstName",
    "last_name": "lastName",
    "confirm_password": "confirmPassword",
}


def to_camel_case(s):
    if not isinstance(s, str):
        return str(s)
    parts = s.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


def register_exception_handlers(app):

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status": "error",
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
                "status": "error",
                "message": "Validation error",
                "errors": errors,
            },
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Internal server error",
            },
        )
