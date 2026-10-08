# Localization repair — 7 October 2026

## Why the URL changed while the text stayed English

The actual configured PostgreSQL database contained zero UI-string records and zero localized editorial records. The locale routes and CMS-first message loader worked, but every missing interface value used the documented bundled English fallback. Earlier populated SQLite QA fixtures concealed the real setup gap. A localized SiteSettings tagline also had an English default. Topic/collection projection incorrectly copied a selected language value into every locale slot.

The repair populates the actual CMS rather than adding visitor-time machine translation or substituting bundled native dictionaries for CMS ownership.

## Stored records repaired

- 306 UI-string records now contain English, Pashto and Dari values. All 612 native values are `ai_draft`; none were falsely approved.
- SiteSettings tagline is stored separately for en, ps and fa.
- Every initially missing UI key is enumerated in [.qa/localization-real-inventory.json](../.qa/localization-real-inventory.json). Its `missing` lists are now empty.
- Existing wording/status is preserved by the idempotent repair. A second execution created/updated zero records. When customized English differs from the bundled source, the command reports missing translations rather than inserting translations of different wording.
- No accounts, editorial stories, legal approvals or published translations were invented.

## Sources and behavior

Public interface text uses CMS `ui-strings` through `getMergedMessages`, with bundled English only when a value is genuinely missing. CMS draft native values render for review. The seed reads existing native starter dictionaries and writes them to editable CMS records; it does not translate on visitor requests.

Settings, Pages, Topics and Collections use the selected Payload locale with `fallbackLocale: false`. Topic/collection projections now populate only the actual selected language. About uses active-locale CMS Page content when available, otherwise CMS UI-string About copy. Approved legal translations remain gated.

Articles and Videos continue to require the exact document language and eligible Published status. Item switches resolve translationGroup to each document's actual slug. Missing languages are omitted and fabricated native routes return 404. Permanent public navigation remains independent of content counts.

English uses en/ltr, Pashto ps/rtl, Dari fa-AF/rtl. General switches reload the whole document and preserve relevant query state.

## Files changed

- `src/lib/localization/ui-seed.ts`: shared missing-value repair, preserving founder wording and draft status.
- `scripts/seed-localization.ts`, `package.json`: account-independent, idempotent `npm run seed:localization`; no PostgreSQL schema push.
- `scripts/seed.ts`: existing seed can also fill genuinely missing native values.
- `src/lib/ui-strings.ts`: expose missing native CMS coverage through server diagnostics.
- `src/globals/SiteSettings.ts`: remove English default from localized tagline.
- `src/lib/data/cms.ts`: native tagline fallback and honest locale projection.
- `src/app/[locale]/page.tsx`: handle PostgreSQL's null featured-video relationship safely.
- `src/app/api/ui-string-review/route.ts`: move review operations away from Payload's native `/api/ui-strings` endpoint, restoring native collection listing/creation.
- `src/app/[locale]/review-report/page.tsx`: use the dedicated review endpoint.
- `tests/public-behavior.test.ts`: meaningful seed preservation/draft-status tests.
- `scripts/qa-localization-visible.mjs`, `scripts/qa-localization-editorial.mjs`: actual visible-language browser checks.
- Existing `qa-runtime`, `qa-integration`, `qa-extended`, `qa-navigation` scripts: update review endpoint while retaining native per-record API URLs.

## Hardcoded text

The English localized-field default was removed. The public JSX/label scan reports zero findings and both native dictionaries have zero missing starter keys. This scan does not claim to prove dynamic CMS content or third-party admin translations; actual visible browser assertions supplement it. Proper nouns, bibliography titles and developer identifiers remain unchanged.

## Remaining content

The actual database still has zero Articles, Videos, Topics, Collections and Pages. There are therefore no existing editorial manuscripts to translate or publish. Their public index pages show localized editorial empty states. Native About interface copy is present as a draft; founder-authored CMS Page manuscripts and approved legal translations are still absent. All 612 native UI values need founder review. The configured AI translation provider is unavailable; no live translation service was introduced.

## Verification

Lint, 10 automated tests, UI-string scan and production build/type checking pass. Browser verification results are recorded in `.qa/localization-real-browser.json` and `.qa/localization-editorial-browser.json`; the former uses the actual PostgreSQL CMS, the latter explicitly uses isolated test editorial records. See the verification results appended below.

### Verified browser results

- **Actual PostgreSQL:** 27 routes: Home, Watch, Read, Topics, About, Search, Contact, Sources and Collections in each of en/ps/fa. Assertions checked visible navbar labels, hero/headings, About paragraphs, form/filter/sort labels and footer copy, not just paths. Native pages were also checked for exact reused English interface values. All passed.
- **Actual PostgreSQL:** four Home selector transitions verified changed hero/footer text and document direction; missing native item routes returned 404. Together the real-CMS script reports **29 passed groups, zero failures and zero browser page errors**.
- **Actual PostgreSQL mobile:** all three locale Home pages at 360px have no horizontal overflow; desktop Pashto and mobile Dari screenshots were visually inspected.
- **Isolated SQLite editorial fixtures:** `/en/read/qa-memory-en`, `/ps/read/qa-memory-ps`, `/fa/read/qa-memory-fa`, `/en/watch/qa-video-en`, `/ps/watch/qa-video-ps`, `/fa/watch/qa-video-fa`. Assertions compare stored titles and actual article paragraphs/video description/transcript with rendered text, and switch to real sibling slugs.
- **Isolated SQLite:** missing item languages hidden, native CMS UI-string list/create/delete passed, dedicated review endpoint returned the review records.
- **Isolated SQLite navigation suite:** all 8 groups passed, including 21 general-page selector transitions across Home/Watch/Read/Topics/About/Contact/Search, published-content absence, article/video switches, missing translation, preserved search query, Admin/Editor quick-add and anonymous exclusion.

To repair another configured environment without changing existing founder wording, run `npm run seed:localization`, then review native drafts in Payload or the translation review report. This is a deliberate trusted setup command; visitors never invoke it.

### Footer social labels and icons follow-up
The five social UI keys (ui.youtube, ui.instagram, ui.tiktok, ui.facebook, ui.x) now have native Pashto/Dari names in both starter dictionaries and the actual CMS. Changed native values remain ai_draft. Footer links include decorative monochrome 20px SVG brand icons at 1.5px stroke, with text retained as the accessible link name and flex gap spacing that adapts to RTL. Changes: Footer.tsx, SocialIcon.tsx, globals.css, ps.json and fa.json.
Verification: actual CMS browser assertions passed for all five localized social labels and decorative SVG icons on /en, /ps and /fa; 360px Pashto layout passed overflow verification. Lint, typecheck, 10 tests and UI scan passed. Fresh Webpack production build passed (dependency cache warnings only).
