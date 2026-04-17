from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import Any, Optional



def success_response(
    data: Optional[Any] = None,
    message: str = "Operation successful",
    status_code: int = 200,
):
    data = jsonable_encoder(data) if data is not None else {}
    
    content = {
        **data,
        "status": "success",
        "message": message,
    }

    return JSONResponse(content=content, status_code=status_code)

# usage: return success_response(user, "User registered successfully", 201)


def error_response(
    message: str = "Operation failed",
    errors: Optional[Any] = None,
    status_code: int = 500,
):
    return JSONResponse(
        content={
            "message": message,
            "errors": errors,
        },
        status_code=status_code,
    )
