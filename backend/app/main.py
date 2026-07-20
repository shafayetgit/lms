import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.bootstrap.middlewares import configure_middlewares
from app.bootstrap.routes import configure_routes
from app.core.config import init_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import setup_logging
from app.core.project_settings import get_project_settings

settings = init_settings()
project_settings = get_project_settings()

setup_logging(settings)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {project_settings.project.name}")
    yield
    logger.info(f"Shutting down {project_settings.project.name}")
    from app.core.redis import RedisManager
    await RedisManager.close()


app = FastAPI(
    title=project_settings.api.title,
    description=project_settings.api.description,
    version=project_settings.api.version,
    lifespan=lifespan,
    swagger_ui_parameters={"docExpansion": "none"},
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
)

configure_middlewares(app)
configure_routes(app)
register_exception_handlers(app)
