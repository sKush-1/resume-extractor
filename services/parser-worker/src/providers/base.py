"""
Abstract base class for AI providers.
"""

from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Interface for AI resume data extraction providers."""

    @abstractmethod
    def extract_resume_data(self, text: str, metrics: list = None) -> str:
        """
        Send resume text to AI model and get raw response.

        Args:
            text: Extracted resume text

        Returns:
            Raw JSON string from AI model
        """
        pass
