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
    && python3 -m pip install -r /app/backend/requirements.txt \
    && python3 -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124 \
    && python3 -m pip install numpy==1.26.4 librosa==0.10.2.post1 opencv-python-headless==4.10.0.84 tqdm==4.68.3 numba==0.60.0 scipy==1.13.1 audiofile==1.5.1 face-alignment==1.4.1

COPY backend /app/backend
COPY apps/frontend/public /app/apps/frontend/public

EXPOSE 8088

CMD ["python3", "-m", "uvicorn", "backend.api.main:app", "--host", "0.0.0.0", "--port", "8088"]
