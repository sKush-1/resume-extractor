FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY services/export-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY services/export-service/ ./services/export-service/

ENV PYTHONPATH=/app/services/export-service
ENV PYTHONUNBUFFERED=1

CMD ["python", "-m", "src.main"]
