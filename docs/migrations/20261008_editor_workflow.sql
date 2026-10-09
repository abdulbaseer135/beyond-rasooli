-- ==============================================================================
-- Beyond Rasooli — Migration: Editor Workflow, Roles & Approvals
-- Date: 2026-10-08
-- Description:
--   Strictly additive, non-destructive PostgreSQL schema migration.
--   Enables the two-role editorial model (Founder/Admin vs Editor),
--   founder review/approval workflow for articles, videos, and topics,
--   and editor profile relationships to Media and Authors.
--
-- Supported Database:
--   PostgreSQL (Neon / Managed PostgreSQL)
-- ==============================================================================

-- 1. Create Required Enum Types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_status' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum_users_status AS ENUM ('approved', 'pending', 'rejected', 'suspended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_articles_review_decision' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum_articles_review_decision AS ENUM ('none', 'changes_requested', 'approved', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__articles_v_version_review_decision' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum__articles_v_version_review_decision AS ENUM ('none', 'changes_requested', 'approved', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_videos_review_decision' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum_videos_review_decision AS ENUM ('none', 'changes_requested', 'approved', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum__videos_v_version_review_decision' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum__videos_v_version_review_decision AS ENUM ('none', 'changes_requested', 'approved', 'rejected');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_topics_status' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum_topics_status AS ENUM ('published', 'pending', 'draft');
  END IF;
END $$;

-- 2. Users Table Additions
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS photo_id integer REFERENCES media(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status enum_users_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reason_for_joining varchar,
  ADD COLUMN IF NOT EXISTS rejection_reason varchar,
  ADD COLUMN IF NOT EXISTS applied_at timestamp(3) with time zone,
  ADD COLUMN IF NOT EXISTS author_profile_id integer REFERENCES authors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS social_links_tiktok varchar;

-- Backfill existing users (including Founder) to 'approved'
UPDATE users
SET status = 'approved'
WHERE status IS NULL OR role = 'admin';

-- Link existing founder user to existing author record if available
UPDATE users u
SET author_profile_id = a.id
FROM authors a
WHERE u.author_profile_id IS NULL
  AND (u.name = a.name OR u.role = 'admin');

-- Enforce NOT NULL on status with 'pending' default for new registrations
ALTER TABLE users
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Topics Table Additions
ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS status enum_topics_status DEFAULT 'published';

-- Backfill existing topics to 'published' to ensure public site integrity
UPDATE topics
SET status = 'published'
WHERE status IS NULL;

ALTER TABLE topics
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN status SET DEFAULT 'published';

-- 4. Articles Table Additions
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS review_decision enum_articles_review_decision DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS review_notes varchar,
  ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL;

-- 5. Articles Version Table Additions (_articles_v)
ALTER TABLE _articles_v
  ADD COLUMN IF NOT EXISTS version_review_decision enum__articles_v_version_review_decision DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS version_review_notes varchar,
  ADD COLUMN IF NOT EXISTS version_submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL;

-- 6. Videos Table Additions
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS review_decision enum_videos_review_decision DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS review_notes varchar,
  ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL;

-- 7. Videos Version Table Additions (_videos_v)
ALTER TABLE _videos_v
  ADD COLUMN IF NOT EXISTS version_review_decision enum__videos_v_version_review_decision DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS version_review_notes varchar,
  ADD COLUMN IF NOT EXISTS version_submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL;

-- 8. Array Tables for Articles (Sources & Tags)
CREATE TABLE IF NOT EXISTS articles_sources (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  source_type enum_articles_sources_source_type NOT NULL DEFAULT 'paper',
  evidence_level enum_articles_sources_evidence_level NOT NULL DEFAULT 'primary_research',
  title varchar NOT NULL,
  author_org varchar NOT NULL,
  year varchar NOT NULL,
  url_doi varchar,
  note varchar
);
CREATE INDEX IF NOT EXISTS articles_sources_order_idx ON articles_sources(_order);
CREATE INDEX IF NOT EXISTS articles_sources_parent_id_idx ON articles_sources(_parent_id);

CREATE TABLE IF NOT EXISTS articles_tags (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  tag varchar NOT NULL
);
CREATE INDEX IF NOT EXISTS articles_tags_order_idx ON articles_tags(_order);
CREATE INDEX IF NOT EXISTS articles_tags_parent_id_idx ON articles_tags(_parent_id);

-- 8. Indexes for Performance & Relational Integrity
CREATE INDEX IF NOT EXISTS users_photo_idx ON users(photo_id);
CREATE INDEX IF NOT EXISTS users_author_profile_idx ON users(author_profile_id);
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);

CREATE INDEX IF NOT EXISTS topics_status_idx ON topics(status);

CREATE INDEX IF NOT EXISTS articles_submitted_by_idx ON articles(submitted_by_id);
CREATE INDEX IF NOT EXISTS articles_review_decision_idx ON articles(review_decision);

CREATE INDEX IF NOT EXISTS _articles_v_version_submitted_by_idx ON _articles_v(version_submitted_by_id);
CREATE INDEX IF NOT EXISTS _articles_v_version_review_decision_idx ON _articles_v(version_review_decision);

CREATE INDEX IF NOT EXISTS videos_submitted_by_idx ON videos(submitted_by_id);
CREATE INDEX IF NOT EXISTS videos_review_decision_idx ON videos(review_decision);

CREATE INDEX IF NOT EXISTS _videos_v_version_submitted_by_idx ON _videos_v(version_submitted_by_id);
CREATE INDEX IF NOT EXISTS _videos_v_version_review_decision_idx ON _videos_v(version_review_decision);
