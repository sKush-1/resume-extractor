# Resume to Excel ETL Platform

A production-grade pipeline that batch-processes up to **1000 resumes** (PDF/DOCX/TXT), extracts structured candidate data using AI, and exports results to Excel.

Built with **Node.js** (API) + **Python** (AI parsing & export).

---

## Architecture

```
Upload PDFs/DOCX/TXT
       │
       ▼
┌──────────────┐    ┌───────────┐    ┌────────────┐
│  API Gateway │───▶│  MinIO/S3 │    │   Redis    │
│  (Node.js)   │───▶│  Storage  │    │  (BullMQ)  │
└──────────────┘    └───────────┘    └─────┬──────┘
                                           │
                               ┌───────────┼───────────┐
                               ▼           ▼           ▼
                        ┌──────────┐┌──────────┐┌──────────┐
                        │ Worker 1 ││ Worker 2 ││ Worker N │
                        │ (Python) ││ (Python) ││ (Python) │
                        └─────┬────┘└─────┬────┘└─────┬────┘
                              └───────────┼───────────┘
                                          ▼
                                  ┌──────────────┐
                                  │  PostgreSQL  │
                                  └──────┬───────┘
                                         ▼
                                 ┌───────────────┐
                                 │ Export Service │
                                 │ pandas → Excel│
                                 └───────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| API | Node.js, Express |
| Queue | Redis, BullMQ |
| Database | PostgreSQL |
| Storage | S3 / MinIO / Cloudflare R2 |
| AI Parsing | Ollama / OpenAI / Gemini |
| Text Extraction | PyMuPDF, python-docx, Plain Text |
| Excel Export | pandas, openpyxl |
| Containerization | Docker, Docker Compose, Kubernetes |

---

## Prerequisites

- **Docker** & **Docker Compose** (recommended)
- **Node.js** ≥ 18 (for local dev)
- **Python** ≥ 3.10 (for local dev)
- **Ollama** (optional — for local AI inference)

---

## Quick Start (Docker)

### 1. Clone the repository

```bash
cd resume-extractor
```

### 2. Create environment file

```bash
cp .env.example .env
```

Edit `.env` and set your `API_KEY`:

```env
API_KEY=your-secret-api-key
```

> All other defaults work out of the box with Docker Compose (Postgres, Redis, MinIO are pre-configured).

### 3. Start all services

```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build -d
```

This starts:

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | `3000` | REST API |
| PostgreSQL | `5432` | Database |
| Redis | `6379` | Job queue |
| MinIO | `9000` / `9001` | Object storage (API / Console) |
| Parser Worker | — | Resume parsing (2 replicas) |
| Export Service | — | Excel generation |

### 4. Run database migrations

```bash
# Requires psql client installed locally
bash scripts/migrate.sh
```

Or run inside Docker:
```bash
docker exec -i $(docker ps -q -f name=postgres) \
  psql -U postgres -d resume_etl \
  -f /dev/stdin < services/api-gateway/src/db/migrations/001_init.sql
```

### 5. Verify the server is running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "api-gateway"
  }
}
```

---

## Local Development (without Docker)

### 1. Run setup script

```bash
bash scripts/setup.sh
```

This will:
- Copy `.env.example` → `.env`
- Install Node.js dependencies
- Create Python virtual environments and install packages

### 2. Start infrastructure services

```bash
docker compose -f infrastructure/docker/docker-compose.yml up postgres redis minio minio-setup -d
```

### 3. Run migrations

```bash
bash scripts/migrate.sh
```

### 4. Start each service (in separate terminals)

```bash
# Terminal 1 — API Gateway
npm run dev:api

# Terminal 2 — Parser Worker
cd services/parser-worker
source .venv/bin/activate
python -m src.main

# Terminal 3 — Export Service
cd services/export-service
source .venv/bin/activate
python -m src.main
```

---

## AI Provider Setup

The system supports three AI providers. Set `AI_PROVIDER` in `.env`:

### Ollama (default — runs locally, no API key needed)

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.1
```

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

### OpenAI

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Gemini

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-1.5-flash
```

---

## API Usage

