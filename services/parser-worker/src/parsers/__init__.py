"""Parsers package."""

from .ai_parser import parse_ai_response
from .schema import CandidateData

__all__ = ["parse_ai_response", "CandidateData"]
