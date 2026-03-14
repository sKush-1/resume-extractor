"""
Resume parsing pipeline.
Orchestrates: download → extract text → AI parse → validate → store.
"""

from .storage import create_s3_client, download_file
from .extractors import extract_text
from .providers import create_ai_provider
from .parsers import parse_ai_response
from .db import (
    create_connection,
    update_candidate_data,
    mark_candidate_failed,
    increment_batch_processed,
    increment_batch_failed,
    check_batch_complete,
    update_batch_completed,
)
from .logger import create_logger

logger = create_logger("pipeline")


class ResumePipeline:
    """
    Stateful pipeline for processing resume parsing jobs.
    Initializes shared resources (S3 client, AI provider, DB connection) once
    and reuses them across multiple job invocations.
    """

    def __init__(self):
        self._s3 = create_s3_client()
        self._ai = create_ai_provider()
        self._conn = create_connection()
        logger.info("Pipeline initialized")

    def process_job(self, job_data: dict):
        """
        Process a single resume parsing job.

        Args:
            job_data: Dict with keys: job_id, batch_id, file_key, file_name, file_type
        """
        job_id = job_data["job_id"]
        batch_id = job_data["batch_id"]
        file_key = job_data["file_key"]
        file_type = job_data["file_type"]

        logger.info("Processing job", extra={"job_id": job_id, "file_key": file_key})

        try:
            # 1. Download file from storage
            file_bytes = download_file(self._s3, file_key)

            # 2. Extract text
            raw_text = extract_text(file_bytes, file_type)

            # 3. Send to AI for parsing
            ai_response = self._ai.extract_resume_data(raw_text)

            # 4. Validate response
            candidate_data = parse_ai_response(ai_response)

            # 5. Store in database
            update_candidate_data(self._conn, job_id, candidate_data.model_dump())
            increment_batch_processed(self._conn, batch_id)

            logger.info("Job completed", extra={
                "job_id": job_id,
                "candidate_name": candidate_data.name,
            })

        except Exception as e:
            logger.error("Job failed", extra={
                "job_id": job_id,
                "error": str(e),
            })
            mark_candidate_failed(self._conn, job_id, str(e))
            increment_batch_failed(self._conn, batch_id)

        # 6. Check if batch is complete
        self._check_batch_completion(batch_id)

    def _check_batch_completion(self, batch_id: str):
        """Check if the batch is done and update status."""
        if check_batch_complete(self._conn, batch_id):
            update_batch_completed(self._conn, batch_id)

    def close(self):
        """Close resources."""
        if self._conn:
            self._conn.close()
        logger.info("Pipeline shut down")
