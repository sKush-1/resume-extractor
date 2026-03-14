"""
S3-compatible storage client for the Python worker.
Downloads files from object storage (S3/MinIO/R2).
"""

import boto3
from botocore.config import Config as BotoConfig
from .. import config
from ..logger import create_logger

logger = create_logger("s3-client")


def create_s3_client():
    """Create a boto3 S3 client from environment config."""
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


def download_file(s3_client, file_key: str) -> bytes:
    """
    Download a file from S3.

    Args:
        s3_client: boto3 S3 client
        file_key: Object key in the bucket

    Returns:
        File content as bytes
    """
    response = s3_client.get_object(
        Bucket=config.S3_BUCKET,
        Key=file_key,
    )
    data = response["Body"].read()
    logger.debug("File downloaded from S3", extra={"key": file_key, "size": len(data)})
    return data
