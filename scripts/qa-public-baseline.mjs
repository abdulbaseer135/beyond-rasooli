import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.QA_PUBLIC_URL || 'http://localhost:3100';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await fs.mkdir('.qa/public-redesign/before', { recursive: true });
for (const route of ['en', 'en/watch', 'en/read', 'en/topics', 'en/about', 'admin/login']) {
  const response = await page.goto(`${base}/${route}`, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `.qa/public-redesign/before/${route.replaceAll('/', '-')}.png`, fullPage: true });
  console.log(route, response.status(), await page.locator('h1').allTextContents());
}
await browser.close();
