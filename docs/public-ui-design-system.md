# Beyond Rasooli — public editorial design system

## Authority, skill and scope

### Watch library refinement

Homepage latest-video previews share the Watch card rules and grid: three columns from 1024px, two from 600px, and one below 600px, with at most four videos. Shared styles keep 3:2 thumbnails, 2px vertical/4px horizontal insets, ivory bordered surfaces, a 6.5rem caption area, and 18–20px titles clamped to two lines identical across both placements. The See all videos link and full video detail content remain available.

About's Contact action uses a native details/summary disclosure to reveal Facebook and Instagram destinations from existing CMS settings and a disabled WhatsApp placeholder, as requested until an official destination is supplied. It supports keyboard and no-JavaScript use; external links open safely in a new tab. The public contact form, API, and admin settings are unchanged.

About uses a fluid editorial headline and restrained mission eyebrow, a balanced founder/mission composition, ivory founder and principle panels, a soft sage mission panel, and a bordered contact panel. Logical spacing and native Arabic-script line heights support RTL; Arabic taglines avoid synthetic italics. The five existing principles, factual biography, presentation note, CMS override, and contact destination are preserved. No portraits or invented claims are introduced.

The Topics index reuses the homepage compact topic cards: existing image, three-line title, and localized Read more action with uniform dimensions. All published topics remain listed. Descriptions and associated articles/videos remain available on the existing topic detail route.

The Read introduction shares Watch's compact typography and spacing, retaining the existing CMS-managed Read sentence. Its topic-only panel uses the same accessible single-row scrolling chips. Language, format, and inline search controls are hidden for this presentation; existing query handling and the public header search remain available. Read articles reuse the homepage's compact ivory cards: 3:2 images, uniform dimensions, three-line 18–20px titles, and author followed by date on one line. Every article uses the same card layout, including the first article. Full summaries, topics, reading times, and article bodies remain on detail pages.

Watch thumbnails use `object-fit: cover` to fill their 3:2 frames, with a subtle 2px top/bottom inset and 4px side inset. This reduces layout-generated black gaps without stretching images. Other video placements retain their existing image fitting. Black bars embedded in source artwork remain part of that artwork.

Watch library videos use three equal columns from 1024px, two from 600px, and one on phones. Additional videos continue into subsequent rows under the existing pagination contract. Each has an ivory surface, subtle warm border and small radius. Posters share a taller 3:2 frame; the fixed 6.5rem caption area has 16px padding. Previews show only the thumbnail/play cue and title, using a two-line ellipsis clamp with the homepage's 18–20px typography and 1.6 line height. Full title text remains accessible in the link and on the detail page. Duration, topic, spoken language, description, transcript and sources remain on video details.

Final presentation: Watch filters contain only the single horizontally scrollable topic row. Search, language and sort controls are absent; the row uses the full panel width. Topic interactions clear obsolete search/language/sort selections. Read search remains unchanged.

The Watch page replaces its oversized title with a concise, semantic introductory heading. `watch.library_intro` remains overridable through the existing UI-string CMS; `src/messages/public-watch.json` provides localized presentation defaults when that new key is absent, without changing the translation loader or writing CMS records. SEO retains the existing title and description.

Topic links and a single search field share one ivory filter panel. All CMS topics remain on one unwrapped, horizontally scrollable row with a visible scrollbar and keyboard-operable links; no topics are capped or removed. Selected links use sage fill plus a visible inset rule and `aria-current`. Mobile/tablet search stacks below topics; desktop places it alongside the scroll row. Watch language/sort controls are removed as requested; Read controls and backend filtering are unchanged. Search uses existing title/description/tag matching and works with topic selection and native GET submission. Topic/search interactions clear obsolete Watch language/sort URL selections and reset pagination.

The installed UI UX Pro Max skill at `.agents/skills/ui-ux-pro-max/SKILL.md` was read and its local Python search workflow executed. No installation, new font service or UI framework was needed. `docs/MASTER_PRD.md` remains the functional and token source of truth.

This document applies to visitor-facing pages only. Payload administration, founder/editor dashboards, registration, review screens, authentication, APIs, collections, database and publishing workflows are excluded.

## Research and brand direction

