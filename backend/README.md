# ClipForge Backend

FastAPI skeleton for the future GPU-backed video generation service.

## Folders

```text
api/                 HTTP app, routes, schemas
core/                config
domain/              domain models
services/            business logic
repositories/        data access
database/migrations/ future SQL migrations
workers/             future GPU job dispatch
```

## Run

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/uvicorn backend.api.main:app --host 127.0.0.1 --port 8088
```

## API

```text
GET  /health
GET  /api/templates
GET  /api/templates/{template_id}
POST /api/templates/{template_id}/transcription
POST /api/generation/preview
GET  /api/generation/jobs/{job_id}
```

## Local transcription model

The transcription endpoint uses `faster-whisper` locally. It auto-detects language and uses GPU when CUDA is available.

Environment overrides:

```bash
CLIPFORGE_TRANSCRIPTION_MODEL_SIZE=small
CLIPFORGE_TRANSCRIPTION_DEVICE=auto
CLIPFORGE_TRANSCRIPTION_COMPUTE_TYPE=auto
```
