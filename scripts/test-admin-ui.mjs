import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const networkResponses = [];
  const consoleMessages = [];

  page.on('response', res => {
    networkResponses.push({
      status: res.status(),
      url: res.url(),
      method: res.request().method(),
    });
    if (res.status() >= 400) {
      console.log(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
    }
  });

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err.message);
  });

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle', timeout: 60000 });

  console.log('2. Filling credentials...');
  await page.locator('input[name=email]').fill('attaullahbatoor135@gmail.com');
  await page.locator('input[name=password]').fill('Isolated-founder-9273!');
  await page.locator('button[type=submit]').click();

  console.log('3. Waiting for admin dashboard...');
  await page.waitForURL('**/admin', { timeout: 30000 });
  console.log('Successfully reached admin URL:', page.url());

  console.log('4. Navigating to Media collection...');
  await page.goto('http://localhost:3000/admin/collections/media', { waitUntil: 'networkidle', timeout: 60000 });
  console.log('Media collection URL:', page.url());

  // Wait a moment for any background API calls
  await page.waitForTimeout(3000);

  console.log('5. Checking if any 400 responses occurred...');
  const badRequests = networkResponses.filter(r => r.status === 400);
  console.log('Total 400 responses:', badRequests.length);
  for (const br of badRequests) {
    console.log(` -> 400 on ${br.method} ${br.url}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
