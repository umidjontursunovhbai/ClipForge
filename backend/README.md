# ClipForge Backend

FastAPI backend for the GPU-backed ClipForge MVP. It now owns auth, Postgres data, template APIs, async job records, transcription jobs, generated video storage metadata, and the lip-sync worker adapter.

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
docker compose up -d postgres
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/uvicorn backend.api.main:app --host 127.0.0.1 --port 8088
```

Default admin:

```text
admin / admin12345
```

## API

```text
GET  /health
POST /api/auth/login
GET  /api/auth/me
GET  /api/templates
GET  /api/templates/{template_id}
POST /api/templates/{template_id}/transcription
POST /api/templates/{template_id}/transcription/jobs
GET  /api/templates/transcription/jobs/{job_id}
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

## Generated video storage

Generated files live on disk under `backend/storage/generated/`. Postgres stores job metadata, storage path, and public URL in `generated_assets`. Keep big media files out of the database; use S3/R2/MinIO later when the project moves beyond one server.

## Lip-sync model adapter

Set `CLIPFORGE_LIPSYNC_COMMAND` on the GPU server to run a real model:

```bash
CLIPFORGE_LIPSYNC_COMMAND='python run_lipsync.py --video {video_path} --text {script} --output {output_path}'
```

Without this env var, generation copies the template video into generated storage so the API, queue, and frontend player can be tested end to end.
