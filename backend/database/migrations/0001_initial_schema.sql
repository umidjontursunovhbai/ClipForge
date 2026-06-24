CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt VARCHAR(64) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  token_hash VARCHAR(128) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(80) PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  length VARCHAR(32) NOT NULL DEFAULT '',
  media_type VARCHAR(24) NOT NULL DEFAULT 'video',
  media_url TEXT NOT NULL,
  poster_url TEXT,
  default_prompt TEXT NOT NULL,
  source_path TEXT,
  tone VARCHAR(32) NOT NULL DEFAULT 'Casual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(64) PRIMARY KEY,
  job_type VARCHAR(32) NOT NULL,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  template_id VARCHAR(80) NOT NULL REFERENCES templates(id),
  status VARCHAR(32) NOT NULL DEFAULT 'queued',
  progress INTEGER NOT NULL DEFAULT 0,
  script TEXT NOT NULL DEFAULT '',
  language VARCHAR(64) NOT NULL DEFAULT 'Uzbek',
  voice VARCHAR(64) NOT NULL DEFAULT 'Casual',
  result_text TEXT,
  language_probability VARCHAR(32),
  result_url TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_assets (
  id VARCHAR(64) PRIMARY KEY,
  job_id VARCHAR(64) NOT NULL REFERENCES jobs(id),
  user_id VARCHAR(64) NOT NULL REFERENCES users(id),
  template_id VARCHAR(80) NOT NULL REFERENCES templates(id),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  media_type VARCHAR(24) NOT NULL DEFAULT 'video',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
