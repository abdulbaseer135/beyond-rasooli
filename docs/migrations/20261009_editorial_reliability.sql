-- Additive topic governance upgrade. No existing content or ownership is rewritten.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_topics_review_decision' AND typnamespace = current_schema()::regnamespace) THEN
    CREATE TYPE enum_topics_review_decision AS ENUM ('none', 'approved', 'changes_requested', 'rejected');
  END IF;
END $$;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS submitted_by_id integer REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS review_decision enum_topics_review_decision DEFAULT 'none';
ALTER TABLE topics ADD COLUMN IF NOT EXISTS review_notes varchar;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS reviewed_by_id integer REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
CREATE INDEX IF NOT EXISTS topics_submitted_by_idx ON topics(submitted_by_id);
ALTER TABLE videos ADD COLUMN IF NOT EXISTS author_id integer REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS author_profile_id integer REFERENCES authors(id) ON DELETE SET NULL;
ALTER TABLE _videos_v ADD COLUMN IF NOT EXISTS version_author_id integer REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE _videos_v ADD COLUMN IF NOT EXISTS version_author_profile_id integer REFERENCES authors(id) ON DELETE SET NULL;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type' AND typnamespace = current_schema()::regnamespace) THEN
    ALTER TYPE enum_notifications_type ADD VALUE IF NOT EXISTS 'topic_approval';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_target_collection' AND typnamespace = current_schema()::regnamespace) THEN
    ALTER TYPE enum_notifications_target_collection ADD VALUE IF NOT EXISTS 'topics';
  END IF;
END $$;
ALTER TYPE enum_ui_strings_namespace ADD VALUE IF NOT EXISTS 'admin_content';
