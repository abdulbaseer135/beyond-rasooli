# Public frontend redesign delivery

Date: 10 October 2026. Branch: `design/beyond-rasooli-public-ui-pro-max`. No push or deployment.

## Delivered

The installed UI UX Pro Max skill was verified and read. Its design-system and focused typography, UX and Next.js searches informed the implementation; unsuitable glass/fashion suggestions were rejected. The final design system is [public-ui-design-system.md](public-ui-design-system.md), subordinate to `MASTER_PRD.md`.

The public site now uses a restrained ivory/sage editorial composition, fluid serif headings, consistent cards, a featured-story hero, accessible navigation, labeled filter controls, richer topic discovery and a broader About layout. Existing CMS content and biography wording are preserved. Article reading stays bounded at 680px while headings, covers and discovery sections have appropriate wider measures.

## Public pages and components

- Home: featured CMS story title/poster, persistent Watch action, four-card desktop video row, consistent article and topic grids, mission section.
- Watch and video detail: two/three/four-column discovery, full titles, uncropped thumbnails, duration/spoken-language metadata, responsive portrait/landscape players, prominent article bridge.
- Read and article detail: consistent 3:2 covers, flexible feature cards including missing-cover states, author/date/time metadata, broader title/cover composition, narrow reading measure, evidence and collapsible sources.
- Topics and topic detail: reusable image-aware topic cards, localized destination arrows, optional actual CMS cover, associated article/video grids.
- About: founder/mission composition, numbered editorial principles and restrained contact section; published CMS About manuscripts retain rich text.
- Search, contact and other public informational pages inherit the same public typography, controls, shell and spacing. Search results use the shared discovery grids.
- Header/footer: refined public navigation, localized mobile dialog, no-JavaScript navigation fallback, visible footer groups and unchanged optional newsletter logic.

## Responsive, language and accessibility

Fluid type, shrinkable grid tracks and logical properties support every requested viewport from 320px through 2560px. Libraries, article reading, article headers and covers use distinct widths. Homepage scrolling remains inside its row. Essential headlines wrap fully. Topic choices wrap instead of causing page overflow; controls have comfortable 44px targets.

English, Pashto and Dari retain existing routing and CMS-first messages. Dari retains `fa-AF`. Content cards declare their document language/direction; UI metadata inside mixed-language cards explicitly uses its own interface language and Arabic font when needed. Spoken language remains separate. Existing translations, query logic, SEO functions, schema data, caches and publishing contracts are preserved.

Keyboard focus remains visible; the sticky header reveals when focused. Native dialog Escape behavior is retained. Search fields have explicit labels. Filters now offer real URL links and native GET form submission when JavaScript is disabled. Sources use a native disclosure, initially open. Reduced motion is honored.

No new dependency or animation library was introduced. Existing Next.js images have responsive sizes and reserved ratios. Decorative zoom, gradients and heavy shadows were removed. YouTube still loads only after interaction. Core Web Vitals/Lighthouse targets were not independently benchmarked.

## Executed verification

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| Production `npm run build -- --webpack` | Passed on final application source; 69 static pages generated |
| `npm run test` | 58 passed, zero failed |
| `npx eslint src scripts tests --quiet` | Passed; excludes installed third-party skill source |
| `node scripts/qa-public-redesign-text.mjs` | 22 changed public TSX files: zero literal-copy findings; restricted source unchanged |
| Production Chromium responsive checks | 364 passed layouts: 28 route contexts × 13 widths |
| Axe | 56 full-page runs at 375px/1440px, zero violations |
| Public interactions | Menu/Escape, five navigation destinations, search submission, Read filters, Watch sorting, mixed-language font selection, click-to-load privacy-enhanced YouTube, reduced motion and landscape passed |
| JavaScript disabled | Five mobile navigation links, native GET filtering/search and topic links passed |
| Arabic stress fixtures | 26 simulated editorial layouts passed; CDP confirmed self-hosted Noto Naskh Arabic rendered the tested Pashto/Dari headings without fallback glyph fonts |
| Admin isolation | Seven requested admin routes load no public redesign rules; authenticated founder/editor dashboard checks passed; registration retains original token values and excludes new footer headings |
| Diff whitespace | Passed |

Widths: 320, 360, 375, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560px. Matrix includes Home, Watch, Read, Topics, About, Search, Contact and available current-fixture detail routes across locale contexts. Evidence: `.qa/public-redesign/results.json` and `.qa/public-redesign/arabic-stress-results.json`.

The final homepage container alignment passed a focused repeat check in `scripts/qa-public-home-final.mjs`: 39 layouts, six axe checks and three landscape layouts. It updates the same matrix evidence and captures current screenshots.

## Isolation and verification limits

