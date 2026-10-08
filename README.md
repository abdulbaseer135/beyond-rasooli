# Beyond Rasooli

> A multilingual personal media brand, editorial publication, article platform, and short-form video library focused on psychology, human behaviour, neuroscience, behavioural economics, learning, everyday science, and research-backed ideas.

---

## Documentation & Specification

All development on this project is strictly driven by the documentation in `docs/`:

- **Primary Source of Truth:** [`docs/MASTER_PRD.md`](file:///x:/PP/beyond%20rasooli/docs/MASTER_PRD.md)
  - The authoritative product requirements document and engineering contract.
- **Brand & Editorial Reference:** [`docs/BRAND_DEVELOPMENT_BRIEF.pdf`](file:///x:/PP/beyond%20rasooli/docs/BRAND_DEVELOPMENT_BRIEF.pdf)
  - Supporting context for brand direction, visual character, editorial philosophy, and audience.
- **Agent Operating Rules:** [`AGENTS.md`](file:///x:/PP/beyond%20rasooli/AGENTS.md)
  - Persistent operational guidelines, priority rules (P0/P1/P2), multilingual/RTL standards, and quality verification workflows.

---

## Project Structure

```text
/
├── docs/
│   ├── MASTER_PRD.md                   # Single source of truth (PRD)
│   └── BRAND_DEVELOPMENT_BRIEF.pdf     # Brand & visual brief
├── AGENTS.md                           # AI agent persistent operating instructions
├── README.md                           # Project introduction and workspace setup
└── (project source files to follow in implementation phases)
```

---

## Languages Supported
- **Pashto (`ps`)** — RTL
- **Dari (`fa` / `fa-AF`)** — RTL
- **English (`en`)** — LTR

---

## Admin & Founder Access

The admin portal is available at `/admin` (or via the unobtrusive "Admin" footer link on the public website).

- **First-Time Setup (Zero Users):** Navigating to `/admin` automatically detects if no admin users exist and routes to the **Create Founder Account** screen (`/admin/create-first-user`). The initial user is automatically assigned the `Admin` role with founder credentials.
- **Normal Operation:** Once the founder account exists, `/admin` displays the standard login interface. The setup route is locked, preventing public self-registration.
- **Navigation:** Auth views provide clear links back to the public website without requiring manual URL editing.

