import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.config import init_settings
from app.core.exceptions import register_exception_handlers
from app.core.project_settings import get_project_settings

# Initialize settings
settings = init_settings()
project_settings = get_project_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    logger.info(f"Starting {project_settings.project.name}")
    logger.info(
        f"Features enabled: 2FA={project_settings.features.two_factor_auth.enabled}, "
        f"SMS={project_settings.features.sms.enabled}"
    )
    yield
    # Shutdown event
    logger.info(f"Shutting down {project_settings.project.name}")


# Create FastAPI app with lifespan
app = FastAPI(
    title=project_settings.api.title,
    description=project_settings.api.description,
    version=project_settings.api.version,
    lifespan=lifespan,
)

# Add CORS middleware with project settings
cors_config = project_settings.api.cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_config.allow_origins,
    allow_credentials=cors_config.allow_credentials,
    allow_methods=cors_config.allow_methods,
    allow_headers=cors_config.allow_headers,
)

# Include routers
app.include_router(api_router, prefix=f"{project_settings.api.prefix}/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": project_settings.api.version,
        "project": project_settings.project.name,
    }


# Exception handlers
register_exception_handlers(app)