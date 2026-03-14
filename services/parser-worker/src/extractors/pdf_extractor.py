"""
PDF text extractor using PyMuPDF (fitz).
Fast and reliable extraction from PDF files.
"""

import fitz  # PyMuPDF

from ..logger import create_logger

logger = create_logger("pdf-extractor")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract text content from a PDF file.

    Args:
        file_bytes: Raw bytes of the PDF file

    Returns:
        Extracted text string

    Raises:
        ValueError: If the PDF is empty or unreadable
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text("text")
            if page_text.strip():
                text_parts.append(page_text)

        doc.close()

        full_text = "\n".join(text_parts).strip()

        if not full_text:
            raise ValueError("PDF contains no extractable text")

        logger.debug("PDF text extracted", extra={"length": len(full_text)})
        return full_text

    except fitz.FileDataError as e:
        raise ValueError(f"Invalid or corrupted PDF: {e}") from e
