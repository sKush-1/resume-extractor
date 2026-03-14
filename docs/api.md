# API Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

All `/batches/*` endpoints require an API key header:

```
x-api-key: your-api-key-here
```

---

## Endpoints

### Health Check

```
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "api-gateway",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Upload Resumes

```
POST /batches/upload
Content-Type: multipart/form-data
```

| Field | Type | Description |
|-------|------|-------------|
| `resumes` | File[] | PDF/DOCX resume files (max 1000 per batch, 10MB each) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "resume_count": 25
  }
}
```

**cURL example:**
```bash
curl -X POST http://localhost:3000/batches/upload \
  -H "x-api-key: your-api-key-here" \
  -F "resumes=@resume1.pdf" \
  -F "resumes=@resume2.pdf" \
  -F "resumes=@resume3.docx"
```

---

### Get Batch Status

```
GET /batches/:id/status
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "resume_count": 25,
    "processed_count": 18,
    "failed_count": 1,
    "candidates": {
      "total": 25,
      "completed": 18,
      "failed": 1,
      "pending": 4,
      "processing": 2
    }
  }
}
```

**Batch statuses:** `pending` → `processing` → `completed` → `exporting` → `exported`

---

### Export Batch to Excel

```
GET /batches/:id/export
```

**Response (200) — export triggered:**
```json
{
  "success": true,
  "data": {
    "batchId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "exporting"
  }
}
```

**Response (200) — already exported:**
```json
{
  "success": true,
  "data": {
    "batchId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "exported",
    "downloadUrl": "https://s3.../exports/batch-id/candidates.xlsx?..."
  }
}
```

**Response (409) — batch still processing:**
```json
{
  "success": false,
  "error": {
    "code": "BATCH_NOT_READY",
    "message": "Batch is still processing. Please wait for all resumes to be parsed."
  }
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_FILE_TYPE` | 400 | File is not PDF/DOCX |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `BATCH_LIMIT_EXCEEDED` | 400 | Too many files in batch |
| `UNAUTHORIZED` | 401 | Missing/invalid API key |
| `NOT_FOUND` | 404 | Batch not found |
| `BATCH_NOT_READY` | 409 | Batch still processing |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
