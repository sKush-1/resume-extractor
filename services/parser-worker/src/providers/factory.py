"""
Provider factory — creates AI provider based on config.
"""

from .base import AIProvider
from .ollama_provider import OllamaProvider
from .openai_provider import OpenAIProvider
from .gemini_provider import GeminiProvider
from .. import config


def create_ai_provider() -> AIProvider:
    """
    Create an AI provider instance based on environment configuration.

    Returns:
        AIProvider implementation

    Raises:
        ValueError: If the provider is unknown or missing required config
    """
    provider = config.AI_PROVIDER.lower()

    if provider == "ollama":
        return OllamaProvider(config.OLLAMA_BASE_URL, config.OLLAMA_MODEL)

    if provider == "openai":
        if not config.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required when AI_PROVIDER=openai")
        return OpenAIProvider(config.OPENAI_API_KEY, config.OPENAI_MODEL)

    if provider == "gemini":
        if not config.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is required when AI_PROVIDER=gemini")
        return GeminiProvider(config.GEMINI_API_KEY, config.GEMINI_MODEL)

    raise ValueError(f"Unknown AI provider: {provider}")
