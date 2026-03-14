FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for PDF processing
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY services/parser-worker/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY services/parser-worker/ ./services/parser-worker/

# Set Python path
ENV PYTHONPATH=/app/services/parser-worker
ENV PYTHONUNBUFFERED=1

# Run worker
CMD ["python", "-m", "src.main"]
