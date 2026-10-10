import { chromium, request } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import sharp from "sharp";
const base = "http://localhost:3100";
const results = [];
const suffix = Date.now();
async function check(name, work) {
  try { await work(); results.push({ name, status: "PASS" }); console.log("PASS " + name); }
  catch (error) { results.push({ name, status: "FAIL", error: error.message }); console.log("FAIL " + name + ": " + error.message); }
}
const admin = await request.newContext({ baseURL: base, timeout: 120000, extraHTTPHeaders: { Origin: base, "Sec-Fetch-Site": "same-origin" } });
const editor = await request.newContext({ baseURL: base, timeout: 120000, extraHTTPHeaders: { Origin: base, "Sec-Fetch-Site": "same-origin" } });
const publicAPI = await request.newContext({ baseURL: base, timeout: 120000 });
async function json(response, expected = 200) { const body = await response.json(); assert.equal(response.status(), expected, JSON.stringify(body)); return body; }
await json(await admin.post("/api/users/login", { data: { email: "founder-fixes@example.test", password: "QA-founder-fixes-9273!" } }));
await json(await editor.post("/api/users/login", { data: { email: "editor-fixes@example.test", password: "QA-editor-fixes-9273!" } }));
let topic, article, video, topicProposal;
const body = { root: { type: "root", version: 1, format: "", indent: 0, direction: "ltr", children: [{ type: "paragraph", version: 1, format: "", indent: 0, direction: "ltr", children: [{ type: "text", version: 1, text: "Published science content 42.", format: 0, detail: 0, mode: "normal", style: "" }] }] } };
await check("founder creates a published topic", async () => { topic = (await json(await admin.post("/api/topics?locale=en", { data: { name: `QA Sleep ${suffix}`, slug: `qa-sleep-${suffix}`, status: "published" } }), 201)).doc; });
await check("valid video POST accepts fallback-locale=null and separate page/audio languages", async () => { video = (await json(await admin.post("/api/videos?depth=0&fallback-locale=null&locale=en", { data: { title: `QA Video ${suffix}`, youtubeUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ", topic: topic.id, language: "en", spokenLanguage: "ps", status: "draft" } }), 201)).doc; });
await check("video validation returns meaningful field errors for an invalid URL", async () => {
  const response = await admin.post("/api/videos?depth=0&fallback-locale=null&locale=en", { data: { title: "Invalid QA", youtubeUrl: "https://example.com/bad", language: "en", spokenLanguage: "ps", topic: topic.id, status: "published" } });
  const data = await json(response, 400);
  assert(JSON.stringify(data).includes("youtubeUrl"));
  await fs.writeFile(".qa/video-validation-response.json", JSON.stringify({ request: { title: "Invalid QA", youtubeUrl: "https://example.com/bad", language: "en", spokenLanguage: "ps", topic: topic.id, status: "published" }, status: 400, response: data }, null, 2));
});
await check("editor topic draft submits, notifies once, and founder approves persistently", async () => {
  topicProposal = (await json(await editor.post("/api/topics?locale=en", { data: { name: `QA Proposal ${suffix}`, slug: `qa-proposal-${suffix}`, status: "draft" } }), 201)).doc;
  assert.equal(topicProposal.status, "draft");
  topicProposal = (await json(await editor.patch(`/api/topics/${topicProposal.id}?locale=en`, { data: { status: "pending" } }))).doc;
  assert.equal(topicProposal.status, "pending");
  const notifications = await json(await admin.get(`/api/notifications?where[targetCollection][equals]=topics&where[targetId][equals]=${topicProposal.id}`));
  assert.equal(notifications.totalDocs, 1);
  await json(await admin.post("/api/admin/content-reviews", { data: { action: "approve", collection: "topics", id: topicProposal.id } }));
  assert.equal((await json(await admin.get(`/api/topics/${topicProposal.id}`))).status, "published");
  await json(await admin.post("/api/admin/content-reviews", { data: { action: "approve", collection: "topics", id: topicProposal.id } }));
});
await check("editor article submits once, founder approves, and original content stays accessible in all locales", async () => {
  article = (await json(await editor.post("/api/articles", { data: { title: `QA Article ${suffix}`, slug: `qa-article-${suffix}`, language: "en", topic: topicProposal.id, body, status: "draft" } }), 201)).doc;
  await json(await editor.post("/api/admin/submit-for-approval", { data: { collection: "articles", id: article.id } }));
  await json(await editor.post("/api/admin/submit-for-approval", { data: { collection: "articles", id: article.id } }));
  const notifications = await json(await admin.get(`/api/notifications?where[targetCollection][equals]=articles&where[targetId][equals]=${article.id}`));
  assert.equal(notifications.totalDocs, 1);
  await json(await admin.post("/api/admin/content-reviews", { data: { action: "approve", collection: "articles", id: article.id } }));
  const links = await json(await publicAPI.get(`/api/translations?locale=en&path=/read/${article.slug}`));
  for (const locale of ["en", "ps", "fa"]) {
    assert(links.links[locale]);
    const response = await publicAPI.get(links.links[locale]); assert.equal(response.status(), 200);
    assert((await response.text()).includes(article.title));
    const listing = await publicAPI.get(`/${locale}/read?language=${locale}`);
    assert.equal(listing.status(), 200);
    assert((await listing.text()).includes(article.title));
  }
});
await check("concurrent video publishing persists once and repeat action preserves timestamps", async () => {
  const responses = await Promise.all([1, 2].map(() => admin.post("/api/admin/publish-now", { data: { collection: "videos", id: video.id } })));
  assert(responses.some(r => r.status() === 200)); assert(responses.every(r => [200, 409].includes(r.status())));
  const before = await json(await admin.get(`/api/videos/${video.id}`));
  await json(await admin.post("/api/admin/publish-now", { data: { collection: "videos", id: video.id } }));
  const after = await json(await admin.get(`/api/videos/${video.id}`));
  assert.equal(after.status, "published"); assert.equal(after.updatedAt, before.updatedAt); assert.equal(after.publishedAt, before.publishedAt);
  assert.equal((await publicAPI.get(`/en/watch/${after.slug}`)).status(), 200);
});
await check("editor cannot publish, approve, or edit another contributor's draft", async () => {
  assert.equal((await editor.post("/api/admin/publish-now", { data: { collection: "videos", id: video.id } })).status(), 403);
  assert.equal((await editor.post("/api/admin/content-reviews", { data: { action: "approve", collection: "topics", id: topic.id } })).status(), 403);
  assert.equal((await editor.patch(`/api/articles/${article.id}`, { data: { status: "published" } })).status(), 403);
  const privateDoc = (await json(await admin.post("/api/articles", { data: { title: `Private ${suffix}`, language: "en", status: "draft" } }), 201)).doc;
  assert.equal((await editor.get(`/api/articles/${privateDoc.id}`)).status(), 404);
  assert.equal((await publicAPI.get(`/ps/read/${privateDoc.slug}`)).status(), 404);
  assert.equal((await publicAPI.post("/api/admin/submit-for-approval", { data: { collection: "articles", id: privateDoc.id } })).status(), 401);
});
const browser = await chromium.launch();
const context = await browser.newContext({ locale: "en-US", timezoneId: "America/Los_Angeles", storageState: await admin.storageState() });
const page = await context.newPage();
page.setDefaultTimeout(60000);
const errors = [];
page.on("pageerror", error => errors.push(error.message));
page.on("console", message => { if (message.type() === "error" && /hydration/i.test(message.text())) errors.push(message.text()); });
await check("native existing video Publish persists and disables unchanged publishing after reload", async () => {
  const draft = (await json(await admin.post("/api/videos?locale=en", { data: { title: `QA Browser Video ${suffix}`, youtubeUrl: "https://youtu.be/dQw4w9WgXcQ", topic: topic.id, language: "en", spokenLanguage: "ps", status: "draft" } }), 201)).doc;
  await page.goto(`${base}/admin/collections/videos/${draft.id}`, { timeout: 120000 });
  await page.getByRole("button", { name: "Publish Now", exact: true }).click();
  await page.getByRole("button", { name: "Update Published", exact: true }).waitFor();
  assert.equal((await json(await admin.get(`/api/videos/${draft.id}`))).status, "published");
  await page.reload();
  await page.getByRole("button", { name: "Update Published", exact: true }).waitFor();
  assert(await page.getByRole("button", { name: "Update Published", exact: true }).isDisabled());
});
await check("founder and editor dashboards show articles videos topics with type filtering", async () => {
  await page.goto(`${base}/admin`, { timeout: 120000 });
  assert((await page.locator("main").innerText()).includes(article.title));
  assert((await page.locator("main").innerText()).includes(video.title));
  assert((await page.locator("main").innerText()).includes(topic.name));
  await page.goto(`${base}/admin?type=topics`);
  assert((await page.locator("main").innerText()).includes(topicProposal.name));
  const editorContext = await browser.newContext({ storageState: await editor.storageState() });
  const editorPage = await editorContext.newPage(); await editorPage.goto(`${base}/admin`);
  assert((await editorPage.locator("main").innerText()).includes(article.title));
  assert((await editorPage.locator("main").innerText()).includes(topicProposal.name));
  assert(!(await editorPage.locator("main").innerText()).includes(video.title));
  await editorContext.close();
});
await check("topic rejection feedback, resubmission, and editor video approvals", async () => {
  const proposal = (await json(await editor.post("/api/topics?locale=en", { data: { name: `QA Revision ${suffix}`, status: "draft" } }), 201)).doc;
  await json(await editor.post("/api/admin/submit-for-approval", { data: { collection: "topics", id: proposal.id } }));
  await json(await admin.post("/api/admin/content-reviews", { data: { action: "reject", collection: "topics", id: proposal.id, notes: "Please add evidence." } }));
  const rejected = await json(await editor.get(`/api/topics/${proposal.id}?locale=en`));
  assert.equal(rejected.reviewDecision, "rejected"); assert.equal(rejected.reviewNotes, "Please add evidence.");
  await json(await editor.patch(`/api/topics/${proposal.id}?locale=en`, { data: { description: "Revised context." } }));
  await json(await editor.post("/api/admin/submit-for-approval", { data: { collection: "topics", id: proposal.id } }));
  const candidate = (await json(await editor.post("/api/videos?locale=en", { data: { title: `QA Editor Video ${suffix}`, youtubeUrl: "https://youtu.be/dQw4w9WgXcQ", topic: topic.id, language: "en", spokenLanguage: "ps", status: "draft" } }), 201)).doc;
  await json(await editor.post("/api/admin/submit-for-approval", { data: { collection: "videos", id: candidate.id } }));
  await json(await editor.post("/api/admin/submit-for-approval", { data: { collection: "videos", id: candidate.id } }));
  assert.equal((await editor.patch(`/api/videos/${candidate.id}`, { data: { title: "Mutate pending content" } })).status(), 403);
  await page.goto(`${base}/admin/content-approvals?state=in_review`);
  assert((await page.locator("body").innerText()).includes(candidate.title));
  assert((await page.locator("body").innerText()).includes(proposal.name));
  await json(await admin.post("/api/admin/content-reviews", { data: { action: "approve", collection: "videos", id: candidate.id } }));
  assert.equal((await publicAPI.get(`/en/watch/${candidate.slug}`)).status(), 200);
});
await check("native new video creation publishes with a collection POST", async () => {
  await page.goto(`${base}/admin/collections/videos/create?locale=en`);
  await page.locator('#field-title').fill(`QA New Browser ${suffix}`);
  await page.locator('#field-youtubeUrl').fill('https://youtu.be/dQw4w9WgXcQ');
  const topicField = page.locator('#field-topic input');
  await topicField.click(); await topicField.fill(topic.name);
  await page.getByRole('option', { name: topic.name, exact: true }).click();
  const responsePromise = page.waitForResponse(response => response.url().includes('/api/videos?') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Publish Now', exact: true }).click();
  const response = await responsePromise; assert.equal(response.status(), 201);
  const created = (await response.json()).doc; assert.equal(created.status, 'published');
  await page.getByRole('button', { name: 'Update Published', exact: true }).waitFor();
});
await check("dashboard pagination reaches records beyond ten per type", async () => {
  for (let index = 0; index < 11; index++) await json(await admin.post('/api/topics?locale=en', { data: { name: `QA Paging ${suffix} ${index}`, status: 'published' } }), 201);
  await page.goto(`${base}/admin?type=topics&page=1`);
  const first = await page.locator('main section').first().innerText();
  await page.getByRole('link', { name: 'Next', exact: true }).click();
  await page.waitForURL(/page=2/);
  await page.locator('main section').first().getByText('Page 2', { exact: true }).waitFor();
  const second = await page.locator('main section').first().innerText();
  assert.notEqual(first, second); assert(page.url().includes('page=2'));
});
await check("public LTR/RTL fallback pages refresh without hydration errors", async () => {
  for (const locale of ["en", "ps", "fa"]) {
    await page.goto(`${base}/${locale}/read/${article.slug}`, { timeout: 120000 }); await page.reload();
    assert.equal(await page.locator("html").getAttribute("dir"), locale === "en" ? "ltr" : "rtl");
    assert((await page.locator("body").innerText()).includes("Published science content 42."));
  }
  await page.goto(`${base}/admin/content-approvals`);
  assert.equal(errors.length, 0, errors.join("\n"));
});
await check("custom thumbnail upload and video publication preserve media", async () => {
  const image = await sharp({ create: { width: 64, height: 64, channels: 3, background: "#ffffff" } }).png().toBuffer();
  const media = (await json(await admin.post("/api/media", { multipart: { _payload: JSON.stringify({ alt: "QA thumbnail", licence: "original" }), file: { name: "qa-thumbnail.png", mimeType: "image/png", buffer: image } } }), 201)).doc;
  const created = (await json(await admin.post("/api/videos", { data: { title: `QA Thumbnail ${suffix}`, youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", topic: topicProposal.id, language: "en", spokenLanguage: "ps", thumbnail: media.id, relatedArticle: article.id, status: "published" } }), 201)).doc;
  assert.equal(created.status, "published"); assert.equal(created.thumbnail.id || created.thumbnail, media.id);
});
await check("suspended editor sessions and logins lose privileged access", async () => {
  const me = (await json(await editor.get('/api/users/me'))).user;
  try {
    await json(await admin.patch(`/api/users/${me.id}`, { data: { status: 'suspended' } }));
    assert.equal((await editor.post('/api/videos', { data: { title: 'Suspended create', language: 'en', spokenLanguage: 'ps', youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ' } })).status(), 403);
    assert.equal((await editor.post('/api/admin/submit-for-approval', { data: { collection: 'articles', id: article.id } })).status(), 403);
    assert.equal((await editor.post('/api/users/login', { data: { email: 'editor-fixes@example.test', password: 'QA-editor-fixes-9273!' } })).status(), 403);
  } finally { await json(await admin.patch(`/api/users/${me.id}`, { data: { status: 'approved' } })); }
});
await browser.close(); await admin.dispose(); await editor.dispose(); await publicAPI.dispose();
await fs.writeFile(".qa/editorial-fixes-results.json", JSON.stringify(results, null, 2));
if (results.some(result => result.status === "FAIL")) process.exitCode = 1;
