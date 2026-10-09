-- Migration: Allow topic_id and version_topic_id to be nullable to support ON DELETE SET NULL foreign keys
-- Date: 2026-10-09

ALTER TABLE "articles" ALTER COLUMN "topic_id" DROP NOT NULL;
ALTER TABLE "videos" ALTER COLUMN "topic_id" DROP NOT NULL;
ALTER TABLE "_articles_v" ALTER COLUMN "version_topic_id" DROP NOT NULL;
ALTER TABLE "_videos_v" ALTER COLUMN "version_topic_id" DROP NOT NULL;