No founder/editor dashboard, Payload stylesheet/component, collection, permission, API, authentication, database schema/migration or publishing service source changed. New CSS requires the public root marker, which Payload never receives. Registration and editorial review structures are excluded. Testing used existing isolated QA databases with schema setup disabled; the actual configured production database was not changed.

`npm run lint` still fails with 15 errors in pre-existing installed skill scripts. `npm run check-ui-strings` still reports 146 pre-existing literal strings, primarily in admin/registration files outside the allowed scope. Their files were left unchanged; the separate scan of redesign files passes. The isolated fixture also logs two missing native CMS values per locale. No founder wording or approval status was changed to silence these diagnostics.

The older multilingual QA fixture has an obsolete database schema and its native detail queries fail before rendering. It was left untouched. Current-schema fixtures support the final route matrix and mixed-language checks; Arabic article stress tests replace text/direction only in the test browser DOM. They are explicitly simulated and do not claim stored native manuscripts were tested end to end. Native editorial content and UI wording still require human review.

Only Chromium is installed. Safari/WebKit, Firefox, physical iOS/Android/iPads, screen-reader testing, live form-provider delivery, Lighthouse scores and real-user performance remain unverified. The five user-referenced screenshots were not attached; actual rendered baseline screenshots were captured instead. QA screenshots contain synthetic existing fixture stories and media, including deliberately blank posters; they do not represent final founder-selected editorial content.

## Screenshots

Baseline: `.qa/public-redesign/before/`. Final screenshots: `.qa/public-redesign/after/`.

- [Home desktop](../.qa/public-redesign/after/en-preview-1440.png), [Home mobile](../.qa/public-redesign/after/en-preview-375.png), [Home tablet](../.qa/public-redesign/after/en-preview-820.png).
- [About desktop](../.qa/public-redesign/after/en-about-1440.png), [About Pashto mobile](../.qa/public-redesign/after/ps-about-375.png).
- [Read desktop](../.qa/public-redesign/after/en-read-1440.png), [Watch tablet](../.qa/public-redesign/after/en-watch-820.png), [Topics mobile](../.qa/public-redesign/after/en-topics-375.png).
- [Article mobile](../.qa/public-redesign/after/en-read-qa-article-1791574066713-375.png), [Video desktop](../.qa/public-redesign/after/en-watch-qa-thumbnail-1791574066713-1440.png).
- [Simulated Pashto article glyph/layout test](../.qa/public-redesign/after/ps-article-stress-375.png).
- [Founder dashboard isolation](../.qa/public-redesign/after/admin-1440.png), [Editor dashboard isolation](../.qa/public-redesign/after/admin-editor-1440.png).

## Changed files

Public source:

```text
src/app/public-ui.css (new)
src/app/[locale]/layout.tsx
src/app/[locale]/page.tsx
src/app/[locale]/about/page.tsx
src/app/[locale]/read/page.tsx
src/app/[locale]/read/[slug]/page.tsx
src/app/[locale]/search/page.tsx
src/app/[locale]/topics/page.tsx
src/app/[locale]/topics/[slug]/page.tsx
src/app/[locale]/watch/page.tsx
src/app/[locale]/watch/[slug]/page.tsx
src/components/article/EditorialBlocks.tsx
src/components/cards/ArticleCard.tsx
src/components/cards/VideoCard.tsx
src/components/cards/TopicCard.tsx (new)
src/components/home/HomeFeed.tsx
src/components/layout/Header.tsx
src/components/layout/Footer.tsx
src/components/layout/Hero.tsx
src/components/read/ReadLibrary.tsx
src/components/watch/WatchLibrary.tsx
src/components/search/DiscoveryFilters.tsx
src/components/ui/TopicChip.tsx
```

Design documentation and verification:

```text
docs/public-ui-design-system.md
docs/public-ui-redesign-report.md
design-system/beyond-rasooli/MASTER.md (initial skill preparation)
scripts/qa-public-baseline.mjs
scripts/qa-public-redesign.mjs
scripts/qa-public-redesign-text.mjs
scripts/qa-public-arabic-stress.mjs
scripts/qa-public-home-final.mjs
```

Existing untracked `.agents/` content was preserved. `tsconfig.tsbuildinfo` was already modified when work began; it remains uncommitted. Next.js regenerates build/type artifacts during verification; these are not intentional application changes.
# Additional homepage refinement

## Watch library refinement

The latest visual adjustment gives every Watch video an individual ivory card with a subtle border and padded title. Poster height increases approximately 19% at the same width through a 3:2 frame. Title typography now matches homepage videos exactly (fluid 18–20px, 1.6 line height). Three-column desktop layout, equal card dimensions, two-line ellipses and full-detail navigation remain intact. QA checks the new frame ratio, border and title-size range at every requested viewport.

