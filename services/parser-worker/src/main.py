"""
Parser Worker — main entry point.
Consumes resume-parse jobs from Redis (BullMQ-compatible) and processes them
through the resume parsing pipeline.
"""

import json
import signal
import sys
import time
from urllib.parse import urlparse

import redis

from .config import REDIS_URL, WORKER_CONCURRENCY, LOG_LEVEL
from .logger import create_logger
from .pipeline import ResumePipeline

logger = create_logger("parser-worker", LOG_LEVEL)

# BullMQ queue name
QUEUE_NAME = "resume-parse"
STREAM_KEY = f"bull:{QUEUE_NAME}:events"

# Graceful shutdown flag
_shutdown = False


def _signal_handler(signum, frame):
    """Handle shutdown signals."""
    global _shutdown
    logger.info("Shutdown signal received", extra={"signal": signum})
    _shutdown = True


def _parse_redis_url(url: str) -> dict:
    """Parse Redis URL into connection params."""
    parsed = urlparse(url)
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 6379,
        "password": parsed.password or None,
        "decode_responses": True,
    }


def _process_queue(r: redis.Redis, pipeline: ResumePipeline):
    """
    Blocking loop that consumes jobs from the BullMQ queue.
    Uses BRPOP for blocking pop from the waiting list.
    """
    waiting_key = f"bull:{QUEUE_NAME}:wait"
    active_key = f"bull:{QUEUE_NAME}:active"

    logger.info("Worker listening for jobs", extra={"queue": QUEUE_NAME})

    while not _shutdown:
        try:
            # BRPOPLPUSH: pop from wait, push to active
            result = r.brpoplpush(waiting_key, active_key, timeout=2)

            if result is None:
                continue  # Timeout, check shutdown flag

            job_id = result
            job_key = f"bull:{QUEUE_NAME}:{job_id}"

            # Read job data
            job_raw = r.hget(job_key, "data")
            if not job_raw:
                logger.warning("Job data not found", extra={"job_id": job_id})
                r.lrem(active_key, 1, job_id)
                continue

            job_data = json.loads(job_raw)

            logger.info("Job received", extra={
                "job_id": job_id,
                "batch_id": job_data.get("batch_id"),
            })

            # Process the job
            pipeline.process_job(job_data)

            # Remove from active list and mark complete in BullMQ
            r.lrem(active_key, 1, job_id)

            # Update job state
            r.hset(job_key, mapping={
                "finishedOn": str(int(time.time() * 1000)),
                "processedOn": str(int(time.time() * 1000)),
            })

            # Move to completed set
            completed_key = f"bull:{QUEUE_NAME}:completed"
            r.zadd(completed_key, {job_id: time.time() * 1000})

        except redis.ConnectionError as e:
            logger.error("Redis connection error", extra={"error": str(e)})
            time.sleep(5)
        except json.JSONDecodeError as e:
            logger.error("Invalid job data", extra={"error": str(e)})
        except Exception as e:
            logger.error("Unexpected error processing job", extra={"error": str(e)})
            time.sleep(1)


def main():
    """Entry point for the parser worker."""
    signal.signal(signal.SIGTERM, _signal_handler)
    signal.signal(signal.SIGINT, _signal_handler)

    logger.info("Starting parser worker", extra={"concurrency": WORKER_CONCURRENCY})

    # Connect to Redis
    redis_params = _parse_redis_url(REDIS_URL)
    r = redis.Redis(**redis_params)

    try:
        r.ping()
        logger.info("Connected to Redis")
    except redis.ConnectionError as e:
        logger.error("Failed to connect to Redis", extra={"error": str(e)})
        sys.exit(1)

    # Initialize pipeline
    pipeline = ResumePipeline()

    try:
        _process_queue(r, pipeline)
    finally:
        pipeline.close()
        r.close()
        logger.info("Parser worker shut down")


if __name__ == "__main__":
    main()
