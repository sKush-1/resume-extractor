"""
OpenAI API provider adapter.
"""

import requests
from .base import AIProvider
from .ollama_provider import EXTRACTION_SYSTEM_PROMPT
from ..logger import create_logger
from ..config import AI_TIMEOUT

logger = create_logger("openai-provider")


class OpenAIProvider(AIProvider):
    """OpenAI chat completions provider."""

    def __init__(self, api_key: str, model: str):
        self._api_key = api_key
        self._model = model

    def extract_resume_data(self, text: str) -> str:
        """Send text to OpenAI for parsing."""
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._api_key}",
            },
            json={
                "model": self._model,
                "messages": [
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Extract structured data from this resume:\n\n{text}"},
                ],
                "temperature": 0.1,
                "response_format": {"type": "json_object"},
            },
            timeout=AI_TIMEOUT,
        )

        response.raise_for_status()
        result = response.json()
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "")

        logger.debug("OpenAI response received", extra={"model": self._model})
        return content
