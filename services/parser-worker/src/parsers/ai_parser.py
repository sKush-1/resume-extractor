"""
AI parser — sends resume text to AI provider and validates response.
"""

import json
from ..logger import create_logger
from .schema import CandidateData

logger = create_logger("ai-parser")


def parse_ai_response(response_text: str) -> CandidateData:
    """
    Parse and validate the AI response into a CandidateData model.

    Args:
        response_text: Raw response text from AI provider

    Returns:
        Validated CandidateData

    Raises:
        ValueError: If the response cannot be parsed
    """
    text = response_text.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        text = "\n".join(lines)

    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        logger.error("Failed to parse AI response as JSON", extra={"error": str(e)})
        raise ValueError(f"AI response is not valid JSON: {e}") from e

    candidate = CandidateData(**data)
    logger.debug("AI response validated", extra={"name": candidate.name})
    return candidate
