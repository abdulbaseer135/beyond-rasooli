# Founder/Admin workflow audit and repair

Date: 7 October 2026. References: `MASTER_PRD.md` §§11–11.4, multilingual/content rules and launch checks; `BRAND_DEVELOPMENT_BRIEF.pdf`; `AGENTS.md`. Product requirements were not edited.

## Scope and evidence

Testing began with a clean SQLite database. The original first-registration endpoint accepted an Editor role for the first founder: this was reproduced in the browser/API and repaired. A second clean database exercised the complete lifecycle. A final, fresh database repeated the six founder-registration checks after all account changes.

All account and editorial fixtures were confined to `.qa/founder-audit-clean.sqlite`, `.qa/founder-workflow.sqlite`, and `.qa/founder-bootstrap-final.sqlite`, with a separate Next server on port 3100. No test editorial records were written to the founder's PostgreSQL database. Its account/schema inventory was read-only; it reported one Admin. No real account was promoted, reset or altered. A PostgreSQL migration test created a temporary schema inside a transaction and rolled it back; its result confirms zero real editorial rows written. The existing server on port 3000 was not stopped.

PASS means the stated behavior was exercised. PARTIAL separates verified local behavior from external services or untested variants. UNVERIFIED means there is no runtime evidence for that part. This report does not certify production launch readiness or native translation quality.

## 1–19. Workflow results

