# CMS schema transition

The correction pass changes schema fields and adds version history, translation usage, and slug redirects. Production PostgreSQL migration and deployment are UNVERIFIED. Do not deploy over a production database without a backup, a generated/reviewed migration, and a staging restore test.

Existing Collections now default to Draft and need founder review before publication. Page status and legal approval are localized; inspect each locale explicitly after migration and approve/publish Privacy and Terms separately. Do not copy a previous legal approval across newly translated wording. Existing Articles/Videos retain their independent language documents and translation groups.

Run npm run seed after a founder account exists to create only missing UI records and missing taxonomy records; it preserves existing wording and approvals and never invents/publishes legal pages or stories. Absent records appear as Missing in the review report. Newly seeded Pashto/Dari starter wording remains AI draft until native review; existing founder wording and approvals are preserved. Run npm run check-launch against staging before release.

QA is isolated with BEYOND_QA=true and DATABASE_URI=file:./.qa/final.sqlite. QA_SCHEMA_SETUP=true is used only during fixture initialization; schema pushing is disabled during browser verification. QA artifacts and fixtures must not be deployed.
