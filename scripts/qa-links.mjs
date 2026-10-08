import { chromium, request } from "@playwright/test";
import fs from "node:fs/promises";
const base = "http://localhost:3100";
const browser = await chromium.launch();
const page = await browser.newPage();
const client = await request.newContext();
const links = new Set();
const pages = [];
for (const locale of ["en", "ps", "fa"])
  for (const path of [
    "",
    "/watch",
    `/watch/qa-video-${locale}`,
    "/read",
    `/read/qa-memory-${locale}`,
    "/topics",
    `/topics/qa-topic-${locale}`,
    "/collections",
    `/collections/qa-collection-${locale}`,
    "/about",
    "/contact",
    "/search?q=memory",
  ]) {
    await page.goto(base + `/${locale}${path}`);
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((nodes) => nodes.map((n) => n.href))) {
      const url = new URL(href);
      if (url.origin === base && !url.hash) {
        url.hash = "";
        links.add(url.href);
      }
    }
    pages.push(`/${locale}${path}`);
  }
const findings = [];
for (const url of links) {
  try {
    const response = await client.get(url);
    findings.push({ url, status: response.status() });
  } catch (error) {
    findings.push({ url, error: error.message });
  }
}
await page.setViewportSize({ width: 1280, height: 900 });
for (const [name, path] of [
  ["article-ps", "/ps/read/qa-memory-ps"],
  ["video-fa", "/fa/watch/qa-video-fa"],
  ["home-en-1280", "/en"],
]) {
  await page.goto(base + path);
  await page.screenshot({ path: `.qa/${name}.png`, fullPage: true });
}
await fs.writeFile(
  ".qa/link-results.json",
  JSON.stringify({ pages: pages.length, findings }, null, 2),
);
console.log(
  JSON.stringify(
    {
      pages: pages.length,
      links: findings.length,
      failures: findings.filter((f) => f.error || f.status >= 400),
    },
    null,
    2,
  ),
);
await browser.close();
await client.dispose();
