import { chromium, request } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = "http://localhost:3100";
const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push({ name, status: "PASS" });
    console.log("PASS " + name);
  } catch (e) {
    results.push({ name, status: "FAIL", error: e.message });
    console.log("FAIL " + name + " " + e.message);
  }
}
const admin = await request.newContext({ baseURL: base, extraHTTPHeaders: { "Sec-Fetch-Site": "same-origin" } });
await admin.post("/api/users/login", {
  data: { email: "qa@beyondrasooli.test", password: "Local-QA-only-9273!" },
});
const browser = await chromium.launch();
const page = await (
  await browser.newContext({ storageState: await admin.storageState() })
).newPage();
await check("CMS UI edits appear publicly without rebuilding", async () => {
  const item = (await (await admin.get("/api/ui-string-review")).json()).items.find(
    (x) => x.key === "nav.watch",
  );
  try {
    assert.equal(
      (
        await admin.patch(`/api/ui-strings/${item.id}`, {
          data: { valueEn: "QA CMS Watch" },
        })
      ).status(),
      200,
    );
    await page.goto(base + "/en");
    assert((await page.locator("body").innerText()).includes("QA CMS Watch"));
  } finally {
    await admin.patch(`/api/ui-strings/${item.id}`, {
      data: { valueEn: item.en },
    });
  }
});
await check("native Payload Save persists an editorial change", async () => {
  const source = (
    await (await admin.get("/api/articles?limit=100")).json()
  ).docs.find((x) => x.slug === "qa-memory-en");
  await page.goto(base + `/admin/collections/articles/${source.id}`);
  const field = page.locator("textarea[name=summary]");
  await field.waitFor();
  const text = "QA native CMS save " + Date.now();
  await field.fill(text);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForTimeout(1200);
  assert.equal(
    (await (await admin.get(`/api/articles/${source.id}`)).json()).summary,
    text,
  );
  await admin.patch(`/api/articles/${source.id}`, {
    data: { summary: source.summary },
  });
});
await check(
  "authenticated review report and source-read-only review render",
  async () => {
    await page.goto(base + "/en/review-report");
    assert.equal(await page.locator("h1").count(), 1);
    assert(
      (await page.locator("body").innerText()).toLowerCase().includes("review"),
    );
    await page.screenshot({ path: ".qa/review-report.png", fullPage: true });
    await page.goto(base + "/en/translation-review");
    assert.equal(await page.locator("h1").count(), 1);
    await page.screenshot({
      path: ".qa/translation-review.png",
      fullPage: true,
    });
  },
);
await fs.writeFile(
  ".qa/runtime-results.json",
  JSON.stringify(results, null, 2),
);
await browser.close();
await admin.dispose();
