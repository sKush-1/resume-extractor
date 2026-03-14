"""
Export Service — main entry point.
Consumes export jobs from Redis queue and generates Excel files.
"""

import json
import signal
import sys
import time
from urllib.parse import urlparse

import redis

from .config import REDIS_URL, LOG_LEVEL
from .db import create_connection
from .exporter import generate_and_upload_excel

import logging


# Simple structured logger
logger = logging.getLogger("export-worker")
logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    logger.addHandler(handler)

QUEUE_NAME = "export"
_shutdown = False


def _signal_handler(signum, frame):
    global _shutdown
    logger.info(f"Shutdown signal {signum} received")
    _shutdown = True


def _parse_redis_url(url: str) -> dict:
    parsed = urlparse(url)
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 6379,
        "password": parsed.password or None,
        "decode_responses": True,
    }


def main():
    """Entry point for the export worker."""
    signal.signal(signal.SIGTERM, _signal_handler)
    signal.signal(signal.SIGINT, _signal_handler)

    logger.info("Starting export worker")

    redis_params = _parse_redis_url(REDIS_URL)
    r = redis.Redis(**redis_params)

    try:
        r.ping()
        logger.info("Connected to Redis")
    except redis.ConnectionError as e:
        logger.error(f"Failed to connect to Redis: {e}")
        sys.exit(1)

    conn = create_connection()

    waiting_key = f"bull:{QUEUE_NAME}:wait"
    active_key = f"bull:{QUEUE_NAME}:active"

    logger.info(f"Listening for export jobs on queue: {QUEUE_NAME}")

    while not _shutdown:
        try:
            result = r.brpoplpush(waiting_key, active_key, timeout=2)

            if result is None:
                continue

            job_id = result
            job_key = f"bull:{QUEUE_NAME}:{job_id}"
            job_raw = r.hget(job_key, "data")

            if not job_raw:
                logger.warning(f"Export job data not found: {job_id}")
                r.lrem(active_key, 1, job_id)
                continue

            job_data = json.loads(job_raw)
            batch_id = job_data.get("batch_id")

            logger.info(f"Processing export for batch: {batch_id}")

            try:
                export_key = generate_and_upload_excel(conn, batch_id)
                logger.info(f"Export complete: {export_key}")
            except Exception as e:
                logger.error(f"Export failed for batch {batch_id}: {e}")

            # Cleanup
            r.lrem(active_key, 1, job_id)
            r.hset(job_key, mapping={
                "finishedOn": str(int(time.time() * 1000)),
            })
            r.zadd(f"bull:{QUEUE_NAME}:completed", {job_id: time.time() * 1000})

        except redis.ConnectionError as e:
            logger.error(f"Redis connection error: {e}")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            time.sleep(1)

    conn.close()
    r.close()
    logger.info("Export worker shut down")


if __name__ == "__main__":
    main()
