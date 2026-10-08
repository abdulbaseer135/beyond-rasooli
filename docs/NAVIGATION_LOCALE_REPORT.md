# Permanent navigation, locale switching and CMS quick-add

7 October 2026. Implements the founder directive overriding the former blanket PRD empty-page rule. MASTER_PRD now explicitly preserves core navigation/index routes and distinguishes them from optional empty sections and individual topic/collection destinations.

## Behavior

- The public Header always renders Home, Watch, Read, Topics, About, in that order, on desktop and in the mobile menu. These are stable key identifiers, not hardcoded display labels. Labels remain CMS-first `nav.*` values via next-intl, with documented English fallback only when missing. Content counts cannot remove a primary link.
- General Home/Watch/Read/Topics/About/Contact/Search (and Collections index) locale destinations always exist, independently of library contents. The selector performs a full locale navigation: the root document language/direction, CMS-backed messages, headings, controls, metadata and footer load for the target locale. Pashto is ps/rtl; Dari is fa-AF/rtl; English is en/ltr.
- Search/filter query parameters survive general-page switching. A Read language filter matching the departing UI locale changes with the selected locale. Explicit other-content-language selections remain intentional.
- Article/video switching continues to resolve eligible Published documents through translationGroup and actual slugs. It never fabricates a missing translation or serves another-language manuscript under an RTL route. Unavailable item languages are omitted; this does not affect primary navigation. Resolver state is keyed by both pathname and locale to prevent stale options.
- Watch/Read retain localized no-results states; Topics now has a localized editorial empty message. Individual empty topic destinations remain hidden.
- Payload's supported `beforeNavLinks` extension supplies an expandable Add content group linking to its native New Video, New Article, New Topic, New Collection and New Page forms. The native collection sidebar is preserved. This group is available through Payload's normal sidebar/menu toggle and is not a replacement dashboard.
- Quick-add renders only for authenticated Admin/Editor principals. Editors may create/edit draft Pages and submit for review; publishing and legal/UI approvals retain Admin restrictions. Other collection role guards remain in force.

## Files changed

- src/components/layout/Header.tsx
- src/app/[locale]/layout.tsx
- src/components/layout/LanguageSwitcher.tsx
- src/app/api/translations/route.ts
- src/app/[locale]/topics/page.tsx
- src/components/admin/QuickAdd.tsx (new)
- src/payload.config.ts
- src/app/(payload)/admin/importMap.js (generated)
- src/app/(payload)/admin.css
- src/collections/Pages.ts
- src/messages/en.json, ps.json, fa.json
- docs/MASTER_PRD.md
- scripts/qa-navigation.mjs (new browser regression checks)
- scripts/qa-add-navigation-strings.ts (new, restricted isolated-QA seed helper)
- docs/NAVIGATION_LOCALE_REPORT.md

## Verification

PASS: production build, ESLint, TypeScript, nine existing behavioral tests, public hardcoded-label scan, zero missing bundled PS/FA starter keys.

PASS: eight grouped Playwright checks against isolated production-mode SQLite fixtures on port 3100, recorded in .qa/navigation-results.json:

1. Temporarily archived all published QA articles/videos, verified five CMS-localized primary links on /en, /ps, /fa and empty Watch/Read/Topics routes, then restored the fixture publication states in a finally block. Empty section indexes still offered all three locales.
2. Operated the real selector on Home/Watch/Read/Topics/About/Contact/Search for each target locale (21 transitions). Asserted destination route, HTML lang/dir, localized navigation and footer; checked applicable page headings against CMS values.
3. Operated Article and Video selectors in both directions across all three languages (six transitions), checking distinct localized slugs.
4. Used the English-only QA scheduled article to verify that Pashto/Dari options were absent and the fabricated Pashto route returned 404.
5. Confirmed a search query survives switching to Dari.
6. Admin: opened native Payload sidebar, expanded quick-add, verified five native creation destinations and the retained collection sidebar.
7. Editor: repeated the five native creation destinations/sidebar checks.
8. Anonymous login: quick-add absent.

PASS: separate persisted Editor Page permission check: create Draft, transition to In review, reject approval/publication. Evidence: .qa/navigation-permissions.json. Only isolated QA data was used; no production content or approvals were changed.

Two initial browser-test assumptions were corrected: native select options require attachment rather than visual visibility, and Payload's initially collapsed sidebar must be opened before its controls can be clicked. The successful run uses normal interactions, not forced clicks.

## Translation and launch notes

Existing founder values/approvals were preserved. New CMS keys are `ui.add_content`, `ui.new_video`, `ui.new_article`, `ui.new_topic`, `ui.new_collection`, `ui.new_page`, `topics.empty`. EN fallback plus PS/FA starter wording is supplied. New native wording is unapproved; it must be seeded into the real CMS using the existing safe seed workflow and reviewed by native/founder reviewers. No bundled starter keys are missing. Real production CMS missing-value/approval inventory was not queried or changed during these isolated tests; genuine missing values continue to use documented English fallback.

Localized CMS editorial content, About/legal manuscripts, taxonomy descriptions, media captions and Site Settings still require actual per-locale wording. Interface locale switching does not translate such manuscripts on demand. Only approved/published legal translations are offered. Real-device/screen-reader and live-provider checks remain outside this scoped verification.
