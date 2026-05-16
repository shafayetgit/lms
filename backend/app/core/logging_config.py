import logging
import logging.handlers
import os
from pathlib import Path
from app.core.config import Settings


def setup_logging(settings: Settings) -> None:
    """
    Configure logging to write to console and optionally to files.
    
    Set ENABLE_FILE_LOGGING=true in .env to enable file logging.
    By default, only console logging is enabled.
    
    Args:
        settings: Application settings
    """
    # Check if file logging is enabled via environment variable
    enable_file_logging = os.getenv("ENABLE_FILE_LOGGING", "false").lower() == "true"
    
    # Get root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Log format
    log_format = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Console handler (always enabled)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
    console_handler.setFormatter(log_format)
    root_logger.addHandler(console_handler)
    
    # File handlers (only if enabled)
    if enable_file_logging:
        # Create logs directory if it doesn't exist
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # File handler - General logs
        file_handler = logging.handlers.RotatingFileHandler(
            filename=log_dir / "app.log",
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=10,  # Keep 10 backup files
        )
        file_handler.setLevel(logging.DEBUG if settings.DEBUG else logging.INFO)
        file_handler.setFormatter(log_format)
        root_logger.addHandler(file_handler)
        
        # File handler - Error logs
        error_handler = logging.handlers.RotatingFileHandler(
            filename=log_dir / "error.log",
            maxBytes=10 * 1024 * 1024,  # 10 MB
            backupCount=10,  # Keep 10 backup files
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(log_format)
        root_logger.addHandler(error_handler)
        
        # File handler - Debug logs (only in debug mode)
        if settings.DEBUG:
            debug_handler = logging.handlers.RotatingFileHandler(
                filename=log_dir / "debug.log",
                maxBytes=10 * 1024 * 1024,  # 10 MB
                backupCount=5,
            )
            debug_handler.setLevel(logging.DEBUG)
            debug_handler.setFormatter(log_format)
            root_logger.addHandler(debug_handler)
