import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs/promises";
const base = "http://localhost:3100";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const paths = [
  "",
  "/watch",
  "/watch/qa-video-LOCALE",
  "/read",
  "/read/qa-memory-LOCALE",
  "/topics",
  "/topics/qa-topic-LOCALE",
  "/collections",
  "/collections/qa-collection-LOCALE",
  "/about",
  "/search?q=memory",
  "/contact",
  "/does-not-exist",
];
for (const locale of ["en", "ps", "fa"])
  for (const width of [360, 480, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const pattern of paths) {
      const path = `/${locale}${pattern.replaceAll("LOCALE", locale)}`;
      try {
        const response = await page.goto(base + path, {
          waitUntil: "domcontentloaded",
          timeout: 120000,
        });
        await page.waitForTimeout(150);
        const layout = await page.evaluate(() => ({
          overflow:
            document.documentElement.scrollWidth > window.innerWidth + 1,
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          h1: document.querySelector("h1")?.getBoundingClientRect().top,
          h1text: document.querySelector("h1")?.textContent,
          nested: document.querySelectorAll("a button").length,
        }));
        findings.push({
          locale,
          width,
          path,
          status: response?.status(),
          ...layout,
        });
        if (
          width === 360 &&
          [
            "",
            "/contact",
            "/read/qa-memory-LOCALE",
            "/watch/qa-video-LOCALE",
          ].includes(pattern)
        ) {
          const accessibility = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          findings.at(-1).axe = accessibility.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => n.target),
          }));
        }
        if (width === 360 && pattern === "")
          await page.screenshot({
            path: `.qa/home-${locale}-360.png`,
            fullPage: true,
          });
      } catch (error) {
        findings.push({ locale, width, path, error: error.message });
      }
    }
    console.log(`Checked ${locale} at ${width}px`);
  }
await fs.writeFile(
  ".qa/browser-results.json",
  JSON.stringify({ findings, errors }, null, 2),
);
console.log(
  JSON.stringify(
    {
      routes: findings.length,
      overflow: findings
        .filter((f) => f.overflow)
        .map((f) => [f.path, f.width]),
      httpFailures: findings
        .filter((f) => f.status >= 500 || f.error)
        .map((f) => ({
          path: f.path,
          width: f.width,
          error: f.error,
          status: f.status,
        })),
      axe: findings
        .filter((f) => f.axe?.length)
        .map((f) => ({ path: f.path, violations: f.axe })),
      pageErrors: [...new Set(errors)],
    },
    null,
    2,
  ),
);
await browser.close();
