# Developer Setup Guide

## Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **Docker** & **Docker Compose**
- **PostgreSQL client** (`psql`) for migrations
- **Ollama** (optional, for local AI inference)

## Quick Start (Docker)

```bash
# 1. Clone and enter directory
cd resume-extractor

# 2. Copy environment template
cp .env.example .env
# Edit .env with your settings

# 3. Start all services
docker compose -f infrastructure/docker/docker-compose.yml up --build

# 4. Run database migrations
bash scripts/migrate.sh

# 5. Test the API
curl http://localhost:3000/health
```

## Local Development (without Docker)

```bash
# 1. Setup
bash scripts/setup.sh

# 2. Start infrastructure (Redis, Postgres, MinIO)
docker compose -f infrastructure/docker/docker-compose.yml up postgres redis minio minio-setup

# 3. Run migrations
bash scripts/migrate.sh

# 4. Start API Gateway
npm run dev:api

# 5. Start Parser Worker (new terminal)
cd services/parser-worker
source .venv/bin/activate
python -m src.main

# 6. Start Export Service (new terminal)
cd services/export-service
source .venv/bin/activate
python -m src.main
```

## Running Tests

```bash
# API Gateway tests
npm run test:api

# Parser Worker tests
cd services/parser-worker && python -m pytest tests/ -v

# Export Service tests
cd services/export-service && python -m pytest tests/ -v
```

## Environment Variables

See [.env.example](../.env.example) for all configuration options.

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | ✅ | API authentication key |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `S3_BUCKET` | ✅ | S3 bucket name |
| `S3_ACCESS_KEY` | ✅ | S3 access key |
| `S3_SECRET_KEY` | ✅ | S3 secret key |
| `AI_PROVIDER` | ❌ | `ollama` / `openai` / `gemini` (default: ollama) |
| `WORKER_CONCURRENCY` | ❌ | Parallel jobs per worker (default: 4) |

## AI Provider Setup

### Ollama (default, local)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1

# Ollama runs on http://localhost:11434 by default
```

### OpenAI
Set `AI_PROVIDER=openai` and `OPENAI_API_KEY=sk-...` in `.env`.

### Gemini
Set `AI_PROVIDER=gemini` and `GEMINI_API_KEY=...` in `.env`.
