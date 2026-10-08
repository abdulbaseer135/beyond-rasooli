# Product Requirements Document (PRD): Beyond Rasooli Website

**Version:** 6.0 (resolves v5 review findings: tier/phase conflicts, one translation data model, status matrix, measurable analytics, Dari labelling, video-language handling, shared Source component, operations targets, delivery plan, and a single decisions table) | **Date:** October 2026
**Owner:** Abdul Majeed Rasooli (founder) | **Tagline:** Look Beyond the Obvious.
**Brand spelling:** "Beyond Rasooli" (double "o"). Use it consistently everywhere.

> **How to use this PRD with an AI coding tool:** Paste the whole document as the first prompt (Claude Code, Cursor, Lovable, Bolt, v0). Then build one phase at a time (Section 17). Design tokens in Section 6 are the single source of truth for colour, type and spacing. Do not invent other values.

---

## 1. Product Summary

Beyond Rasooli is a personal media brand and editorial publication. It explains the hidden science behind everyday life (psychology, human behaviour, neuroscience, behavioural economics, learning) through short vertical videos and researched articles.

The website is the owned home for all content. It must feel like a premium science/ideas magazine, not an influencer landing page or a template blog. Most visitors arrive from TikTok, Instagram, YouTube or Facebook on a phone.

**Core job of the site:** turn a social-media video viewer into a returning reader by connecting each short video to a deeper article, sources and related content.

## 2. Goals and Non-Goals

### Goals
1. Publish videos (YouTube embeds) and articles from one place the founder fully owns.
2. Let the founder publish, schedule and edit content without a developer.
3. Mobile-first, fast, accessible, SEO-ready.
4. Multilingual from day one: Pashto (primary, Arabic script), Dari/Persian, English, with correct RTL, and a translate-at-publish tool that creates reviewable Pashto/Dari drafts of every article and video (Section 11.3).
5. A distinctive editorial look that combines **TED-Ed-style video discovery** with **Behavioral Scientist-style long-form reading** (Section 5).

### Non-goals for v1
Reader accounts, comments, paid memberships, courses, direct video hosting or transcoding, live per-visitor machine translation (translation happens once at publish time instead, Section 11.3), podcast/audio, newsletter automation (signup form only, if enabled).

### 2.1 Product success metrics
These are **initial targets**, not permanent promises. Review them after the first 90 days of real traffic and adjust from the baseline.

| Outcome | Metric | Initial target / signal |
|---|---|---|
| Social viewer becomes deeper reader | Video → linked article click-through rate | **15%+** on video pages that have a linked article |
| People return | Return signal: returning visits (only if the opt-in identifier in Section 10.6 is enabled); otherwise repeat sessions, newsletter growth and branded search | Establish baseline in month 1; improve month-over-month through month 3. Cookieless analytics cannot reliably measure 30-day returning visitors, so the method is a decision in Section 22 |
| Content is discoverable | Organic search impressions and clicks | Upward trend after indexing; no indexing errors in Search Console |
| Editorial depth is used | Article engaged time / scroll depth (events `article_read_25/50/75/100`, `article_engaged_30s`) | Track median engaged time and 75% scroll completion; compare by topic and language |
| Founder can operate independently | Publishing workflow | Founder can publish a video + article pair, translations, metadata and sources without developer help |
| Site quality | Core Web Vitals / accessibility | Meet Section 15 and Section 18 thresholds on representative pages |

**Primary product KPI:** the percentage of visitors who move from a short video page to a deeper article or another piece of related content. This directly measures the site's core job.

### 2.2 V1 priority tiers
To keep the first release polished rather than overbuilt, requirements are prioritised as follows.

- **P0 — launch blockers:** Home, Watch, Video, Read, Article, Topics, About, Contact, CMS publishing (with the status matrix in 11.4), multilingual routing/RTL, source display (shared Source component), video→article bridge, search/filtering, SEO basics, analytics, accessibility, backups and ownership. **Basic collections** ("Everyday Mysteries" and "Start here" as simple ordered lists; a collection is hidden until it has at least 3 items). **Founder gates:** approval of Privacy/Terms, and the founder's review pass over Pashto/Dari UI wording using the review report (11.1).
- **P1 — launch if stable:** translate-at-publish, glossary, translation review status and side-by-side editor, optional newsletter signup, advanced collection features (cover art, extra layouts), advanced related-content controls.
- **P2 — v1.1 / later:** bulk translation, CSV/XLSX round-trip for UI strings, in-page review mode for UI strings and translations, advanced recommendations, reader features and other items in Section 20.

If schedule or budget is constrained, **P0 ships first**. P1/P2 features must never delay correctness, RTL quality, performance, sources, or the founder's ability to publish.

## 3. Users

| User | Needs |
|---|---|
| **Visitor (primary):** curious viewer arriving from social on a phone | Watch fast, then optionally read deeper, find related content |
| **Learner/student** | Browse by topic, read sources, find reading lists |
| **Collaborator/media** | About page, contact form, credibility signals |
| **Creator/admin (the founder)** | A simple, secure dashboard to create, preview, schedule, publish and unpublish content |

## 4. Brand and Editorial Principles

