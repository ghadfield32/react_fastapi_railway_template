FROM python:3.12-slim
WORKDIR /app
COPY api/pyproject.toml pyproject.toml
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --no-build-isolation "uv[standard]" && \
    uv pip install .
COPY api ./api
ENV PORT 8000
CMD ["uvicorn", "api.app.main:app", "--host", "0.0.0.0", "--port", "8000"] 
