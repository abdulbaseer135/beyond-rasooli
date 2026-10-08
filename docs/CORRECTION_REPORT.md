# Beyond Rasooli correction report

Date: 7 October 2026. References: MASTER_PRD v6.0, BRAND_DEVELOPMENT_BRIEF.pdf, AGENTS.md, and the preceding implementation audit. The PRD overrides the supporting brief.

The correction pass preserves Next.js, Payload, the existing content architecture, and the ivory/ink/sage editorial identity. Public content now comes from Payload rather than demonstration arrays. This is an implementation and isolated-QA report, **not production launch approval**. Real production migration, editorial approvals, provider delivery, and physical-device checks remain separate gates.

## 1. Critical issues corrected

| Previous defect | Correction | PRD | Evidence |
|---|---|---|---|
| Public pages ignored CMS content | Request-scoped Payload loaders resolve exact-language published articles/videos, localized taxonomy, collections, pages, media, settings, and safe author projections. Public routes use these loaders. | 10, 11, 13 | CMS author rendered in QA; native Payload Save persists; public content fixtures render across three locales. |
| CMS UI-string edits did not affect the website | CMS-first values, English-only bundled fallback, request-scoped caching, persistent review statuses, missing-key inventory, editable review tools. No redeployment needed for wording edits. | 11.1, 11.4 | Runtime CMS wording override appeared on public Home without rebuilding. Approval/edit/reset integration passed. |
| Draft/future content and publishing privileges were unsafe | Public article/video access excludes ineligible publication dates and machine drafts when review is required. Collections exclude future publication dates. Editors cannot publish or alter already published content. | 11.4 | Anonymous draft/future access and editor restrictions tested. |
| Legal publication was disconnected from founder approval | Localized CMS Pages; only Admin approves; unapproved legal publication rejected; changed approved wording resets to awaiting approval and Draft; footer uses eligible records. | 11.2, 11.4 | Legal publish rejection and approval reset tested. Production legal copy remains unapproved/unverified. |
| Review/provider tools were public or simulated | Authenticated report/review/preview routes and provider APIs; successful review means an actual persisted CMS update; provider failure returns no mock text. | 11.3, 11.4, 15 | Anonymous provider/UI access denied; persistent review actions and authenticated screens tested. |

## 2. High issues corrected

- Watch and Read use CMS eligibility, URL-based filters, bounded load-more, sorting, and Arabic-aware search. Watch filters spokenLanguage independently of page language. Read defaults to the current locale and changes content language only when explicitly selected.
- Language switching resolves actual translationGroup documents and their distinct slugs. Missing/ineligible translations disappear. Machine translations remain excluded from indexing/hreflang. Dari uses fa-AF for document metadata.
- Rich text preserves headings, paragraphs, lists, links, uploads, captions, quotes, evidence, numbered parts, and supported video blocks. Internal relationship links resolve document language or the current page locale.
- Article reading measure is 680px; cover media, shared Sources, author details, correction notes, dates, functional sharing, and mixed article/video recommendations are connected.
- Video details restore the mobile heading → player → Go Deeper sequence, real companion-article resolution, description, transcript, sources and fallback recommendations. The YouTube facade loads on interaction, does not request autoplay with sound, contains landscape posters, handles invalid URLs, and offers retry/YouTube recovery.
- Search and mobile navigation use native modal dialogs with initial focus, focus trapping/background isolation, Escape, body-scroll control and focus restoration. Navigation uses anchors rather than nested buttons.
- Contact validates on both sides, focuses invalid fields, verifies Turnstile server-side, rejects honeypots/direct collection bypass, applies persisted throttling, and reports storage versus email delivery truthfully. Live delivery is UNVERIFIED.
- Optional newsletter stays absent when disabled. When configured, it requires consent, approved privacy, Turnstile and a supported provider; provider failures are reported truthfully. Live provider/double-opt-in behavior is UNVERIFIED.
- Payload preview and the official live-preview SDK display authenticated draft/unsaved changes without publishing them. Native editing remains intact.
- Protected scheduling worker transitions due Scheduled content to Published. Deployment of its cron trigger is UNVERIFIED.
- Published slug changes create permanent redirects. Source changes flag reviewed translations; review clears that flag. A regression discovered during QA was fixed and tested.
- Translation generation preserves rich-text structure, publication isolation, provenance, SEO fields, captions, evidence, correction wording and explanatory source notes. Budget reservations/usage are persisted. Actual provider output and long manuscripts are UNVERIFIED; incomplete structured responses are rejected rather than silently published.

