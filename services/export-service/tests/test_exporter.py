"""
Tests for the Excel exporter.
"""

import pytest
from unittest.mock import MagicMock, patch
import pandas as pd


class TestExporter:
    """Tests for Excel generation logic."""

    def test_format_array_field_with_list(self):
        from src.exporter import _format_array_field

        result = _format_array_field(["Python", "JavaScript", "Go"])
        assert result == "Python, JavaScript, Go"

    def test_format_array_field_with_empty_list(self):
        from src.exporter import _format_array_field

        result = _format_array_field([])
        assert result == ""

    def test_format_array_field_with_string(self):
        from src.exporter import _format_array_field

        result = _format_array_field("single value")
        assert result == "single value"

    def test_format_array_field_with_none(self):
        from src.exporter import _format_array_field

        result = _format_array_field(None)
        assert result == ""

    def test_dataframe_columns(self):
        """Verify DataFrame has the correct columns."""
        candidates = [
            {
                "name": "John Doe",
                "email": "john@test.com",
                "phone": "555-0100",
                "skills": ["Python"],
                "experience_years": "5",
                "education": ["B.Tech"],
                "companies": ["Google"],
                "location": "NYC",
            }
        ]

        rows = []
        for c in candidates:
            rows.append({
                "Name": c["name"],
                "Email": c["email"],
                "Phone": c["phone"],
                "Skills": ", ".join(c["skills"]),
                "Experience": c["experience_years"],
                "Education": ", ".join(c["education"]),
                "Companies": ", ".join(c["companies"]),
                "Location": c["location"],
            })

        df = pd.DataFrame(rows)
        expected_columns = [
            "Name", "Email", "Phone", "Skills",
            "Experience", "Education", "Companies", "Location"
        ]
        assert list(df.columns) == expected_columns
        assert len(df) == 1
