import { request, chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = "http://localhost:3100";
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: "PASS" });
    console.log("PASS " + name);
  } catch (error) {
    results.push({ name, status: "FAIL", error: error.message });
    console.log("FAIL " + name + ": " + error.message);
  }
}
const admin = await request.newContext({ baseURL: base, extraHTTPHeaders: { "Sec-Fetch-Site": "same-origin" } });
const anon = await request.newContext({ baseURL: base, extraHTTPHeaders: { "Sec-Fetch-Site": "same-origin" } });
await admin.post("/api/users/login", {
  data: { email: "qa@beyondrasooli.test", password: "Local-QA-only-9273!" },
});
const docs = (await (await admin.get("/api/articles?limit=100")).json()).docs;
const source = docs.find((d) => d.slug === "qa-memory-en");
const target = docs.find((d) => d.slug === "qa-memory-ps");
await check(
  "editor cannot publish, approve UI strings, or edit published content",
  async () => {
    const created = await admin.post("/api/users", {
      data: {
        email: "editor@beyondrasooli.test",
        password: "Local-editor-only-9273!",
        name: "QA Restricted Editor",
        role: "editor",
      },
    });
    assert([201, 400].includes(created.status()));
    const editor = await request.newContext({ baseURL: base, extraHTTPHeaders: { "Sec-Fetch-Site": "same-origin" } });
    assert.equal(
      (
        await editor.post("/api/users/login", {
          data: {
            email: "editor@beyondrasooli.test",
            password: "Local-editor-only-9273!",
          },
        })
      ).status(),
      200,
    );
    assert(
      (
        await editor.patch(`/api/articles/${source.id}`, {
          data: { title: "Unauthorized" },
        })
      ).status() >= 400,
    );
    assert(
      (
        await editor.post("/api/articles", {
          data: {
            title: "Unauthorized",
            language: "en",
            slug: "unauthorized",
            translationGroup: "unauthorized",
            status: "published",
          },
        })
      ).status() >= 400,
    );
    assert.equal(
      (
        await editor.patch("/api/ui-string-review", {
          data: { key: "nav.watch", locale: "ps", status: "approved" },
        })
      ).status(),
      403,
    );
    await editor.dispose();
  },
);
await check(
  "source changes flag reviewed translations and review clears flag",
  async () => {
    assert.equal(
      (
        await admin.patch(`/api/articles/${target.id}`, {
          data: { translatedFromLocale: "en", translationStatus: "reviewed" },
        })
      ).status(),
      200,
    );
    assert.equal(
      (
        await admin.patch(`/api/articles/${source.id}`, {
          data: {
            summary: source.summary + " Updated QA source " + Date.now(),
          },
        })
      ).status(),
      200,
    );
    assert.equal(
      (await (await admin.get(`/api/articles/${target.id}`)).json())
        .sourceChanged,
      true,
    );
    assert.equal(
      (
        await admin.patch(`/api/articles/${target.id}`, {
          data: { translationStatus: "reviewed" },
        })
      ).status(),
      200,
    );
    assert.equal(
      (await (await admin.get(`/api/articles/${target.id}`)).json())
        .sourceChanged,
      false,
    );
  },
);
await check(
  "disabled newsletter returns a truthful unavailable response",
  async () => {
    assert.equal(
      (
        await anon.post("/api/newsletter", {
          data: { email: "qa@example.com", consent: true },
        })
      ).status(),
      503,
    );
  },
);
const browser = await chromium.launch();
const context = await browser.newContext({
  storageState: await admin.storageState(),
  viewport: { width: 1280, height: 900 },
});
const page = await context.newPage();
await check(
  "authenticated draft preview updates unsaved data without publishing it",
  async () => {
    const created = await admin.post("/api/articles", {
      data: {
        title: "QA Preview saved",
        summary: "QA preview summary",
        topic: source.topic.id || source.topic,
        language: "en",
        slug: "qa-preview",
        translationGroup: "qa-preview",
        status: "draft",
      },
    });
    assert.equal(created.status(), 201);
    const doc = (await created.json()).doc;
    await page.goto(base + `/en/preview?collection=articles&id=${doc.id}`);
    await page
      .getByRole("heading", { level: 1, name: "QA Preview saved" })
      .waitFor();
    await page.waitForTimeout(500);
    await page.evaluate(
      (data) =>
        window.postMessage(
          {
            type: "payload-live-preview",
            collectionSlug: "articles",
            locale: "en",
            data,
          },
          location.origin,
        ),
      { ...doc, title: "QA Preview unsaved" },
    );
    await page
      .getByRole("heading", { level: 1, name: "QA Preview unsaved" })
      .waitFor({ timeout: 15000 });
    assert.equal(
      (await (await admin.get(`/api/articles/${doc.id}`)).json()).title,
      "QA Preview saved",
    );
    assert.equal((await anon.get(`/api/articles/${doc.id}`)).status(), 404);
  },
);
await check("native Payload editing and branded login render", async () => {
  await page.goto(base + `/admin/collections/articles/${source.id}`);
  await page.locator("input[name=title]").waitFor({ timeout: 30000 });
  assert.equal(
    await page.locator("input[name=title]").inputValue(),
    source.title,
  );
  await page.screenshot({ path: ".qa/admin-editor.png", fullPage: true });
  const publicPage = await browser.newPage();
  await publicPage.goto(base + "/admin/login");
  await publicPage.locator("input[name=email]").waitFor();
  await publicPage.screenshot({ path: ".qa/admin-login.png", fullPage: true });
  assert(
    (await publicPage.locator("body").innerText()).includes("Beyond Rasooli"),
  );
  await publicPage.close();
});
await check(
  "mobile landscape and 200 percent equivalent layout have no overflow",
  async () => {
    for (const locale of ["en", "ps", "fa"])
      for (const size of [
        { width: 844, height: 390 },
        { width: 640, height: 450 },
      ]) {
        await page.setViewportSize(size);
        await page.goto(base + `/${locale}/watch`);
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth + 1,
          ),
          false,
        );
      }
  },
);
await check("published slug changes produce permanent redirects", async () => {
  assert.equal(
    (
      await admin.patch(`/api/articles/${source.id}`, {
        data: { slug: "qa-memory-en-updated" },
      })
    ).status(),
    200,
  );
  const response = await anon.get("/en/read/qa-memory-en", { maxRedirects: 0 });
  assert.equal(response.status(), 308);
  assert.equal(response.headers().location, "/en/read/qa-memory-en-updated");
  assert.equal(
    (
      await admin.patch(`/api/articles/${source.id}`, {
        data: { slug: "qa-memory-en" },
      })
    ).status(),
    200,
  );
});
await fs.writeFile(
  ".qa/extended-results.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
await admin.dispose();
await anon.dispose();
