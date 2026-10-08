import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    consoleLogs.push({ type: 'pageerror', text: err.message, stack: err.stack });
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      networkErrors.push({
        url: res.url(),
        status: res.status(),
        statusText: res.statusText(),
      });
    }
  });

  console.log('Navigating to http://localhost:3000/admin ...');
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle', timeout: 60000 });

  console.log('Current URL:', page.url());
  console.log('Page title:', await page.title());

  console.log('Network errors count:', networkErrors.length);
  for (const err of networkErrors) {
    console.log(`  [${err.status}] ${err.url}`);
  }

  const errorOrWarnLogs = consoleLogs.filter(l => l.type === 'error' || l.type === 'warn' || l.type === 'pageerror');
  console.log('Console warnings/errors count:', errorOrWarnLogs.length);
  for (const log of errorOrWarnLogs) {
    console.log(`  [${log.type}] ${log.text}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error('Browser check failed:', err);
  process.exit(1);
});
