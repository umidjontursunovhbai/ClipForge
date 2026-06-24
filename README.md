# ClipForge

ClipForge is a first MVP for a short-video template generator. The current version is the website/frontend: users pick a camera-front short-video template, write their own script, choose language and voice style, then generate a simulated preview.

## Run Locally For Development

```bash
npm install
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

The production files are created in `dist/`. You can serve that folder from any web server or deploy it behind a backend that talks to GPU workers.

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
