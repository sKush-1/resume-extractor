-- Resume ETL Platform - Initial Migration
-- Creates batches and candidates tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Batches Table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS batches (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ─── Indexes ────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_candidates_batch_id ON candidates(batch_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
