import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultNavigationTimeout(90000);
await fs.mkdir('.qa/public-redesign/topic-cards', { recursive: true });
try {
  for (const locale of ['en', 'ps', 'fa']) {
    await page.goto(`http://localhost:3100/${locale}/topics`);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.home-topic-preview .topic-card-copy')).display === 'grid');
    assert.equal(await page.locator('.topic-card-copy p').count(), 0);
    const name = await page.locator('.topic-card-copy h2').first().textContent();
    for (const width of [320,360,375,430,600,768,820,1024,1280,1366,1440,1920,2560]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale} ${width} overflow`);
      const cards = await page.locator('.topic-destination').evaluateAll(nodes => nodes.map(node => {
        const r = node.getBoundingClientRect();
        return { width: r.width, height: r.height, children: node.querySelector('.topic-card-copy').children.length, clamp: getComputedStyle(node.querySelector('h2')).webkitLineClamp };
      }));
      for (const card of cards) {
        assert.equal(card.children, 2, 'Only topic title and Read more');
        assert.equal(card.clamp, '3');
        assert(Math.abs(card.width - cards[0].width) < 1 && Math.abs(card.height - cards[0].height) < 1, 'Equal card dimensions');
      }
      if ([375,820,1440].includes(width)) await page.screenshot({ path: `.qa/public-redesign/topic-cards/${locale}-${width}.png` });
    }
    const axe = await new AxeBuilder({ page }).include('.topic-grid').analyze();
    assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations));
    await page.locator('.topic-destination').first().click();
    await page.waitForURL(url => url.pathname.includes('/topics/'));
    assert.equal(await page.locator('h1').textContent(), name);
    assert(await page.locator('.page-heading p').count(), 'Full description remains on topic detail');
  }
  console.log('PASS: 39 compact topic layouts, three accessibility scans and three topic detail navigation flows');
} finally {
  await browser.close();
}
