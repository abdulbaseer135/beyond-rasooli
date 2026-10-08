# Scheduled publishing

Set a strong CRON_SECRET and call POST /api/publish-scheduled every minute with an Authorization: Bearer token from a founder-owned scheduler. The endpoint persists due Scheduled records as Published. Public queries do not expose Scheduled content early. Legal approval is enforced by the Page hook. Each invocation processes at most 100 due records per collection and locale; later invocations finish additional records.

Scheduler deployment and a production execution are UNVERIFIED. Never share the token in a browser or a public URL.
