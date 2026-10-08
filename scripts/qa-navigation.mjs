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
assert.equal(
  (
    await admin.post("/api/users/login", {
      data: { email: "qa@beyondrasooli.test", password: "Local-QA-only-9273!" },
    })
  ).status(),
  200,
);
let items = (await (await admin.get("/api/ui-string-review")).json()).items;
items = (await (await admin.get("/api/ui-string-review")).json()).items;
const message = (locale, key) => {
  const item = items.find((item) => item.key === key);
  return (
    (locale === "ps" ? item?.ps : locale === "fa" ? item?.fa : item?.en) ||
    item?.en
  );
};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
async function nav(locale) {
  const links = page.locator("header .desktop-navigation nav a");
  assert.equal(await links.count(), 5);
  for (const [index, key] of [
    "home",
    "watch",
    "read",
    "topics",
    "about",
  ].entries()) {
    assert.equal(
      (await links.nth(index).innerText()).trim(),
      message(locale, "nav." + key).trim(),
    );
    assert.equal(
      await links.nth(index).getAttribute("href"),
      `/${locale}${key === "home" ? "" : "/" + key}`,
    );
  }
  assert.equal(
    await page.locator("html").getAttribute("lang"),
    locale === "fa" ? "fa-AF" : locale,
  );
  assert.equal(
    await page.locator("html").getAttribute("dir"),
    locale === "en" ? "ltr" : "rtl",
  );
}
await check(
  "five localized destinations remain when all published articles/videos are absent",
  async () => {
    const changed = [];
    try {
      for (const collection of ["articles", "videos"]) {
        const docs = (
          await (await admin.get(`/api/${collection}?limit=100`)).json()
        ).docs;
        for (const doc of docs.filter((d) => d.status === "published")) {
          assert.equal(
            (
              await admin.patch(`/api/${collection}/${doc.id}`, {
                data: { status: "archived" },
              })
            ).status(),
            200,
          );
          changed.push({ collection, id: doc.id });
        }
      }
      for (const locale of ["en", "ps", "fa"]) {
        await page.goto(base + `/${locale}`);
        await nav(locale);
        for (const section of ["watch", "read", "topics"]) {
          const r = await page.goto(base + `/${locale}/${section}`);
          assert.equal(r.status(), 200);
          await nav(locale);
          const api = await (
            await anon.get(
              `/api/translations?locale=${locale}&path=/${section}`,
            )
          ).json();
          assert.deepEqual(Object.keys(api.links).sort(), ["en", "fa", "ps"]);
          assert(
            (await page.locator("body").innerText()).includes(
              message(
                locale,
                section === "topics" ? "topics.empty" : "ui.no_results",
              ),
            ),
          );
        }
      }
    } finally {
      for (const doc of changed)
        assert.equal(
          (
            await admin.patch(`/api/${doc.collection}/${doc.id}`, {
              data: { status: "published" },
            })
          ).status(),
          200,
        );
    }
  },
);
await check(
  "general-page selector changes the full document and localized shell",
  async () => {
    for (const section of [
      "",
      "watch",
      "read",
      "topics",
      "about",
      "contact",
      "search",
    ])
      for (const target of ["en", "ps", "fa"]) {
        const start = target === "en" ? "ps" : "en";
        await page.goto(base + `/${start}${section ? "/" + section : ""}`);
        const select = page.locator("header select");
        await select
          .locator(`option[value=${target}]`)
          .waitFor({ state: "attached" });
        await select.selectOption(target);
        await page.waitForURL(
          base + `/${target}${section ? "/" + section : ""}`,
        );
        await nav(target);
        assert(
          (await page.locator("footer").innerText()).includes(
            message(target, "footer.description"),
          ),
        );
        if (["watch", "read", "topics", "contact", "search"].includes(section))
          assert.equal(
            (await page.locator("h1").innerText()).trim(),
            message(
              target,
              section === "contact" ? "nav.contact" : section + ".title",
            ).trim(),
          );
      }
  },
);
await check(
  "article/video switchers resolve translationGroup and distinct published slugs",
  async () => {
    for (const [section, slug] of [
      ["read", "qa-memory"],
      ["watch", "qa-video"],
    ])
      for (const target of ["ps", "fa", "en"]) {
        const start = target === "en" ? "ps" : "en";
        await page.goto(base + `/${start}/${section}/${slug}-${start}`);
        const select = page.locator("header select");
        await select
          .locator(`option[value=${target}]`)
          .waitFor({ state: "attached" });
        await select.selectOption(target);
        await page.waitForURL(base + `/${target}/${section}/${slug}-${target}`);
        await nav(target);
      }
  },
);
await check(
  "missing item translation is hidden and its fake route does not render",
  async () => {
    await page.goto(base + "/en/read/qa-scheduled");
    const select = page.locator("header select");
    await page.waitForFunction(
      () => !document.querySelector("header select")?.disabled,
    );
    assert.equal(await select.locator("option[value=ps]").count(), 0);
    assert.equal(await select.locator("option[value=fa]").count(), 0);
    assert.equal((await anon.get("/ps/read/qa-scheduled")).status(), 404);
    const response = await page.goto(base + "/ps/read/qa-memory-ps");
    assert.equal(response.status(), 200);
    await nav("ps");
  },
);
await check("search query survives general locale switching", async () => {
  await page.goto(base + "/en/search?q=memory");
  const select = page.locator("header select");
  await select.locator("option[value=fa]").waitFor({ state: "attached" });
  await select.selectOption("fa");
  await page.waitForURL(base + "/fa/search?q=memory");
  await nav("fa");
});
for (const [role, email, password] of [
  ["admin", "qa@beyondrasooli.test", "Local-QA-only-9273!"],
  ["editor", "editor@beyondrasooli.test", "Local-editor-only-9273!"],
])
  await check(
    role + " sees five quick-add destinations and standard Payload collections",
    async () => {
      const client = await request.newContext({ baseURL: base, extraHTTPHeaders: { "Sec-Fetch-Site": "same-origin" } });
      assert.equal(
        (
          await client.post("/api/users/login", { data: { email, password } })
        ).status(),
        200,
      );
      const ctx = await browser.newContext({
        storageState: await client.storageState(),
      });
      const cms = await ctx.newPage();
      await cms.goto(base + "/admin");
      await cms.locator("button.nav-toggler").first().click();
      const quick = cms.locator(".br-quick-add");
      await quick.waitFor();
      await quick.locator("summary").click();
      assert.equal(await quick.locator("a").count(), 5);
      for (const collection of [
        "videos",
        "articles",
        "topics",
        "collections",
        "pages",
      ]) {
        const href = `/admin/collections/${collection}/create`;
        assert.equal(await quick.locator(`a[href="${href}"]`).count(), 1);
        const response = await client.get(href);
        assert.equal(response.status(), 200);
      }
      assert(
        (await cms.locator('a[href="/admin/collections/articles"]').count()) >
          0,
      );
      await ctx.close();
      await client.dispose();
    },
  );
await check("anonymous login does not expose quick-add", async () => {
  await page.goto(base + "/admin/login");
  assert.equal(await page.locator(".br-quick-add").count(), 0);
});
await fs.writeFile(
  ".qa/navigation-results.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results));
await browser.close();
await admin.dispose();
await anon.dispose();
