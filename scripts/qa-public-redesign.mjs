import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.env.QA_PUBLIC_URL || 'http://localhost:3100';
const widths = [320, 360, 375, 430, 600, 768, 820, 1024, 1280, 1366, 1440, 1920, 2560];
const results = process.env.QA_INTERACTIONS_ONLY === 'true'
  ? { ...JSON.parse(await fs.readFile('.qa/public-redesign/results.json', 'utf8')), interactions: [], admin: [], errors: [] }
  : { layouts: [], accessibility: [], interactions: [], admin: [], errors: [] };
await fs.mkdir('.qa/public-redesign/after', { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
page.on('pageerror', (error) => results.errors.push(error.message));

try {
  for (const locale of process.env.QA_INTERACTIONS_ONLY === 'true' ? [] : ['en', 'ps', 'fa']) {
    const routes = [locale, `${locale}/watch`, `${locale}/read`, `${locale}/topics`, `${locale}/about`, `${locale}/search?q=memory`, `${locale}/contact`];
    for (const kind of ['read', 'watch', 'topics']) {
      await page.goto(`${base}/${locale}/${kind}`, { timeout: 120000 });
      const href = await page.locator(`main a[href*="/${kind}/"]`).first().getAttribute('href').catch(() => null);
      if (href?.startsWith(`/${locale}/`)) routes.push(href.replace(/^\//, ''));
    }
    for (const route of routes) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      const response = await page.goto(`${base}/${route}`, { timeout: 120000 });
      assert.equal(response.status(), 200, route);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('dir'), locale === 'en' ? 'ltr' : 'rtl');
      assert.equal(await page.locator('html').getAttribute('lang'), locale === 'fa' ? 'fa-AF' : locale);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 1000 });
        const metrics = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, heading: document.querySelector('h1')?.getBoundingClientRect().width }));
        results.layouts.push({ route, width, ...metrics, pass: metrics.scroll <= width });
        if ([375, 820, 1440].includes(width)) await page.screenshot({ path: `.qa/public-redesign/after/${route.replaceAll('/', '-').replaceAll('?', '-').replaceAll('=', '-')}-${width}.png`, fullPage: true });
      }
      await page.setViewportSize({ width: 375, height: 812 });
      const axe = await new AxeBuilder({ page }).analyze();
      results.accessibility.push({ route, width: 375, violations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) });
      await page.setViewportSize({ width: 1440, height: 1000 });
      const desktopAxe = await new AxeBuilder({ page }).analyze();
      results.accessibility.push({ route, width: 1440, violations: desktopAxe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })) });
      console.log('CHECKED', route);
    }
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${base}/en`);
  await page.locator('.mobile-toggle').click();
  await page.locator('.navigation-dialog[open]').waitFor();
  assert.equal(await page.locator('.navigation-dialog nav a').count(), 5);
  await page.keyboard.press('Escape');
  await page.locator('.navigation-dialog[open]').waitFor({ state: 'hidden' });
  results.interactions.push('Mobile menu opens; five destinations; Escape closes');
  await page.locator('.header-actions button').first().click();
  await page.locator('#overlay-query').fill('memory');
  await page.locator('.search-dialog button[type=submit]').click();
  await page.waitForURL('**/en/search?q=memory');
  results.interactions.push('Search dialog submits to URL-backed results');
  await page.goto(`${base}/en/read`);
  await page.locator('#filter-language').selectOption('all');
  await page.waitForURL('**/en/read');
  await page.locator('#filter-format').selectOption('explainer');
  await page.waitForURL('**format=explainer*');
  results.interactions.push('Read language and format controls retain URL filtering');
  await page.goto(`${base}/en/watch`);
  await page.locator('.watch-filters .topic-chip').nth(1).click();
  await page.waitForURL('**topic=*');
  results.interactions.push('Watch topics retain URL filtering');
  await page.goto(`${base}/ps/read?language=en`);
  const mixed = await page.locator('.article-card[lang=en]').first().evaluate(el => ({ direction: getComputedStyle(el).direction, font: getComputedStyle(el.querySelector('h2, h3')).fontFamily, labelFont: getComputedStyle(el.querySelector('.card-meta span[lang=ps]')).fontFamily }));
  assert.equal(mixed.direction, 'ltr');
  assert(mixed.font.includes('newsreader') || mixed.font.includes('Newsreader'));
  assert(mixed.labelFont.includes('notoSansArabic') || mixed.labelFont.includes('Noto Sans Arabic'));
  results.interactions.push('Mixed English story uses Latin typography; Pashto UI metadata retains Arabic font');
  await page.goto(`${base}/en/watch`);
  const videoHref = await page.locator('.video-card a').first().getAttribute('href');
  await page.goto(`${base}${videoHref}`);
  assert.equal(await page.locator('iframe').count(), 0);
  await page.locator('.player-facade:visible').click();
  await page.locator('iframe:visible').waitFor();
  assert((await page.locator('iframe:visible').getAttribute('src')).startsWith('https://www.youtube-nocookie.com/embed/'));
  results.interactions.push('YouTube remains click-to-load and uses privacy-enhanced embed');
  await page.setViewportSize({ width: 820, height: 600 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${base}/ps/about`);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert((await page.locator('.site-header').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))) <= .001);
  results.interactions.push('RTL landscape and reduced-motion layout');
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const nativePage = await noJS.newPage();
  await nativePage.goto(`${base}/en/read`);
  assert.equal(await nativePage.locator('.no-js-navigation nav a').count(), 5);
  await nativePage.locator('#filter-format').selectOption('explainer');
  await nativePage.locator('#filter-query').fill('memory');
  await nativePage.locator('#filter-query').press('Enter');
  await nativePage.waitForURL('**format=explainer*q=memory*');
  assert(await nativePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await nativePage.goto(`${base}/en/watch`);
  await nativePage.locator('.topic-chips-scroll a').nth(1).press('Enter');
  await nativePage.waitForURL('**topic=*');
  await noJS.close();
  results.interactions.push('No-JavaScript GET filters and topic links work');
  for (const route of process.env.QA_SKIP_ADMIN === 'true' ? [] : ['admin', 'admin/login', 'admin/collections/articles', 'admin/collections/videos', 'admin/collections/topics', 'admin/editor-requests', 'admin/content-approvals']) {
    await page.goto(`${base}/${route}`, { timeout: 120000 });
    assert.equal(await page.locator('html.public-site').count(), 0);
    const publicRules = await page.evaluate(() => [...document.styleSheets].flatMap(sheet => {
      try { return [...sheet.cssRules].map(r => r.cssText); } catch { return []; }
    }).some(rule => rule.includes('html.public-site')));
    results.admin.push({ route, publicMarker: false, publicRulesLoaded: publicRules, destination: new URL(page.url()).pathname });
    assert.equal(publicRules, false);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  if (process.env.QA_ADMIN_EMAIL && process.env.QA_ADMIN_PASSWORD) {
    const login = await context.request.post(`${base}/api/users/login`, { headers: { Origin: base, 'Sec-Fetch-Site': 'same-origin' }, data: { email: process.env.QA_ADMIN_EMAIL, password: process.env.QA_ADMIN_PASSWORD } });
    assert.equal(login.status(), 200, 'Existing isolated admin fixture login');
    for (const route of ['admin', 'admin/collections/articles', 'admin/collections/videos', 'admin/collections/topics', 'admin/editor-requests', 'admin/content-approvals']) {
      await page.goto(`${base}/${route}`, { timeout: 120000 });
      assert.equal(await page.locator('html.public-site').count(), 0);
      await page.screenshot({ path: `.qa/public-redesign/after/${route.replaceAll('/', '-')}-1440.png` });
      results.admin.push({ route, authenticated: true, publicMarker: false, destination: new URL(page.url()).pathname });
    }
  }
  if (process.env.QA_EDITOR_EMAIL && process.env.QA_EDITOR_PASSWORD) {
    const editor = await browser.newContext();
    const login = await editor.request.post(`${base}/api/users/login`, { headers: { Origin: base, 'Sec-Fetch-Site': 'same-origin' }, data: { email: process.env.QA_EDITOR_EMAIL, password: process.env.QA_EDITOR_PASSWORD } });
    assert.equal(login.status(), 200, 'Existing isolated editor fixture login');
    const editorPage = await editor.newPage({ viewport: { width: 1440, height: 1000 } });
    await editorPage.goto(`${base}/admin`, { timeout: 120000 });
    assert.equal(await editorPage.locator('html.public-site').count(), 0);
    await editorPage.screenshot({ path: '.qa/public-redesign/after/admin-editor-1440.png' });
    results.admin.push({ route: 'admin', editor: true, publicMarker: false });
    await editor.close();
  }
  await page.goto(`${base}/en/apply-as-editor`);
  assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).getPropertyValue('--max-w-site').trim()), '1440px');
  assert.equal(await page.locator('.footer-group-title').first().isVisible(), false);
  results.admin.push({ route: 'en/apply-as-editor', redesignExcluded: true });
  console.log('QA complete', results.layouts.length, 'layout checks');
} finally {
  await fs.writeFile('.qa/public-redesign/results.json', JSON.stringify(results, null, 2));
  await browser.close();
}
assert(results.layouts.every(r => r.pass), JSON.stringify(results.layouts.filter(r => !r.pass)));
assert(results.accessibility.every(r => r.violations.length === 0), JSON.stringify(results.accessibility.filter(r => r.violations.length)));
assert.equal(results.errors.length, 0, JSON.stringify(results.errors));
