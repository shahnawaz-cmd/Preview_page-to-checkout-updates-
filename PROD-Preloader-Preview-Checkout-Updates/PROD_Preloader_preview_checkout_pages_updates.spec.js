const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.setTimeout(120000);

// ─── Domains for Preloader flow ───────────────────────────────────────────────
const domains = [
  { name: 'InstantVinReports', url: 'https://instantvinreports.com' },
  { name: 'ConsultaDeVin',     url: 'https://consultadevin.com' },
  { name: 'PremiumVin',        url: 'https://premiumvin.com' },
  { name: 'VehiclesReport',    url: 'http://vehiclesreport.com' }
];

const VIN_PARAM = 'dGtlbmw2YVJZNENRTE04cUtLY1pPakdka3RHOGhtTGxFZkhOWTdqTE84OD0=';
const PRELOADER_PATH = `/vin-check/license-preview?type=vhr&utm_details=&traffic_source=&vin=${VIN_PARAM}&wpPage=homepage&landing=normal`;

// ─── InstantVinReports — Preview page updates + Coupon validation ─────────────
const IVR_PREVIEW_URL = 'https://instantvinreports.com/vin-check/preview?type=vhr&utm_details=&traffic_source=&vin=1FTBF2B66HEE83884&wpPage=homepage&offer=Preview15&landing=normal';
const IVR_COUPON_API  = 'https://instantvinreports.com/api-cwa/coupon_validation';

