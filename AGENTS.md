# Beyond Rasooli — Persistent Agent Instructions & Operating Rules

## Project Overview
**Beyond Rasooli** is a multilingual personal media brand, editorial publication, article platform, and short-form video library focused on psychology, human behaviour, neuroscience, behavioural economics, learning, everyday science, and research-backed ideas.

---

## 1. Specification Hierarchy & Single Source of Truth
1. **Authoritative Specification:** [`docs/MASTER_PRD.md`](file:///x:/PP/beyond%20rasooli/docs/MASTER_PRD.md)
   - Serves as the authoritative implementation specification and single source of truth.
   - Treat the PRD as an inviolable technical contract.
2. **Supporting Context:** [`docs/BRAND_DEVELOPMENT_BRIEF.pdf`](file:///x:/PP/beyond%20rasooli/docs/BRAND_DEVELOPMENT_BRIEF.pdf)
   - Provides supporting context for brand direction, editorial intent, audience, visual character, and original project vision.
3. **Conflict Resolution:**
   - In any scenario where the two documents differ, conflict, or diverge, **`MASTER_PRD.md` strictly overrides and takes precedence**.
   - Do not use older PRD versions unless explicitly provided and instructed by the user.
4. **No Unilateral Inventions or Removals:**
   - Never invent product architecture or features from scratch.
   - Never silently remove, simplify, replace, or reinterpret requirements because an alternative seems easier.
   - If a requirement is technically problematic, detail the issue clearly and propose the smallest compliant solution.
   - Inspect the PRD before making any product or technical decisions.

---

## 2. Phased Implementation & Scope Management
- **Phase-by-Phase Execution:**
  - Follow the implementation phases defined in `MASTER_PRD.md`.
  - Do not jump ahead between phases unless an explicit dependency requires it.
- **Priority Rules:**
  - **P0**: Launch blockers (must be rock-solid, fully implemented, and thoroughly tested).
  - **P1**: Launch if stable / budget allows.
  - **P2**: Post-launch / later enhancements.
  - **Strict Constraint:** P1 and P2 features must never destabilize, delay, or compromise P0 functionality.

---

## 3. Multilingual & RTL Architecture (Foundational)
Multilingual capabilities are a foundational architectural requirement from day one, never an afterthought:
- **Supported Languages:**
  - Pashto (`ps`) — RTL
  - Dari (`fa` / `fa-AF`) — RTL
  - English (`en`) — LTR
- **Script & Typography:**
  - Native Arabic-script typography, font fallbacks, and rendering for Pashto and Dari.
  - Proper handling of Pashto-specific characters (ځ, څ, ډ, ړ, ږ, ښ, ڼ, ۍ, ئ, etc.).
  - Mixed Latin/Arabic bidirectional text rendering.
  - Correct localized Dari labeling and nuances distinct from standard Iranian Persian where specified.
- **Layout & Styling:**
  - Full RTL layout mirroring (margins, paddings, borders, flex/grid directions, directional icons/chevrons).
  - Use CSS logical properties (`margin-inline-start`, `padding-inline-end`, `inset-inline`, etc.).
- **Content Model:**
  - One document per language version.
  - Connected across languages via `translationGroup`.
  - Independent slugs, SEO metadata, publishing dates, and translation review states per language.
  - Do NOT merge page language and video spoken language: strictly maintain separate `language` (UI/page context) and `spokenLanguage` (audio/subtitle tracks) models.
- **Metadata:**
  - Precise `hreflang`, canonical tags, and HTML `dir`/`lang` attributes per document.

---

## 4. UI Strings & Content Management
- **Zero Hardcoded User-Facing Text:**
  - Never hardcode user-facing copy or labels in application components.
  - Implement the PRD's editable `ui-strings` architecture.
  - All UI strings must be loadable and editable via the CMS without requiring code edits or redeployment.
- **Founder Autonomy & CMS Workflow:**
  - The founder must have complete autonomy to create, edit, preview, submit for review, schedule, publish, and unpublish/archive content without engineering intervention.
  - Adhere to the roles, publishing workflows, translation statuses, legal approval statuses, and UI-string review rules specified in `MASTER_PRD.md`.

---

## 5. Engineering Standards & Quality Assurance
- **Verification Before Completion:**
  - For every development phase and feature:
    1. Inspect requirements in `MASTER_PRD.md`.
    2. Understand architecture interactions.
    3. Implement without violating any requirement.
    4. Run linter, type checker, and automated tests.
    5. Test runtime behavior, responsiveness, accessibility, and LTR/RTL rendering.
    6. Fix any defects found.
    7. Document changes clearly.
  - **Rule:** Never mark a task or feature complete simply because code exists. Verify it in runtime.
- **Architectural Principles:**
  - Premium science and ideas editorial feel (clean, intellectual, elegant typography, high readability).
  - Avoid generic SaaS/startup templates, influencer portfolio tropes, or generic blog layouts.
  - Avoid unnecessary dependencies and over-abstraction.
  - Do not replace PRD-specified technologies without technical rationale and explicit user approval.
- **Security:**
  - Never expose secrets, API keys, database credentials, or admin tokens.
  - Strictly use environment variables (`.env`) and maintain a comprehensive `.env.example`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
