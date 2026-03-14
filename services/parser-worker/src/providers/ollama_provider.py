"""
Ollama AI provider adapter.
Calls the Ollama HTTP API for local LLM inference.
"""

import requests
from .base import AIProvider
from ..logger import create_logger

logger = create_logger("ollama-provider")

EXTRACTION_SYSTEM_PROMPT = """You are a resume data extraction assistant.
Extract structured information from the given resume text.
You MUST respond with ONLY valid JSON matching this exact schema:

{
  "name": "string (full name)",
  "email": "string (email address or empty string)",
  "phone": "string (phone number or empty string)",
  "skills": ["array of skill strings"],
  "experience_years": "string (total years of experience, e.g. '5' or '3-5')",
  "education": ["array of education entries, e.g. 'B.Tech in Computer Science, XYZ University, 2020'"],
  "companies": ["array of company names the candidate has worked at"],
  "location": "string (city/state/country or empty string)"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation.
- If a field cannot be determined, use empty string or empty array.
- Skills should be individual skill names, not sentences.
- Companies should be just company names.
- Experience years should be a number or range."""


class OllamaProvider(AIProvider):
    """Ollama local LLM provider."""

    def __init__(self, base_url: str, model: str):
        self._base_url = base_url.rstrip("/")
        self._model = model

    def extract_resume_data(self, text: str) -> str:
        """Send text to Ollama for parsing."""
        response = requests.post(
            f"{self._base_url}/api/chat",
            json={
                "model": self._model,
                "messages": [
                    {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Extract structured data from this resume:\n\n{text}"},
                ],
                "stream": False,
                "format": "json",
            },
            timeout=120,
        )

        response.raise_for_status()
        result = response.json()
        content = result.get("message", {}).get("content", "")

        logger.debug("Ollama response received", extra={"model": self._model})
        return content
