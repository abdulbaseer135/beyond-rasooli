# Beyond Rasooli — Implementation Roadmap & Status Tracker

Mapped directly to `MASTER_PRD.md` (Sections 17 & 18) and `AGENTS.md`.

---

## Phase 0: Foundation and Design System
- [x] Initialize Next.js (App Router) + TypeScript + Tailwind CSS
- [x] Configure Design Tokens from PRD Section 6 (CSS variables for colors, typography, spacing, layout, shadows)
- [x] Configure font loading with proper fallbacks (Newsreader, Inter, Noto Naskh Arabic, Noto Sans Arabic) ensuring Pashto glyphs (ټ ډ ړ ږ ښ ڼ ګ ې ۍ)
- [x] Setup `next-intl` multilingual routing with locales `ps` (default, RTL), `fa` (RTL, Dari labelled دری, `fa-AF`), and `en` (LTR)
- [x] Setup UI strings architecture (`ui-strings` with fallback to English seed, support for `ai_draft`, `needs_review`, `approved`)
- [x] Implement base layout shell (Header with logo wordmark, nav, search trigger, language switcher; Footer with 4 groups, social links, inverse colors)
- [x] Configure Payload CMS integration with Postgres/SQLite adapter and environment schema
- [x] Verification: linting, TypeScript build, RTL/LTR layout rendering

---

## Phase 1: Component Library
- [x] Build all Section 8 components with required states (default, hover, focus-visible, active, disabled, loading, error):
  - [x] Header & Mobile Menu (full-screen ivory sheet)
  - [x] Language Switcher (ps/fa/en with active item filtering)
  - [x] Hero component
  - [x] Topic Chip (scrollable row with edge fade on mobile)
  - [x] Video Card (9:16 vertical poster, play icon, duration, language badge, topic, title)
  - [x] Article Card (3:2 image, topic, serif title, summary, metadata)
  - [x] Feature Article Card
  - [x] Collection Card
  - [x] Video Player Facade (YouTube nocookie facade, 9:16 locked, click-to-play)
  - [x] Go-Deeper Card (video-to-article bridge)
  - [x] Article Header (breadcrumb, H1, byline, reading time, share actions, standfirst)
  - [x] Numbered Section Divider ("Part N")
  - [x] Figure with caption and alt text
  - [x] Pull Quote (direction-aware sage rule)
  - [x] Evidence Note (Established / Emerging / Debated)
  - [x] Sources & Further Reading (shared Source component)
  - [x] Author Box
  - [x] Related Content grid ("Keep exploring")
  - [x] Search overlay / modal
  - [x] Contact Form (Turnstile, inline validation, success/error states)
  - [x] Newsletter Form (feature-flagged)
  - [x] Footer
- [x] Create `/styleguide` route (hidden from indexing) presenting every component in LTR and RTL
- [x] Verification: automated checks, visual rendering in LTR and RTL, keyboard focus rings

---

## Phase 2: Content Model and CMS
- [x] Configure Payload CMS collections matching Section 11:
  - [x] `articles`: one document per language, `translationGroup` ID, reading time, sources, evidence note, numbered parts, status
  - [x] `videos`: one document per language, `translationGroup` ID, `language` vs `spokenLanguage`, YouTube URL auto-fill, facade preview, sources, status
  - [x] `topics`: localized fields (name, slug, description, cover)
  - [x] `collections`: localized title, slug, description, ordered items, 3-item minimum visibility rule
  - [x] `pages`: About, Privacy, Terms with approval workflow (`draft`, `awaiting_founder_approval`, `approved`)
  - [x] `ui-strings`: key, namespace, context, localized values, status per locale, review report view
  - [x] `site-settings`: global settings, social links, default SEO, glossary, budget caps
  - [x] `media`: alt text, caption, credit/source, license notes
  - [x] `users`: roles (`admin`, `editor`)
