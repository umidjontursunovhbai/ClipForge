# ClipForge

ClipForge is a first MVP for a short-video template generator. The current version is the website/frontend: users pick a camera-front short-video template, write their own script, choose language and voice style, then generate a simulated preview.

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
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
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
GET  /api/templates
GET  /api/templates/{template_id}
POST /api/templates/{template_id}/transcription
POST /api/generation/preview
GET  /api/generation/jobs/{job_id}
```

Template transcription uses `faster-whisper` locally. It auto-detects the source language and uses CUDA when available.

```bash
CLIPFORGE_TRANSCRIPTION_MODEL_SIZE=small
CLIPFORGE_TRANSCRIPTION_DEVICE=auto
CLIPFORGE_TRANSCRIPTION_COMPUTE_TYPE=auto
```

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

If the number of local templates changes, update `localTemplateSpecs` in `apps/frontend/src/features/templates/data/templates.js`.

Import one Instagram template:

```bash
npm run import:instagram -- https://www.instagram.com/p/DZ7GcVTFOcc/ instagram-dz7gcvtfocc
```

This creates:

```text
apps/frontend/public/assets/templates/<slug>.mp4
apps/frontend/public/assets/templates/<slug>-poster.jpg
```

After import, add a template object in `apps/frontend/src/features/templates/data/templates.js` that points to those files.

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

For a free-start MVP, first keep this as a template editor and preview workflow. After the UI is useful, connect it to a GPU server or a hosted notebook/worker.
