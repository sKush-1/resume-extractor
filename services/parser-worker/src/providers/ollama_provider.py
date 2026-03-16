"""
Ollama AI provider adapter.
Calls the Ollama HTTP API for local LLM inference.
"""

import requests
from .base import AIProvider
from .prompt_builder import build_extraction_prompt
from ..logger import create_logger
from ..config import AI_TIMEOUT

logger = create_logger("ollama-provider")


class OllamaProvider(AIProvider):
    """Ollama local LLM provider."""

    def __init__(self, base_url: str, model: str):
        self._base_url = base_url.rstrip("/")
        self._model = model

    def extract_resume_data(self, text: str, metrics: list = None) -> str:
        """Send text to Ollama for parsing."""
        response = requests.post(
            f"{self._base_url}/api/chat",
            json={
                "model": self._model,
                "messages": [
                    {"role": "system", "content": build_extraction_prompt(metrics)},
                    {"role": "user", "content": f"Extract structured data from this resume:\n\n{text}"},
                ],
                "stream": False,
                "format": "json",
            },
            timeout=AI_TIMEOUT,
        )

        response.raise_for_status()
        result = response.json()
        content = result.get("message", {}).get("content", "")

        logger.debug("Ollama response received", extra={"model": self._model})
        return content