- [x] Enforce Status Matrix (11.4): Admin vs Editor roles, legal approval lock, content publish lock
- [x] Implement YouTube metadata auto-fetch (oEmbed)
- [x] Slug redirect tracking on published slug changes
- [x] Seed launch content (Section 16: 5 research-backed video & article pairs in Pashto, Dari, English)
- [x] Seed complete UI strings dictionary across all namespaces with `ai_draft` for ps & fa
- [x] Build UI String Review Report dashboard (P0)
- [x] Verification: CMS access, publishing test, draft preview, review report

---

## Phase 3: Core Pages
- [x] Home (`/[locale]`): Hero, Topic chips, Latest videos horizontal row, Latest articles with feature card, Start Here / Everyday Mysteries collection banner, Topic pillars, About snippet, Footer
- [x] Watch (`/[locale]/watch`): H1, sticky chip bar with topic/language/sort filters, 9:16 video grid, Load More, Collections strip
- [x] Video Detail (`/[locale]/watch/[slug]`): 9:16 facade player, Go-Deeper card, title, description, collapsible transcript, sources, related videos, `spokenLanguage` note
- [x] Read (`/[locale]/read`): H1, search input, topic chips, format filter, feature article card, 1/2/3 column article grid, Load More
- [x] Article Detail (`/[locale]/read/[slug]`): Breadcrumb, H1, standfirst, byline, cover/source video, rich text body, numbered parts, figures, evidence notes, sources accordion, author box, related content
- [x] Topics (`/[locale]/topics`, `/[locale]/topics/[slug]`): topic landing with featured item and segmented video/article lists
- [x] Collections (`/[locale]/collections`, `/[locale]/collections/[slug]`): ordered item lists (hidden if <3 items)
- [x] About (`/[locale]/about`): Founder bio, mission, 5 editorial principles, social links
- [x] Sources (`/[locale]/sources`): Shared source repository
- [x] Custom 404 (`/[locale]/not-found`): Branded, search field, links to Watch and Read
- [x] Verification: all routes render, responsive tests, RTL/LTR layout parity

---

## Phase 4: Discovery, Forms and Translation
- [x] Site-wide Search: Arabic-script normalization (ي/ی, ك/ک, diacritics stripped), query grouping (Videos / Articles)
- [x] Filter interactions: URL query param fallbacks for non-JS progressive enhancement
- [x] Contact Form endpoint: Cloudflare Turnstile, honeypot, DB storage, Resend email dispatch, accessibility error announcements
- [x] Privacy & Terms pages: scaffold structure with founder approval gate (`approved` check for publishing)
- [x] Translate-at-publish system (P1):
  - [x] Provider adapter (Claude / LLM server-side)
  - [x] System prompt with glossary injection and editorial safeguards
  - [x] Side-by-side translation editor in CMS
  - [x] Safeguards: heading/paragraph count match, link/number preservation, Arabic script verification
  - [x] Public label "Automatic translation, being reviewed" on `machine_draft`
  - [x] `noindex` and exclude from sitemap until `reviewed`
- [x] Verification: search indexing, form submission end-to-end, translation workflow

---

## Phase 5: SEO and Quality
- [x] Dynamic Metadata & Canonical URLs
- [x] Open Graph & Twitter Cards with brand fallback images
- [x] Structured Data: `Article`, `VideoObject`, `BreadcrumbList`, `Organization`, `WebSite`
- [x] Multilingual `sitemap.xml` and `robots.txt`
- [x] `hreflang` alternating tags matching `translationGroup`
- [x] Privacy-friendly Analytics events (`video_play`, `video_to_article_click`, scroll depth, search, filter)
- [x] Accessibility (WCAG 2.2 AA) audit: 44px touch targets, contrast ratios, keyboard navigation, focus rings
- [x] Performance audit: Core Web Vitals, responsive images, font preloading

---

## Phase 6: Launch Readiness
- [x] Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy)
- [x] Backup and recovery documentation (RPO 24h, RTO 4h)
- [x] Production deployment guide (Vercel / Railway / self-hosted)
- [x] Founder handover documentation and CMS publishing guide
- [x] Final Acceptance Criteria review against Section 18