## 3. Medium/Low design corrections

| Area | Final implementation | PRD |
|---|---|---|
| Global system | Required palette, restrained surfaces, permitted shadow, 4px cards/inputs, pill chips, square hero; semantic type roles replace prominent arbitrary sizes. | 6 |
| Typography | Local Newsreader/Inter and Noto Naskh/Noto Sans Arabic; script-specific sizes/line heights; Arabic italics/tracking disabled; full-glyph WOFF2 assets and font licenses. | 6.2, 13 |
| Header/navigation | Consistent page starts; header hides while scrolling down and returns scrolling up; active navigation; mounted search; actual translated destinations. | 8, 9, 13 |
| Homepage | Required section order; actual selected/latest video; responsive media; dominant feature article; restrained collections, text-led topics and About; empty destinations hidden. | 9.1 |
| Watch/video | 9:16 contained media, persistent play cue, metadata outside posters, 360px filter layout, correct audio-language labels and article bridge. | 9.2, 9.3 |
| Read/articles | 3:2 card imagery, feature hierarchy, readable metadata, structural long-form content and 680px reading width. | 9.4, 9.5 |
| Topics/collections | CMS-managed eligible topics; featured item before secondary grids; collections count resolved published items, require three, use actual links and ordered lists when sequential. | 9 |
| Forms/search | Shared input/button treatment, 44px control heights, darker form boundaries, focus/error/disabled/loading/status behavior, localized empty/error states. | 8, 9, 15 |
| Footer | Dark inverse tokens, tighter rhythm, state-aware destinations, settings-based social URLs, Sources hidden when empty, approved legal links only. | 8, 11 |
| CMS/admin | Supported Payload graphics/configuration and theme tokens; branded auth, loaded editorial/UI fonts, Arabic editing support; intrusive blanket overrides removed. | 11, 13 |
| Mobile | Layout checked at 360, 480, 768, 1024 and 1280 in EN/PS/FA; contained media avoids destructive cropping. | 6.3, 15 |
| RTL | Logical layout, directional icon mirroring, explicit document language/direction, bidi isolation and script-specific role overrides. | 13 |
| Accessibility | Native dialogs, correct selected semantics, visible light/dark focus, semantic controls/headings, CMS alt text and meaningful status announcements. | 15 |
| SEO | Page-specific canonical/OG metadata, actual eligible hreflang, locale-aware PNG typography, safe JSON-LD, redirects, and restricted/noindex editor routes. | 14 |

QA media is intentionally synthetic and isolated. Its sage fields in screenshots are test fixtures, not new public placeholder designs. Real founder media is not invented or silently published.

## 4. Verification

All checks use isolated SQLite fixtures under .qa and the production Next build on port 3100. The existing user server on port 3000 was left alone. Production CMS content was not seeded, approved, or intentionally changed by QA.

| Check | Result | Scope/evidence |
|---|---|---|
| ESLint | PASS | Repaired flat ESLint configuration; final lint exits successfully. |
| TypeScript | PASS | tsc --noEmit --incremental false; includes new regression test. |
| Automated behavior tests | PASS, 9/9 | Publication, review eligibility, Arabic normalization, official YouTube URLs, spoken-language filtering, pagination, validation, structural translation and source-change regression. |
| Hardcoded public-label scan | PASS, zero findings | Public JSX labels/accessible attributes; hidden styleguide fixtures, CMS schema labels and third-party native admin text are outside this static scan. Not proof that all dynamic copy is correct. |
| Bundled PS/FA starter completeness | PASS | Zero missing dictionary keys. **Not native translation approval.** |
| Production build | PASS | Production-mode isolated QA build, server-rendered editorial/API routes and 59 generated static entries. Production PostgreSQL deployment is not covered. |
| Route/responsive matrix | PASS, 195 visits | 13 route patterns × three languages × five breakpoints. Expected 404 checked. Rerun on the final build after rich-text/SEO refinements: no horizontal overflow, 5xx/navigation failures or browser page errors. .qa/browser-results.json. |
| Automated accessibility | PASS on samples | Axe WCAG 2 A/AA and 2.1 AA on Home, Contact, Article and Video at 360px in each locale; zero violations. Does not replace manual assistive-technology review. |
| Initial integration checks | PASS, 13/13 | Auth, translated slugs, UI review persistence, translation review, drafts/future, legal approval, scheduler, contact validation, OG, dialog focus, mobile video order, reading width. .qa/integration-results.json. |
| Extended integration | PASS, 7/7 | Editor restrictions, source-change flag/review clearing, disabled newsletter, unsaved authenticated preview, native CMS/login, landscape/reflow layout and slug redirects. .qa/extended-results.json. |
| Runtime CMS checks | PASS, 3/3 | UI edit visible without rebuild; actual native Payload Save persists; authenticated report/review screens render. .qa/runtime-results.json. |
| Final metadata/access smoke | PASS, 4/4 | Current-page sharing/canonical metadata, real translated slugs, no invented taxonomy alternates, future collection exclusion and published About editor protection. .qa/final-smoke-results.json. |
| Internal links | PASS | 36 representative pages, 40 unique internal navigation URLs, no failures. .qa/link-results.json. External sites, YouTube playback and provider destinations not crawled. |
| Arabic font coverage | PASS | Required Pashto characters exist in both Arabic WOFF2 fonts. .qa/font-coverage.json; compression sizes .qa/font-sizes.json. |
| Visual review | PERFORMED | EN/PS/FA mobile Home; desktop PS article, FA video, admin login and locale OG screenshots inspected. Synthetic media limits editorial composition judgments. |

