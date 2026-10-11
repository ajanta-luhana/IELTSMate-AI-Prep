# syntax=docker/dockerfile:1
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_DEFAULT_TIMEOUT=300 PIP_RETRIES=15
WORKDIR /app
COPY requirements.txt requirements-stt.txt ./
# Cache mount keeps already-downloaded packages, so a retry on slow internet resumes instead of restarting.
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
# Optional speech-to-text (large download). Enable with WITH_STT=1 in the root .env, then rebuild.
ARG WITH_STT=0
RUN --mount=type=cache,target=/root/.cache/pip if [ "$WITH_STT" = "1" ]; then pip install -r requirements-stt.txt; fi
COPY app ./app
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
