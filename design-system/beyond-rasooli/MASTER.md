# Beyond Rasooli public website design system

## Authority and scope

`docs/MASTER_PRD.md` overrides this document and all skill recommendations. This system applies only to the public website. Founder/editor dashboards, Payload administration, authentication, permissions, database and publishing workflows are outside the redesign scope.

## Direction and provenance

Generated using the installed `.agents/skills/ui-ux-pro-max/SKILL.md` workflow and its CLI on 2026-10-10. The refined query `news magazine editorial` returned Newsreader editorial typography, a spacious grid, clear hierarchy and restrained interaction. These recommendations fit the publication; the generic news colors, Roboto, marketing section sequence and shadows are superseded by PRD Sections 6–9. The initial glass/fashion recommendation was rejected as unsuitable.

Premium science and psychology editorial identity: warm paper, generous whitespace, expressive serif headlines, readable research-led articles and clear video-to-article discovery. Avoid generic SaaS cards, decorative glass, gradients, excessive animation and invented features.

## Color

Use only PRD tokens: background `#FAF7F0`, surface `#F3EEE2`, secondary surface `#EAE4D5`, ink `#1B1B18`, muted ink `#5A5A52`, divider `#E3DED2`, sage 700 `#34502F`, sage 600 `#4F6B4D`, sage 400 `#6B8068`, sage 100 `#DCE5D6`, error `#9B2C2C`. Inverse surfaces use ink and ivory. Sage 400 is decorative only. Normal text contrast must reach 4.5:1; focus indicators and meaningful controls require 3:1.

## Typography and language

English headlines and article body: self-hosted Newsreader. English interface: Inter. Pashto and Dari headlines/body: Noto Naskh Arabic; interface: Noto Sans Arabic. Preserve PRD fallback stacks and verify Pashto-specific glyphs. Arabic text has no italics, uppercase transformations or tracking.

Display 36–64px; page title 32–48px; section title 26–34px; article body 18–20px; interface 16px; metadata 13–14px. Use PRD language-specific line heights (Arabic body 1.9). Article measure is 680px. Page languages remain separate from video spoken language. Dari output uses `fa-AF`; Pashto and Dari mirror via logical CSS properties.

## Layout and components

Use a 4px base and spacing steps 4, 8, 12, 16, 24, 32, 48, 64, 96. Site width 1200px; gutters 20px mobile and 40px desktop. Breakpoints 360, 480, 768, 1024, 1280px. Center bounded content on larger monitors. Cards/inputs radius 4px; chips pill shaped; hero imagery square corners. No default card shadows.

Preserve Home, Watch, Read, Topics and About navigation, localized search and language switching. Preserve PRD page order, CMS content, empty states, filters and URL behavior. Video cards 9:16, article imagery 3:2, hero imagery 16:9 desktop and 4:5 mobile. No cropped video captions. Existing Lucide icons use 1.5px strokes; directional icons mirror in RTL.

## Interaction and accessibility

Minimum 44px controls, visible keyboard focus, semantic landmarks, skip link, sequential headings, labeled forms and accessible status feedback. Navigation and reading retain progressive enhancement. All interface wording continues through existing CMS-backed UI strings; no component literals.

Use 150–200ms color/opacity transitions; respect reduced motion. No parallax or autoplay sound. Responsive images reserve their dimensions; prioritize only LCP media and lazy-load below-fold media. Load YouTube after user activation.

## Implementation verification

After the complete redesign prompt is supplied, verify actual rendered public pages in English, Pashto and Dari at small/typical phone, tablet/iPad, laptop, desktop and large-monitor widths, plus landscape and reduced motion. Check overflow, keyboard interaction, glyph rendering and accessibility. Run lint, typecheck, existing automated tests and UI-string checks. Report unavailable browser/device checks explicitly rather than claiming physical-device coverage.
