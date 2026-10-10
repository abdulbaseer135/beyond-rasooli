# Editorial reliability fixes

Date: 10 October 2026 (Asia/Karachi). Branch: `fix/multilingual-editorial-reliability`.

## 1. Root cause analysis

1. **Language switching:** public article/video queries required an exact `language` match. The switcher offered only stored translation links. Missing language versions therefore removed items from discovery or prevented navigation. Explicit language filters also needed to recognize an original-content fallback in the selected library.
2. **Repeated publishing:** controls dispatched status changes separately from `submit()`, ignored unsuccessful form responses, and could display success after Payload validation failed. Publishing then invoked a second endpoint. Submission notifications were created both by the collection hook and by the API, with different event keys. Repeated publish requests updated review metadata even when the document was already published.
3. **Topic approvals:** topics lacked ownership and review feedback fields, a submission notification hook, and publishing controls. Approval updates did not pass the authenticated founder, so the editor-protection hook could restore pending status. Runtime tests additionally reproduced a required-name validation failure when the CMS locale differed from the authored topic locale.
4. **Dashboards:** root overview queries covered only articles/videos, approval counts used a five-item preview instead of total records, and editor queries compared user IDs with author-profile IDs. The current video schema had also removed author fields used by dashboard queries; this reproduced a query error in the editor dashboard.
5. **Video publishing:** the client save/feedback defects above affected videos as well. The installed Payload contract returns a response that must be checked and supports submission overrides. Valid collection-level POST requests, including `fallback-locale=null`, succeed for new videos; existing native saves use the document update operation. An invalid YouTube URL reproduces a field-level HTTP 400, with a sanitized request/response saved in `.qa/video-validation-response.json`. The exact historical 400 payload supplied in the original report was unavailable, so its individual validation field cannot be conclusively attributed. Both new and existing valid video publication paths now pass actual browser tests.

## 2. Changes made

| Files | Purpose |
|---|---|
| `src/lib/data/language-resolution.ts`, `src/lib/data/cms.ts`, `src/lib/data/content-types.ts`, `src/lib/discovery.ts` | Select eligible target translations first; retain original published content otherwise; preserve source language, relationships, authorship and rich text; recognize fallback entries in language filters. Resolve localized topic names without hiding published taxonomies. |
| `src/app/api/translations/route.ts` | Offer working routes for all supported languages, retaining real translation-group links where available. |
| `src/app/[locale]/read/page.tsx` | Deduplicate the all-language article listing. |
| `src/app/[locale]/read/[slug]/page.tsx`, `src/app/[locale]/watch/[slug]/page.tsx` | Show the CMS-editable fallback notice and apply the actual content language/direction. |
| `src/lib/seo/metadata.ts`, `src/lib/seo/structured-data.ts` | Canonicalize original-content fallbacks to their source URL, avoid indexing duplicate fallback pages, and report the actual article language. Video spoken language stays independent. |
| `src/components/admin/PublishControlsClient.tsx`, `src/components/admin/PublishControls.tsx` | Use native Payload overrides, check save responses, update state after success, block unchanged/repeated actions, preserve legitimate revisions, and supply editable publishing feedback. |
| `src/lib/content-lock.ts`, `src/app/api/admin/publish-now/route.ts`, `src/app/api/admin/submit-for-approval/route.ts`, `src/app/api/admin/content-reviews/route.ts` | Serialize conflicting endpoint actions, return repeat-operation success without rewriting published metadata, remove duplicate notification creation, enforce ownership, and support locale-aware topic actions. |
| `src/collections/Topics.ts`, `src/collections/shared/topic-workflow.ts` | Add topic ownership, draft/submission states, review decisions/notes, founder approval and notification lifecycle. |
| `src/collections/Articles.ts`, `src/collections/Videos.ts`, `src/collections/shared/auth-roles.ts`, `src/collections/shared/publication.ts` | Enforce approved-editor access to owned eligible drafts; prevent edits to pending/live content and private draft reads. Restore video author/profile fields required by ownership and attribution. |
| `src/collections/Notifications.ts`, `src/lib/notifications.ts`, `src/collections/shared/content-changes.ts` | Add topic notifications, pass the parent request/transaction into hook notifications, and key submission events by the submitted source revision. |
| `src/lib/admin-content.ts`, `src/components/admin/views/UnifiedContentList.tsx`, `src/app/(payload)/admin/[[...segments]]/page.tsx` | Normalize articles/videos/topics, count actual matches, apply ownership and server filters, and fetch bounded pages. |
| `src/components/admin/views/FounderDashboard.tsx`, `src/components/admin/views/EditorDashboard.tsx`, `src/components/admin/views/ContentApprovalsView.tsx` | Integrate unified content, published topic totals, real approval counts, server navigation and review feedback. Match actions by type plus ID. |
| `src/collections/UIStrings.ts`, `src/messages/en.json`, `src/messages/ps.json`, `src/messages/fa.json` | Add an editable dashboard namespace, multilingual labels and fallback/publishing notices. Native wording remains subject to founder review. |
| `src/payload-types.ts` | Regenerate schema types. |
| `tests/language-resolution.test.ts`, `tests/content-lock.test.ts`, `tests/dashboard-content.test.ts`, `tests/topic-workflow.test.ts` | Regression coverage for language fallback, private-content exclusion, concurrent actions, dashboard pagination/ownership, topic decisions and notifications. |
| `tests/admin-experience.test.ts`, `tests/editor-workflow.test.ts`, `tests/publishing-workflow.test.ts`, `tests/role-model.test.ts` | Update fixtures/assertions to the explicit approved-editor and draft-only access contract. |
| `scripts/qa-editorial-fixes-seed.ts`, `scripts/qa-editorial-fixes.mjs`, `scripts/qa-editorial-layout.mjs` | Reproducible isolated SQLite fixtures, real REST/browser workflows, responsiveness and scoped accessibility checks. |
| `docs/migrations/20261009_editorial_reliability.sql`, `scripts/migrate-editorial-reliability.mjs` | Additive PostgreSQL upgrade with transactional rollback. |

