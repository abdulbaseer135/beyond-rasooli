import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultNavigationTimeout(90000);
await fs.mkdir('.qa/public-redesign/about', { recursive: true });
try {
  for (const locale of ['en', 'ps', 'fa']) {
    await page.goto(`http://localhost:3100/${locale}/about`);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.about-page')).display === 'grid');
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.principle').count(), 5);
    assert(await page.locator('.founder-panel .type-body').textContent());
    assert(await page.locator('.about-mission .type-body').textContent());
    for (const width of [320,360,375,430,600,768,820,1024,1280,1366,1440,1920,2560]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => document.fonts.ready);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale} ${width} overflow`);
      assert(await page.locator('.principle').evaluateAll(nodes => nodes.every(node => {
        const r = node.getBoundingClientRect();
        return [...node.children].every(child => child.getBoundingClientRect().bottom <= r.bottom);
      })), 'Principle content fits its card');
      if ([375,820,1440].includes(width)) {
        const axe = await new AxeBuilder({ page }).include('.about-page').analyze();
        assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations));
        await page.screenshot({ path: `.qa/public-redesign/about/${locale}-${width}.png`, fullPage: true });
      }
    }
    const channels = page.locator('.contact-channels');
    await channels.locator('summary').focus();
    await page.keyboard.press('Enter');
    assert(await channels.evaluate(node => node.open), 'Contact expands with keyboard');
    assert.equal(await channels.locator('.contact-channel-link').count(), 3);
    assert(await channels.locator('button').last().isDisabled(), 'WhatsApp is a placeholder');
    for (const link of await channels.locator('a').all()) {
      const href = await link.getAttribute('href');
      assert(href?.startsWith('https://'));
      assert.equal(await link.getAttribute('target'), '_blank');
      assert((await link.getAttribute('rel')).includes('noopener'));
      assert(await page.locator('.site-footer a').evaluateAll((nodes, url) => nodes.some(node => node.href === url), href), 'Uses the original CMS social URL');
    }
    const axe = await new AxeBuilder({ page }).include('.contact-channels').analyze();
    assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations));
    for (const width of [320,820,1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Open channels fit viewport');
    }
    await channels.locator('summary').click();
    assert(!(await channels.evaluate(node => node.open)), 'Contact closes');
  }
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await noJs.newPage();
  await staticPage.goto('http://localhost:3100/en/about');
  await staticPage.locator('.contact-channels summary').click();
  assert(await staticPage.locator('.contact-channels').evaluate(node => node.open), 'Contact disclosure works without JavaScript');
  await noJs.close();
  console.log('PASS: 39 About layouts, 12 accessibility scans, three contact disclosures, CMS social destinations and no-JavaScript expansion');
} finally {
  await browser.close();
}
