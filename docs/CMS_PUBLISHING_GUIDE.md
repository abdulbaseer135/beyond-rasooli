# Beyond Rasooli — Founder CMS Publishing Guide

This manual empowers the founder to create, edit, translate, schedule, and publish videos and researched articles without developer intervention.

---

## 1. Accessing the CMS Dashboard
- **URL:** `https://your-domain.com/admin` (or `http://localhost:3000/admin` locally).
- **Default Founder Account:** `admin@beyondrasooli.com`.
- **Roles:**
  - **Admin (Founder):** Full authority to publish, unpublish, approve legal pages, and approve UI strings.
  - **Editor:** Can draft and submit content for review (`draft` → `in_review`). Cannot publish without Admin approval.

---

## 2. Publishing a Video Short

1. Navigate to **Collections → Videos → Add New**.
2. **Language vs Spoken Language (Crucial Architectural Rule):**
   - `Language`: The page/UI language of this specific document (`ps`, `fa`, or `en`).
   - `Spoken Language`: The language of the actual voiceover in the video (typically Pashto `ps`).
   - *A translated Dari or English page keeps the original Pashto video, displaying a clear note to the reader.*
3. **YouTube URL & Auto-Fill:**
   - Paste the YouTube URL or YouTube Shorts URL into `youtubeUrl`.
   - The system automatically retrieves the high-resolution poster and title.
4. **Link to In-Depth Article (Go-Deeper Bridge):**
   - In the `Related Article` field, select the corresponding written explainer.
   - *This activates the Go-Deeper Card directly beneath the player, powering the site's primary 15%+ conversion KPI.*
5. **Add Sources:**
   - Click `Add Source` to add structured citations (paper title, authors, year, DOI link, relevance note).
6. **Set Status:**
   - Change Status from `Draft` to `Published` (or pick a future date and select `Scheduled`).
7. Click **Save**.

---

## 3. Publishing an In-Depth Article

1. Navigate to **Collections → Articles → Add New**.
2. **Translation Group:**
   - Enter a shared identifier (e.g., `tg-selective-attention`). All language versions of this article must share this exact ID.
3. **Standfirst / Summary:**
   - Enter a 1-2 sentence compelling summary. This appears in italic serif on the article header.
4. **Body Content:**
   - Use the rich text editor to write headings, paragraphs, and numbered parts (Part 1, Part 2).
5. **Evidence Note:**
   - Select status: `Established Finding`, `Emerging Research`, or `Active Scientific Debate`.
   - Add a concise one-sentence description.
6. **Attach Companion Video:**
   - Select the related short video in `Related Video` to embed the video player near the top of the article.
7. **Add Structured Sources:**
   - Use the shared Source component to add papers, books, or reviews cited in the text.
8. Set Status to `Published` and click **Save**.

---

## 4. Translating Content (Translate-at-Publish Workflow)

1. Open the source article or video document (e.g. English or Pashto).
2. Visit `/translation-review` or trigger translation in the CMS.
3. The server generates draft translations in Pashto (`ps`) and Dari (`fa`).
4. **Draft Status:**
   - The translation is saved with status `machine_draft`.
   - On the public site, machine drafts show a clear note: *"Automatic translation, being reviewed"* and are excluded from search indexing (`noindex`).
5. **Side-by-Side Review:**
   - Review the text in the direction-aware editor.
   - Edit any phrasing to ensure natural register.
   - Click **Save as Reviewed**. The public warning is removed and the page becomes eligible for indexing!

---

## 5. Editing UI Strings (Zero Code Changes)

1. Navigate to **Collections → UI Strings** or open the **Review Report** at `/[locale]/review-report`.
2. Locate the key you want to modify (e.g. `home.hero_headline`, `nav.watch`).
3. Edit the Pashto or Dari text directly.
4. Set status to `Approved`.
5. Changes appear on the live website immediately without redeploying!

---

## 6. Approving Privacy Policy & Terms of Use

1. Navigate to **Collections → Pages**.
2. Open `Privacy Policy` or `Terms of Use`.
3. Review the scaffold content and insert jurisdiction details.
4. Set `Approval Status` to **Approved by Founder**.
5. Change Status to **Published**.
6. *Hard validation rule: The CMS will reject publishing if approval status is not set to approved.*
