-- ==============================================================================
-- Beyond Rasooli — Migration: Video Author Attribution & Relationships
-- Date: 2026-10-09
-- Description:
--   Strictly additive, non-destructive PostgreSQL schema migration.
--   Adds author and authorProfile relationship columns and indexes to videos
--   and _videos_v tables, mirroring the existing articles author architecture.
--
-- Supported Database:
--   PostgreSQL (Neon / Managed PostgreSQL)
--
-- Rollback Instructions:
--   ALTER TABLE _videos_v DROP COLUMN IF EXISTS version_author_profile_id;
--   ALTER TABLE _videos_v DROP COLUMN IF EXISTS version_author_id;
--   ALTER TABLE videos DROP COLUMN IF EXISTS author_profile_id;
--   ALTER TABLE videos DROP COLUMN IF EXISTS author_id;
-- ==============================================================================

-- 1. Videos Table Additions
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS author_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS author_profile_id integer REFERENCES authors(id) ON DELETE SET NULL;

-- 2. Videos Version Table Additions (_videos_v)
ALTER TABLE _videos_v
  ADD COLUMN IF NOT EXISTS version_author_id integer REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version_author_profile_id integer REFERENCES authors(id) ON DELETE SET NULL;

-- 3. Backfill Historical Video Attribution: Link existing videos to founder author profile if available
UPDATE videos v
SET author_id = (SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1)
WHERE v.author_id IS NULL;

UPDATE videos v
SET author_profile_id = (SELECT author_profile_id FROM users WHERE id = v.author_id)
WHERE v.author_profile_id IS NULL AND v.author_id IS NOT NULL;

-- 4. Relational Indexes for Fast Filtering and Byline Queries
CREATE INDEX IF NOT EXISTS videos_author_idx ON videos(author_id);
CREATE INDEX IF NOT EXISTS videos_author_profile_idx ON videos(author_profile_id);
CREATE INDEX IF NOT EXISTS _videos_v_version_author_idx ON _videos_v(version_author_id);
CREATE INDEX IF NOT EXISTS _videos_v_version_author_profile_idx ON _videos_v(version_author_profile_id);