| # | Workflow | Result | Runtime evidence and limits |
|---|---|---|---|
| 1 | First founder creation | PASS | Six checks on the final clean database: missing name, malformed email, weak password, API confirmation mismatch, browser confirmation mismatch, successful browser creation/redirect/session. First account is forced to Admin even when a client requests Editor. Later first-registration attempts are rejected. Duplicate email rejection was exercised separately. |
| 2 | Login/logout/session | PASS | Correct login, wrong password, unknown email, lockout/unlock, refresh, logout and authenticated-page refresh. Expiry used a valid signed control JWT followed by the same claims with an expired timestamp. Native browser logout clears `/api/users/me`. Anonymous private APIs and review/preview routes are denied or redirected. |
| 3 | Password/security | PARTIAL | Twelve-character Unicode-aware letter/number rule, password change, hashed storage, reset request/token consumption, five-attempt lockout, reset throttling, HttpOnly/SameSite cookies and session expiry were exercised. Reset email used an isolated capture adapter. Real Resend delivery and production HTTPS Secure-cookie behavior are UNVERIFIED. Optional 2FA is not installed/configured. |
| 4 | Roles/profile | PASS | Admin/Editor API permissions exercised; Editor can update own name/bio but cannot promote self or manage another account. Last Admin cannot be demoted/deleted. Account profile image is not currently a User field; public Author profiles support an image. Native Editor status menu contains only Draft/In review. |
| 5 | Dashboard | PASS | Native Payload collection navigation retained. Admin and Editor each have five quick-add destinations. Review tools are linked separately. Authors and Glossary are registered native collections. Browser mobile check at 390px found no document overflow. |
| 6 | Article publishing | PASS | Editor draft/submit, Admin publish, reading-time computation, author projection, cover/media, sources, SEO, public Read/topic/search/sitemap eligibility. Native browser created, saved and published an Article. Unique language/slug/group identity enforced. |
| 7 | Video publishing | PARTIAL | Editor/API restrictions, Admin publish, valid YouTube URL, separate spoken language, transcript and companion link. Native browser created/saved/published a Video; public 9:16 ratio checked. Paste autofill and provider-failure behavior passed with isolated responses. Live YouTube oEmbed returned title/poster. Real duration autofill remains UNVERIFIED without an optional YouTube Data API key. |
| 8 | Topic publishing | PASS | Localized topic creation/editing and published-content eligibility exercised; empty topic destinations remain unavailable while core Topics navigation remains permanent. |
| 9 | Collections | PASS | Mixed Article/Video ordering/localized metadata; fewer than three distinct eligible items hides the collection. Duplicate relationships do not inflate the threshold. Editor publishing/archive bypass denied. |
| 10 | Pages/legal | PASS | Editor About draft/review, Admin publication and Pashto body rendering. Privacy/Terms reject publication without approval, reject Editor approval, publish only after Admin approval, retain versions, and return to draft/approval review after legal-body changes. Missing native legal translation returns 404. |
| 11 | Media library | PASS | PNG upload, required alt validation, rights metadata, WebP/responsive sizes, public rendering and invalid MIME rejection. SVG uploads are disabled to avoid active uploaded content. Existing media metadata fields remain available. Production persistent/object storage and expiry-cleanup hosting are UNVERIFIED. |
| 12 | Sources | PASS | Article/Video source title, organization, year and URL survive translation; only editorial notes translate. Public source output and companion links exercised. |
| 13 | Preview/live preview | PASS | Authenticated Article/Video/Page draft preview uses public components; anonymous access is redirected. Native Payload live preview displayed unsaved title changes for all three and saved titles remained unchanged. The Page locale-object URL defect was fixed. Collection preview equivalence was not separately browser-tested. |
| 14 | Scheduling | PARTIAL | Missing/invalid schedule denied, future content hidden, cancellation/rescheduling persisted, UTC timestamp retained with Asia/Kabul configuration, protected cron published a due item. Hosting's recurring scheduler and non-QA production timezone presentation remain UNVERIFIED. |
| 15 | Multilingual workflow | PASS | Separate en/ps/fa documents, shared translationGroup, independent status, distinct slugs and actual translation links. Browser checked English LTR, native RTL and article width ≤680px. Public item switches resolve stored eligible slugs; no fabricated cross-language route. |
| 16 | Translation workflow | PARTIAL | Manual generation into ps/fa for Article and Video persisted machine drafts with provenance/hash/date; rich-text structure, source identities and glossary prompt preserved. Machine noindex/sitemap exclusion, configurable review gate, human body/transcript/SEO saves, reviewer metadata, reviewed overwrite confirmation and source-change flags passed. Generation used a local provider fixture: real Anthropic quality, real spending reconciliation, do-not-translate fidelity are UNVERIFIED. English-target Article/Video generation and native Admin/Editor generation buttons passed using the isolated fixture. A zero-budget request returned 429 before provider invocation on the optimized server. Native side-by-side Editor review saved body/transcript edits, reviewer metadata and titles that persisted after browser reload. |
| 17 | UI-string review | PASS | Editor can propose review but cannot approve. Admin approval persists on reread; English change resets native review; stable key and placeholder integrity enforced. Browser Editor review page omits approval controls; native founder approval persists after browser reload. Static scan passes and bundled ps/fa dictionaries have every English key. This is not a founder's linguistic approval of wording. |
| 18 | Slug redirects | PASS | Article and Video published-slug changes return permanent 308 redirects. Actual item language switches return stored localized slugs. Redirect resolution stops at a live current document, preventing old redirect chains from overriding reused live slugs. |
| 19 | Unpublish/archive/delete | PASS | Unpublish and archive remove public eligibility while retaining admin records. Editor cannot bypass those actions. Published deletion is blocked; an archived fixture can be deleted. Native Payload's destructive-confirmation Cancel preserved the archived fixture; Confirm deleted it. |

## 4. Permission matrix

| Action | Admin | Editor |
|---|---|---|
| Create/edit editorial drafts | Allowed | Allowed |
| Submit draft for review | Allowed | Allowed |
| Publish/schedule/unpublish/archive | Allowed | Denied |
| Edit a currently published/scheduled/archived document | Allowed | Denied; return to draft through Admin first |
| Human-review eligible translation drafts | Allowed | Allowed |
| Overwrite reviewed translation | Explicit confirmation | Explicit confirmation; protected published states remain Admin-only |
| Approve Privacy/Terms | Allowed | Denied |
| Propose/edit UI wording | Allowed | Allowed subject to review rules |
| Approve UI wording | Allowed | Denied |
| Manage site settings/accounts/roles | Allowed | Denied; own account profile editable |
| Upload media/create Author/Glossary | Allowed | Allowed |
| Hard-delete protected editorial content | Archive/unpublish first | Denied |
| Demote/delete last Admin | Denied | Denied |

## 20. Security findings

