import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.QA_PUBLIC_URL || 'http://localhost:3100';
await fs.mkdir('.qa/public-redesign/watch', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = { layouts: [], accessibility: [], interactions: [] };
try {
  for (const locale of ['en', 'ps', 'fa']) {
    await page.goto(`${base}/${locale}/watch`);
    await page.locator('.video-grid .video-card').first().evaluate(node => {
      node.lang = 'ps'; node.dir = 'rtl';
      node.querySelector('h2').textContent = 'د انسان ذهن او چلند — Neuroscience and everyday psychology '.repeat(12);
    });
    for (const width of [320, 820, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const title = await page.locator('.video-grid h2').first().evaluate(node => ({
        clamp: getComputedStyle(node).webkitLineClamp,
        height: node.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(node).lineHeight),
        bottom: node.getBoundingClientRect().bottom,
        cardBottom: node.closest('.video-card').getBoundingClientRect().bottom,
      }));
      assert.equal(title.clamp, '2');
      assert(title.height <= title.lineHeight * 2 + 1 && title.bottom <= title.cardBottom, 'Long mixed-language title fits two complete lines');
    }
    await page.goto(`${base}/${locale}/watch`);
    await page.evaluate(() => document.fonts.ready);
    assert.notEqual(await page.locator('h1').textContent(), 'Watch');
    for (const width of [320, 360, 375, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale} ${width} overflow`);
      assert.equal(await page.locator('.watch-page .video-duration, .watch-page .video-card-copy .card-meta').count(), 0, 'Watch previews omit duration, topic and language');
      const cardStyles = await page.locator('.watch-page .video-card').evaluateAll(nodes => nodes.map(node => {
        const poster = node.querySelector('.video-card-poster').getBoundingClientRect();
        return {
          border: parseFloat(getComputedStyle(node).borderTopWidth),
          ratio: poster.width / poster.height,
          fontSize: parseFloat(getComputedStyle(node.querySelector('h2')).fontSize),
        };
      }));
      assert(cardStyles.every(card => card.border === 1 && Math.abs(card.ratio - 1.5) < 0.02 && card.fontSize >= 18 && card.fontSize <= 20), 'Separate bordered cards, taller 3:2 posters and homepage-sized titles');
      const imageFits = await page.locator('.watch-page .video-card-poster img').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).objectFit));
      assert(imageFits.every(fit => fit === 'cover'), 'Watch thumbnails fill the frame without layout letterboxing');
      const grid = await page.locator('.video-grid').evaluate(node => ({
        columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
        cards: [...node.children].map(card => { const rect = card.getBoundingClientRect(); return {width: rect.width, height: rect.height, top: rect.top}; }),
      }));
      assert.equal(grid.columns, width >= 1024 ? 3 : width >= 600 ? 2 : 1);
      assert(Math.max(...grid.cards.map(card => card.width)) - Math.min(...grid.cards.map(card => card.width)) < 2, 'Equal video widths');
      assert(Math.max(...grid.cards.map(card => card.height)) - Math.min(...grid.cards.map(card => card.height)) < 2, 'Equal video heights');
      if (width >= 1024 && grid.cards.length >= 4) {
        assert(Math.abs(grid.cards[2].top - grid.cards[0].top) < 1, 'Three cards fill the first row');
        assert(grid.cards[3].top > grid.cards[0].top, 'Fourth video continues on the second row');
      }
      assert.equal(await page.locator('.watch-filters select').count(), 0, 'Watch has search instead of language and sort selects');
      assert.equal(await page.locator('.watch-filters input[type="search"]').count(), 0, 'Watch search field is removed');
      const topicRows = await page.locator('.watch-filters .topic-chip').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
      assert(Math.max(...topicRows) - Math.min(...topicRows) < 1, 'All topics stay on one scrollable row');
      const controls = await page.locator('.watch-filters input[type="search"], .watch-filters .topic-chip').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
      assert(controls.every(height => height >= 44), 'Touch controls remain at least 44px high');
      results.layouts.push({ locale, width, pass: true });
      if ([375, 820, 1440].includes(width)) await page.screenshot({ path: `.qa/public-redesign/watch/${locale}-${width}.png`, fullPage: true });
    }
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const axe = await new AxeBuilder({ page }).analyze();
      assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(item => item.id)));
      results.accessibility.push({ locale, width, violations: [] });
    }
    const firstVideo = page.locator('.video-grid .editorial-card-link').first();
    const fullTitle = await firstVideo.locator('h2').textContent();
    const videoHref = await firstVideo.getAttribute('href');
    await firstVideo.click();
    await page.waitForURL(url => url.pathname === videoHref);
    assert.equal(await page.locator('h1').textContent(), fullTitle, 'Preview opens the full video title');
    assert(await page.locator('main .card-meta').count(), 'Full details preserve metadata');
    await page.goto(`${base}/${locale}/watch`);
    const topic = page.locator('.watch-filters .topic-chip').nth(1);
    const topicHref = await topic.getAttribute('href');
    await topic.click();
    await page.waitForURL(url => url.pathname + url.search === topicHref);
    await page.locator('.watch-filters .topic-chip').first().click();
    await page.waitForURL(url => !url.searchParams.has('topic'));
    assert(await page.locator('.video-grid .video-card').count() > 0, 'All restores videos');
    const lastTopic = page.locator('.watch-filters .topic-chip').last();
    await lastTopic.focus();
    assert(await lastTopic.isVisible());
    await lastTopic.press('Enter');
    await page.waitForURL(url => url.searchParams.has('topic'));
    results.interactions.push(`${locale}: topic, All reset and keyboard access to the final topic passed`);
    await page.setViewportSize({ width: 812, height: 375 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('.watch-filters .topic-chips-scroll').focus();
    assert(await page.locator('.watch-filters .topic-chips-scroll').evaluate(node => node === document.activeElement));
  }
  const native = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 1000 } });
  const nativePage = await native.newPage();
  await nativePage.goto(`${base}/en/watch`);
  await nativePage.locator('.watch-filters .topic-chip').nth(1).click();
  assert(new URL(nativePage.url()).searchParams.has('topic'));
  results.interactions.push('No-JavaScript topic links passed');
  await fs.writeFile('.qa/public-redesign/watch/results.json', JSON.stringify(results, null, 2));
  console.log('PASS: 39 topic-only Watch layouts, six axe scans, three locale topic flows, final-topic keyboard access, landscape/reduced-motion checks and no-JavaScript topic links.');
} finally { await browser.close(); }
