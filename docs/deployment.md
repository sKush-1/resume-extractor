# Deployment Guide

## Docker Compose (Staging / Single Server)

```bash
# Build and start all services
docker compose -f infrastructure/docker/docker-compose.yml up -d --build

# Scale parser workers for higher throughput
docker compose -f infrastructure/docker/docker-compose.yml up -d --scale parser-worker=4

# Run migrations
bash scripts/migrate.sh

# View logs
docker compose -f infrastructure/docker/docker-compose.yml logs -f
```

### Services Overview

| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | REST API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Job queue |
| MinIO | 9000 / 9001 | Object storage (API / Console) |
| Parser Worker | — | Background job processor |
| Export Service | — | Excel generator |

## Kubernetes

Apply manifests from `infrastructure/kubernetes/`:

```bash
# Create namespace
kubectl create namespace resume-etl

# Apply secrets (create from .env)
kubectl create secret generic resume-etl-secrets \
  --from-env-file=.env \
  -n resume-etl

# Deploy
kubectl apply -f infrastructure/kubernetes/ -n resume-etl

# Scale workers
kubectl scale deployment parser-worker --replicas=8 -n resume-etl
```

## Performance Tuning

| Resumes | Workers | Estimated Time |
|---------|---------|---------------|
| 100 | 2 | ~3 min |
| 500 | 4 | ~10 min |
| 1000 | 4 | ~15-20 min |
| 1000 | 8 | ~8-10 min |

Increase `WORKER_CONCURRENCY` and worker replicas for higher throughput.

## Production Checklist

- [ ] Set strong `API_KEY`
- [ ] Use managed PostgreSQL (e.g. RDS)
- [ ] Use managed Redis (e.g. ElastiCache)
- [ ] Use real S3 bucket with IAM roles
- [ ] Enable HTTPS via reverse proxy
- [ ] Set `NODE_ENV=production`
- [ ] Configure log aggregation
- [ ] Set up monitoring/alerting
- [ ] Enable auto-scaling for workers
