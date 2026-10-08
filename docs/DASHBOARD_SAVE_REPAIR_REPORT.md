# Dashboard save repair

Date: 7 October 2026.

## Cause

The reported request posts to `/api/media`. The founder clarified that the submitted item was a YouTube link. Media is the image-upload collection; a YouTube webpage cannot become an image file. Payload therefore rejects the request with HTTP 400. A valid YouTube link must be saved in `/admin/collections/videos/create`, in the YouTube URL field.

The initial reproduction returned a structured file validation error for HTML. After the correction, a YouTube URL posted to Media returns a localized message directing the user to New Video. The 400 remains appropriate for an invalid media-file request; valid Video and image creation both succeed. The `nonIterableSpread.js` console location alone did not identify a separate spread exception.

## Changes

- Added CMS-backed save guidance to Media, Videos, Articles, Topics, Collections, Pages, Authors, Glossary, UI Strings and Users.
- Media guidance identifies supported image files and required alt text, with a direct New Video link.
- Media before-operation validation catches a YouTube URL or unsupported incoming MIME type before image processing, using a structured localized field error. It reads the original request URL because the installed Payload version sanitizes generated upload identity before collection hooks.
- Retained the image MIME restrictions and required alt text. YouTube Videos continue to use their own content collection and optional thumbnail.
- Page and Collection status menus now restrict Editors to Draft/In review, matching existing server permissions and preventing those forms from offering invalid publishing choices.
- Added English, Pashto and Dari starter wording for eleven UI-string keys. These remain subject to founder review.
- No persisted data fields, schema migration, publishing requirement or product content model was changed by this repair.

## Verification

All test records were created in `.qa/founder-workflow.sqlite` on the isolated port-3100 server. The connected database was inspected read-only: the checked current Article/Video/settings fields exist. No founder account, editorial content or real schema was modified. The original port-3000 server was left running.

| Native Admin screen | Create | Save/reload | Edit/save |
|---|---|---|---|
| Media: actual PNG upload and alt text | PASS | PASS | PASS |
| Video: actual YouTube URL in the Video field | PASS | PASS | PASS |
| Article | PASS | PASS | PASS |
| Topic | PASS | PASS | PASS |
| Collection | PASS | PASS | PASS |
| Page: Privacy draft with normal rich-text keyboard entry | PASS | PASS | PASS |
| Author | PASS | PASS | PASS |
| Glossary | PASS | PASS | PASS |
| UI String | PASS | PASS | PASS |
| User | PASS | PASS | PASS |
| Site Settings (existing global) | N/A | PASS | PASS |

All eight permitted Editor creation/edit forms also passed: Media, Videos, Articles, Topics, Collections, Pages, Authors and Glossary. Editor status menus were checked on Articles, Videos, Collections and Pages and contained only the two permitted states.

Additional checks: YouTube-in-Media structured validation passed for both roles; en/ps/fa Media guidance matched CMS wording and had the correct LTR/RTL direction. The first automated Page attempt used programmatic contenteditable replacement and produced a required-body error; normal keyboard entry saved correctly, with no Page validation rules removed.

Evidence:

- `.qa/dashboard-save-admin-results.json`: 11 passing scenario groups.
- `.qa/dashboard-save-editor-results.json`: 9 passing scenario groups.
- `.qa/dashboard-save-settings-results.json`: 2 passing scenario groups.
- `scripts/qa-dashboard-saves.mjs` and `scripts/qa-dashboard-save-settings.mjs`: reproducible browser/API checks, with nonzero exit status on failure. They require the isolated test accounts/database and port 3100.

Final lint, typecheck, unit tests (10/10) and static UI-string scan: PASS. Bundled Pashto/Dari key coverage: no missing keys. Production build (`npm run build -- --webpack`): PASS, including TypeScript and 59 generated static pages.

## Files changed

- New `src/components/admin/CreationHelp.tsx` and `src/collections/shared/creation-help.ts`.
- `src/collections/Media.ts`, `Videos.ts`, `Articles.ts`, `Topics.ts`, `Collections.ts`, `Pages.ts`, `Authors.ts`, `Glossary.ts`, `UIStrings.ts`, `Users.ts`.
- `src/app/(payload)/admin.css` and generated `src/app/(payload)/admin/importMap.js`.
- `src/messages/en.json`, `ps.json`, `fa.json`.
- New `scripts/qa-dashboard-saves.mjs`, `scripts/qa-dashboard-save-settings.mjs` and this report.

## Using the correction

Open `http://localhost:3000/admin/collections/videos/create` for a YouTube video. Paste the link into YouTube URL, select the document language and topic, complete title/slug/description, then Save. A thumbnail upload is optional. Use Media for image files, with descriptive alt text.

Refresh an already-open admin form to load the new guidance. Localization seeding was performed only against the isolated test database. To add the new editable guidance wording to the connected CMS, run `npm run seed:localization`; existing founder wording is preserved. Until missing values are seeded, the documented bundled English fallback applies. No migration is required for these UI-only fields.

