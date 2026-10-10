import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

// DOM-only stress fixtures: no CMS writes, no database changes, no fabricated
// claims of native manuscripts. Exercise the rendered editorial CSS and fonts.
const base = process.env.QA_PUBLIC_URL || 'http://localhost:3100';
const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];
try {
  await page.goto(`${base}/en/read`);
  const href = await page.locator('.article-card a').first().getAttribute('href');
  for (const locale of ['ps', 'fa']) {
    await page.goto(`${base}${href}`);
    await page.evaluate(locale => {
      document.documentElement.lang = locale === 'fa' ? 'fa-AF' : locale;
      document.documentElement.dir = 'rtl';
      const article = document.querySelector('main > article');
      article.lang = document.documentElement.lang;
      article.dir = 'rtl';
      document.querySelector('h1').textContent = locale === 'ps' ? 'ځ څ ډ ړ ږ ښ ڼ ۍ ئ — د انسان د حافظې او زده کړې علم' : 'روان‌شناسی و علم زندگی روزمره — حافظه و یادگیری';
      const paragraph = document.querySelector('.editorial-body p');
      if (paragraph) {
        paragraph.closest('[dir]').dir = 'rtl';
        paragraph.textContent = ('ځ څ ټ ډ ړ ږ ښ ڼ ګ ې ۍ ئ — Psychology 2026 https://example.test/research/attention ' + 'د انسان د حافظې او زده کړې علم ').repeat(8);
      }
    }, locale);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 360, 375, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale} ${width}`);
      const font = await page.locator('h1').evaluate(el => getComputedStyle(el).fontFamily);
      assert(/notoNaskhArabic|Noto Naskh Arabic/i.test(font), font);
      results.push({ locale, width, pass: true, syntheticDOMFixture: true, font });
      if ([375, 820, 1440].includes(width)) await page.screenshot({ path: `.qa/public-redesign/after/${locale}-article-stress-${width}.png` });
    }
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: 'h1' });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    assert(fonts.some(font => font.isCustomFont && /NotoNaskhArabic|Noto Naskh Arabic/i.test(font.postScriptName + font.familyName)), JSON.stringify(fonts));
    results.push({ locale, glyphFonts: fonts, syntheticDOMFixture: true });
    await cdp.detach();
  }
  console.log('PASS: 26 Arabic and mixed-script editorial stress layouts; self-hosted Naskh glyph rendering verified.');
} finally {
  await fs.writeFile('.qa/public-redesign/arabic-stress-results.json', JSON.stringify(results, null, 2));
  await browser.close();
}
