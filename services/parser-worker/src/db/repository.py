"""
Database repository for storing parsed candidate data.
"""

import psycopg2
import psycopg2.extras
import json
from .. import config
from ..logger import create_logger

logger = create_logger("db-repository")


def create_connection():
    """Create a database connection."""
    return psycopg2.connect(config.DATABASE_URL)


def update_candidate_data(conn, candidate_id: str, data: dict):
    """
    Update a candidate record with parsed resume data.

    Args:
        conn: psycopg2 connection
        candidate_id: UUID of the candidate record
        data: Parsed candidate data dict
    """
    # Normalize keys to match DB columns
    lowered_data = {k.strip().lower(): v for k, v in data.items()}
    
    # Extract standard fields
    name = str(lowered_data.get("name", ""))
    email = str(lowered_data.get("email", ""))
    phone = str(lowered_data.get("phone", ""))
    location = str(lowered_data.get("location", ""))
    exp = str(lowered_data.get("experience", "") or lowered_data.get("experience_years", ""))
    
    # Handle array fields
    def to_list(val):
        if isinstance(val, list): return val
        if not val: return []
        return [s.strip() for s in str(val).split(",") if s.strip()]

    skills = to_list(lowered_data.get("skills", []))
    edu = to_list(lowered_data.get("education", []))
    cos = to_list(lowered_data.get("companies", []))

    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE candidates SET
                name = %s,
                email = %s,
                phone = %s,
                location = %s,
                experience_years = %s,
                skills = %s,
                education = %s,
                companies = %s,
                parsed_data = %s,
                status = 'completed'
            WHERE id = %s
            """,
            (
                name,
                email,
                phone,
                location,
                exp,
                skills,
                edu,
                cos,
                json.dumps(data),
                candidate_id,
            ),
        )
    conn.commit()
    logger.debug("Candidate updated", extra={"candidate_id": candidate_id})


def mark_candidate_failed(conn, candidate_id: str, error_message: str):
    """
    Mark a candidate record as failed.

    Args:
        conn: psycopg2 connection
        candidate_id: UUID of the candidate record
        error_message: Error description
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE candidates SET status = 'failed', error_message = %s
            WHERE id = %s
            """,
            (error_message, candidate_id),
        )
    conn.commit()
    logger.debug("Candidate marked failed", extra={"candidate_id": candidate_id})


def increment_batch_processed(conn, batch_id: str):
    """Increment the processed count for a batch."""
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE batches SET processed_count = processed_count + 1 WHERE id = %s",
            (batch_id,),
        )
    conn.commit()


def increment_batch_failed(conn, batch_id: str):
    """Increment the failed count for a batch."""
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE batches SET failed_count = failed_count + 1 WHERE id = %s",
            (batch_id,),
        )
    conn.commit()


def check_batch_complete(conn, batch_id: str) -> bool:
    """
    Check if all candidates in a batch are done (completed or failed).

    Returns:
        True if all candidates are processed
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE status IN ('completed', 'failed')) AS done,
                COUNT(*) AS total
            FROM candidates WHERE batch_id = %s
            """,
            (batch_id,),
        )
        row = cur.fetchone()
        return row[0] >= row[1] if row else False


def update_batch_completed(conn, batch_id: str):
    """Mark a batch as completed."""
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE batches SET status = 'completed', completed_at = NOW() WHERE id = %s",
            (batch_id,),
        )
    conn.commit()
    logger.info("Batch completed", extra={"batch_id": batch_id})