Existing unrelated working-tree changes and media were preserved. Earlier hydration/editor-account fixes remain in the workspace; this audit did not replace them.

## 3. Business logic

- A published eligible translation takes precedence. Otherwise, the selected-language route serves the original with an availability notice. **Per the user's explicit clarification, public requests never generate paid translations.** Stored original content is unchanged.
- Founders publish drafts or permitted revisions. Publishing an unchanged live document through the endpoint is idempotent. Publishing a scheduled item immediately sets a current publication time; ordinary live revisions preserve their publication date.
- Approved editors save owned drafts and submit them once. Pending content is immutable to editors until a founder returns it to draft with feedback. Topics use `pending`; the unified view normalizes that to `in_review`.
- Reject/request-changes operations preserve feedback and permit draft revision/resubmission. Founder approval publishes the correct persisted record and resolves its notifications.
- Dashboard pages fetch at most ten records **per selected type**. The mixed view merges those bounded pages; type-specific filters provide conventional ten-item pagination. Counts come from matching records, not preview lengths. Collections retain their existing founder-only CMS workflow; legal Pages retain their separate approval rules.

## 4. Security verification

Actual QA requests verified editor denial for publishing and approval endpoints, direct live-state REST mutations, another contributor's private draft, modification during review, and suspended-account creation/submission/login. Anonymous submission requests are denied. Draft content is unavailable through cross-language fallback. Ownership is set/preserved by trusted hooks. Founder decisions carry the authenticated user into local Payload updates.

## 5. Database changes

The migration adds topic submitter/reviewer relationships, decision/feedback/time fields, topic notification values, video attribution columns where absent, and the dashboard UI namespace. It does not delete or rewrite content, media or existing ownership. Legacy topics without submitter attribution remain founder-managed; ownership is not fabricated.

SQLite schema setup and all runtime fixtures used only `.qa/editorial-fixes.sqlite`; QA uploads use `.qa/media`. No production migration or production data edits were performed.

## 6. Testing results

| Feature | Original issue | Fix implemented | Result |
|---|---|---|---|
| Multilingual article switching | Content disappeared | Eligible translation selection and original-content fallback, working localized links/list filters | PASS under the user's no-paid-translation choice |
| Duplicate publishing | Repeated actions/side effects | Native overrides, persisted-state checks, endpoint locks and one notification hook | PASS |
| Editor topic approval | Missing/inconsistent queue | Ownership, notifications, locale-aware founder updates and feedback | PASS |
| Unified dashboard | Missing types/inaccurate counts | Articles/videos/topics, bounded pages, ownership/type/state filters | PASS |
| Founder video publishing | HTTP 400/false feedback | Verified native create/update operations, checked save results and preserved field validation | PASS for valid scenarios; historical payload unavailable |

Executed successfully: 57 unit/regression tests; TypeScript; ESLint with zero errors and 202 warnings; 15 real REST/Chromium scenarios; eight mobile/desktop layout checks (375/1280 pixels) across admin and en/ps/fa article pages; axe checks scoped to the new unified dashboard. Screenshots were visually inspected. Production build completed against isolated SQLite data. A final Chromium check against that production build confirmed an approved topic disappears immediately and remains absent after reload, with rejected/changes-requested tabs navigating to persisted server queries.

Evidence: `.qa/editorial-fixes-results.json`, `.qa/editorial-layout-results.json`, `.qa/video-validation-response.json`, and `.qa/editorial-*-mobile.png`.

