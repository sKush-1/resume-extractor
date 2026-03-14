"""
Excel exporter — generates Excel files from candidate data using pandas.
"""

import io
import pandas as pd
import boto3
from botocore.config import Config as BotoConfig

from . import config
from .db import get_candidates_by_batch, update_batch_export

import json
import logging
import sys
from datetime import datetime, timezone


class StructuredFormatter(logging.Formatter):
    def __init__(self, service: str):
        super().__init__()
        self.service = service

    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z",
            "service": self.service,
            "level": record.levelname.lower(),
            "message": record.getMessage(),
        }
        return json.dumps(entry)


def _create_logger(service: str) -> logging.Logger:
    logger = logging.getLogger(service)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(StructuredFormatter(service))
        logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger


logger = _create_logger("exporter")


def _create_s3_client():
    """Create S3 client for uploading exports."""
    kwargs = {
        "service_name": "s3",
        "region_name": config.S3_REGION,
        "aws_access_key_id": config.S3_ACCESS_KEY,
        "aws_secret_access_key": config.S3_SECRET_KEY,
    }
    if config.S3_ENDPOINT:
        kwargs["endpoint_url"] = config.S3_ENDPOINT

    boto_config = None
    if config.S3_FORCE_PATH_STYLE:
        boto_config = BotoConfig(s3={"addressing_style": "path"})

    return boto3.client(**kwargs, config=boto_config)


def _format_array_field(value) -> str:
    """Convert a PostgreSQL array to a comma-separated string."""
    if isinstance(value, list):
        return ", ".join(str(v) for v in value if v)
    return str(value) if value else ""


def generate_and_upload_excel(conn, batch_id: str) -> str:
    """
    Generate an Excel file for a batch and upload to S3.

    Args:
        conn: DB connection
        batch_id: UUID of the batch

    Returns:
        S3 object key of the uploaded Excel file
    """
    # 1. Fetch candidates
    candidates = get_candidates_by_batch(conn, batch_id)

    if not candidates:
        logger.warning("No completed candidates for batch", extra={"batch_id": batch_id})
        raise ValueError(f"No completed candidates for batch {batch_id}")

    # 2. Build DataFrame
    rows = []
    for c in candidates:
        rows.append({
            "Name": c["name"],
            "Email": c["email"],
            "Phone": c["phone"],
            "Skills": _format_array_field(c["skills"]),
            "Experience": c["experience_years"],
            "Education": _format_array_field(c["education"]),
            "Companies": _format_array_field(c["companies"]),
            "Location": c["location"],
        })

    df = pd.DataFrame(rows)

    # 3. Write to Excel in memory
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Candidates")
    buffer.seek(0)

    # 4. Upload to S3
    export_key = f"exports/{batch_id}/candidates.xlsx"
    s3 = _create_s3_client()
    s3.put_object(
        Bucket=config.S3_BUCKET,
        Key=export_key,
        Body=buffer.getvalue(),
        ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )

    # 5. Update batch record
    update_batch_export(conn, batch_id, export_key)

    logger.info("Excel exported", extra={
        "batch_id": batch_id,
        "rows": len(rows),
        "key": export_key,
    })

    return export_key
