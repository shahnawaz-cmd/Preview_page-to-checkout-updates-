const { test, expect } = require('@playwright/test');
const path = require('path');

const PREVIEW_URL =
  'https://vhreu.accessautohistory.com/vin-check/preview?vin=2C3CDXCT0GH126868&type=vhr&wpPage=homepage';

const EVIDENCE_DIR = path.join(__dirname, '..', 'test-results', 'VHREU-preloader-preview-to-checkout');

test('VHREU — Preview → Preloader → Checkout flow with timing', async ({ page }) => {
  // Step 1: Open Preview page
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\01-VHREU-preview-page.png`, fullPage: true });

  // Step 2: Click "Access Records" on page to open popup
  await page.getByRole('button', { name: /access records/i }).first().click();

  // Step 3: Fill email in "Secure Your Report" popup
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('test@example.com');
  await page.screenshot({ path: `${EVIDENCE_DIR}\\02-VHREU-email-popup.png`, fullPage: true });

  // Step 4: Click "Access Records" inside popup
  await page.getByRole('button', { name: /access records/i }).last().click();

  const startTime = Date.now();

  // Step 5: Capture Preloader
  const preloader = page.locator('text=Preparing Your Checkout');
  await expect(preloader).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\03-VHREU-preloader-screen.png`, fullPage: true });
  console.log('✅ VHREU Preloader appeared');

  // Step 6: Wait for Checkout page
  await page.waitForURL('**/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱ VHREU Time from Preloader to Checkout: ${elapsed}s`);

  // Step 7: Capture Checkout page
  await expect(page.locator('text=Choose payment method')).toBeVisible({ timeout: 30000 });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\04-VHREU-checkout-page.png`, fullPage: true });
  console.log('✅ VHREU Checkout page loaded successfully');

  expect(parseFloat(elapsed)).toBeLessThan(30);
});