## 7. Remaining verification and limits

- PostgreSQL migration execution and PostgreSQL advisory-lock runtime were not tested: no local PostgreSQL server was available and the Docker daemon was unavailable. Verify both on an isolated staging database before production deployment.
- Automatic public machine translation was explicitly declined. Visitors see an approved stored translation or the original plus notice.
- Existing lint warnings remain. Accessibility verification covers the changed unified dashboard, not a complete re-audit of every existing page.
- Native-script UI defaults require the founder's linguistic review. Existing authored content was not automatically translated or reassigned.

## 8. Deployment and reproduction

1. Back up the database and verify the migration on staging.
2. For PostgreSQL, run `node scripts/migrate-editorial-reliability.mjs` before deploying the new schema. The existing `DATABASE_URI` is used; no new provider variables are required.
3. Run the existing `npm run seed:localization` after the schema upgrade to add missing UI keys without replacing founder wording. Review the new dashboard and translation notice wording.
4. Deploy, restart the application, and smoke-test founder publication, editor topic submission/approval, and cross-language original fallback.

For isolated QA, set `BEYOND_QA=true`, `DATABASE_URI=file:./.qa/editorial-fixes.sqlite`, `QA_SCHEMA_SETUP=true`, and a dedicated test `PAYLOAD_SECRET`; run `npx tsx scripts/qa-editorial-fixes-seed.ts`, start the app on port 3100, then run `node scripts/qa-editorial-fixes.mjs` and `node scripts/qa-editorial-layout.mjs`. Use `QA_SCHEMA_SETUP=false` after initial schema setup. Test credentials in those scripts belong only to these fixtures.

The fix branch and working diff are prepared for review. Nothing was pushed or deployed.

## 9. Registration follow-up — 10 October 2026

The user authorized and the prepared migration was applied to the configured Neon database. All five topic governance columns were verified, and the previously failing topic SELECT succeeded.

Editor registration notifications now receive the user hook's Payload request, sharing the transaction that creates the pending account. A separate notification transaction could wait on the uncommitted user referenced by its actor foreign key. The registration route no longer repeats the notification operation. Password debug logging and raw internal error details in public responses were removed.

Verified directly against PostgreSQL: a pending editor and exactly one founder notification were created in one explicit transaction, then rolled back; no test account or notification was retained. The updated 58-test regression suite, TypeScript, and lint on the affected files passed. No additional schema migration is needed for this registration fix.

## 10. Approved topic visibility — 10 October 2026

Per the user's explicit follow-up, published topics now appear immediately in the public Topics index and resolve at their public URLs, including topics with no attached published article/video. This supersedes the earlier PRD rule hiding individual empty topic destinations; collection visibility remains governed by its existing rules. Draft and pending topics remain private. The public library cache key was advanced to avoid retaining previously filtered lists.

Verified the existing published topic's index link, detail page and reload in Chromium for en/ps/fa. TypeScript, affected-file lint and all 58 regression tests passed. No database records were changed for this verification.

## 11. Article body horizontal-rule paste — 10 October 2026

Payload 3.90.2's client horizontal-rule node inherits the server node's HTML import conversion. Pasting an HTML `<hr>` therefore constructs a different node class from the one registered in the browser editor. A scoped client compatibility module corrects that conversion using Payload's exported client node factory. The configured feature retains Payload's existing toolbar, Markdown support, node registration and server serialization. The generated admin import map points to the compatibility module.

Chromium verification in the founder article creation screen pasted HTML with paragraphs and a horizontal rule, verified the separator and following text were present, and detected no node mismatch errors. TypeScript, lint for the new modules and all 58 regression tests passed. Verification used the isolated QA database and did not save an article.

### Follow-up: repeated paste and detached-node error

The user's detached-node `__slots.values()` crash did not reproduce in a fresh isolated browser, including repeated ChatGPT-style HTML pastes. During investigation, multiple installed dependency folders were found missing their package manifests; a fresh main-app compilation failed to resolve Payload, its adapters, pg and sharp. The existing lockfile was retained and `npm ci --no-audit --no-fund` restored all dependencies. The main compiled cache was preserved under `.qa/next-before-editor-reset` and the development app restarted. This repairs the verified installation problem; a causal link to the user's specific detached-node crash remains unconfirmed.

After restoration, Chromium verified formatted paste with headings, a separator, quote, code, table and lists, followed by clicking, typing, undo/redo, native Save Draft and reload. The stored text and horizontal rule were preserved without editor errors. The test saved only an isolated QA article. All 58 tests, TypeScript and compatibility-module lint passed. The user must reopen the article tab to discard the earlier in-memory editor instance.
