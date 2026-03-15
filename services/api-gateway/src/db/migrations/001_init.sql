-- Resume ETL Platform - Initial Migration
-- Creates batches and candidates tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Batches Table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS batches (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMP WITH TIME ZONE,
  resume_count  INTEGER NOT NULL DEFAULT 0,
  processed_count INTEGER NOT NULL DEFAULT 0,
  failed_count  INTEGER NOT NULL DEFAULT 0,
  export_file_key TEXT,
  
  CONSTRAINT chk_batch_status CHECK (
    status IN ('pending', 'processing', 'completed', 'failed', 'exporting', 'exported')
  )
);

-- ─── Candidates Table ───────────────────────────────

CREATE TABLE IF NOT EXISTS candidates (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  batch_id        UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  skills          TEXT[] NOT NULL DEFAULT '{}',
  experience_years TEXT NOT NULL DEFAULT '',
  education       TEXT[] NOT NULL DEFAULT '{}',
  companies       TEXT[] NOT NULL DEFAULT '{}',
  location        TEXT NOT NULL DEFAULT '',
  file_key        TEXT NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message   TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT chk_candidate_status CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  )
);

-- ─── Users Table ────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  email         VARCHAR(150) NOT NULL UNIQUE,
  name          VARCHAR(150) NOT NULL,
  role          VARCHAR(50) NOT NULL DEFAULT 'user',
  profile_pic   TEXT DEFAULT '',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Auth Providers Table ───────────────────────────

CREATE TABLE IF NOT EXISTS auth_providers (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      VARCHAR(50) NOT NULL, -- 'email' | 'google'
  provider_id   VARCHAR(255),         -- googleId OR email for email provider
  password_hash VARCHAR(255),         -- only for email provider
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_provider_per_user UNIQUE(user_id, provider)
);

-- ─── Sessions Table ─────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL UNIQUE,
  user_agent    TEXT,
  ip_address    VARCHAR(45),
  expires_at    TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_candidates_batch_id ON candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON auth_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
