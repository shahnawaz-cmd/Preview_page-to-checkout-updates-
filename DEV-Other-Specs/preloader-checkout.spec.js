const { test, expect } = require('@playwright/test');
const path = require('path');

const PREVIEW_URL =
  'https://developtestsite.com/members/vin-check/preview?type=vhr&utm_details=&vin=1FTFW1ET2DFD78356&wpPage=homepage&landing=normal';

const EVIDENCE_DIR = path.join(__dirname, '..', 'test-results', 'preloader-preview-to-checkout');

test('Preview → Preloader → Checkout flow with timing', async ({ page }) => {
  // Step 1: Open Preview page
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\01-preview-page.png`, fullPage: true });

  // Step 2: Click "Access Records"
  await page.getByRole('button', { name: /access records/i }).first().click();

  // Step 3: Fill email in popup
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('test@example.com');
  await page.screenshot({ path: `${EVIDENCE_DIR}\\02-email-popup.png`, fullPage: true });

  // Step 4: Click "Access Records" inside popup
  await page.getByRole('button', { name: /access records/i }).last().click();

  const startTime = Date.now();

  // Step 5: Capture Preloader
  const preloader = page.locator('text=Preparing Your Checkout');
  await expect(preloader).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\03-preloader-screen.png`, fullPage: true });
  console.log('✅ Preloader appeared');

  // Step 6: Wait for Checkout page
  await page.waitForURL('**/members/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱ Time from Preloader to Checkout: ${elapsed}s`);

  // Step 7: Capture Checkout page
  await expect(page.locator('text=Choose payment method')).toBeVisible({ timeout: 30000 });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\04-checkout-page.png`, fullPage: true });
  console.log('✅ Checkout page loaded successfully');

  expect(parseFloat(elapsed)).toBeLessThan(30);
});
