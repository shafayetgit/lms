from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import Any, Optional
from datetime import datetime

# ============================================
# RESPONSE HANDLERS
# ============================================


def read_response(
    data: Optional[Any] = None,
    status_code: int = 200,
):
    """Response for GET single/multiple resource"""
    data = jsonable_encoder(data) if data is not None else {}
    content = {
        "success": True,
        **data,
    }
    return JSONResponse(content=content, status_code=status_code)


def create_response(
    data: Optional[Any] = None,
    message: str = "Resource created successfully",
    status_code: int = 201,
):
    """Response for POST (Create)"""
    data = jsonable_encoder(data) if data is not None else {}
    content = {
        "success": True,
        **data,
        "message": message,
    }
    return JSONResponse(content=content, status_code=status_code)


def update_response(
    data: Optional[Any] = None,
    message: str = "Resource updated successfully",
    status_code: int = 200,
):
    """Response for PATCH/PUT (Update)"""
    data = jsonable_encoder(data) if data is not None else {}
    content = {
        "success": True,
        **data,
        "message": message,
    }
    return JSONResponse(content=content, status_code=status_code)


def delete_response(
    message: str = "Resource deleted successfully",
    status_code: int = 200,
):
    """Response for DELETE"""
    content = {
        "success": True,
        "message": message,
    }
    return JSONResponse(content=content, status_code=status_code)


def error_response(
    message: str = "An error occurred",
    errors: Optional[Any] = None,
    error_code: str = "ERROR",
    status_code: int = 400,
):
    """Response for errors"""
    content = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
        },
    }
    if errors:
        content["error"]["details"] = errors

    return JSONResponse(content=content, status_code=status_code)

