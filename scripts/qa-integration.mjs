import { request, chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = "http://localhost:3100";
const results = [];
const anonymous = await request.newContext({ baseURL: base, extraHTTPHeaders: { "Sec-Fetch-Site": "same-origin" } });
const admin = await request.newContext({ baseURL: base, extraHTTPHeaders: { "Sec-Fetch-Site": "same-origin" } });
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
await check("anonymous UI/provider endpoints are protected", async () => {
  assert.equal((await anonymous.get("/api/ui-string-review")).status(), 401);
  assert.equal(
    (await anonymous.post("/api/translate", { data: {} })).status(),
    401,
  );
});
await check("QA administrator can log in", async () => {
  const response = await admin.post("/api/users/login", {
    data: {
      email: "qa@beyondrasooli.test",
      password: process.env.QA_ADMIN_PASSWORD || "Local-QA-only-9273!",
    },
  });
  assert.equal(response.status(), 200);
});
const articles = await (await admin.get("/api/articles?limit=100")).json();
const target = articles.docs?.find((a) => a.slug === "qa-memory-ps");
const source = articles.docs?.find((a) => a.slug === "qa-memory-en");
await check(
  "language switcher resolves distinct translated slugs",
  async () => {
    const data = await (
      await anonymous.get(
        "/api/translations?locale=en&path=%2Fread%2Fqa-memory-en",
      )
    ).json();
    assert.equal(data.links.ps, "/ps/read/qa-memory-ps");
    assert.equal(data.links.fa, "/fa/read/qa-memory-fa");
  },
);
await check("UI approval persists and edits reset approval", async () => {
  let r = await admin.patch("/api/ui-string-review", {
    data: { key: "nav.watch", locale: "ps", status: "approved" },
  });
  assert.equal(r.status(), 200);
  let list = await (await admin.get("/api/ui-string-review")).json();
  let item = list.items.find((d) => d.key === "nav.watch");
  assert.equal(item.statusPs, "approved");
  r = await admin.patch(`/api/ui-strings/${item.id}`, {
    data: { valuePs: item.ps + " " },
  });
  assert.equal(r.status(), 200);
  list = await (await admin.get("/api/ui-string-review")).json();
  assert.equal(
    list.items.find((d) => d.key === "nav.watch").statusPs,
    "ai_draft",
  );
});
await check("translation review saves the actual target document", async () => {
  assert(target);
  const r = await admin.patch("/api/translation-review", {
    data: {
      collection: "articles",
      id: target.id,
      title: target.title,
      text: target.summary,
    },
  });
  assert.equal(r.status(), 200);
  const saved = await (await admin.get(`/api/articles/${target.id}`)).json();
  assert.equal(saved.translationStatus, "reviewed");
});
await check(
  "draft and future Published records are excluded publicly",
  async () => {
    const template = {
      title: "QA hidden",
      summary: "QA only",
      language: "en",
      topic: source.topic.id || source.topic,
      translationGroup: "qa-hidden",
      status: "draft",
      slug: "qa-hidden-draft",
    };
    let r = await admin.post("/api/articles", { data: template });
    assert.equal(r.status(), 201);
    const draft = await r.json();
    assert.equal(
      (await anonymous.get(`/api/articles/${draft.doc.id}`)).status(),
      404,
    );
    r = await admin.post("/api/articles", {
      data: {
        ...template,
        slug: "qa-hidden-future",
        translationGroup: "qa-hidden-future",
        status: "published",
        publishedAt: "2100-01-01",
      },
    });
    assert.equal(r.status(), 201);
    const future = await r.json();
    assert.equal(
      (await anonymous.get(`/api/articles/${future.doc.id}`)).status(),
      404,
    );
  },
);
await check(
  "legal publishing requires approval; changed text resets it",
  async () => {
    const body = {
      root: {
        type: "root",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: [
          {
            type: "paragraph",
            version: 1,
            format: "",
            indent: 0,
            direction: null,
            children: [
              {
                type: "text",
                version: 1,
                text: "QA legal scaffold. Not legal advice or production copy.",
                format: 0,
                detail: 0,
                mode: "normal",
                style: "",
              },
            ],
          },
        ],
      },
    };
    let r = await admin.post("/api/pages?locale=en", {
      data: {
        title: "QA Privacy",
        slug: "privacy",
        body,
        approvalStatus: "draft",
        status: "published",
      },
    });
    assert(r.status() >= 400);
    r = await admin.post("/api/pages?locale=en", {
      data: {
        title: "QA Privacy",
        slug: "privacy",
        body,
        approvalStatus: "approved",
        status: "published",
      },
    });
    assert.equal(r.status(), 201);
    const page = await r.json();
    r = await admin.patch(`/api/pages/${page.doc.id}?locale=en`, {
      data: { title: "QA Privacy revised" },
    });
    assert.equal(r.status(), 200);
    const changed = await r.json();
    assert.equal(changed.doc.status, "draft");
    assert.equal(changed.doc.approvalStatus, "awaiting_founder_approval");
  },
);
await check("scheduled worker publishes only when authenticated", async () => {
  assert.equal((await anonymous.post("/api/publish-scheduled")).status(), 401);
  const created = await admin.post("/api/articles", {
    data: {
      title: "QA scheduled",
      summary: "QA scheduled content",
      language: "en",
      topic: source.topic.id || source.topic,
      translationGroup: "qa-scheduled",
      slug: "qa-scheduled",
      status: "scheduled",
      publishedAt: "2020-01-01",
    },
  });
  assert.equal(created.status(), 201);
  const r = await anonymous.post("/api/publish-scheduled", {
    headers: { Authorization: "Bearer qa-private-scheduling-test" },
  });
  assert.equal(r.status(), 200);
  const data = await r.json();
  assert(data.published > 0);
});
await check(
  "contact validation and direct-store bypass are rejected",
  async () => {
    const r = await anonymous.post("/api/contact", {
      data: { name: "", email: "bad", reason: "general", message: "short" },
    });
    assert.equal(r.status(), 400);
    const d = await r.json();
    assert.equal(d.error, "invalid_fields");
    assert.equal(
      (
        await anonymous.post("/api/contacts", {
          data: {
            name: "Bot",
            email: "bot@example.com",
            reason: "general",
            message: "Bypass attempt",
          },
        })
      ).status(),
      403,
    );
  },
);
await check("OG images render English/Pashto/Dari", async () => {
  for (const locale of ["en", "ps", "fa"]) {
    const r = await anonymous.get(`/api/og?locale=${locale}`);
    assert.equal(r.status(), 200);
    assert(r.headers()["content-type"].includes("image/png"));
    await fs.writeFile(`.qa/og-${locale}.png`, await r.body());
  }
});
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 360, height: 900 },
});
const page = await context.newPage();
await check(
  "search dialog traps focus, closes with Escape, and restores focus",
  async () => {
    await page.goto(base + "/en");
    const trigger = page.locator("header button").first();
    await trigger.click();
    await page.locator("dialog[open] input[type=search]").waitFor();
    assert.equal(
      await page
        .locator("dialog[open] input[type=search]")
        .evaluate((e) => document.activeElement === e),
      true,
    );
    await page.keyboard.press("Shift+Tab");
    assert.equal(
      await page
        .locator("dialog[open]")
        .evaluate((e) => e.contains(document.activeElement)),
      true,
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog[open]").count(), 0);
    assert.equal(
      await trigger.evaluate((e) => document.activeElement === e),
      true,
    );
  },
);
await check("mobile video heading precedes the player and bridge", async () => {
  await page.goto(base + "/en/watch/qa-video-en");
  const positions = await page.evaluate(() => ({
    heading: document.querySelector("h1").getBoundingClientRect().top,
    player: document.querySelector(".video-player").getBoundingClientRect().top,
    bridge: document.querySelector(".go-deeper").getBoundingClientRect().top,
  }));
  assert(
    positions.heading < positions.player && positions.player < positions.bridge,
  );
});
await check("article body stays within the 680px reading measure", async () => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + "/ps/read/qa-memory-ps");
  const reading = await page.locator(".editorial-body").first().boundingBox();
  assert(reading.width <= 680);
});
await fs.writeFile(
  ".qa/integration-results.json",
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify(
    {
      pass: results.filter((r) => r.status === "PASS").length,
      fail: results.filter((r) => r.status === "FAIL"),
    },
    null,
    2,
  ),
);
await browser.close();
await anonymous.dispose();
await admin.dispose();
