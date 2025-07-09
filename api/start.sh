#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PORT:-}" ]]; then
  echo "❌  PORT env var is not set! Railway always sets it—did Nixpacks miss it?"
  exit 1
fi

echo "🚀  FastAPI boot; PORT=$PORT  PY=$(python -V)"
env | grep -E 'RAILWAY_|PORT|SECRET_KEY|DATABASE_URL' | sed 's/SECRET_KEY=.*/SECRET_KEY=***/' || echo "   No relevant environment variables found"

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📁 Loading environment from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Seed DB in the background so we never block readiness
echo "🌱 Seeding database..."
python api/scripts/seed_user.py &

echo "🎯  Launching Uvicorn..."
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --proxy-headers \
  --forwarded-allow-ips="*" \
  --log-level info 
