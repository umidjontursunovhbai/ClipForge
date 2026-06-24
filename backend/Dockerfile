FROM nvidia/cuda:12.4.1-cudnn-runtime-ubuntu22.04

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /app/backend/requirements.txt
RUN python3 -m pip install --upgrade pip \
    && python3 -m pip install -r /app/backend/requirements.txt

COPY backend /app/backend
COPY apps/frontend/public /app/apps/frontend/public

EXPOSE 8088

CMD ["python3", "-m", "uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8088"]
