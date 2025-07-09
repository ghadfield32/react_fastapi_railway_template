#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting FastAPI application..."
echo "🏷  Runtime: $(python -V)"
echo "🌐 Port: ${PORT:-8000}"
echo "🔧 Environment variables:"
env | grep -E 'RAILWAY_|PORT|SECRET_KEY|DATABASE_URL' | sed 's/SECRET_KEY=.*/SECRET_KEY=***/' || echo "   No relevant environment variables found"

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "📁 Loading environment from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Seed database with initial user (non-blocking)
echo "🌱 Seeding database..."
python api/scripts/seed_user.py || echo "ℹ️  Database seeding skipped or failed (non-critical)"

# Start the application with Railway-optimized settings
echo "🎯 Starting uvicorn server..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --proxy-headers \
    --forwarded-allow-ips="*" \
    --log-level info 
