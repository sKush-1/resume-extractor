"""
Tests for AI response parsing and Pydantic schema validation.
"""

import json
import pytest
from src.parsers.schema import CandidateData
from src.parsers.ai_parser import parse_ai_response


class TestCandidateDataSchema:
    """Tests for CandidateData Pydantic model."""

    def test_valid_complete_data(self):
        data = CandidateData(
            name="John Doe",
            email="john@example.com",
            phone="+1234567890",
            skills=["Python", "JavaScript"],
            experience_years="5",
            education=["B.Tech in CS, MIT, 2018"],
            companies=["Google", "Meta"],
            location="San Francisco, CA",
        )
        assert data.name == "John Doe"
        assert len(data.skills) == 2

    def test_defaults_for_empty_fields(self):
        data = CandidateData()
        assert data.name == ""
        assert data.skills == []
        assert data.experience_years == ""

    def test_coerces_none_to_empty_string(self):
        data = CandidateData(name=None, email=None)
        assert data.name == ""
        assert data.email == ""

    def test_coerces_non_string_list_items(self):
        data = CandidateData(skills=[1, 2, "Python"])
        assert data.skills == ["1", "2", "Python"]


class TestParseAIResponse:
    """Tests for parse_ai_response function."""

    def test_valid_json_response(self):
        response = json.dumps({
            "name": "Jane Smith",
            "email": "jane@test.com",
            "phone": "555-0100",
            "skills": ["React", "Node.js"],
            "experience_years": "3",
            "education": ["BS Computer Science"],
            "companies": ["Startup Inc"],
            "location": "New York",
        })
        result = parse_ai_response(response)
        assert result.name == "Jane Smith"
        assert "React" in result.skills

    def test_strips_markdown_fences(self):
        response = '```json\n{"name": "Test User"}\n```'
        result = parse_ai_response(response)
        assert result.name == "Test User"

    def test_raises_on_invalid_json(self):
        with pytest.raises(ValueError, match="not valid JSON"):
            parse_ai_response("not json at all")

    def test_handles_extra_whitespace(self):
        response = '  \n  {"name": "Spacey User"}  \n  '
        result = parse_ai_response(response)
        assert result.name == "Spacey User"
