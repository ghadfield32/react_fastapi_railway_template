#!/usr/bin/env bash
set -euo pipefail

# --- sanity checks ----------------------------------------------------------
if [[ ! -x "$0" ]]; then
  echo "❌ start.sh is not executable. Run 'chmod +x api/start.sh' in Git." >&2
  exit 1
fi
if [[ -z "${PORT:-}" ]]; then
  echo "❌  PORT env var missing – Railway should always set it." >&2
  exit 1
fi

echo "🚀  FastAPI boot; PORT=$PORT  PY=$(python -V)"
env | grep -E 'RAILWAY_|PORT|DATABASE_URL' | sed 's/SECRET_KEY=.*/SECRET_KEY=***/'

# --- (optional) load .env if present ----------------------------------------
[[ -f .env ]] && export $(grep -Ev '^#' .env | xargs)

# --- run DB seed *synchronously* so we never race the health-probe ----------
python -m scripts.seed_user

# --- run the app ------------------------------------------------------------
exec uvicorn app.main:app \
  --host 0.0.0.0 --port "$PORT" \
  --proxy-headers --forwarded-allow-ips="*" \
  --log-level info

