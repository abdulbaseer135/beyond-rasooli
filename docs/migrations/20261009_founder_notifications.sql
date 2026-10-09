-- ==============================================================================
-- Beyond Rasooli — Migration: Founder-Only Notification System
-- Date: 2026-10-09
-- Description:
--   Additive, non-destructive PostgreSQL schema migration.
--   Creates the notifications collection table, notification enum type,
--   and performance indexes for the Founder Notification Center.
--
-- Supported Database:
--   PostgreSQL (Neon / Managed PostgreSQL)
-- ==============================================================================

-- 1. Create Notification Type Enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum_notifications_type AS ENUM (
      'editor_registration',
      'article_approval',
      'video_approval',
      'article_resubmission',
      'video_resubmission'
    );
  END IF;
END $$;

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id serial PRIMARY KEY,
  recipient_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type enum_notifications_type NOT NULL,
  title varchar NOT NULL,
  message text NOT NULL,
  actor_id integer REFERENCES users(id) ON DELETE SET NULL,
  target_collection varchar,
  target_id varchar,
  submission_revision varchar,
  read_at timestamp(3) with time zone,
  resolved_at timestamp(3) with time zone,
  deduplication_key varchar UNIQUE,
  link varchar,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

-- 3. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications (read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_resolved_at ON notifications (resolved_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_target ON notifications (target_collection, target_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup_key ON notifications (deduplication_key);