Repaired first-founder privilege assignment, last-Admin loss, unnecessarily broad Editor user reads, publication/approval bypasses, short passwords, permissive upload types and missing trusted CSRF origins. Native Payload cookie authentication now validates the configured public origin. Cross-origin editorial mutations and anonymous review/translation APIs were tested. Custom review pages are private and noindex. Translation provider keys remain server-only. Production boot refuses missing/weak known-development secrets.

Sessions expire after two hours; five failed logins lock the account for ten minutes; reset tokens expire after thirty minutes, with a one-minute minimum request interval. QA email capture and the translation fixture require explicit QA settings; neither sends founder email nor charges a translation account. No secrets/passwords/reset tokens are included in this report.

Limits: account lockout is not a distributed edge/IP firewall; optional 2FA, trusted-proxy deployment, production TLS/cookies, backups/restore, hosting storage and deployed scheduler need operational verification. Payload's stock admin translations support English and Persian here; a fully translated Pashto stock admin is not claimed. Public Dari remains `fa-AF`, public Pashto/Dari are RTL, and editorial/custom-tool wording comes from CMS UI strings.

## 21. Files changed

Application/configuration:

- `src/payload.config.ts`, generated `src/payload-types.ts`, generated `src/app/(payload)/admin/importMap.js`.
- `src/collections/Users.ts`, `Articles.ts`, `Videos.ts`, `Media.ts`, `Pages.ts`; new `Authors.ts`, `Glossary.ts`, `shared/validation.ts`; `shared/publication.ts` and `shared/content-changes.ts`.
- `src/globals/SiteSettings.ts`.
- `src/components/admin/QuickAdd.tsx`, `PreviewDocument.tsx`; new `FounderRole.tsx`, `EditorialTools.tsx`, `EditorialToolsClient.tsx`; `src/app/(payload)/admin.css`.
- `src/app/api/generate-translations/route.ts`, `translate/route.ts`, `translation-review/route.ts`, `ui-string-review/route.ts`, `youtube-autofill/route.ts`.
- `src/app/[locale]/translation-review/page.tsx`, `review-report/page.tsx`, their protected `layout.tsx` files, `preview/page.tsx`, locale `layout.tsx`, `src/lib/seo/metadata.ts` for content OG/default metadata.
- New `src/app/(entry)/page.tsx` and `layout.tsx`; `src/proxy.ts` for the CMS-controlled root locale redirect.
- New `src/lib/cms-email.ts`; `src/lib/data/cms.ts`, `src/lib/translation/structure.ts`, `src/lib/youtube.ts`, `src/components/article/RichText.tsx`; en/ps/fa message dictionaries.
- `scripts/seed-localization.ts`, `package.json`; new `scripts/migrate-founder-workflow.mjs` and `docs/migrations/20261007_founder_workflow.sql`.
- `tests/public-behavior.test.ts`; isolated QA scripts `qa-founder-bootstrap.mjs`, `qa-founder-foundation.mjs`, `qa-founder-lifecycle.mjs`, `qa-founder-native-browser.mjs`, `qa-founder-editor-browser.mjs`, `qa-founder-live-preview.mjs`, `qa-founder-autofill.mjs`, `qa-founder-postgres-migration.mjs`, `qa-founder-built-smoke.mjs`, `qa-founder-review-browser.mjs`, `qa-founder-delete-browser.mjs`. Existing API QA clients were updated to send native cookie-auth same-origin headers.

There is no Git baseline for this workspace; this is the task change inventory, not a claim that every pre-existing workspace modification belongs to this audit. MASTER_PRD was not changed.

## 22. Tests run

Evidence JSON under `.qa/`:

- `founder-bootstrap-results.json`: 6 PASS on a final fresh database.
- `founder-foundation-results.json`: 11 PASS.
- `founder-lifecycle-results.json`: 14 PASS.
- `founder-native-browser-results.json`: 3 PASS.
- `founder-editor-browser-results.json`: 3 PASS.
- `founder-live-preview-results.json`: 3 PASS.
- `founder-autofill-results.json`: 3 PASS; duration configuration remains separate.
- `founder-postgres-migration-results.json`: additive schema and idempotency PASS; rolled back completely.

`founder-built-smoke-results.json`: 3 PASS (optimized root redirect, budget denial, all public home locales).

Additional evidence: `founder-review-browser-results.json` (4 PASS) and `founder-delete-browser-results.json` (1 PASS).

