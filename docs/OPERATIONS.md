# Beyond Rasooli — Operations & Reliability Guide

## 1. Operations Targets
As defined in PRD Section 15:
- **Availability Target:** 99.5% monthly uptime.
- **Recovery Point Objective (RPO):** 24 hours (daily automated backups).
- **Recovery Time Objective (RTO):** 4 hours (full database & media restore).

---

## 2. Backup Strategy & Automation

### Automated Database Backups
- **PostgreSQL (Production target e.g. Neon, Supabase, Railway):**
  - Managed automated daily backups with point-in-time recovery (PITR) enabled.
  - Manual backup command:
    ```bash
    pg_dump --clean --if-exists --no-owner --no-privileges -d "$DATABASE_URI" -f "backup-$(date +%Y%m%d_%H%M%S).sql"
    ```
- **SQLite (Local / Self-hosted):**
  - Snapshot `data/beyond_rasooli.sqlite` daily:
    ```bash
    sqlite3 data/beyond_rasooli.sqlite ".backup 'backups/beyond_rasooli_$(date +%Y%m%d).sqlite'"
    ```

### Media Storage Backups
- Media assets uploaded via Payload CMS (`public/media` or S3/Cloudflare R2 bucket) must have object versioning enabled.
- Daily synchronization of media bucket to secondary cold storage.

### Disaster Recovery & Restore Procedure
1. Provision a clean PostgreSQL instance.
2. Restore database state:
   ```bash
   psql "$DATABASE_URI" < backup-20261006.sql
   ```
3. Set environment variables in `.env` matching production.
4. Run schema check / verification:
   ```bash
   npm run build
   ```
5. Confirm CMS admin access at `/admin` and verify public routes (`/ps`, `/fa`, `/en`).
6. Test restore drill quarterly.

---

## 3. Uptime & Health Monitoring
- **Healthcheck Endpoint:** `GET /api/health`
  - Returns `{ status: 'ok', timestamp: '...' }` with HTTP 200.
- **Recommended Monitor:** BetterStack / UptimeRobot (Free tier owned by founder).
  - Check interval: 3 minutes.
  - Alerts: Email and SMS alerts to the founder and engineering lead upon consecutive failure.

---

## 4. Error Tracking & Sentry
- Configure `SENTRY_DSN` in production environment.
- Any unhandled server error or hydration exception will alert the engineering team during the 90-day stabilization window.

---

## 5. Security & HTTP Headers
Configured in `next.config.mjs`:
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options`: `SAMEORIGIN` (enables CMS admin live preview while preventing clickjacking)
- `X-Content-Type-Options`: `nosniff`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`: whitelisting YouTube (`youtube-nocookie.com`), Cloudflare Turnstile, and self-hosted assets.