// ─── CDP screenshot helper (bypasses font-loading hang) ──────────────────────
async function snap(context, page, filePath) {
  try {
    const cdp = await context.newCDPSession(page);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  } catch { /* non-fatal */ }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1–4: PROD Preloader flow (all domains)
// ═══════════════════════════════════════════════════════════════════════════════
for (const site of domains) {
  test(`PROD: ${site.name} — Preview → Preloader → Checkout flow`, async ({ page }) => {
    const PREVIEW_URL = `${site.url}${PRELOADER_PATH}`;
    const EVIDENCE_DIR = path.join(__dirname, '..', 'test-results', `PROD-${site.name}`);

    console.log(`\n🚀 Testing Domain: ${site.name} (${site.url})`);

    page.on('request', request => {
      if (request.url().includes('members/api-cwa/')) {
        const url = request.url();
        if (url.includes('create-preview-analytics') || url.includes('update-preview-analytics')) {
          console.log(`📡 [${site.name}] Analytics: ${request.method()} ${url.split('/').pop()}`);
          const postData = request.postData();
          if (postData) {
            const emailMatch = postData.match(/name="email"\s*\r\n\r\n(.*?)\r\n/);
            if (emailMatch) console.log(`   📧 Email: ${emailMatch[1]}`);
          }
        }
      }
    });

    // Step 1: Open Preview page
    await page.goto(PREVIEW_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.screenshot({ path: `${EVIDENCE_DIR}\\01-preview.png`, fullPage: true });

    // Step 2: Click "Access Records"
    const accessButtonRegex = /access records|Acceder a los registros|Revelar registros|Get My Report/i;
    await page.getByRole('button', { name: accessButtonRegex }).first().click();

    // Step 3: Fill email in popup
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });
    const testEmail = `test_${site.name.toLowerCase()}_${Date.now()}@example.com`;
    await emailInput.fill(testEmail);
    await page.screenshot({ path: `${EVIDENCE_DIR}\\02-email-popup.png`, fullPage: true });

    // Step 4: Click "Access Records" inside popup
    await page.getByRole('button', { name: accessButtonRegex }).last().click();

    const startTime = Date.now();

    // Step 5: Capture Preloader
    const preloader = page.locator('text=Preparing Your Checkout');
    await expect(preloader).toBeVisible({ timeout: 30000 });
    await page.screenshot({ path: `${EVIDENCE_DIR}\\03-preloader.png`, fullPage: true });
    console.log(`✅ [${site.name}] Preloader appeared`);

    // Step 6: Wait for Checkout page
    await page.waitForURL('**/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱ [${site.name}] Preloader → Checkout: ${elapsed}s`);

    // Step 7: Capture Checkout page
    const checkoutTextRegex = /Choose payment method|Elija el método de pago|Seleccione un método de pago/i;
    await expect(page.locator('body')).toContainText(checkoutTextRegex, { timeout: 45000 });
    await page.screenshot({ path: `${EVIDENCE_DIR}\\04-checkout.png`, fullPage: true, timeout: 60000 });
    console.log(`✅ [${site.name}] Checkout page loaded`);

    expect(parseFloat(elapsed)).toBeLessThan(40);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5: InstantVinReports — Preview page updates (#landing_decal auto-check)
// ═══════════════════════════════════════════════════════════════════════════════
test('PROD: InstantVinReports — Preview page #landing_decal auto-selected', async ({ page, context }) => {
  const EVIDENCE_DIR = path.join(__dirname, '..', 'test-results', 'PROD-InstantVinReports-PreviewUpdates');

  console.log('\n🚀 Testing IVR Preview page updates');

  // Step 1: Open Preview page
  await page.goto(IVR_PREVIEW_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await snap(context, page, `${EVIDENCE_DIR}\\01-ivr-preview-page.png`);

  // Step 2: Verify #landing_decal checkbox is auto-selected
  const decalCheckbox = page.locator('#landing_decal');
  await decalCheckbox.waitFor({ state: 'visible', timeout: 15000 });
  await expect(decalCheckbox).toBeChecked();
  console.log('✅ IVR #landing_decal checkbox is auto-selected');
  await snap(context, page, `${EVIDENCE_DIR}\\02-ivr-decal-checked.png`);

  // Step 3: Click "Access Records" to open popup
  await page.getByRole('button', { name: /access records/i }).first().click();

  // Step 4: Fill email and phone in popup
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('test@example.com');
  const phoneInput = page.locator('input[type="tel"]').first();
  if (await phoneInput.isVisible()) await phoneInput.fill('5551234567');
  await snap(context, page, `${EVIDENCE_DIR}\\03-ivr-email-popup.png`);

  // Step 5: Click "Proceed to Checkout"
  await page.getByRole('button', { name: /proceed to checkout/i }).click();

  const startTime = Date.now();

  // Step 6: Capture Preloader
  const preloader = page.locator('text=Preparing Your Checkout');
  await expect(preloader).toBeVisible({ timeout: 30000 });
  await snap(context, page, `${EVIDENCE_DIR}\\04-ivr-preloader.png`);
  console.log('✅ IVR Preloader appeared');

  // Step 7: Wait for Checkout
  await page.waitForURL('**/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱ IVR Preloader → Checkout: ${elapsed}s`);

  const checkoutTextRegex = /Choose payment method|Elija el método de pago/i;
  await expect(page.locator('body')).toContainText(checkoutTextRegex, { timeout: 45000 });
  await snap(context, page, `${EVIDENCE_DIR}\\05-ivr-checkout.png`);
  console.log('✅ IVR Checkout page loaded');

  expect(parseFloat(elapsed)).toBeLessThan(40);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6: InstantVinReports — Coupon Validation on Checkout
// ═══════════════════════════════════════════════════════════════════════════════
test('PROD: InstantVinReports — Coupon Validation on Checkout', async ({ page, context }) => {
  const EVIDENCE_DIR = path.join(__dirname, '..', 'test-results', 'PROD-InstantVinReports-CouponValidation');

  console.log('\n🚀 Testing IVR Coupon Validation');

  // Navigate to preview and proceed to checkout to get a live checkout session
  await page.goto(IVR_PREVIEW_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const decalCheckbox = page.locator('#landing_decal');
  await decalCheckbox.waitFor({ state: 'visible', timeout: 15000 });
  await expect(decalCheckbox).toBeChecked();
  console.log('✅ #landing_decal auto-selected');

  await page.getByRole('button', { name: /access records/i }).first().click();
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(`test_coupon_${Date.now()}@example.com`);
  const phoneInput = page.locator('input[type="tel"]').first();
  if (await phoneInput.isVisible()) await phoneInput.fill('5551234567');
  await page.getByRole('button', { name: /proceed to checkout/i }).click();

  await page.waitForURL('**/checkout**', { timeout: 90000, waitUntil: 'domcontentloaded' });
  console.log('✅ Reached Checkout page');

  const couponInput = page.locator('input[placeholder="Enter your coupon code"]');
  const applyBtn    = page.getByRole('button', { name: /apply/i });
  const payBtn      = page.locator('button', { hasText: /Pay \$/ });

  await couponInput.waitFor({ state: 'visible', timeout: 15000 });

  const initialPrice = await payBtn.first().innerText();
  console.log(`💰 Initial price: ${initialPrice}`);
  await snap(context, page, `${EVIDENCE_DIR}\\01-checkout-initial.png`);

  // ── TC: Valid coupon "get20" ───────────────────────────────────────────────
  let apiStatus, apiBody, apiResponseTime;
  const validResponse = page.waitForResponse(r => r.url().includes('coupon_validation'));
  const t1 = Date.now();
  await couponInput.fill('get20');
  await applyBtn.click();

  const validRes = await validResponse;
  apiResponseTime = Date.now() - t1;
  apiStatus = validRes.status();
  try { apiBody = await validRes.json(); } catch { apiBody = await validRes.text(); }

  console.log(`📡 Valid Coupon API — Status: ${apiStatus} | Time: ${apiResponseTime}ms`);
  console.log(`📡 Response: ${JSON.stringify(apiBody)}`);

  expect(apiStatus).toBe(200);
  await page.waitForTimeout(1500);

  const discountedPrice = await payBtn.first().innerText();
  console.log(`💰 Discounted price after "get20": ${discountedPrice}`);
  await snap(context, page, `${EVIDENCE_DIR}\\02-valid-coupon-applied.png`);

  expect(discountedPrice).not.toBe(initialPrice);
  console.log(`✅ Price changed: ${initialPrice} → ${discountedPrice}`);

  // ── TC: Invalid coupon "get323523" ────────────────────────────────────────
  let invalidApiStatus, invalidApiBody, invalidApiResponseTime;
  const invalidResponse = page.waitForResponse(r => r.url().includes('coupon_validation'));
  const t2 = Date.now();
  await couponInput.fill('get323523');
  await applyBtn.click();

  const invalidRes = await invalidResponse;
  invalidApiResponseTime = Date.now() - t2;
  invalidApiStatus = invalidRes.status();
  try { invalidApiBody = await invalidRes.json(); } catch { invalidApiBody = await invalidRes.text(); }

  console.log(`📡 Invalid Coupon API — Status: ${invalidApiStatus} | Time: ${invalidApiResponseTime}ms`);
  console.log(`📡 Response: ${JSON.stringify(invalidApiBody)}`);

  await page.waitForTimeout(1500);
  const priceAfterInvalid = await payBtn.first().innerText();
  console.log(`💰 Price after invalid coupon: ${priceAfterInvalid}`);
  await snap(context, page, `${EVIDENCE_DIR}\\03-invalid-coupon.png`);

  // Price must not reset after invalid coupon
  expect(priceAfterInvalid).toBe(discountedPrice);
  console.log(`✅ Price held at ${priceAfterInvalid} after invalid coupon`);

  const isInvalidResponse =
    (invalidApiStatus && invalidApiStatus !== 200) ||
    (invalidApiBody && JSON.stringify(invalidApiBody).match(/invalid|error|not found|false/i));
  expect(isInvalidResponse).toBeTruthy();
  console.log('✅ API correctly returned invalid coupon response');

  console.log('\n📊 Coupon Summary:');
  console.log(`  Valid   "get20"     → API ${apiStatus} in ${apiResponseTime}ms | ${initialPrice} → ${discountedPrice}`);
  console.log(`  Invalid "get323523" → API ${invalidApiStatus} in ${invalidApiResponseTime}ms | Price held: ${priceAfterInvalid}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 7: VSR — Manual Flow Verification (runs last)
// ═══════════════════════════════════════════════════════════════════════════════
test('VSR: Manual Flow Verification (Strict)', async ({ page }) => {
  const VSR_URL = 'https://vehiclesreport.com/vin-check/license-preview?type=vhr&utm_details=&traffic_source=&vin=dGtlbmw2YVJZNENRTE04cUtLY1pPakdka3RHOGhtTGxFZkhOWTdqTE84OD0=&wpPage=homepage&landing=normal';

  console.log(`\n🚀 Starting VSR Test: ${VSR_URL}`);

  let createHit = false;
  let updateHit = false;

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
  await page.goto(VSR_URL, { waitUntil: 'networkidle', timeout: 60000 });

  // Step 2: Click "Proceed to checkout" via XPath
  const xpath = '/html/body/div[4]/div/div/div[2]/div[1]/div[7]/div/div[2]/div/button';
  console.log('Step: Clicking "Proceed to checkout" via XPath');
  await page.waitForTimeout(2000); // allow JS to render
  await page.evaluate((xpath) => {
    const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (el) { el.scrollIntoView(); el.click(); }
  }, xpath);

  // Step 3: Fill email
  console.log('Step: Filling Email Address');
  const emailInput = page.locator('input[type="email"], input[placeholder*="Email"]').first();
  await emailInput.waitFor({ state: 'attached', timeout: 30000 });
  await emailInput.fill(`test_vsr_${Date.now()}@example.com`);

  // Step 4: Click "Create an account"
  console.log('Step: Clicking "Create an account"');
  await page.getByRole('button', { name: /Create an account/i }).click({ force: true });

  const startTime = Date.now();

  // Step 5: Wait for Checkout
  console.log('Step: Waiting for checkout...');
  await page.waitForURL('**/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱ VSR Transition Time: ${elapsed}s`);

  // Step 6: Verify Checkout loaded
  await expect(page.locator('body')).toContainText(/Choose payment method|payment/i, { timeout: 30000 });
  console.log('✅ VSR Checkout page loaded successfully');

  console.log(`📊 Analytics: Create=${createHit}, Update=${updateHit}`);
  expect(createHit).toBe(true);
  expect(updateHit).toBe(true);
});
