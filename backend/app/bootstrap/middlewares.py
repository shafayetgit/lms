from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.project_settings import get_project_settings
from app.core.limiter import limiter


def configure_middlewares(app: FastAPI) -> None:
    # Setup Limiter state and error handler
    app.state.limiter = limiter
    
    @app.exception_handler(RateLimitExceeded)
    def rate_limit_exceeded_handler(request, exc):
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=429,
            content={"success": False, "message": "Too many requests. Please try again later."},
        )

    # Add SlowAPI middleware
    app.add_middleware(SlowAPIMiddleware)

    cors_config = get_project_settings().api.cors
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_config.allow_origins,
        allow_credentials=cors_config.allow_credentials,
        allow_methods=cors_config.allow_methods,
        allow_headers=cors_config.allow_headers,
    )

    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
