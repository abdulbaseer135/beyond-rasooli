import { chromium, request } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = "http://localhost:3100";
const api = await request.newContext({ baseURL: base, extraHTTPHeaders: { Origin: base, "Sec-Fetch-Site": "same-origin" } });
assert.equal((await api.post('/api/users/login', { data: { email: 'founder-fixes@example.test', password: 'QA-founder-fixes-9273!' } })).status(), 200);
const article = (await (await api.get('/api/articles?where[status][equals]=published&limit=1')).json()).docs[0];
const browser = await chromium.launch();
const page = await (await browser.newContext({ storageState: await api.storageState() })).newPage();
const results = [];
for (const [name, route] of [['admin', '/admin'], ['read-en', `/en/read/${article.slug}`], ['read-ps', `/ps/read/${article.slug}`], ['read-fa', `/fa/read/${article.slug}`]]) {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + route, { timeout: 120000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${name} overflows at ${width}`);
    results.push({ name, width, status: 'PASS' });
    if (width === 375) await page.screenshot({ path: `.qa/editorial-${name}-mobile.png` });
  }
}
await page.goto(base + '/admin');
const accessibility = await new AxeBuilder({ page }).include('main section').analyze();
assert.equal(accessibility.violations.length, 0, JSON.stringify(accessibility.violations.map(v => ({ id: v.id, impact: v.impact }))));
results.push({ name: 'unified dashboard accessibility', status: 'PASS' });
await fs.writeFile('.qa/editorial-layout-results.json', JSON.stringify(results, null, 2));
console.log('PASS 8 mobile/desktop layouts and axe checks for the unified dashboard.');
await browser.close(); await api.dispose();