All `/batches/*` endpoints require the `x-api-key` header.

### Upload Resumes

```bash
curl -X POST http://localhost:3000/batches/upload \
  -H "x-api-key: your-secret-api-key" \
  -F "resumes=@resume1.pdf" \
  -F "resumes=@resume2.pdf" \
  -F "resumes=@resume3.docx" \
  -F "resumes=@resume4.txt"
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "resume_count": 3
  }
}
```

### Check Batch Status

```bash
curl http://localhost:3000/batches/{batch_id}/status \
  -H "x-api-key: your-secret-api-key"
```

### Export to Excel

```bash
curl http://localhost:3000/batches/{batch_id}/export \
  -H "x-api-key: your-secret-api-key"
```

> First call triggers export generation. Second call returns the download URL.

---

## Scaling Workers

For higher throughput, scale the parser workers:

```bash
# Docker Compose
docker compose -f infrastructure/docker/docker-compose.yml up -d --scale parser-worker=4

# Kubernetes
kubectl scale deployment parser-worker --replicas=8
```

| Resumes | Workers | Estimated Time |
|---------|---------|---------------|
| 100 | 2 | ~3 min |
| 500 | 4 | ~10 min |
| 1000 | 4 | ~15–20 min |
| 1000 | 8 | ~8–10 min |

---

## Running Tests

```bash
# API Gateway (Node.js)
npm run test:api

# Parser Worker (Python)
cd services/parser-worker && python -m pytest tests/ -v

# Export Service (Python)
cd services/export-service && python -m pytest tests/ -v
```

---

## Project Structure

```
resume-extractor/
├── packages/                    # Shared packages
│   ├── config/                  # Env validation (Joi)
│   ├── logger/                  # Structured JSON logger (Winston)
│   ├── types/                   # Error codes, constants
│   ├── storage/                 # S3-compatible adapter
│   ├── queue/                   # BullMQ wrapper
│   └── ai-provider/            # Ollama / OpenAI / Gemini
├── services/
│   ├── api-gateway/             # Node.js Express API
│   │   ├── src/
│   │   │   ├── controllers/     # Thin request handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── repositories/    # Database queries
│   │   │   ├── middleware/      # Auth, validation, errors
│   │   │   ├── routes/          # Route definitions
│   │   │   └── db/              # Pool + migrations
│   │   └── tests/
│   ├── parser-worker/           # Python resume parser
│   │   └── src/
│   │       ├── extractors/      # PDF / DOCX / TXT text extraction
│   │       ├── providers/       # AI provider adapters
│   │       ├── parsers/         # Schema + validation
│   │       ├── storage/         # S3 download client
│   │       ├── db/              # PostgreSQL repository
│   │       └── pipeline.py      # Orchestrator
│   └── export-service/          # Python Excel exporter
├── infrastructure/
│   ├── docker/                  # docker-compose.yml
│   └── kubernetes/              # K8s manifests
├── scripts/                     # setup.sh, migrate.sh
├── docs/                        # API, setup, deployment, architecture
├── .env.example
└── package.json
```

---

## Environment Variables

See [.env.example](.env.example) for the full list. Key variables:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_KEY` | ✅ | — | API authentication key |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `REDIS_URL` | ✅ | — | Redis connection string |
| `S3_BUCKET` | ✅ | — | S3 bucket name |
| `S3_ACCESS_KEY` | ✅ | — | S3 access key |
| `S3_SECRET_KEY` | ✅ | — | S3 secret key |
| `AI_PROVIDER` | ❌ | `ollama` | AI provider (`ollama`/`openai`/`gemini`) |
| `WORKER_CONCURRENCY` | ❌ | `4` | Parallel jobs per worker |
| `MAX_FILE_SIZE_MB` | ❌ | `10` | Max upload size per file |
| `MAX_FILES_PER_BATCH` | ❌ | `1000` | Max files per batch |

---

## Documentation

- [API Reference](docs/api.md)
- [Developer Setup](docs/setup.md)
- [Deployment Guide](docs/deployment.md)
- [Architecture Overview](docs/architecture.md)

---

## License

MIT