Latest video-grid refinement: three equal cards per desktop row, continuing into further rows; two columns on tablets and one on phones. Posters are compact 16:9 with equal caption heights and two-line title ellipses. Watch preview duration/topic/language metadata is omitted through existing card options; full video detail pages are unchanged. QA checks column counts, fourth-card row continuation, equal dimensions, removed metadata, long mixed-language title clamps, full-detail clicks, and existing topic filtering.

The final follow-up removes Watch search as requested, leaving only the full-width topic row. Its secondary control column and separator are removed. Read search and filters remain unchanged. Updated QA verifies absence of Watch search, topic selection/reset, final-topic keyboard access and no-JavaScript links.

Latest user refinement: all topics stay on one horizontally scrollable row, including newly added CMS topics. Watch now offers only search alongside topic selection, replacing visible video-language and sort controls. Existing video title/description/tag matching, topic queries and no-JavaScript GET search are reused. Read filtering and backend query support remain unchanged. Updated browser tests cover single-row layout with the large existing topic fixture, keyboard access to the final topic, combined topic/search, matching/empty/cleared results and all locales.

Removed the large visible Watch label and replaced it with a short localized introduction. Restyled only Watch's topic/language/sort filter panel: ivory surface, restrained borders, compact wrapping topic links, selected-state underline, readable labels and 48px native selects. Shared Read filters retain their styles. CMS override key `watch.library_intro` is optional; localized public presentation defaults are provided without CMS/database writes. Existing metadata, spoken-language filtering, URL queries and no-JavaScript GET behavior remain unchanged.

Verification script: `scripts/qa-public-watch.mjs`; screenshots/results: `.qa/public-redesign/watch/`. It checks all 13 widths in three locales, six axe scans, topic/language/sort combinations, All reset, keyboard focus, landscape, reduced motion and no-JavaScript filtering.

Homepage topic cards now omit descriptions and display only image, title and Read more. The copy area shrinks from 23rem to 14.5rem while preserving consistent dimensions. Full topic pages and topic library cards retain their information. Browser checks confirm descriptions are absent from previews, the localized action is visible, and each locale's card opens its full topic page.

Homepage articles now have distinct topic-style ivory cards with subtle borders, padded copy and matching small radii. Title size is reduced to 18–20px. The copy area shrinks from 18rem to 11.5rem; a consistent 16px gap separates the reserved title slot from the author/date row. Browser checks assert borders, typography, spacing, equal dimensions and multilingual behavior. Dedicated article-section screenshots are captured at 375px, 820px and 1440px in all locales.

Article card bylines now use the interface locale's direction rather than inheriting the content language. English and Pashto stories on an English page both show author then date left to right; native pages show that same sequence in RTL reading order. Browser checks assert both single-line alignment and author-before-date positioning on mixed-language cards.

The latest article refinement supersedes the earlier summary-layout fix: homepage cards now render only image, title, author and publication date. A homepage-only compact option omits topic, summary and reading time. Image frames and copy slots maintain equal widths and heights without changing full article pages or library cards. Browser checks assert removed preview details, equal dimensions, visible author/date slots, and successful navigation to full article details in every locale.

Fixed partially clipped article summaries and reading-time labels on the homepage. The copy area now has sufficient minimum space and grows when needed; summary lines and footer metadata cannot shrink. Metadata has no clipping cap. Browser stress checks verify three complete summary lines, no summary/footer overlap, and fully visible wrapped bilingual author/date/reading-time metadata.

The final homepage simplification removes the Latest Videos filter-chip row (All and topic buttons), along with its unused local filter state. The homepage still previews four latest videos and links to Watch, where full filtering remains available. Browser checks explicitly assert that homepage filter chips are absent.

The latest refinement reduces homepage video poster height from 9:16 to 16:9 and omits duration badges using a homepage-only component option. The existing four-video limit, titles, play cues and full-detail navigation remain. Browser checks assert landscape ratios and absence of badges at every requested viewport width in all locales.

Implemented the user's bounded preview request: four videos, three equally styled articles, and six topics maximum, with localized links to Watch, Read, and Topics. Homepage card dimensions are consistent within each type, including mixed-language stories, differing summary lengths, and missing covers. Full libraries and CMS queries are preserved. Topic-card actions use an existing editable localized label rather than duplicating potentially long topic titles. The follow-up video refinement omits topic and language labels from homepage cards, enlarges desktop cards to four per row and reduces the copy area's empty space. Full detail pages retain their metadata, description, sources and transcript when supplied by the CMS. Browser checks click a homepage video in each locale and verify its full title and detail metadata.

The homepage browser check now asserts preview limits, equal card dimensions and library links at all 13 requested widths for all three locales. It also runs six axe scans, three landscape checks and nine browser-only long/mixed-language text cases. Screenshots are refreshed at 375px, 820px and 1440px. Existing isolated QA content is synthetic and does not reproduce the supplied live-content screenshot.

