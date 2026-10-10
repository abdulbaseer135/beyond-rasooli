import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultNavigationTimeout(90000);
await fs.mkdir('.qa/public-redesign/read-header', { recursive: true });
try {
  for (const locale of ['en', 'ps', 'fa']) {
    await page.goto(`http://localhost:3100/${locale}/read`);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.read-page')).display === 'grid');
    const intro = await page.locator('h1').textContent();
    assert(intro && intro !== 'Read');
    if (locale === 'en') assert.equal(intro, 'Research-backed essays, explainers, and long-form explorations of psychology, cognitive science, and human behavior.');
    assert.equal(await page.locator('.editorial-filters select, .editorial-filters input[type="search"]').count(), 0);
    for (const width of [320, 360, 375, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale} ${width} overflow`);
      const rows = await page.locator('.topic-chips-scroll a').evaluateAll(nodes => nodes.map(n => Math.round(n.getBoundingClientRect().top)));
      assert.equal(new Set(rows).size, 1);
      const cards = await page.locator('.read-page .article-card').evaluateAll(nodes => nodes.map(node => {
        const title = node.querySelector('h2');
        const meta = node.querySelector('.card-meta');
        const bounds = node.getBoundingClientRect();
        return {
          width: bounds.width, height: bounds.height,
          border: getComputedStyle(node).borderTopWidth,
          clamp: getComputedStyle(title).webkitLineClamp,
          font: parseFloat(getComputedStyle(title).fontSize),
          copyChildren: node.querySelector('.article-card-copy').children.length,
          metadataChildren: meta.children.length,
          metadataRows: [...meta.children].map(child => Math.round(child.getBoundingClientRect().top)),
        };
      }));
      for (const card of cards) {
        assert.equal(card.border, '1px');
        assert.equal(card.clamp, '3');
        assert(card.font >= 18 && card.font <= 20);
        assert.equal(card.copyChildren, 2, 'Only title and author/date metadata');
        assert(card.metadataChildren <= 2, 'No topic, summary or reading time');
        assert.equal(new Set(card.metadataRows).size, 1, 'Author and date share one line');
        assert(Math.abs(card.width - cards[0].width) < 1 && Math.abs(card.height - cards[0].height) < 1, 'Uniform card dimensions including no-cover articles');
      }
      if ([375, 820, 1440].includes(width)) await page.screenshot({ path: `.qa/public-redesign/read-header/${locale}-${width}.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 375, height: 1000 });
    const axe = await new AxeBuilder({ page }).include('.read-intro').include('.editorial-filters').include('.article-grid').analyze();
    assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations));
    const topic = page.locator('.topic-chips-scroll a').nth(1);
    const href = await topic.getAttribute('href');
    await topic.click();
    await page.waitForURL(url => url.searchParams.has('topic'));
    assert(page.url().endsWith(href));
    await page.locator('.topic-chips-scroll a').first().click();
    await page.waitForURL(url => !url.searchParams.has('topic'));
  }
  console.log('PASS: 39 Read header/card layouts, three accessibility scans, and three topic/reset flows');
} finally {
  await browser.close();
}