The first query, `science psychology publication premium editorial`, produced glass styling and fashion typography; it was rejected. The narrower `news magazine editorial` returned a minimal grid, Newsreader typography, clear hierarchy, low-cost effects and accessible interaction. Focused searches covered magazine readability, click-to-play video, compact filter labels and Next.js responsive images. The editorial recommendations were accepted; generic red/blue news colors, Roboto, marketing section sequences and sharp shadows were overridden by PRD Sections 6–9.

The result is a calm science and psychology magazine: expressive serif titles, warm paper, forest-green accents, generous spacing, real CMS imagery, visible references, and a clear bridge from video to deeper reading. No invented biography, stock topic placeholders, glass effects or promotional gimmicks.

## Colors

| Token | Value | Role |
|---|---|---|
| bg | #FAF7F0 | Warm paper |
| surface | #F3EEE2 | Quiet panels and inputs |
| surface-2 | #EAE4D5 | Hover surface |
| ink | #1B1B18 | Main text and inverse footer |
| ink-muted | #5A5A52 | Metadata and secondary text |
| divider | #E3DED2 | Decorative rules |
| sage-700 | #34502F | Focus and accent hover |
| sage-600 | #4F6B4D | Buttons and links |
| sage-400 | #6B8068 | Decoration only |
| sage-100 | #DCE5D6 | Selected/supporting surfaces |
| error | #9B2C2C | Error text |

Use only these PRD colors. Inverse text uses ivory. Ordinary text must reach 4.5:1; large text and meaningful UI boundaries require 3:1. Decorative dividers do not indicate control boundaries. No heavy shadows; maximum elevation is the PRD subtle shadow.

## Fonts and type scale

Existing self-hosted Newsreader serves English display and reading text; Inter serves English UI. Noto Naskh Arabic serves Pashto/Dari editorial text; Noto Sans Arabic serves their UI. Preserve existing fallback stacks and `font-display`. No external font requests.

| Role | English mobile → desktop | Arabic mobile → desktop |
|---|---|---|
| Display | 36 → 64px | 38 → 66px |
| Page title | 32 → 48px | 34 → 50px |
| Section heading | 26 → 34px | 28 → 36px |
| Card heading | 21 → 24px | 23 → 26px |
| Standfirst | 20 → 24px | Existing Naskh 22 → 26px |
| Reading text | 18 → 20px | 20 → 22px |
| Interface | 16px | 18px |
| Metadata | 13–14px | 14px with 1.6 leading |

Scale via `clamp()`. English body leading is 1.65; Arabic body leading is 1.9. Arabic titles retain spacious PRD leading, with no italics, letter spacing or uppercase transformations. Headlines wrap fully rather than hiding essential words. Short summaries may be clamped; full stories remain linked.

## Spacing, widths and grid

Base 4px; scale 4, 8, 12, 16, 24, 32, 48, 64, 96. Section spacing scales from 48 to 96px. Public container maximum 1200px, mobile gutters 20px, intermediate 32px, desktop 40px. Article body maximum 680px; article heading up to 900px and cover up to 960px. About and discovery use the broader site grid; contact and legal reading keep narrower measures.

Mobile video libraries use two columns; tablets three; desktops four. Homepage videos use an accessible horizontal scroll row with four visible cards at desktop width. Article grids use one/two/three columns. Topic grids use one/two/three columns. Use shrinkable `minmax(0, 1fr)` tracks to prevent content forcing overflow. Large monitors keep a centered, bounded composition.

## Component patterns

- Hero: large editorial message, existing localized actions, actual featured poster and story title; a Watch destination remains available without a featured item. Poster is contained to avoid cropping video text. Hero frame is 4:5 mobile and 16:9 tablet/desktop.
- Video cards: 9:16 frames, contained thumbnail, visible play cue, duration, topic and spoken-language metadata. Keep full titles readable.
- Article cards: 3:2 imagery, topic, title, short summary, author/date/reading-time row. Feature card is split on tablets/desktops; missing covers produce an intentional text feature rather than an empty image slot.
- Topic cards: real optional CMS cover, sage rule, title, description and localized destination with mirrored arrow. No generic filler images.
- About: founder and mission in balanced desktop columns, numbered principles, restrained contact section. Existing factual content is preserved. CMS-authored About manuscripts retain their rich text.
- Sources/evidence/transcript: readable bounded text, rules and muted surfaces; preserve links and all references.
- Filters: wrap topic choices, show labels above comfortable selects, labeled search with a 44px submit control. Preserve URL parameters and existing query logic.
- Footer: inverse editorial statement, visible navigation group labels, real social links and existing optional newsletter.

