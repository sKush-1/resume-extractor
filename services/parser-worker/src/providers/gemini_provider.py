"""
Google Gemini API provider adapter.
"""

import requests
from .base import AIProvider
from .ollama_provider import EXTRACTION_SYSTEM_PROMPT
from ..logger import create_logger
from ..config import AI_TIMEOUT

logger = create_logger("gemini-provider")


class GeminiProvider(AIProvider):
    """Google Gemini API provider."""

    def __init__(self, api_key: str, model: str):
        self._api_key = api_key
        self._model = model

    def extract_resume_data(self, text: str) -> str:
        """Send text to Gemini for parsing."""
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self._model}:generateContent?key={self._api_key}"
        )

        prompt = f"{EXTRACTION_SYSTEM_PROMPT}\n\nExtract structured data from this resume:\n\n{text}"

        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "responseMimeType": "application/json",
                },
            },
            timeout=AI_TIMEOUT,
        )

        response.raise_for_status()
        result = response.json()
        content = (
            result.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        logger.debug("Gemini response received", extra={"model": self._model})
        return content