Evidence-led (sources shown), accessible not simplistic, curious not preachy, honest about uncertainty, original (never copy another publication's text, design or identity).

**Brand line (optional):** Science • Psychology • Human Behaviour • Ideas
**Brand promise:** Understand everyday life more deeply through evidence, clear explanations and memorable storytelling.

**Imagery/video rules:** The creator's face never appears. Use voiceover, cinematic B-roll, hands, objects, environments, archival/illustrative imagery and designed text. Vertical 9:16 video with readable captions. Only original or properly licensed media; no misleading AI-generated "real" footage.

## 5. Design References and How They Combine

These are structural references only. The final identity must be original.

| Reference | What we borrow (pattern) | What we do not borrow |
|---|---|---|
| **TED-Ed** (ed.ted.com) | Video-first hero with a visible play action; **subject chips** that filter the grid in place; video cards showing duration, topic label, language badge and title (no public view counts); **Collections** as a main concept; newsletter in footer | Animated-lesson illustration style, user accounts, Create/Educator/Student-Talks sections, logo-heavy footer |
| **Behavioral Scientist** (article: "Journey to Robbers Cave") | Three-way taxonomy (Topics / Fields / Formats); article header with breadcrumb, large serif headline, byline, date, reading time, share row, italic standfirst; **long reads split into numbered parts**, each with captioned images; "Sources/Select references" at the end; tags; author box; "Recommended for you" cards | Subscriber paywall prompts, print-edition promos, its logo and visual styling |

**The combined model**
- **Watch side = TED-Ed logic:** discovery by chips, cards with duration/topic/language, collections.
- **Read side = Behavioral Scientist logic:** calm, text-led editorial layout with sources.
- **The bridge:** every video page has a "Go deeper: read the full article" card right after the player; every article can embed its source video at the top.

**Reference guardrail:** borrow interaction and information-architecture patterns, not exact layouts, proportions, copy, illustration styles, logos or branded visual motifs. The result should be recognisably Beyond Rasooli even when the reference sites are not visible.

## 6. Design System (Tokens)

### 6.1 Colour palette

Warm ivory backgrounds, near-black text, muted sage accents, subtle grey-beige dividers. All text/background pairs below meet WCAG AA (4.5:1 for body text, 3:1 for large text and UI borders).

| Token | Hex | Use | Contrast note |
|---|---|---|---|
| `--bg` | `#FAF7F0` | Page background (warm ivory) | Base |
| `--surface` | `#F3EEE2` | Cards, quotes, code, input backgrounds | Text on it: AA |
| `--surface-2` | `#EAE4D5` | Hover state, selected rows | |
| `--ink` | `#1B1B18` | Headlines and body text (near-black) | ~16:1 on bg |
| `--ink-muted` | `#5A5A52` | Metadata, captions, labels | ~6.5:1 on bg |
| `--divider` | `#E3DED2` | Hairlines, card borders | Decorative |
| `--sage-700` | `#34502F` | Hover/pressed accent, focus ring | ~9:1 on bg |
| `--sage-600` | `#4F6B4D` | **Accent for text, links, primary buttons** | ~5.5:1 on bg |
| `--sage-400` | `#6B8068` | Decorative only (icons, rules, thumbnails overlay). Not for small text | ~3.9:1; large/UI only |
| `--sage-100` | `#DCE5D6` | Chips, tags, selected-filter background | Text `--sage-700` on it: AA |
| `--inverse-bg` | `#1B1B18` | Footer / video overlay panels | |
| `--inverse-ink` | `#FAF7F0` | Text on inverse backgrounds | ~16:1 |
| `--error` | `#9B2C2C` | Errors | ~7:1 on bg |
| `--success` | `#34502F` | Success (same as sage-700) | |

**Rules**
- Primary button: `--sage-600` background, `--bg` text. Hover: `--sage-700`.
- Secondary button: transparent, 1px `--ink` border, `--ink` text. Hover: `--surface-2`.
- Links in body text: `--sage-600`, underlined; hover `--sage-700`.
- Light theme only for v1. No gradients, no heavy shadows (max `0 1px 2px rgba(27,27,24,.06)`).
- Never use colour alone to convey meaning (pair with text or icon).

### 6.2 Typography

| Role | Latin (English) | Arabic script (Pashto, Dari) |
|---|---|---|
| **Display / headlines** | **Newsreader** (serif), weights 500-700, optical size on | **Noto Naskh Arabic**, 600-700 |
| **Body / long-form** | **Newsreader** 400 for articles (editorial reading) | **Noto Naskh Arabic** 400-500 |
| **UI, nav, labels, metadata, buttons** | **Inter** 400/500/600 | **Noto Sans Arabic** 400/500/600 |

Notes
- Pashto-specific letters (ټ ډ ړ ږ ښ ڼ ګ ې ۍ) must render correctly. Verify glyph coverage for every chosen font in QA; if any glyph falls back to a system font, switch that role to another Naskh/Sans Arabic family with full Pashto support.
- Self-host all fonts (WOFF2), subset by script (Latin, Arabic), `font-display: swap`, preload only the 2-3 critical files. Use variable fonts where available.
- Font stacks must include real fallbacks: `Newsreader, Georgia, serif`; `Inter, system-ui, sans-serif`; `"Noto Naskh Arabic", "Amiri", serif`; `"Noto Sans Arabic", "Vazirmatn", system-ui, sans-serif`.

**Type scale (mobile / desktop)**

| Style | Mobile | Desktop | Line-height (Latin / Arabic) |
|---|---|---|---|
| Display (hero) | 36 px | 64 px | 1.1 / 1.5 |
| H1 (article/page title) | 32 px | 48 px | 1.15 / 1.55 |
| H2 | 26 px | 34 px | 1.25 / 1.6 |
| H3 | 21 px | 24 px | 1.3 / 1.65 |
| Body (article) | 18 px | 20 px | 1.65 / 1.9 |
| Body (UI) | 16 px | 16 px | 1.5 / 1.7 |
| Standfirst (italic in Latin; regular, slightly larger in Arabic script) | 20 px | 24 px | 1.5 / 1.8 |
| Meta / caption / label | 13-14 px | 14 px | 1.4 / 1.6 |

- Arabic-script text is set about 1-2 px larger than Latin at the same role because Naskh reads smaller. No italics in Arabic script.
- Article measure: 60-75 characters per line (about 680 px max).
- Labels such as "ARTICLE", "VIDEO" use small caps / tracked uppercase in Latin only.

### 6.3 Spacing, layout and shape
- 4 px base unit; scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Container max width 1200 px; article column 680 px; page gutters 20 px mobile, 40 px desktop.
- Grid: 4 columns mobile, 8 tablet, 12 desktop.
- Border radius: 4 px for cards and inputs, 999 px for chips, 0 for hero images.
- Card style: no shadow by default; 1px `--divider` border or none, generous padding.
- Breakpoints: 360, 480, 768, 1024, 1280.

### 6.4 Motion
Subtle only: 150-200 ms fades and colour transitions, no parallax, no autoplay sound. Respect `prefers-reduced-motion`.

### 6.5 Iconography and imagery
- 1.5 px stroke line icons (Lucide). Mirror directional icons in RTL.
- Thumbnails: video 9:16 (vertical) with a light `--inverse-bg` 15% gradient only at the bottom for the duration label; article 3:2; hero 16:9 on desktop, 4:5 on mobile.
- Image treatment: natural light, restrained colour, subtle grain; never oversaturated.

## 7. Information Architecture

**Primary navigation:** `Home | Watch | Read | Topics | About` plus search icon and language switcher (PS / FA / EN).
**Footer:** Contact, Sources/Reading list (hidden until it has content), Privacy, Terms, social links, newsletter signup (if enabled).

**Taxonomy (inspired by Behavioral Scientist's Topics / Fields / Formats):**
- **Topic** (what it is about): Psychology & Human Behaviour; Neuroscience & Cognition; Behavioural Economics & Decisions; Learning & Thinking; Everyday Science; Ideas & Society.
- **Format** (what it is): Video, Article, Explainer, Everyday Mystery.
- **Language:** Pashto, Dari, English.
- **Collections:** Everyday Mysteries, Start Here, plus founder-created sets.

| Page | Route | Notes |
|---|---|---|
| Home | `/[locale]` | Section 9.1 |
| Watch (library) | `/[locale]/watch` | Chips + grid, Section 9.2 |
| Video page | `/[locale]/watch/[slug]` | Section 9.3 |
| Read (index) | `/[locale]/read` | Section 9.4 |
| Article | `/[locale]/read/[slug]` | Section 9.5 |
| Collections | `/[locale]/collections`, `/[locale]/collections/[slug]` | Everyday Mysteries etc. |
| Topics | `/[locale]/topics`, `/[locale]/topics/[slug]` | |
| About | `/[locale]/about` | |
| Sources / Reading list | `/[locale]/sources` | Hidden if empty |
| Search | `/[locale]/search` | |
| Contact | `/[locale]/contact` | |
| Privacy, Terms | `/[locale]/privacy`, `/[locale]/terms` | |
| 404 | custom | Branded, search + links |

Locales: `ps`, `fa`, `en`. Default locale chosen by founder (recommend `ps`). The `fa` route is labelled **دری** (Dari) in the switcher and uses `lang="fa-AF"` and `hreflang="fa-AF"` (Dari/Afghan Persian); test font, screen-reader and search-engine handling. If Iranian Persian is ever added, use a separate `fa-IR` locale. **Core navigation rule (founder directive, 7 October 2026):** Home, Watch, Read, Topics and About are permanent primary destinations in every locale, regardless of published-content counts. Watch, Read and Topics retain their index routes and display localized editorial empty states when empty. General-page locale switching must offer en/ps/fa even when their libraries are empty. Hide empty optional sections and individual empty topic/collection destinations; this must never remove the five core navigation links.

## 8. Component Library

All components use tokens from Section 6, are keyboard accessible and mirror correctly in RTL (use CSS logical properties: `margin-inline-start`, `text-align: start`, etc.).

| Component | Spec |
|---|---|
| **Header** | Logo wordmark (serif) at start; nav links (Inter / Noto Sans Arabic 15 px); search icon; language switcher. Sticky on scroll-up only; 1px `--divider` bottom border. Mobile: hamburger opens a full-screen ivory sheet |
| **Language switcher** | Dropdown "پښتو / دری / English". Shows only languages that exist for the current item |
| **Hero** | Display headline, one-sentence subheading, two buttons (primary "Watch the latest video", secondary "Explore the articles"), featured video poster with centred play button. Mobile: text first, then poster |
| **Topic chip** | Pill, `--sage-100` background, `--sage-700` text; selected = `--sage-600` background with `--bg` text. Horizontally scrollable row on mobile with edge fade |
| **Video card (9:16)** | Poster, play icon, duration (bottom corner), language badge, topic label (small caps), title (H3, 2-line clamp). No views count unless analytics is shown publicly |
| **Article card** | 3:2 image, topic label, headline (serif H3), 2-line summary, meta (date, reading time) |
| **Feature article card** | Large image, headline H2, standfirst, byline; used once per index |
| **Collection card** | Stacked thumbnails or single cover, title, count ("8 videos") |
| **Video player (facade)** | Poster + play button; loads YouTube iframe (`youtube-nocookie.com`) on click only; never autoplay with sound; 9:16 locked ratio |
| **Go-deeper card** | `--surface` card with article thumbnail, "Read the full explanation", reading time, arrow. Appears under every video that has a linked article |
| **Article header** | Breadcrumb (Topic / Format), H1, byline (author, date, "Updated" when relevant), reading time, share row (copy link, WhatsApp, Facebook, X), standfirst |
| **Numbered section divider** | In long reads: small label "Part 1" + H2, thin rule above. Optional per article |
| **Figure** | Image, caption (`--ink-muted`, 14 px), alt text required |
| **Pull quote** | Serif italic (Latin) / larger Naskh (Arabic script), sage rule on the start edge |
| **Evidence note** | `--surface` box with label "Established / Emerging / Debated" and one sentence |
| **Sources & further reading** | Collapsible list at the article end: title, author/publication, year, link |
| **Author box** | Small avatar (optional), name, 2-line bio, social links |
| **Related content** | "Keep exploring" row of 3 cards (mixed video/article) |
| **Search** | Full-screen overlay on mobile; results grouped Videos / Articles |
| **Newsletter form** | Email, consent checkbox, double opt-in message. Feature-flagged |
| **Contact form** | Name, email, topic select, message, Turnstile; inline field errors; success panel |
| **Footer** | `--inverse-bg` background, `--inverse-ink` text, 4 groups, social icons, copyright, newsletter |
| **Buttons, inputs, tags** | As defined in 6.1; minimum height 44 px |

**States required for every interactive component:** default, hover, focus-visible (2 px `--sage-700` ring, 2 px offset), active, disabled, loading, error.

## 9. Page Specifications and Wireframes

### 9.1 Home
Mobile order (top to bottom):
1. **Hero** (ivory): Display headline "Look Beyond the Obvious." Subheading: "Psychology, human behaviour and the science behind everyday life—explained through short films, thoughtful stories and research-backed ideas." Buttons: Watch the latest video / Explore the articles. Below: featured video poster with play button.
2. **Topic chips** (TED-Ed pattern): All, Psychology, Neuroscience, Behavioural Economics, Learning, Everyday Science. Selecting a chip filters the "Latest videos" row below without a page reload.
3. **Latest videos:** section label, horizontal scroll row of 9:16 cards (desktop: 5 visible), "See all videos" link.
4. **Latest articles** (Behavioral Scientist pattern): one feature card, then a list/grid of 3-6 article cards. Clearly separate section with its own heading.
5. **Start here / Everyday Mysteries:** collection banner on `--surface` background with 3 preview items.
6. **Topic pillars:** six cards linking to Topic pages.
7. **About snippet:** "Beyond Rasooli explores the questions hiding in everyday life: why we remember, choose, learn, notice and behave the way we do. Each story starts with curiosity and follows the evidence." Link to About, social links.
8. **Newsletter** (if enabled), then footer.

Admin controls: which video is featured in the hero, order of pinned items, which collection is shown in section 5.

### 9.2 Watch (library)
- Header: "Watch" H1 and one-line intro.
- Sticky chip bar: Topic chips plus a Language filter (PS / FA / EN) and a sort toggle (Latest / Featured).
- Grid: 2 columns mobile, 3 tablet, 4-5 desktop of 9:16 cards. "Load more" button (no infinite scroll).
- Collections strip above the grid ("Everyday Mysteries", "Start here").
- Empty state: message plus link to Read.

### 9.3 Video page
- Mobile: title, topic/language labels, 9:16 player (facade), **Go-deeper card**, description, transcript (collapsible), sources, related videos.
- Desktop: two columns. Start column: centred 9:16 player (max 420 px wide). End column: title, description, Go-deeper card, transcript accordion, sources.
- Share row under the player. "Next video" and "More in [Topic]" at the bottom.
- Shows a small "Video language: Pashto" label (from `spokenLanguage`). On a translated page the video stays the original; the transcript and text are in the page language, with a note that the video itself is in the spoken language (and a link to YouTube captions if they exist).

### 9.4 Read (articles index)
- H1, intro line, search field.
- Filters: Topic chips, Format (Article / Explainer / Everyday Mystery), Language.
- First item is the **feature article card**; the rest in a 1/2/3-column grid with article cards.
- Pagination with "Load more".

### 9.5 Article page (Behavioral Scientist-style)
Order:
1. Breadcrumb: Topic / Format.
2. H1 (serif/Naskh Display), byline, date, reading time, share row.
3. Standfirst (italic in Latin).
4. Cover image with caption. If a source video exists, show the video facade here instead of or beneath the cover.
5. Body (680 px column): H2s, optional numbered "Part N" dividers, figures with captions, pull quotes, evidence notes, embedded videos.
6. **Sources & further reading** (collapsible, open by default on desktop).
7. Tags (chips linking to tag pages).
8. Author box.
9. "Keep exploring": 3 related cards.
10. Newsletter (if enabled).
- "Updated [date]" shown near the byline only for meaningful edits.
- Optional reading progress bar (2 px `--sage-600` at the top, hidden under reduced motion).

### 9.6 Topics and Collections
- Topic landing: H1, description (2-3 lines), featured item, then Videos and Articles in two labelled sections.
- Collection page: cover, description, ordered list; numbered sequence for "Start here".

### 9.7 About
Founder bio (draft below), mission, editorial principles (5 short items), social links, contact link. No face photo required; optional illustrated or object-based portrait.

> *Abdul Majeed Rasooli is the creator of Beyond Rasooli, an educational media project exploring psychology, human behaviour, decision-making and the science behind everyday life. Through short videos and accessible articles, he turns research and unusual everyday questions into ideas people can understand and use.*

### 9.8 Contact, Privacy, Terms, 404
As in Section 8 components. Privacy and Terms are CMS pages with an approval workflow (Section 11.2). 404 uses the brand tagline, a search field and links to Watch and Read. All text on these pages comes from CMS content or UI strings (Section 11.1).

## 10. Functional Requirements

### 10.1 Video publishing
- YouTube embed (including Shorts) via click-to-load facade with `youtube-nocookie.com`.
- Fields: URL, title, description, thumbnail (falls back to YouTube thumbnail), duration, transcript/captions, page language, spoken language, topic, tags, related article.
- **Auto-fill from YouTube:** when the founder pastes a URL, the server fetches title and thumbnail (YouTube oEmbed) and, if an API key is configured, duration (YouTube Data API). All values can be overridden; a failed lookup never blocks saving.
- 9:16 never cropped; no autoplay with sound; clear play controls and fallback thumbnail.
- Direct video upload is out of scope. If ever required, a costed proposal for storage, bandwidth, transcoding and backup is needed first.

### 10.2 Articles
Rich-text editor: headings, lists, images with alt/caption, pull quotes, links, embedded videos, evidence notes, numbered part dividers. Sources list, author, publish and updated dates, auto reading time, related content, clean shareable URLs, social metadata.

**Editorial source requirements:** each factual/research-led article must support a structured source list with source type (paper/book/report/site), title, author/organisation, year, URL/DOI, and optional note explaining why the source is relevant. The editor must be able to mark a source as primary research, review/meta-analysis, book, or secondary explanation. This single **Source component** (type, title, author/organisation, year, URL/DOI, note) is reused by Articles, Videos and the Sources / Reading list page.

**Corrections:** articles can display an optional correction/update note with date and summary. Material corrections should be retained in revision history rather than silently overwritten.

### 10.3 Search and discovery
- Site-wide search over titles, summaries and tags (both content types), locale-aware, with Arabic-script normalisation (ي/ی, ك/ک, diacritics stripped).
- Topic pages, filters by topic/format/language, related-content recommendations.
- Recommended implementation: Postgres full-text or Pagefind/Meilisearch; pick the simplest that handles RTL correctly.

### 10.4 Contact form
Fields: name, email, reason (collaboration, speaking, media, correction, general), message. Cloudflare Turnstile plus honeypot plus rate limit. Sent via Resend; also stored in the database. Clear confirmation and error states.

### 10.5 Newsletter (feature-flagged, off by default)
Email plus consent checkbox, double opt-in, unsubscribe in every email, provider behind an environment flag.

### 10.6 Analytics and consent
Privacy-conscious analytics only (Plausible or Umami). Disclose in Privacy page. Connect Google Search Console. No tracking cookies by default; cookie banner only if the setup requires one.

Track only the events needed to evaluate the product goals:
- `video_play` (fires on facade click = play intent; real watch time via the YouTube IFrame API is optional and loaded only after click)
- `video_to_article_click`
- `article_to_video_click`
- `related_content_click`
- `article_read_25`, `article_read_50`, `article_read_75`, `article_read_100` (scroll milestones) and `article_engaged_30s` (30 seconds of active reading)
- `search_used` (query text should not be stored if it may contain personal information; prefer aggregate or truncated reporting)
- `filter_used` (topic / format / language)
- `language_switch`
- `contact_submit_success`
- `newsletter_signup_success` when enabled

Analytics dashboards should be segmented by locale, content type and acquisition source where available without invasive tracking.

**Returning visitors:** cookieless tools such as Plausible and Umami generally cannot measure 30-day returning visitors reliably. Default: do not track individuals; report repeat sessions, newsletter growth and branded search instead. Optional: with the founder's explicit decision and disclosure in the Privacy page, enable a minimal first-party identifier to measure returning visits.

## 11. Content Management (Admin CMS)

- Secure `/admin`: strong passwords, rate-limited login, optional 2FA, roles (Admin, Editor).
- Draft, Scheduled, Published; unpublish and edit old posts any time; **live preview** that matches the public design.
- Featured/pinned controls; media library with required alt text, automatic resizing, WebP/AVIF.
- The founder can publish a video and an article with no code.

### Publishing workflow and governance
- Statuses: Draft → In review → Scheduled → Published → Archived.
- Only Admin can publish, unpublish, change legal-page approval, or manage roles. Editor can create/edit and submit for review.
- Scheduled publishing uses one configured site timezone shown clearly in the CMS; store timestamps in UTC.
- Changing a published slug must create a permanent redirect from the old URL.
- Deleting published content requires confirmation and should default to archive/unpublish rather than hard delete.
- Media records include alt text, caption, credit/source, licence/usage-rights note and optional expiry date for licensed assets.

### Content types

**Video:** title (localized), slug, summary (localized), description (localized), youtubeUrl, thumbnail, duration, transcript (localized), language (page language: ps/fa/en), spokenLanguage (language of the voiceover), topic, tags, relatedArticle, sources (shared Source component, see 10.2), featured/pin order, status, publishedAt, seoTitle, metaDescription, ogImage.

**Article:** title, slug, summary/standfirst, body (rich text, localized), coverImage + alt + caption, author, topic, format, tags, language, relatedVideo, sources (shared Source component, see 10.2), evidenceNote (enum + text), partsEnabled (boolean for numbered parts), readingTime (computed), featured/pin order, status, publishedAt, SEO fields, "show updated date" toggle.

**Topic:** name, slug, description, cover, order.
**Collection:** title, slug, description, cover, ordered items (videos and articles), numbered toggle.
**Page:** About, Privacy, Terms (rich text, localized, with an approval status; see 11.2).
**UI String:** every piece of interface text (see 11.1).
**Site settings:** social links, default SEO, newsletter toggle, nav labels, footer text.
**Author:** name, bio, optional image, social links.

### Multilingual content model (decision)

- **Articles and Videos:** one **document per language**, linked by a shared `translationGroup` ID. Each language document has its own slug, status, SEO fields, publish date, reviewer and translation status, so each language can be published, scheduled, reviewed and unpublished independently. (The "localized" label on a field in this section means "written in that document's language".)
- **Topics, Collections metadata, Pages (About/Privacy/Terms), UI strings, Site settings, Glossary:** use the CMS's built-in **localized fields** (one record, values per locale).
- The `language` field on an Article/Video is the page language. For videos, `spokenLanguage` records the voiceover language (they can differ on a translated page).
- If a translation document does not exist or is not Published, the switcher hides that language for that item (no broken pages). Translations are created ahead of time with the translate-at-publish tool (Section 11.3), never live for each visitor. A new language needs only a locale config entry and translations.
- Redirect rule: changing any language document's slug creates a permanent redirect from its old URL.

### 11.1 Editable interface text (UI strings), founder-managed

**Decision (from the founder):** the developer/AI tool generates the first Pashto and Dari interface wording now so the site is complete and testable. The founder checks it after the website is built and corrects whatever is unnatural or culturally wrong, directly in the admin (no code change). Generated wording is a starter draft, never final.

**Rules for the generated wording:** Pashto in Arabic script only (never Roman Pashto); Dari written in Dari Persian usage, not Iranian Persian where the vocabulary differs; short, plain, neutral phrasing; keep placeholders like `{count}` intact; every generated value is stored with status `ai_draft`.

**Requirement:** no user-facing text may be hardcoded in components, templates or emails. Every label, button, heading, placeholder, error message, empty state, accessibility label, footer line and email subject lives in an editable store the founder can change without a developer or a deploy.

**Implementation**
- A CMS collection `ui-strings` with one record per text:
  | Field | Purpose |
  |---|---|
  | `key` | Stable ID, e.g. `nav.watch`, `home.hero.cta_primary`, `form.error.email_invalid` (read-only after creation) |
  | `namespace` | Group for easy browsing: `nav`, `home`, `buttons`, `forms`, `errors`, `search`, `video`, `article`, `footer`, `a11y`, `email`, `seo` |
  | `context` | Plain-English note for the translator: where it appears, what it means, maximum length |
  | `value` (localized: ps, fa, en) | The actual text |
  | `status` per locale | `ai_draft` (generated), `needs_review` (flagged by founder/reviewer), `approved` (checked by founder) |
  | `placeholders` | Allowed variables, e.g. `{count}`, `{minutes}`, `{name}` (must be preserved) |
- The developer seeds all keys with English values and `context` notes at build time (from `messages/en.json`). Pashto and Dari values are generated once at seed time with status `ai_draft` (English remains the source of truth for meaning).
- **Display rule:** the site renders any non-empty ps/fa value, whatever its status, so the generated wording works immediately. If a value is missing, it falls back to the English value, so nothing ever renders blank. A "review mode" (**P2**; admin-only toggle) highlights every `ai_draft` and `needs_review` string on the live page so the founder can check wording in context and click a string to edit it in place.
- **Review gate:** public launch requires the founder's review pass to be finished (see checklist). After that, new or changed strings default to `ai_draft` until he approves them.
- **Spreadsheet round trip (P2):** admin buttons to **export** all strings to CSV/XLSX (key, namespace, context, en, ps, fa, status) and **import** an edited file back, with a validation report (unknown keys, broken placeholders, empty values). This lets the founder edit in bulk or send the sheet to a reviewer.
- **Review report (P0 minimum review tool; the founder edits each string directly from this list):** a dashboard page listing keys by status (`ai_draft`, `needs_review`, `approved`, missing) with a completion percentage per locale, so the founder can see how much is left to check.
- Changes publish without redeploying (tag-based cache revalidation on save).
- Plurals and numbers use ICU message format where needed (e.g., `{count, plural, ...}`); the founder supplies the correct plural forms for Pashto and Dari.
- Date and number formats are locale settings in **Site settings**, not hardcoded.
- Add an automated check (lint or test) that fails the build if a component contains hardcoded user-facing strings, or if a key used in code does not exist in `ui-strings`.
- Content types (articles, videos, topics, pages) keep their own localized fields. UI strings cover only interface text.

**Also editable from the admin without code (Site settings):** navigation labels and order, footer text and links, social links, homepage section titles, hero copy and buttons, About text, SEO defaults, 404 text, newsletter and contact-form text.

### 11.2 Privacy Policy and Terms pages: structure now, founder approves content

**Decision (from the founder):** use a standard professional website structure. He will review and provide or approve the final content before it goes live. The developer must not publish invented legal text.

**Implementation**
- Privacy and Terms are CMS **Page** records with fields: title, slug, body (rich text, localized), `lastUpdated` (date shown on the page), `version` label, and **`approval status`: `draft` / `awaiting_founder_approval` / `approved`**.
- A page can only be set to **Published** by the Admin role when its status is `approved` (hard validation, not a warning).
- Until approved, the footer links to Privacy and Terms are hidden in production, and the pages return `noindex`. Forms (contact, newsletter) show a short line "Privacy notice coming soon" only on staging; **production launch is blocked until both pages are approved** (see checklist).
- Content can be edited later in the rich-text editor with no code change. Each save keeps a revision history so the founder can compare and roll back. Changing the body of an approved page sets it back to `awaiting_founder_approval` (optional toggle, on by default).
- The developer seeds each page with the **standard structure below** using clearly marked placeholders like `[FOUNDER TO PROVIDE: ...]`. The seeded text is a scaffold for the founder (and a lawyer, if he chooses) to review, not final legal advice.

**Standard Privacy Policy structure**
1. Who we are and how to contact us
2. What information we collect (contact form, newsletter signup, analytics, server logs, cookies/local storage)
3. How we use the information
4. Third-party services (hosting, YouTube/Google embeds, Cloudflare Turnstile, email provider, analytics), each with a link to its policy
5. Cookies and similar technologies (what is set, why, how to control; matches what is actually implemented)
6. Embedded videos (YouTube privacy-enhanced mode; loads only after the visitor clicks play)
7. Data retention and deletion
8. Your rights and how to request access, correction or deletion
9. Children's privacy
10. Security
11. International data transfers (if applicable)
12. Changes to this policy and "last updated" date
13. Contact for privacy questions

**Standard Terms & Conditions structure**
1. Acceptance of terms
2. About the website and its purpose (educational content)
3. Educational-use disclaimer (content is general information, not medical, psychological or professional advice)
4. Intellectual property and copyright (site content, licensed media, how to request permission)
5. Acceptable use
6. Messages and submissions through the contact form
7. Third-party links and embedded content
8. Accuracy, corrections and how to report an error
9. Disclaimer of warranties and limitation of liability
10. Governing law and jurisdiction `[FOUNDER TO PROVIDE]`
11. Changes to the terms and "last updated" date
12. Contact information

*Note: the scaffolds above are a standard structure, not legal advice. The founder may choose to have a qualified lawyer review the final text.*


### 11.3 Automatic translation of articles and videos (translate at publish time)

**Goal:** when the founder publishes in one language, the site can create Pashto and Dari (and English) versions automatically, and the visitor's language toggle then switches to the stored version instantly.

**How it works**
1. In the Article or Video edit screen, the founder (or editor) clicks **"Generate translations"** and picks the target languages (ps, fa, en).
2. The system sends the source content to a translation provider (see below) and saves each result as a **draft translation** in the same `translationGroup`, with `translationStatus = machine_draft`.
3. A **side-by-side editor** (source on one side, translation on the other, direction-aware) lets the founder or a reviewer fix the text. Saving a human edit sets `translationStatus = reviewed`.
4. The founder publishes each language independently. The visitor's language toggle switches to the stored translation; if none exists for that item, the language option is hidden for that item (no broken pages).
5. There is **no live translation per visitor** in v1 (poor quality, no SEO, per-view cost, no way to correct).

**What gets translated:** title, summary/standfirst, body (the rich-text structure, headings, lists, quotes, image alt text and captions, evidence notes), video description and transcript, SEO title and meta description, and the visible text of "Sources & further reading" notes. **Never translated:** source titles, author names, URLs, study names in the original language, brand name "Beyond Rasooli", proper nouns on the glossary's do-not-translate list.

**Quality rules for the generated text (put these in the system prompt)**
- Preserve meaning exactly; do not add, remove or strengthen any claim. Keep hedging words ("may", "suggests", "in some studies") and the evidence-note label.
- Keep numbers, dates, names and links unchanged; keep the heading and list structure identical.
- Pashto in Arabic script only. Dari in Dari usage (output locale `fa` with display label "دری").
- Use the **glossary** (Site settings): a table of English term, preferred Pashto term, preferred Dari term, and a do-not-translate flag (e.g., "selective attention", "cognitive bias", "retrieval practice"). The founder maintains it; it is injected into every translation request.
- Plain, clear, editorial register; no slang.

**Safeguards**
- Automatic checks after generation: same number of headings/paragraphs, all links and numbers preserved, no Latin-script Pashto, no leftover untranslated paragraphs; failures are flagged to the editor.
- **Public label** on any published `machine_draft`: a small note "Automatic translation, being reviewed" (localized via UI strings). The label disappears when the status becomes `reviewed`.
- **Indexing:** `machine_draft` translations are `noindex` and excluded from `hreflang` and the sitemap until `reviewed`. This is a setting the founder can change.
- Re-translate button warns that it will overwrite unreviewed text and never overwrites a `reviewed` translation without confirmation. If the source changes after a translation was reviewed, the translation is flagged "source changed".

**Provider (swappable adapter)**
- Default: an LLM API (Claude) with the system prompt and glossary above, called from the server only. Alternative: Google Cloud Translation (supports Pashto and Persian) as a cheaper first pass.
- API keys live in environment variables in an account owned by the founder.
- Cost controls: manual trigger only (no automatic bulk runs), per-item size limit, monthly budget cap in Site settings, and a usage log (item, languages, date, approximate cost).
- Limitation to state in the handover: Pashto and Dari machine translation is less reliable than for major languages, so every translation should be read by a fluent reviewer before the "Automatic translation" label is removed.

**Data model additions**
Article and Video documents get: `translationStatus` (`none`, `machine_draft`, `reviewed`; one value per language document), `translatedFromLocale`, `translatedAt`, `reviewedBy`, `reviewedAt`, `sourceHashAtTranslation` (to detect source changes). A `glossary` collection: `termEn`, `termPs`, `termFa`, `doNotTranslate`, `notes`.


### 11.4 Status matrix (who can change what, and what it controls)

| System | Applies to | States | Who can change it | What it controls |
|---|---|---|---|---|
| **Content status** | Article, Video, Collection, Page (each language document separately) | Draft → In review → Scheduled → Published → Archived | Editor: Draft → In review. Admin: all transitions | Public visibility of that language document |
| **Translation status** | Article and Video documents created by translation | `none` / `machine_draft` / `reviewed` | System sets `machine_draft`; Editor or Admin sets `reviewed` | Public "Automatic translation, being reviewed" label, `noindex`, and inclusion in `hreflang` and sitemap |
| **UI string status** | Each UI string, per locale | `ai_draft` / `needs_review` / `approved` | Editor may flag `needs_review`; Admin (founder) approves | Review report, launch gate, optional review-mode highlighting. **Never hides text** |
| **Legal approval** | Privacy and Terms pages | `draft` / `awaiting_founder_approval` / `approved` | Admin (founder) only | Page cannot be Published unless `approved`; footer links appear only when published |

**Combination rules**
- A language document is public only when Content status = Published.
- A published `machine_draft` shows the public label and is `noindex` until marked `reviewed` (the founder can turn on "Require review before public" in Site settings to block publishing of unreviewed translations entirely).
- Editing a `reviewed` translation's source text sets it to "source changed", not back to `machine_draft`.
- Changing the body of an approved legal page sets it back to `awaiting_founder_approval` (default on).


## 12. Recommended Technical Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS with the Section 6 tokens as CSS variables; logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`) for RTL |
| CMS | Payload CMS (embedded in the Next.js app) with Postgres: self-hosted, founder owns data, drafts, scheduling, localization, roles, live preview |
| Alternative CMS | Sanity (hosted); confirm scheduling cost and ownership terms |
| Database | PostgreSQL (Neon, Supabase or host-managed) |
| i18n | `next-intl`, locales `ps`, `fa`, `en`, `dir` per locale; message strings loaded from the CMS `ui-strings` collection (Section 11.1) with a bundled English fallback file |
| Translation (at publish) | Swappable adapter: Claude API (default) or Google Cloud Translation; server-side only; glossary-driven; manual trigger (Section 11.3) |
| Fonts | `next/font` or self-hosted WOFF2: Newsreader, Inter, Noto Naskh Arabic, Noto Sans Arabic |
| Media | CMS media library + Next/Image; S3-compatible storage (Cloudflare R2) |
| Video | YouTube facade embeds, `youtube-nocookie.com` |
| Email | Resend (contact); Buttondown or MailerLite (newsletter, optional) |
| Spam | Cloudflare Turnstile |
| Hosting | Vercel, or Railway/Fly if self-hosting app and DB together; accounts owned by the founder |
| Backups | Daily automated DB backup, media bucket versioning, documented restore |
| Monitoring | Uptime check plus Sentry (free tier) |

**Ownership:** domain, hosting, CMS, database, storage, GitHub repo, analytics and email accounts are registered to the founder; the developer is a collaborator.

## 13. Internationalization and RTL

- `<html lang="ps|fa-AF|en" dir="rtl|ltr">` set per locale (Dari pages use `fa-AF`; see Section 7).
- Pashto is written in Arabic script only (never Roman Pashto).
- Logical CSS properties everywhere; mirror directional icons (arrows, back, carousels, breadcrumb separators); chip rows scroll from the start edge.
- Mixed direction: English terms inside Pashto/Dari text use `<bdi>` and `unicode-bidi: isolate`.
- Numerals: Western by default, switchable to Eastern Arabic.
- Dates localized (Gregorian default; Jalali optional later).
- `hreflang` for translated pairs; locale-aware sitemap.
- All interface text is managed in the CMS (Section 11.1). Pashto and Dari wording is generated as `ai_draft` starter text and checked/corrected by the founder after the build. Articles and videos get Pashto/Dari drafts through translate-at-publish (Section 11.3).
- Required test pages: a Pashto article containing English terms, a Dari article, a page with mixed scripts, search with Arabic-script input, and every component in Section 8 in RTL.

## 14. SEO Requirements

- Editable title and meta description per item; descriptive URLs; canonical URLs.
- `sitemap.xml` (all locales), `robots.txt`, `noindex` for drafts, search results and admin.
- Open Graph and Twitter card for every page; auto OG image fallback using the brand tokens (title on ivory, RTL-correct).
- Structured data: `Article`, `VideoObject` (truthful fields only), `BreadcrumbList`, `Person`/`Organization`, `WebSite` with SearchAction.
- Search Console verification; RSS feed per locale (nice to have).

## 15. Accessibility, Performance and Security

### Accessibility (WCAG 2.2 AA)
- Colour pairs only from Section 6.1; `--sage-400` never for small text.
- Keyboard navigation, visible focus ring, skip-to-content link, semantic landmarks and headings, required alt text.
- Captions/transcripts for video; accessible, localized labels for the play button and chips.
- Touch targets at least 44x44 px; respects `prefers-reduced-motion`.
- Forms: labelled inputs; errors announced and tied to fields.

### Performance (mobile, 4G)
- LCP under 2.5 s, CLS under 0.1, INP under 200 ms; Lighthouse Performance 90+ on Home, Video, Article.
- AVIF/WebP, responsive `srcset`, lazy-load below the fold, no render-blocking third-party scripts, YouTube loaded only on click, subsetted fonts.

### Security
HTTPS, HSTS and security headers (CSP, X-Frame-Options, Referrer-Policy); rate-limited admin login; sanitized rich text and form input; monthly dependency updates; secrets in environment variables; collect only necessary data.

### Browser and device support
- Current and previous major versions of Chrome, Safari, Firefox and Edge.
- Test iOS Safari and Android Chrome on at least one small phone width (~360 px), one typical phone, tablet and desktop.
- Progressive enhancement: core navigation, article reading and filter URLs must remain usable when JavaScript fails; richer filtering/search interactions may enhance the experience.

### Page-level states and resilience
Every data-driven page must define loading/skeleton, empty, partial-data and error states. A failed related-content block, analytics request, newsletter provider or translation service must not break the primary reading/watching experience.

### Data retention and privacy controls
- Contact-form submissions: configurable retention period; default recommendation **12 months**, then delete or anonymise unless needed for an active conversation.
- Translation usage logs: store operational metadata and cost, not unnecessary copies of sensitive user data.
- Admin audit/revision logs: retain long enough to support rollback and accountability.
- Provide a documented process for exporting/deleting personal data that is actually collected.

### Operations targets (initial)
- Availability: 99.5% monthly uptime target with an uptime monitor alerting the founder by email.
- Backups: recovery point objective 24 hours (daily backups); recovery time objective 4 hours for a full site restore; restore tested before launch and at least quarterly.
- Error alerts (Sentry) go to the developer and the founder during the bug-fix period.

## 16. Launch Content (seed data for testing)

1. The Sound of Your Name (selective attention; avoid claiming the brain monitors everything equally)
2. Three Study Mistakes (retrieval practice, spacing, passive rereading; with limits)
3. Why We Misremember (reconstructed memory; confidence is not accuracy)
4. Why We Follow the Crowd (social influence, informational cues, belonging; not just "blind conformity")
5. Why a Price Changes What We Feel (framing and expectations; effects depend on context)

Each exists as a video plus a linked article with sources, in Pashto and English at minimum, to test the video-to-article bridge and the multilingual model.

## 17. Build Phases (one prompt per phase)

**Phase 0: Foundation and design system.** Next.js, TypeScript, Tailwind, a `ui-strings` system (no hardcoded text, English seed file, CMS-backed with fallback), tokens from Section 6 as CSS variables, self-hosted fonts (Latin and Arabic), `next-intl` with ps/fa/en and RTL, layout shell (header, footer, language switcher), Payload CMS plus Postgres, env config.
**Phase 1: Component library.** All Section 8 components with every state, in LTR and RTL, on a `/styleguide` page (hidden from indexing).
**Phase 2: Content model and CMS.** P0: collections and fields from Section 11 (Articles/Videos as one document per language linked by `translationGroup`; localized fields for Topics, Pages, UI strings and settings), shared Source component, status matrix (11.4), roles, in-review/scheduling/drafts, slug redirects, live preview, media library, YouTube auto-fill, basic collections, `ui-strings` with status and review report, a one-time script that generates the Pashto/Dari starter wording as `ai_draft`, Privacy/Terms pages with the approval workflow (11.1, 11.2), seed data. **P2 (only if budgeted):** CSV/XLSX import/export of UI strings and in-page review mode.
**Phase 3: Core pages.** Home, Watch, Video, Read, Article, Topics, Collections, About, 404, following Section 9.
**Phase 4: Discovery, forms and translation.** Finish P0 search (RTL-safe), filters, contact form with Turnstile/email, Privacy and Terms. Then add P1 translate-at-publish (provider adapter, glossary, review status, safeguards, usage log). Side-by-side review tooling is P1; bulk/overlay review tooling is P2 unless specifically budgeted for launch.
**Phase 5: SEO and quality.** Metadata, OG images, structured data, sitemap, robots, hreflang, analytics, Search Console, accessibility and performance passes.
**Phase 6: Launch readiness.** Staging, backup and restore test, security headers, uptime monitoring, ownership transfer, handover docs, training.

## 18. Acceptance Criteria (launch checklist)

**Design**
- [ ] Only Section 6 colour tokens and fonts are used; no ad-hoc values.
- [ ] All text meets AA contrast; focus states visible everywhere.
- [ ] Pashto and Dari text uses Noto Naskh Arabic / Noto Sans Arabic with no fallback-font glyphs; all special Pashto letters render.
- [ ] Every Section 8 component works in LTR and RTL with mirrored icons.
- [ ] Video cards are 9:16; article cards 3:2; no cropped on-screen text.

**Function**
- [ ] The founder can create, preview, schedule, publish, unpublish and edit a video and an article without a developer; scheduled posts publish automatically.
- [ ] Topic chips filter the video grid without a page reload and also work without JavaScript through URL parameters.
- [ ] Every video page with a linked article shows the Go-deeper card; articles with a source video show it near the top.
- [ ] Language switcher links only to existing translations.
- [ ] Embeds never autoplay with sound; thumbnail fallback works.
- [ ] Articles show author, date, reading time, sources, tags and related content.
- [ ] Search returns correct results for Latin and Arabic-script queries.
- [ ] Contact form works end to end with spam protection and clear states.
- [ ] Required analytics events fire once, carry the correct locale/content metadata, and do not expose unnecessary personal data.
- [ ] Old URLs redirect after a published slug change in any language.
- [ ] Articles and Videos are one document per language linked by `translationGroup`; each language can be published, scheduled and unpublished independently.
- [ ] The status matrix (11.4) is enforced: only Admin can approve legal pages and UI strings; Editors cannot publish.
- [ ] One shared Source component is used by Articles, Videos and the Sources page.
- [ ] Pasting a YouTube URL auto-fills title, thumbnail and (if configured) duration; failures do not block saving.
- [ ] Video pages show "Video language" from `spokenLanguage`; translated pages keep the original video with a clear note.
- [ ] The switcher labels Dari as "دری"; Dari pages output `lang="fa-AF"` and `hreflang="fa-AF"`.
- [ ] Scroll-milestone and engaged-time events fire; the returning-visitor method chosen in Section 22 is implemented and disclosed.
- [ ] Basic collections ("Everyday Mysteries", "Start here") work and are hidden until they have 3 or more items.
- [ ] Empty optional sections and individual topic/collection destinations are hidden; the five permanent core navigation destinations remain available with localized index empty states.
- [ ] No hardcoded user-facing text in code; the build check for hardcoded strings passes.
- [ ] The founder can edit any interface text in the admin, and the change appears on the live site without a deploy.
- [ ] **P2 unless explicitly in launch scope:** CSV/XLSX export and import of UI strings works, with a validation report.
- [ ] Pashto and Dari UI strings are generated for every key (status `ai_draft`), render on the live site, and fall back to English only if a value is missing. **P2:** in-page review overlay/in-place editing.
- [ ] Founder review pass completed: the review report shows 0 `ai_draft` or `needs_review` strings for ps and fa before public launch.
- [ ] "Generate translations" works for an article and a video into ps, fa and en; results save as `machine_draft` drafts in the same translation group.
- [ ] Side-by-side translation editor works in LTR and RTL; saving a human edit sets status to `reviewed`.
- [ ] Glossary terms are respected; do-not-translate terms stay unchanged; links, numbers and structure are preserved (automatic checks pass or flag).
- [ ] Published machine drafts show the "Automatic translation, being reviewed" label and are `noindex` until reviewed.
- [ ] Translation requests are manual, logged, and stop at the monthly budget cap.
- [ ] Language toggle switches to the stored translation instantly; items without a translation hide that language.
- [ ] Privacy and Terms pages exist with the standard structure; they cannot be published until the founder sets them to `approved`.
- [ ] Production launch is blocked until the founder has approved the Privacy and Terms content and completed the Pashto/Dari UI review pass.

**Quality**
- [ ] Unique title, meta description and OG preview on every page; sitemap and robots live.
- [ ] Lighthouse mobile: Performance 90+, Accessibility 95+, SEO 95+ on Home, Video and Article.
- [ ] Tested on common iOS and Android sizes, tablet and desktop.
- [ ] 404, broken links and image loading checked.
- [ ] Backups confirmed and a restore tested; admin access verified; all accounts owned by the founder.
- [ ] Handover docs and training delivered; bug-fix period defined.

## 19. Deliverables

1. Sitemap and wireframes (from Section 9) before full build.
2. Visual design samples: Home, Video page, Article page.
3. Working website, CMS access and full source-code handover.
4. List of all third-party services and recurring fees.
5. Publishing guide and training (recorded or live) on publishing a video and an article.
6. Defined post-launch bug-fix period and a maintenance option.

**Separate quotes requested:** design/UI and responsive build; CMS and content types; hosting, domain, email, paid plugins and recurring costs; maintenance, security and backups; extra cost for multilingual/RTL and, if ever required, direct video hosting.

## 19.1 Delivery plan and estimates

Ask the developer to provide hours and cost per phase. The sizes below are **relative guidance for planning, not quotes** (S = small, M = medium, L = large).

| Phase | Relative size | Milestone / demo |
|---|---|---|
| 0 Foundation and design system | M | Staging site with tokens, fonts, i18n/RTL shell and empty CMS |
| 1 Component library | M | `/styleguide` page with every component in LTR and RTL |
| 2 Content model and CMS | L | Founder publishes a test video and article; UI strings review report works |
| 3 Core pages | L | Home, Watch, Video, Read, Article, Topics, About running on seed content |
| 4 Discovery, forms (P0) + translation (P1) | M + M | Search, contact form; then translate-at-publish on staging |
| 5 SEO and quality | S | Lighthouse, accessibility and structured-data pass; analytics events verified |
| 6 Launch readiness | S | Backup restore test, ownership transfer, training, founder approvals recorded |

Founder review pass (UI wording) and legal approvals run in parallel with Phases 4-6 and must finish before public launch. Re-baseline the plan after Phase 2, once the data model is proven.

## 20. Phase 2 Backlog (not in v1)

Newsletter automation, reader accounts, comments, courses, memberships, advanced recommendations, **bulk translation and advanced translation QA/review automation** (basic translate-at-publish is already P1 in v1), podcast/audio, downloadable reading lists, direct video hosting (only with a clear technical and financial reason), dark mode, Jalali calendar, reading-list bookmarks.

## 21. Key Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| V1 becomes too large | Translation/admin tooling can consume more effort than the public experience | Enforce P0/P1/P2 priorities; never delay core publishing, RTL, performance or sources for P2 tooling |
| Pashto/Dari machine translation sounds unnatural | Trust and editorial quality are central to the brand | Human review status, glossary, noindex for unreviewed translations, clear public label where used |
| Reference sites influence the design too literally | Creates a derivative identity | Use references only for patterns; create original tokens, spacing, typography, imagery and composition |
| Low initial content volume makes sections feel empty | A publication can look unfinished at launch | Seed at least 5 video/article pairs; hide empty sections; feature collections only when they have enough content |
| Heavy media hurts mobile performance | Most visitors arrive from social on phones | Facade video embeds, responsive images, strict image budgets, limited scripts/fonts |
| Founder becomes dependent on developer | Defeats the ownership goal | CMS-first workflow, handover, backups, owner-controlled accounts, staging, written publishing guide |
| Cookieless analytics cannot answer retention questions | KPI targets become unmeasurable | Decide the measurement method early (Section 22); use repeat sessions, newsletter growth and branded search if no identifier is allowed |
| Several overlapping status systems confuse editors | Mistakes in publishing, review or legal approval | Follow the status matrix (11.4); show status badges and one "what blocks publishing" message in the admin |

## 22. Open Questions and Decisions to Lock

**Already answered:** Pashto/Dari UI wording is generated now and checked by the founder after the build. Final Privacy/Terms content is provided and approved by the founder; the structure is built now and content is added later through the CMS (Sections 11.1 and 11.2).

Lock the items below before the phase shown. Each needs an owner and a date; change "Status" to Decided when resolved.

| # | Decision | Why it matters | Owner | Needed by | Status |
|---|---|---|---|---|---|
| 1 | Default locale (`ps` recommended) | Routing, homepage language, SEO | Founder | Before Phase 0 | Open |
| 2 | Dari UI at launch (P0) or Dari content only | UI string effort, review load | Founder | Before Phase 0 | Open |
| 3 | CMS (Payload vs Sanity) and hosting/database provider | Architecture, cost, ownership | Developer, founder approves cost | Before Phase 0 | Open |
| 4 | Hosting and tooling budget range | Provider and plan choices | Founder | Before Phase 0 | Open |
| 5 | Domain name and registrar account (founder-owned) | DNS, email, SEO | Founder | Before Phase 0 | Open |
| 6 | Logo/wordmark (text wordmark in Newsreader for v1 if none) | Header, OG images | Founder | Before Phase 1 | Open |
| 7 | Editors and reviewers: additional editors, named Pashto reviewer, named Dari reviewer, second approver | Roles, review gate | Founder | Before Phase 2 | Open |
| 8 | Which P1 features are in launch budget (translation, newsletter, extra collection features) | Scope and cost | Founder and developer | Before Phase 2 | Open |
| 9 | Newsletter at launch and provider | Forms, consent, email setup | Founder | Before Phase 3 | Open |
| 10 | YouTube channel, social profile links, sender email domain | Footer, About, email deliverability | Founder | Before Phase 3 | Open |
| 11 | Translation provider (Claude API, Google Cloud Translation, or both) and monthly cap | Quality, cost | Founder and developer | Before Phase 4 | Open |
| 12 | May machine-translated drafts go public with the label, or only after human review ("Require review before public")? | Trust, SEO | Founder | Before Phase 4 | Open |
| 13 | Glossary: do-not-translate terms and who maintains it | Translation quality | Founder | Before Phase 4 | Open |
| 14 | Returning-visitor measurement: no identifier (default) or opt-in first-party identifier | KPI measurability, privacy | Founder and developer | Before Phase 5 | Open |
| 15 | Legal-page final approver and governing law/jurisdiction | Launch gate | Founder | Before Phase 5 | Open |

**Definition of ready for development:** Sections 1-18 are accepted; P0/P1 scope is agreed; decisions 1-5 are resolved; seed content and brand assets are available or explicitly assigned; remaining decisions have an owner and a date.
