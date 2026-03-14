"""
Extractor factory - selects the right extractor based on file type.
"""

from .pdf_extractor import extract_text_from_pdf
from .docx_extractor import extract_text_from_docx


def extract_text(file_bytes: bytes, file_type: str) -> str:
    """
    Extract text from a resume file.

    Args:
        file_bytes: Raw file content
        file_type: File extension without dot ('pdf' or 'docx')

    Returns:
        Extracted text

    Raises:
        ValueError: If the file type is unsupported
    """
    extractors = {
        "pdf": extract_text_from_pdf,
        "docx": extract_text_from_docx,
    }

    extractor = extractors.get(file_type.lower())
    if not extractor:
        raise ValueError(f"Unsupported file type: {file_type}")

    return extractor(file_bytes)
