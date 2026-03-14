# Architecture Overview

## System Design

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Client/CLI    │────▶│  API Gateway     │────▶│  Object Storage │
│  (Upload PDFs)  │     │  (Node.js)       │     │  (S3/MinIO)     │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                        │
                                 ▼                        │
                        ┌─────────────────┐               │
                        │   Redis Queue   │               │
                        │   (BullMQ)      │               │
                        └────────┬────────┘               │
                                 │                        │
                     ┌───────────┼───────────┐            │
                     ▼           ▼           ▼            │
              ┌──────────┐┌──────────┐┌──────────┐       │
              │ Worker 1 ││ Worker 2 ││ Worker N │◀──────┘
              │ (Python) ││ (Python) ││ (Python) │
              └─────┬────┘└─────┬────┘└─────┬────┘
                    │           │           │
                    ▼           ▼           ▼
              ┌─────────────────────────────────┐
              │         PostgreSQL               │
              │    (Structured Candidate Data)   │
              └──────────────┬──────────────────┘
                             │
                             ▼
              ┌─────────────────────────────────┐
              │      Export Service (Python)     │
              │    pandas → Excel → S3 upload   │
              └─────────────────────────────────┘
```

## Data Flow

1. **Upload** → Client sends PDF/DOCX files to `POST /batches/upload`
2. **Store** → API uploads files to S3, creates batch + candidate DB records
3. **Queue** → API enqueues parse jobs to Redis (BullMQ)
4. **Process** → Python workers consume jobs:
   - Download file from S3
   - Extract text (PyMuPDF / python-docx)
   - Send to AI provider for structured extraction
   - Validate response with Pydantic
   - Store structured data in PostgreSQL
5. **Complete** → Workers auto-detect batch completion
6. **Export** → Client triggers `GET /batches/:id/export`
7. **Generate** → Export service builds Excel with pandas, uploads to S3
8. **Download** → Client gets pre-signed download URL

## Service Responsibilities

| Service | Language | Responsibility |
|---------|----------|---------------|
| API Gateway | Node.js | REST API, auth, upload, queue management |
| Parser Worker | Python | Text extraction, AI parsing, DB storage |
| Export Service | Python | Excel generation, S3 upload |

## Provider Abstraction

All external dependencies are abstracted behind interfaces:

- **StorageProvider**: S3 / MinIO / Cloudflare R2
- **AIProvider**: Ollama / OpenAI / Gemini
- **QueueProvider**: Redis + BullMQ

Providers are swapped via `.env` configuration — no code changes needed.

## Clean Architecture Layers

```
Controllers  →  Services  →  Repositories  →  Database
     ↑              ↑             ↑
  Middleware    Providers     Adapters
```

- **Controllers**: Thin HTTP layer, no business logic
- **Services**: Business logic, orchestration
- **Repositories**: Data access, SQL queries
- **Providers**: External service adapters (AI, Storage, Queue)
