"""
Pydantic schema for validating AI-extracted candidate data.
"""

from pydantic import BaseModel, field_validator


class CandidateData(BaseModel):
    """Schema for structured resume data extracted by AI."""

    name: str = ""
    email: str = ""
    phone: str = ""
    skills: list[str] = []
    experience_years: str = ""
    education: list[str] = []
    companies: list[str] = []
    location: str = ""

    @field_validator("skills", "education", "companies", mode="before")
    @classmethod
    def ensure_list_of_strings(cls, v):
        """Ensure array fields contain only strings."""
        if isinstance(v, list):
            return [str(item) for item in v if item]
        if isinstance(v, str):
            return [v] if v else []
        return []

    @field_validator("name", "email", "phone", "experience_years", "location", mode="before")
    @classmethod
    def ensure_string(cls, v):
        """Ensure string fields are strings."""
        if v is None:
            return ""
        return str(v)
