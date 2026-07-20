from fastapi import FastAPI

from app.api.v1.api import api_router
from app.core.project_settings import get_project_settings


def configure_routes(app: FastAPI) -> None:
    prefix = get_project_settings().api.prefix
    app.include_router(api_router, prefix=f"{prefix}/v1")

    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint."""
        ps = get_project_settings()
        return {
            "status": "healthy",
            "version": ps.api.version,
            "project": ps.project.name,
        }
