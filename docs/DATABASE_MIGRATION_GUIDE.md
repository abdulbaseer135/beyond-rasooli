# Beyond Rasooli — Database Migration, Backup & Rollback Guide

## Overview
This document specifies the database migration, backup, and rollback procedures for the Beyond Rasooli editorial system.
The production database is hosted on PostgreSQL (Neon / Managed PostgreSQL).
Local test suites run on an isolated SQLite database (`.qa/beyond-qa.db` or in-memory) to protect production data integrity.

---

## Non-Destructive Migration Principles
1. **Never drop or recreate existing tables**: All migrations use `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, and `CREATE TABLE IF NOT EXISTS`.
2. **Never overwrite existing founder accounts**: Users with `role = 'admin'` remain untouched with full privileges.
3. **Never delete historical content**: Articles, videos, collections, and media records are preserved.
4. **Preserve multilingual translations**: Translations in `ps`, `fa`, and `en` maintain existing `translationGroup` keys.
5. **Backfill safely**: Any new non-null column is added with a safe default, backfilled from existing relational keys, and then constrained.

---

## Migration Sequence

1. `docs/migrations/20261007_founder_workflow.sql`
   - Authors table, glossary table, site settings additions, localized metadata.
2. `docs/migrations/20261008_editor_workflow.sql`
   - User account status enum (`approved`, `pending`, `rejected`, `suspended`).
   - Editor application metadata fields (`reason_for_joining`, `applied_at`, `rejection_reason`).
   - Content submission tracking (`submitted_by_id`, `review_decision`, `review_notes`).
   - Topic status enum (`published`, `pending`, `draft`).
3. `docs/migrations/20261009_founder_notifications.sql`
   - Founder notification table (`founder_notifications`) for new registrations and review requests.
4. `docs/migrations/20261009_topic_fk_nullable.sql`
   - Topic foreign key constraint relaxation for draft proposals.
5. `docs/migrations/20261009_video_author_attribution.sql`
   - Video author attribution (`author_id`, `author_profile_id`).
   - Video versions attribution columns.
   - Historical video attribution backfill from founder user.

---

## Backup Strategy Before Applying Migrations

Before executing any migration against production:
```bash
# 1. Take a full PostgreSQL dump
pg_dump "$DATABASE_URI" --format=custom --file="beyond_rasooli_backup_$(date +%Y%m%d_%H%M%S).dump"

# 2. Verify dump integrity
pg_restore --list "beyond_rasooli_backup_$(date +%Y%m%d_%H%M%S).dump" | head -n 20
```

---

## Execution Instructions

Run migrations in a single transaction where supported:
```bash
psql "$DATABASE_URI" -f docs/migrations/20261009_video_author_attribution.sql
```

---

## Rollback Procedures

If a migration needs to be rolled back, execute the corresponding reversal script:

### Rollback `20261009_video_author_attribution.sql`:
```sql
ALTER TABLE _videos_v DROP COLUMN IF EXISTS version_author_profile_id;
ALTER TABLE _videos_v DROP COLUMN IF EXISTS version_author_id;
ALTER TABLE videos DROP COLUMN IF EXISTS author_profile_id;
ALTER TABLE videos DROP COLUMN IF EXISTS author_id;
```

### Full Database Restore (Emergency Disaster Recovery Only):
```bash
# WARNING: Only use if an unrecoverable corruption occurs during an external event
pg_restore --clean --if-exists --dbname="$DATABASE_URI" "beyond_rasooli_backup_<timestamp>.dump"
```
