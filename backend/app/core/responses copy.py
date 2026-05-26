from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import Any, Optional


def read_response(
    data: Optional[Any] = None,
    status_code: int = 200,
):
    data = jsonable_encoder(data) if data is not None else {}

    content = {
        **data,
        "success": True,
    }

    return JSONResponse(content=content, status_code=status_code)

# usage:

def cu_response(
    data: Optional[Any] = None,
    message: str = "Resource created/updated",
    status_code: int = 201,
):
    data = jsonable_encoder(data) if data is not None else {}

    content = {
        **data,
        "success": True,
        "message": message,
    }

    return JSONResponse(content=content, status_code=status_code)


def delete_response(
    message: str = "Resource deleted",
    status_code: int = 200,
):

    content = {
        "success": True,
        "message": message,
    }

    return JSONResponse(content=content, status_code=status_code)


def error_response(
    message: str = "Resource failed",
    errors: Optional[Any] = None,
    status_code: int = 400,
):

    if errors:
        return JSONResponse(
            content={
                "success": True,
                "message": message,
                "errors": errors,
            },
            status_code=status_code,
        )

    return JSONResponse(
        content={
            "success": False,
            "message": message,
        },
        status_code=status_code,
    )
