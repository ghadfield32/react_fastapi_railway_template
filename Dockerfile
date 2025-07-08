# Multi-stage Dockerfile for FastAPI + React deployment on Railway
# ==============================================================

# Stage 1: Build React Frontend
# ------------------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci --only=production --silent

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend with Frontend Assets
# ---------------------------------------------
FROM python:3.10-slim AS backend

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/app/.venv/bin:$PATH"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create virtual environment
RUN python -m venv .venv

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN .venv/bin/pip install --no-cache-dir --upgrade pip && \
    .venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built frontend from the previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port (Railway will set the PORT environment variable)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Start command - Railway will provide the PORT environment variable
CMD ["sh", "-c", ".venv/bin/uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"] 