FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_DEFAULT_TIMEOUT=300 PIP_RETRIES=15 PIP_NO_CACHE_DIR=1
WORKDIR /app
COPY requirements.txt requirements-stt.txt ./
RUN pip install -r requirements.txt
# Optional speech-to-text (large download). Enable with WITH_STT=1, then rebuild.
ARG WITH_STT=0
RUN if [ "$WITH_STT" = "1" ]; then pip install -r requirements-stt.txt; fi
COPY app ./app
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]