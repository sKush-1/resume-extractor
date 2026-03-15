"""
Plain text extractor for .txt files.
Simple UTF-8 decoding with fallback to Latin-1.
"""

from ..logger import create_logger

logger = create_logger("txt-extractor")


def extract_text_from_txt(file_bytes: bytes) -> str:
    """
    Extract text content from a TXT file.

    Args:
        file_bytes: Raw bytes of the TXT file

    Returns:
        Extracted text string
    """
    try:
        # Try UTF-8 first
        full_text = file_bytes.decode("utf-8").strip()
    except UnicodeDecodeError:
        # Fallback to Latin-1 if UTF-8 fails
        logger.warning("UTF-8 decoding failed, falling back to latin-1")
        full_text = file_bytes.decode("latin-1").strip()

    if not full_text:
        raise ValueError("TXT file is empty")

    logger.debug("TXT text extracted", extra={"length": len(full_text)})
    return full_text
