import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.QA_PUBLIC_URL || 'http://localhost:3100';
const results = JSON.parse(await fs.readFile('.qa/public-redesign/results.json', 'utf8'));
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultNavigationTimeout(90000);
try {
  for (const route of ['en', 'ps', 'fa']) {
    await page.goto(`${base}/${route}`);
    await page.evaluate(() => document.fonts.ready);
    results.layouts = results.layouts.filter(result => result.route !== route);
    results.accessibility = results.accessibility.filter(result => result.route !== route);
    for (const width of [320, 360, 375, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 1000 });
      const metrics = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, heading: document.querySelector('h1').getBoundingClientRect().width, container: document.querySelector('.hero-layout').getBoundingClientRect().width }));
      assert(metrics.scroll <= width, `${route} ${width}`);
      assert(metrics.container <= 1200, 'Hero retains PRD bounded container');
      const heroBorders = await page.locator('.hero, .hero-caption').evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).borderBottomWidth)));
      assert(heroBorders.every(border => border === 0), 'Hero transition and featured caption have no divider lines');
      assert.equal(await page.locator('.home-video-row .card-meta').count(), 0, 'Homepage video topics and spoken-language labels are omitted');
      assert.equal(await page.locator('.home-sections .topic-chip').count(), 0, 'Homepage video filter chips are removed');
      assert.equal(await page.locator('.home-video-row .video-duration').count(), 0, 'Homepage duration badges are omitted');
      assert.equal(await page.locator('.home-article-preview .article-card-copy > p').count(), 0, 'Homepage article topic and summary are omitted');
      assert.equal(await page.locator('.home-article-preview .card-meta .font-editorial-sans').count(), 0, 'Homepage article reading time is omitted');
      assert(!/ui\.read_more|buttons\.read_more/.test(await page.locator('.home-topic-preview').innerText()), 'Topic action renders translated copy');
      assert.equal(await page.locator('.home-topic-preview .topic-card-copy > p').count(), 0, 'Homepage topic descriptions are omitted');
      const posters = await page.locator('.home-video-row .video-card-poster').evaluateAll(nodes => nodes.map(node => {
        const rect = node.getBoundingClientRect();
        return rect.width / rect.height;
      }));
      assert(posters.every(ratio => Math.abs(ratio - 3 / 2) < 0.02), 'Homepage posters match Watch proportions');
      const titleSizes = await page.locator('.home-video-row h3').evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)));
      assert(titleSizes.every(size => size >= 18 && size <= 20), 'Homepage video titles retain the smaller 18–20px scale');
      const articleStyles = await page.locator('.home-article-preview .article-card').evaluateAll(nodes => nodes.map(node => {
        const title = node.querySelector('h3');
        const metadata = node.querySelector('.card-meta');
        return {
          border: parseFloat(getComputedStyle(node).borderTopWidth),
          fontSize: parseFloat(getComputedStyle(title).fontSize),
          bylineGap: metadata.getBoundingClientRect().top - title.getBoundingClientRect().bottom,
        };
      }));
      assert(articleStyles.every(card => card.border === 1 && card.fontSize >= 18 && card.fontSize <= 20 && Math.abs(card.bylineGap - 16) < 1), 'Article cards have borders, smaller titles and a consistent 16px title-slot/byline gap');
      for (const [selector, limit] of [['.home-video-row .video-card', 4], ['.home-article-preview .article-card', 3], ['.home-topic-preview .topic-destination', 6]]) {
        const cards = await page.locator(selector).evaluateAll(nodes => nodes.map(node => {
          const rect = node.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }));
        assert(cards.length <= limit, `${selector} preview limit`);
        if (cards.length > 1) {
          assert(Math.max(...cards.map(card => card.width)) - Math.min(...cards.map(card => card.width)) < 2, `${route} ${width} ${selector} equal widths`);
          assert(Math.max(...cards.map(card => card.height)) - Math.min(...cards.map(card => card.height)) < 2, `${route} ${width} ${selector} equal heights`);
        }
      }
      for (const destination of ['watch', 'read', 'topics']) {
        assert(await page.locator(`.section-heading a[href="/${route}/${destination}"]`).count(), `${route} full ${destination} library link`);
      }
      results.layouts.push({ route, width, ...metrics, pass: true });
      if ([375, 820, 1440].includes(width)) {
        await page.locator('.home-article-preview').screenshot({ path: `.qa/public-redesign/after/${route}-home-articles-${width}.png` });
        await page.screenshot({ path: `.qa/public-redesign/after/${route}-${width}.png`, fullPage: true });
        await page.screenshot({ path: `.qa/public-redesign/after/${route}-preview-${width}.png` });
      }
    }
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const axe = await new AxeBuilder({ page }).analyze();
      assert.equal(axe.violations.length, 0, JSON.stringify(axe.violations.map(v => v.id)));
      results.accessibility.push({ route, width, violations: [] });
    }
    const firstVideo = page.locator('.home-video-row .editorial-card-link').first();
    const videoTitle = await firstVideo.locator('h3').textContent();
    const videoHref = await firstVideo.getAttribute('href');
    await firstVideo.click();
    await page.waitForURL(url => url.pathname === videoHref);
    assert.equal(await page.locator('h1').textContent(), videoTitle, 'Video card opens full detail page');
    assert(await page.locator('main a[href*="/topics/"]').count(), 'Full video detail preserves topic');
    assert(await page.locator('main .card-meta').count(), 'Full video detail preserves metadata');
    await page.goto(`${base}/${route}`);
    await page.evaluate(() => document.fonts.ready);
    const firstArticle = page.locator('.home-article-preview .editorial-card-link').first();
    const articleTitle = await firstArticle.locator('h3').textContent();
    const articleHref = await firstArticle.getAttribute('href');
    await firstArticle.click();
    await page.waitForURL(url => url.pathname === articleHref);
    assert.equal(await page.locator('h1').textContent(), articleTitle, 'Article preview opens full article details');
    assert(await page.locator('main .card-meta').count(), 'Full article retains metadata');
    await page.goto(`${base}/${route}`);
    const firstTopic = page.locator('.home-topic-preview .topic-destination').first();
    const topicTitle = await firstTopic.locator('h3').textContent();
    const topicHref = await firstTopic.getAttribute('href');
    assert(await firstTopic.locator('.text-link').isVisible(), 'Topic read-more action is visible');
    await firstTopic.click();
    await page.waitForURL(url => url.pathname === topicHref);
    assert.equal(await page.locator('h1').textContent(), topicTitle, 'Topic preview opens full topic detail page');
    await page.goto(`${base}/${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.setViewportSize({ width: 812, height: 375 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    // Browser-only stress content; never changes CMS records.
    await page.evaluate(() => {
      const longText = 'څېړنه: د انسان ذهن او چلند — Neuroscience and everyday psychology '.repeat(12);
      for (const selector of ['.home-video-row h3', '.home-article-preview h3', '.home-topic-preview h3']) {
        document.querySelector(selector)?.replaceChildren(document.createTextNode(longText));
      }
      const article = document.querySelector('.home-article-preview .article-card');
      if (article) { article.lang = 'ps'; article.dir = 'rtl'; }
      const author = document.querySelector('.home-article-preview .card-meta bdi');
      if (author) author.textContent = 'عبدالبصیر خان — Abdul Baseer Khan';
    });
    for (const width of [320, 820, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'long text has no page overflow');
      const articleText = await page.evaluate(() => {
        const article = document.querySelector('.home-article-preview .article-card');
        const title = article.querySelector('h3');
        const metadata = article.querySelector('.card-meta');
        return {
          titleBottom: title.getBoundingClientRect().bottom,
          metadataTop: metadata.getBoundingClientRect().top,
          metadataVisible: [...metadata.children].every(child => child.getBoundingClientRect().bottom <= article.getBoundingClientRect().bottom),
        };
      });
      assert(articleText.titleBottom <= articleText.metadataTop, 'Title and metadata do not overlap');
      assert(articleText.metadataVisible, 'Author and publication date remain inside the card');
      const bylines = await page.locator('.home-article-preview .card-meta').evaluateAll(nodes => nodes.map(node => {
        const author = node.querySelector('bdi');
        const date = node.querySelector('span');
        if (!author) return true;
        const authorRect = author.getBoundingClientRect();
        const dateRect = date.getBoundingClientRect();
        const authorFirst = getComputedStyle(node).direction === 'rtl' ? authorRect.right > dateRect.right : authorRect.left < dateRect.left;
        return authorFirst && Math.abs(authorRect.top - dateRect.top) < 3;
      }));
      assert(bylines.every(Boolean), 'Author precedes date on one line in the UI reading direction, including mixed-language cards');
      for (const selector of ['.home-video-row .video-card', '.home-article-preview .article-card', '.home-topic-preview .topic-destination']) {
        const heights = await page.locator(selector).evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
        if (heights.length > 1) assert(Math.max(...heights) - Math.min(...heights) < 2, `${route} ${width} long text ${selector}`);
      }
    }
  }
  results.homepageFinalRechecked = true;
  await fs.writeFile('.qa/public-redesign/results.json', JSON.stringify(results, null, 2));
  console.log('PASS: 39 responsive layouts with equal card dimensions, bounded previews and library links; six axe checks; three landscape layouts; nine browser-only long/mixed-text stress cases.');
} finally {
  await browser.close();
}