Failures found while working were corrected, not relabeled: an access-result TypeScript error, schema hot-reload collision in an abandoned QA run, an incomplete preview test fixture, and the source-change flag regression. Later successful evidence replaces those interrupted/failed runs. Node test execution required leaving the read-only sandbox after a sandbox user-lookup failure.

## 5. Files involved

Core implementation paths, including new files and refinements:

- `src/lib/data/cms.ts`, `content-types.ts`, `publication.ts`; `src/lib/ui-strings.ts`, `discovery.ts`, `search.ts`, `search-normalize.ts`, `contact-validation.ts`, `youtube.ts`, `fonts.ts`; `src/lib/seo/{metadata,structured-data,json-ld}.ts`; `src/lib/translation/{adapter,structure}.ts`.
- `src/collections/{Articles,Videos,Topics,Collections,Pages,Media,Users,UIStrings,Contacts,TranslationUsage,SlugRedirects}.ts`; `src/collections/shared/{publication,content-changes,sources}.ts`; `src/globals/SiteSettings.ts`; `src/payload.config.ts` and generated `src/payload-types.ts`.
- `src/app/[locale]/layout.tsx`, `page.tsx`, `error.tsx`, `not-found.tsx`; About, Watch/video, Read/article, Topics/detail, Collections/detail, Search, Contact, Sources, Privacy, Terms, preview, review-report and translation-review routes/layouts.
- `src/components/layout/{Header,Footer,Hero,LanguageSwitcher}.tsx`; cards `{ArticleCard,VideoCard,CollectionCard,GoDeeperCard}`; article `{ArticleHeader,RichText,EditorialBlocks,ShareRow}`; `VideoPlayerFacade`; home/read/watch library wrappers; search/filter components; forms `{ContactForm,NewsletterForm,Turnstile}`; UI `{Button,TopicChip,Dialog}`; admin `{Brand,PreviewDocument}`.
- APIs `{contact,newsletter,translate,generate-translations,translation-review,translations,ui-strings,publish-scheduled,og}`; public sitemap/robots; Payload layout/admin page, active generated import map, admin stylesheet.
- `src/app/globals.css`; `src/i18n/{config,routing,request}.ts`; `src/proxy.ts` (supported replacement for middleware convention); `src/messages/{en,ps,fa}.json`.
- Local font TTF/WOFF2 assets and OFL licenses in `public/fonts/`.
- `scripts/{seed,check-ui-strings,check-launch,qa-seed,qa-refresh-strings}.ts`; browser/integration/extended/runtime/link/final-smoke QA scripts; `tests/public-behavior.test.ts`.
- `package.json`, lockfile, `eslint.config.mjs`, `next.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.example`; migration, scheduling, translation, newsletter and starter-review documentation; this report and corrected verification summary.

Formatting was also normalized in touched source files. There is no Git baseline in this workspace, so a byte-level before/after Git diff is unavailable. Bundled demonstration arrays remain development-only; public routes do not import them. QA fixtures/reports/screenshots are ignored and must not be deployed.

## 6. CMS integration status

