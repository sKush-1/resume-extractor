"""
Configuration loader for export service.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(_env_path)


def _require(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Missing required environment variable: {key}")
    return value


def _get(key: str, default: str = "") -> str:
    return os.getenv(key, default)


DATABASE_URL = _require("DATABASE_URL")
REDIS_URL = _require("REDIS_URL")

S3_ENDPOINT = _get("S3_ENDPOINT")
S3_BUCKET = _require("S3_BUCKET")
S3_ACCESS_KEY = _require("S3_ACCESS_KEY")
S3_SECRET_KEY = _require("S3_SECRET_KEY")
S3_REGION = _get("S3_REGION", "us-east-1")
S3_FORCE_PATH_STYLE = _get("S3_FORCE_PATH_STYLE", "false").lower() == "true"

LOG_LEVEL = _get("LOG_LEVEL", "INFO")
