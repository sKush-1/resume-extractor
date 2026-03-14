"""
Configuration loader for parser worker.
Reads from environment variables with dotenv fallback.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from monorepo root
_env_path = Path(__file__).resolve().parent.parent.parent.parent / ".env"
load_dotenv(_env_path)


def _require(key: str) -> str:
    """Get a required environment variable or raise."""
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Missing required environment variable: {key}")
    return value


def _get(key: str, default: str = "") -> str:
    """Get an optional environment variable."""
    return os.getenv(key, default)


# ─── Database ─────────────────────────────────────────

DATABASE_URL = _require("DATABASE_URL")

# ─── Redis ────────────────────────────────────────────

REDIS_URL = _require("REDIS_URL")

# ─── Storage ──────────────────────────────────────────

S3_ENDPOINT = _get("S3_ENDPOINT")
S3_BUCKET = _require("S3_BUCKET")
S3_ACCESS_KEY = _require("S3_ACCESS_KEY")
S3_SECRET_KEY = _require("S3_SECRET_KEY")
S3_REGION = _get("S3_REGION", "us-east-1")
S3_FORCE_PATH_STYLE = _get("S3_FORCE_PATH_STYLE", "false").lower() == "true"

# ─── AI Provider ──────────────────────────────────────

AI_PROVIDER = _get("AI_PROVIDER", "ollama")
OLLAMA_BASE_URL = _get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = _get("OLLAMA_MODEL", "llama3.1")
OPENAI_API_KEY = _get("OPENAI_API_KEY")
OPENAI_MODEL = _get("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_API_KEY = _get("GEMINI_API_KEY")
GEMINI_MODEL = _get("GEMINI_MODEL", "gemini-1.5-flash")

# ─── Worker ───────────────────────────────────────────

WORKER_CONCURRENCY = int(_get("WORKER_CONCURRENCY", "4"))
MAX_RETRIES = int(_get("MAX_RETRIES", "3"))
LOG_LEVEL = _get("LOG_LEVEL", "INFO")