IMPLEMENTED and verified against isolated fixtures: public read integration, media and author projection, UI strings, legal/review guards, review persistence, role restrictions, native editing, draft/unsaved preview, scheduling endpoint, redirects and source flags.

UNVERIFIED against the real production database: migration/backfill, locale approvals, existing record compatibility, complete founder publishing rehearsal, PostgreSQL scheduling concurrency, backup/restore and deployment. See CMS_MIGRATION.md and SCHEDULING.md. Missing real content stays missing; draft/legal scaffolds are not made public to fill gaps.

## 7. Multilingual/RTL status

Three-locale route matrix, correct lang/dir, glyph coverage, script typography, distinct translated slugs and normalized search are verified locally. Native Pashto/Dari editorial wording remains **AI draft**. New starter strings were added without approving them. Run the CMS seed only after reviewed migration; preserve existing founder edits. Review real mixed-language manuscripts, citations, proper names and scientific glossary with named native reviewers.

## 8. Accessibility and responsive status

Automated sample accessibility, keyboard dialog lifecycle, reading measure, no nested button links and 195 responsive route visits passed. Additional 844×390 landscape and 640×450 reflow checks passed. The latter approximates a 1280px browser at 200% zoom; it is not a physical browser-zoom/device certification.

Manual screen-reader testing, real zoom at 200/400%, iOS Safari, Android Chrome, touch keyboard behavior, actual YouTube iframe/captions/recovery, all error/disabled provider states and rich real-media alt descriptions remain UNVERIFIED. A zero axe result is not a blanket WCAG certification.

## 9. Remaining unresolved/UNVERIFIED items

1. Production database migration and staging restore are required before deployment; current code/schema must not be pushed over existing production data casually.
2. Real founder editorial media/content and the six taxonomy topics need review/publication. Collections must contain three actually eligible items per locale.
3. All Pashto/Dari UI strings and translated editorial/legal copy need native/founder approval; English UI fallback remains intentional until CMS wording is available.
4. Live Turnstile, Resend delivery, sender-domain ownership, host allowlists and actual email receipt are UNVERIFIED. QA exercised rejection/storage guards, not real mail delivery.
5. Anthropic generation, selected model/pricing, glossary quality, budget ledger under multiple production workers and recovery from an abandoned reservation are UNVERIFIED. Current request cap is 20,000 source characters / 4,000 output tokens; long manuscripts may be rejected and need a reviewed chunking strategy. Automatic generation on a publishing transition is not certified; the authenticated manual generation/review tool is available.
6. Optional Buttondown/MailerLite signup and double-opt-in account settings need live verification before enabling. No fake enabled newsletter is exposed.
7. Real YouTube playback, captions, third-party blocking and playback recovery remain UNVERIFIED; QA verifies facade layout/invalid URL rules and available recovery links.
8. First-user setup on a fresh production CMS, password reset delivery, production preview origin and a full founder publishing/archiving rehearsal remain UNVERIFIED. Existing-user login/editing/Save/preview were tested locally.
9. Performance budgets, Lighthouse/Core Web Vitals, production analytics receipt, CSP behavior, backups, restore/RPO/RTO and Search Console indexing are UNVERIFIED. Font compression is measured, not a performance certification.
10. Dependency installation reported 22 advisories (2 low, 11 moderate, 9 high). No blanket breaking audit fix was applied; production dependency review remains required.
11. Native Payload schema/help labels and third-party admin translations remain primarily English and outside the editable public UI dictionary. Custom review tools and branding use CMS-backed UI/settings.
12. Real manuscript edge cases and localized author bios/media captions require founder content review; bibliographic source titles/URLs are preserved as source material rather than invented translations.

## 10. Founder decisions and launch gates

Do not silently close the PRD Section 22 decision table. Confirm the default locale/Dari launch scope; production hosting/database/domain and budget; final wordmark; named native reviewers/editors; enabled P1 scope; real social/YouTube profiles and sender domain; translation provider/model/monthly cap/glossary and machine-draft publication policy; optional newsletter/provider; analytics identifier choice; legal approver/jurisdiction.

The founder must approve real Privacy and Terms per locale, complete native UI review, provide/review editorial assets and execute a representative video → article → translation → preview → schedule → publish → archive workflow on staging. Run check-launch there: it checks actual CMS approvals/configuration and may correctly FAIL until these gates are met.

The previous broad all-PASS verification document has been replaced with an evidence-scoped summary. No untested production/provider/device requirement is marked PASS here.
