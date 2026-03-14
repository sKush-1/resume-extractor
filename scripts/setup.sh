#!/usr/bin/env bash
# ─── Resume ETL Platform — Dev Setup ───────────────
# Installs dependencies and prepares the local environment.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "═══════════════════════════════════════════"
echo "  Resume ETL Platform — Setup"
echo "═══════════════════════════════════════════"

# 1. Copy .env if not present
if [ ! -f .env ]; then
  echo "→ Creating .env from .env.example..."
  cp .env.example .env
  echo "  ⚠  Please update .env with your configuration"
fi

# 2. Install Node.js dependencies
echo ""
echo "→ Installing Node.js dependencies..."
npm install

# 3. Install Python dependencies (parser-worker)
echo ""
echo "→ Installing parser-worker Python dependencies..."
if [ -d "services/parser-worker" ]; then
  cd services/parser-worker
  python3 -m venv .venv 2>/dev/null || true
  source .venv/bin/activate 2>/dev/null || true
  pip install -r requirements.txt -q
  cd "$ROOT_DIR"
fi

# 4. Install Python dependencies (export-service)
echo ""
echo "→ Installing export-service Python dependencies..."
if [ -d "services/export-service" ]; then
  cd services/export-service
  python3 -m venv .venv 2>/dev/null || true
  source .venv/bin/activate 2>/dev/null || true
  pip install -r requirements.txt -q
  cd "$ROOT_DIR"
fi

# 5. Run database migrations
echo ""
echo "→ Running database migrations..."
bash scripts/migrate.sh || echo "  ⚠  Migration skipped (DB may not be running)"

echo ""
echo "═══════════════════════════════════════════"
echo "  ✓ Setup complete!"
echo ""
echo "  Start services with:"
echo "    docker compose -f infrastructure/docker/docker-compose.yml up"
echo ""
echo "  Or run individually:"
echo "    npm run dev:api"
echo "    npm run dev:worker"
echo "    npm run dev:export"
echo "═══════════════════════════════════════════"
