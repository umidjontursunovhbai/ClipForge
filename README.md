# ClipForge

ClipForge is a first MVP for a short-video template generator. Users sign in, pick a camera-front short-video template, let the backend transcribe the original audio into script text, edit the script, then queue a generated preview.

## Project Structure

```text
apps/frontend/                 React + Vite website
backend/api/                   FastAPI app, routes, schemas
backend/services/              Business logic and future GPU orchestration
backend/repositories/          Data-access layer
backend/database/migrations/   Database schema migrations
backend/workers/               Future GPU/background workers
```

## Run Locally For Development

```bash
npm --prefix apps/frontend install
docker compose up -d postgres
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/uvicorn backend.api.main:app --host 127.0.0.1 --port 8088
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Default admin account:

```text
username: admin
password: admin12345
```

## Run With Docker

The Docker setup runs:

```text
frontend  -> Nginx static site and /api reverse proxy
backend   -> FastAPI API
postgres  -> database
ngrok     -> optional public tunnel
```

Run the app:

```bash
docker compose up -d --build postgres backend frontend
```

Open:

```text
http://127.0.0.1:5173/
```

Backend remains available at:

```text
http://127.0.0.1:8088/
```

The backend container requests NVIDIA GPU access with `gpus: all`. On Ubuntu, Docker needs the NVIDIA container runtime installed for GPU workloads.

## Public URL With Ngrok

Create a `.env` file from `.env.example` and add your ngrok authtoken:

```bash
cp .env.example .env
```

```text
NGROK_AUTHTOKEN=your-ngrok-token
```

Start the public tunnel:

```bash
docker compose --profile public up -d ngrok
```

Get the public URL:

```bash
curl -s http://127.0.0.1:4040/api/tunnels
```

## Build For Server

```bash
npm run build
```

The production files are created in `apps/frontend/dist/`. You can serve that folder from any web server or deploy it behind a backend that talks to GPU workers.

## Run Backend API

```bash
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
.venv/bin/uvicorn backend.api.main:app --host 127.0.0.1 --port 8088
```

Current API endpoints:

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

Template transcription uses `faster-whisper` locally. It auto-detects the source language and uses CUDA when available.

```bash
CLIPFORGE_TRANSCRIPTION_MODEL_SIZE=small
CLIPFORGE_TRANSCRIPTION_DEVICE=auto
CLIPFORGE_TRANSCRIPTION_COMPUTE_TYPE=auto
```

## Postgres And Generated Video Storage

The app uses Postgres for users, sessions, templates, jobs, and generated asset metadata. Generated video files are not stored inside Postgres. They are written to:

```text
backend/storage/generated/
```

Postgres stores the output path and public URL. Later this can move to S3, Cloudflare R2, or MinIO without changing the frontend contract.

## Lip-Sync Model Hook

The backend has a lip-sync worker adapter. On a GPU server, set `CLIPFORGE_LIPSYNC_COMMAND` to the command that runs your model:

```bash
CLIPFORGE_LIPSYNC_COMMAND='python run_lipsync.py --video {video_path} --text {script} --output {output_path}'
```

If this env var is empty, the worker copies the template video into generated storage so the full queue/storage/player flow can still be tested.

## Import Template Videos

Only import videos that you own or have permission to use as templates.

Import local template folders:

```bash
npm run import:local
```

By default this reads:

```text
/Users/gg/Public/videogen/vd-gen.api-service/media/templates/template_*/test*.mp4
```

It writes normalized videos and posters to:

```text
apps/frontend/public/assets/templates/local/
```

Template records are seeded into Postgres from `apps/frontend/public/assets/templates/local/` on backend startup.

Import one Instagram template:

```bash
npm run import:instagram -- https://www.instagram.com/p/DZ7GcVTFOcc/ instagram-dz7gcvtfocc
```

This creates:

```text
apps/frontend/public/assets/templates/<slug>.mp4
apps/frontend/public/assets/templates/<slug>-poster.jpg
```

After import, restart the backend so the template seed sees the new files.

## Future GPU Architecture

The frontend should call a server API, not run models inside the browser.

```text
User script + selected template
  -> API server
  -> GPU worker queue
  -> TTS / image / video model
  -> generated preview URL
  -> website preview
```

For a free-start MVP, the queue/storage contract is already in place. The next GPU step is to point `CLIPFORGE_LIPSYNC_COMMAND` at the selected local lip-sync model.
