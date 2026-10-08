import { chromium } from '@playwright/test';
import sharp from 'sharp';
import fs from 'node:fs/promises';

async function main() {
  // Create a real test image
  const imgBuffer = await sharp({
    create: {
      width: 1200,
      height: 675,
      channels: 3,
      background: { r: 180, g: 200, b: 190 }
    }
  }).webp().toBuffer();
  await fs.writeFile('data/test-upload.webp', imgBuffer);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  page.on('request', req => {
    if (req.url().includes('media')) {
      console.log(`[REQUEST] ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async res => {
    if (res.status() >= 400) {
      console.log(`[HTTP ${res.status()}] ${res.request().method()} ${res.url()}`);
      try {
        console.log('Response body:', await res.text());
      } catch {
        // ignore
      }
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[CONSOLE ERROR]', msg.text());
  });

  // Login
  await page.goto('http://localhost:3000/admin/login');
  await page.locator('input[name=email]').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('input[name=email]').fill('attaullahbatoor135@gmail.com');
  await page.locator('input[name=password]').fill('Isolated-founder-9273!');
  await page.locator('button[type=submit]').click();
  await page.waitForURL('**/admin', { timeout: 30000 });
  console.log('Logged in successfully');

  // Go to media create
  await page.goto('http://localhost:3000/admin/collections/media/create');
  await page.locator('input[type=file]').waitFor({ state: 'attached', timeout: 30000 });
  console.log('At media create page:', page.url());

  // Upload file
  const fileInput = page.locator('input[type=file]');
  await fileInput.setInputFiles('data/test-upload.webp');
  console.log('File attached');

  // Fill required fields
  await page.locator('input[name=alt]').fill('Test Cover Image for Beyond Rasooli');
  await page.locator('input[name=caption]').fill('Test editorial photograph caption');
  await page.locator('input[name=credit]').fill('Beyond Rasooli Editorial');
  await page.locator('input[name=license]').fill('CC-BY-4.0 test licence');

  // Click Save
  console.log('Clicking Save...');
  const saveBtn = page.getByRole('button', { name: 'Save', exact: true });
  await saveBtn.click();

  await page.waitForTimeout(5000);
  console.log('After save, URL:', page.url());

  const fieldErrors = await page.locator('.field-error, .banner, .payload-toast-item').allTextContents();
  console.log('Field errors / toasts on page:', fieldErrors);

  await page.screenshot({ path: 'data/media-create-after-save.png', fullPage: true });
  console.log('Saved screenshot to data/media-create-after-save.png');

  await browser.close();
}

main().catch(err => {
  console.error('Test media create failed:', err);
  process.exit(1);
});
