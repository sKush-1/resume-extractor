#!/usr/bin/env bash
# ─── Run SQL Migrations ───────────────────────────
# Applies all SQL migration files to the PostgreSQL database.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load env vars
if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/resume_etl}"
MIGRATIONS_DIR="$ROOT_DIR/services/api-gateway/src/db/migrations"

echo "→ Running migrations against: $DB_URL"

for migration in "$MIGRATIONS_DIR"/*.sql; do
  echo "  Applying: $(basename "$migration")"
  psql "$DB_URL" -f "$migration" -q 2>&1 || {
    echo "  ⚠  Failed: $(basename "$migration")"
    exit 1
  }
done

echo "→ Migrations complete"
