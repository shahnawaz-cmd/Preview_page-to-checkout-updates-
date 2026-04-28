const { test, expect } = require('@playwright/test');
const path = require('path');

const URL = 'https://vehiclesreport.com/vin-check/license-preview?type=vhr&utm_details=&traffic_source=&vin=dGtlbmw2YVJZNENRTE04cUtLY1pPakdka3RHOGhtTGxFZkhOWTdqTE84OD0=&wpPage=homepage&landing=normal';

test.setTimeout(120000); // Increase timeout for slow pages

test('VSR: Manual Flow Verification (Strict)', async ({ page }) => {
  console.log(`🚀 Starting VSR Test: ${URL}`);

  let createHit = false;
  let updateHit = false;

  // Analytics capture
  page.on('response', response => {
    const url = response.url();
    if (url.includes('create-preview-analytics')) {
      console.log(`✅ API Captured: create-preview-analytics | Status: ${response.status()}`);
      createHit = true;
    }
    if (url.includes('update-preview-analytics')) {
      console.log(`✅ API Captured: update-preview-analytics | Status: ${response.status()}`);
      updateHit = true;
    }
  });

  // Step 1: Open Preview page
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Step 2: Find "Proceed to checkout" text and click
  // Using the exact XPath provided: /html/body/div[4]/div/div/div[2]/div[1]/div[7]/div/div[2]/div/button
  const xpath = '/html/body/div[4]/div/div/div[2]/div[1]/div[7]/div/div[2]/div/button';
  
  console.log('Step: Clicking "Proceed to checkout" via Evaluate');
  // Since Playwright's click() waits for visibility, we use a JS click if it fails visibility checks
  await page.evaluate((xpath) => {
    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (element) {
      element.scrollIntoView();
      element.click();
      return true;
    }
    return false;
  }, xpath);

  // Step 3: Search "Email Address" text field and fill out unique email
  console.log('Step: Filling Email Address');
  const emailInput = page.locator('input[type="email"], input[placeholder*="Email"]').first();
  await emailInput.waitFor({ state: 'attached', timeout: 15000 });
  const uniqueEmail = `test_vsr_${Date.now()}@example.com`;
  await emailInput.fill(uniqueEmail);

  // Step 4: Click "Create an account" button
  console.log('Step: Clicking "Create an account"');
  const createAccountButton = page.getByRole('button', { name: /Create an account/i });
  await createAccountButton.click({ force: true });

  const startTime = Date.now();

  // Step 5: Wait for movement to checkout page
  console.log('Step: Waiting for movement to checkout...');
  await page.waitForURL('**/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱ Transition Time: ${elapsed}s`);

  // Step 6: Final Checkout check
  await expect(page.locator('body')).toContainText(/Choose payment method|payment/i, { timeout: 30000 });
  console.log('✅ Checkout page loaded successfully');

  console.log(`📊 Analytics Summary: Create=${createHit}, Update=${updateHit}`);
  expect(createHit).toBe(true);
  expect(updateHit).toBe(true);
});
