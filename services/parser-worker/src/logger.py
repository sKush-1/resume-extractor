"""
Structured logger for Python services.
Matches the JSON format used by Node.js services.
"""

import json
import logging
import sys
from datetime import datetime, timezone


class StructuredFormatter(logging.Formatter):
    """Formats log records as structured JSON matching the shared schema."""

    def __init__(self, service: str):
        super().__init__()
        self.service = service

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "service": self.service,
            "level": record.levelname.lower(),
            "message": record.getMessage(),
        }

        # Include extra metadata if present
        metadata = {}
        for key, value in record.__dict__.items():
            if key not in logging.LogRecord.__dict__ and key not in (
                "message", "msg", "args", "levelname", "levelno",
                "pathname", "filename", "module", "lineno", "funcName",
                "created", "msecs", "relativeCreated", "thread",
                "threadName", "processName", "process", "exc_info",
                "exc_text", "stack_info", "name",
            ):
                metadata[key] = value

        if metadata:
            log_entry["metadata"] = metadata

        if record.exc_info and record.exc_info[1]:
            log_entry["metadata"] = log_entry.get("metadata", {})
            log_entry["metadata"]["stack"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def create_logger(service: str, level: str = "INFO") -> logging.Logger:
    """
    Create a structured JSON logger.

    Args:
        service: Service name for log identification
        level: Log level string

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(service)
    logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Avoid duplicate handlers
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredFormatter(service))
        logger.addHandler(handler)

    return logger