## Navigation and multilingual behavior

Retain Home, Watch, Read, Topics and About in order. Desktop navigation switches to the existing keyboard-operable native-dialog menu below 1024px. Search keeps its native dialog and GET results form. The sticky header reveals when keyboard focus enters it. Controls are at least 44px tall.

English uses en/LTR. Pashto uses ps/RTL. Dari uses fa-AF/RTL. Logical properties govern spacing, borders and positioning. Cards declare their actual content language and direction; font stacks follow nested direction rather than forcing the page font onto mixed-language content. Video spoken language remains distinct from document language. Stored translations, actual slugs, metadata and CMS-first UI text remain unchanged.

## Isolation and motion

New stylesheet rules are nested under the public root marker. Payload's root has no marker and does not import this stylesheet. Existing editor-registration/review screen structures are excluded from the redesign selectors. No admin component/style/backend source is edited.

Use 150–200ms color/opacity feedback only; respect reduced motion. Remove decorative image zoom, raised cards, gradients and large shadows. Click-to-load YouTube behavior remains unchanged. Reserve media dimensions, provide responsive image sizes and avoid new client libraries.

## Verification requirements

Run lint, typecheck, production build, existing tests and the UI-string scan. Browser-test en/ps/fa at 320, 360, 375, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920 and 2560px; inspect screenshots at mobile/tablet/desktop; check landscape, reduced motion, keyboard menus, filters, search and mixed-language cards. Run axe against representative public pages. Confirm admin root/style isolation and unchanged restricted source files. Physical iOS/Android and human native-language review must be distinguished from browser emulation.
# Homepage preview refinement

Homepage topic previews render only optional CMS imagery, title and the localized Read more action. Their fixed copy area is reduced to 14.5rem, with no description or decorative rule. Clicking anywhere on the card opens the complete topic introduction and associated stories. Topic library cards and detail pages retain their descriptions.

Article-card metadata follows the interface locale's reading direction, independently of the story's language. Author always precedes date: left to right on English pages and right to left on Pashto/Dari pages. Names retain bidirectional isolation. This keeps mixed-language article cards consistent.

The hero transition and featured video caption have no divider borders; spacing alone separates the hero from Latest Videos. Section-heading rules remain unchanged.

Homepage article cards show only the cover image, title, author and publication date. Like topic cards, each uses an ivory surface, subtle warm border and small radius. A consistent 3:2 image frame and fixed 11.5rem copy area with 20px padding produce equal responsive dimensions. Titles use fluid 18–20px typography, 1.6 line height and a three-line preview slot, followed by a 16px gap to the single author/date row. Dates remain unbroken, while unusually long author names use an ellipsis on narrow screens; the complete name remains in accessible text and the full article. Metadata follows the UI reading direction. Topic, summary and reading time remain on full article pages and library cards.

Homepage video thumbnails use a compact 16:9 landscape frame with no duration badge. Library cards and full video details retain their existing duration presentation and media behavior. Images keep their proportions with `object-fit: contain`.

Homepage video titles use a fluid 18–20px scale with 1.6 line height for Latin and Arabic scripts. The fixed copy area is eight rem tall with 12px vertical padding, keeping three-line previews consistent without the previous excess spacing. These typography changes are scoped to the homepage video row.

The requested homepage refinement uses uniform cards within each content type: at most four videos, three articles, and six topics. This explicit direction replaces the homepage's feature-first article composition; article libraries retain their existing composition. Each section links to its full localized library. Homepage video filter chips are removed; topic filtering remains available in Watch. Video previews show thumbnails and titles; duration, topic and spoken-language labels remain available on the full video detail page.

Responsive grid tracks determine equal widths at each breakpoint; fixed copy slots in rem units and consistent media ratios determine equal heights. Titles and summaries have bounded preview lines, while their full text remains in the DOM and the entire card opens the complete content. Compact topic actions reuse the existing editable `buttons.read_more` string. Missing covers reserve a quiet surface rather than introducing generic imagery. These rules only target homepage preview classes and do not affect admin interfaces or full-library cards.