These are scenario groups, not 51 individual assertions. Some groups contain many API/browser assertions. Unit tests: 10/10 PASS. Static UI scan: PASS, zero findings; zero missing bundled ps/fa keys. Final lint: PASS. Final typecheck: PASS. Optimized production build (`npm run build -- --webpack`): PASS, 59 static pages generated. Built-server smoke: PASS. The earlier Windows sandbox `uv_os_get_passwd` error was resolved by running the test tools with required user-profile access. A stale generated validator was removed after moving the root redirect page.

Earlier failures were retained during investigation rather than treated as passes: first-founder Editor creation, translation array-ID collisions, future-state filter enforcement, source-change test setup, stale duplicate fixture slugs, media URL regression, Page live-preview locale URL, Video review source/field labeling and the root route's missing layout. Obsolete fixtures were archived/deleted only in the isolated database. The grouped QA reporters serialize evidence and now return a nonzero exit code if a scenario fails.

## 23. Corrections and founder operation

The first account becomes Admin automatically; later users default to Editor. Native Payload remains the CMS. Use Add content or the normal collection sidebar, select document language, fill required fields, save Draft and submit In review. Admin can choose Published or Scheduled with a future timestamp. Article reading time is computed automatically. Public bylines use Authors rather than exposing authentication account records.

For Video, paste a supported YouTube URL; autofill retrieves available title/poster/duration. Edit these fields manually if the provider fails. Keep spokenLanguage separate from document language. Save the source before generating another language. Generation creates or updates a linked draft with translation provenance; reviewed replacement requires confirmation. Review text/body/transcript/SEO and save human edits, then publish each language independently. Use the native CMS for remaining fields, tags, relationship and imagery changes.

Preview and Live Preview require login and do not publish. Schedule timestamps are stored in UTC; the tools show the configured publication timezone. A recurring deployment scheduler must call the protected POST `/api/publish-scheduled`. Use Draft to unpublish or Archived to retain retired work. Publishing changes create revisions; legal text changes reset approval. Published slug changes create redirects automatically.

## 24. Remaining issues and verification limits

No failing scenario remains in the final isolated lifecycle/browser evidence above. The entire production environment is not verified. Real reset email delivery, real Anthropic translation quality/cost controls, optional duration lookup, optional 2FA, storage/backup recovery, production cookies and recurring scheduling are not certified by isolated tests. Real provider quality and production operations remain separate from the exercised native browser/API controls.

New native wording is draft wording until founder approval. English fallback is expected on a completely unseeded first database. Run localization seeding after schema setup; it preserves existing founder wording and does not push schema. No founder approvals were fabricated in the real database.

## 25. Deployment and founder configuration

1. Back up the deployment database. Apply `npm run migrate:founder-workflow` to its PostgreSQL schema before running this release. The additive SQL was executed twice successfully in a disposable PostgreSQL schema and rolled back; it was NOT applied to the real public schema during this audit. It includes the new Authors/Glossary tables, version fields, settings fields and per-language cover alt. Do not rely on automatic PostgreSQL schema push.
2. Run `npm run seed:localization` against the deployment database to add missing CMS keys. Review/approve Pashto and Dari wording in the review report; do not mistake bundled drafts for approval.
3. Configure a strong PAYLOAD_SECRET, HTTPS public server URL, persistent media storage and backups. Verify an actual restore and ownership of hosting/domain/database accounts.
4. Configure RESEND_API_KEY and a verified CONTACT_FROM_EMAIL; perform one real reset-email delivery test. Password reset currently fails clearly if email delivery is unconfigured.
5. If enabling translation, choose the founder-owned Anthropic model/key, verified token prices, monthly budget, glossary and public-review policy. Validate real native output and budget exhaustion before enabling editorial use.
6. Optional YOUTUBE_API_KEY enables duration lookup. Optional 2FA needs an explicitly selected supported integration/configuration.
7. Configure CRON_SECRET and a recurring protected scheduling call; verify it in deployment.
8. Complete actual Privacy/Terms content and founder approvals; choose default locale, author profiles, social accounts, timezone and date/number formatting in Site Settings.

These are installation/service/approval steps, not code editing needed to publish normal content once the deployed CMS is configured.





