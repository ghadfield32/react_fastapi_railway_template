#!/usr/bin/env bash
set -euo pipefail

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "Loading environment from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the application
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" 
