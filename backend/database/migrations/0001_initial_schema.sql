-- Initial future schema sketch for ClipForge.
-- Not applied by the app yet.

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  length TEXT NOT NULL,
  media_type TEXT NOT NULL,
  media_url TEXT NOT NULL,
  poster_url TEXT,
  default_prompt TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generation_jobs (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES templates(id),
  status TEXT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  script TEXT NOT NULL,
  language TEXT NOT NULL,
  voice TEXT NOT NULL,
  result_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
