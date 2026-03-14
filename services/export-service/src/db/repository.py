"""
Database repository for the export service.
Reads candidate data for Excel generation.
"""

import psycopg2
import psycopg2.extras
from .. import config


def create_connection():
    """Create a database connection."""
    return psycopg2.connect(config.DATABASE_URL)


def get_candidates_by_batch(conn, batch_id: str) -> list[dict]:
    """
    Fetch all completed candidates for a batch.

    Args:
        conn: psycopg2 connection
        batch_id: UUID of the batch

    Returns:
        List of candidate dicts
    """
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(
            """
            SELECT name, email, phone, skills, experience_years,
                   education, companies, location
            FROM candidates
            WHERE batch_id = %s AND status = 'completed'
            ORDER BY created_at
            """,
            (batch_id,),
        )
        return cur.fetchall()


def update_batch_export(conn, batch_id: str, export_file_key: str):
    """Update the batch with the export file key and status."""
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE batches SET
                status = 'exported',
                export_file_key = %s
            WHERE id = %s
            """,
            (export_file_key, batch_id),
        )
    conn.commit()
