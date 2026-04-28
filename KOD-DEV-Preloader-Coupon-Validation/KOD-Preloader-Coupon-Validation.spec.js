const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.setTimeout(120000);

// ─── CDP screenshot helper ────────────────────────────────────────────────────
async function snap(context, page, filePath) {
  try {
    const cdp = await context.newCDPSession(page);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
  } catch { /* non-fatal */ }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1: KOD DEV — Preview → Preloader → Checkout (Dodge Window Sticker)
// ═══════════════════════════════════════════════════════════════════════════════
test('KOD DEV — Preview → Preloader → Checkout flow with timing', async ({ page }) => {
  const PREVIEW_URL = 'https://dev.dodgewindowsticker.com/vin-check/ws-preview?vin=1FM5K7F88HGC38165&type=sticker&wpPage=homepage';
  const EVIDENCE_DIR = path.join(__dirname, '..', 'test-results', 'KOD-preloader-preview-to-checkout');

  // Step 1: Open Preview page
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\01-KOD-preview-page.png`, fullPage: true });

  // Step 2: Click "Access Records" to open popup
  await page.getByRole('button', { name: /access records/i }).first().click();

  // Step 3: Fill email in popup
  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('test@example.com');
  await page.screenshot({ path: `${EVIDENCE_DIR}\\02-KOD-email-popup.png`, fullPage: true });

  // Step 4: Click "Access Records" inside popup
  await page.getByRole('button', { name: /access records/i }).last().click();

  const startTime = Date.now();

  // Step 5: Capture Preloader
  const preloader = page.locator('text=Preparing Your Checkout');
  await expect(preloader).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\03-KOD-preloader-screen.png`, fullPage: true });
  console.log('✅ KOD DEV Preloader appeared');

  // Step 6: Wait for Checkout
  await page.waitForURL('**/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱ KOD DEV Preloader → Checkout: ${elapsed}s`);

  // Step 7: Capture Checkout page
  await expect(page.locator('text=Choose payment method')).toBeVisible({ timeout: 30000 });
  await page.screenshot({ path: `${EVIDENCE_DIR}\\04-KOD-checkout-page.png`, fullPage: true });
  console.log('✅ KOD DEV Checkout page loaded successfully');

  expect(parseFloat(elapsed)).toBeLessThan(30);
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 2: KOD PROD — Coupon Validation on Checkout (Ford Window Sticker Lookup)
// ═══════════════════════════════════════════════════════════════════════════════
test.use({
  launchOptions: { args: ['--host-resolver-rules=MAP fordwindowstickerlookup.com 104.21.32.7'] }
});

test('KOD PROD — Coupon Validation on Checkout', async ({ page, context }) => {
    const CHECKOUT_URL = 'https://fordwindowstickerlookup.com/checkout?type=sticker&data=eyJlbWFpbCI6InVwZGF0ZWRAZXNzZC5jb20iLCJ2aW4iOiJJakpVTVVKVk5FVkZNMEZETlRBNU5qRTBJZz09IiwidiI6IklqSXdNVEFnVkc5NWIzUmhJRU52Y205c2JHRWkiLCJjb2RlIjoiRk9SRFdJTkRPVVBTVDEiLCJjdXJyZW5jeSI6IlVTRCIsInByaWNlIjoxOS45OSwicGVyY2VudGFnZSI6MSwicGhvbmUiOiIiLCJwbGFuIjoiSW50Y0ltTnZaR1ZjSWpwY0lrWlBVa1JYU1U1RVQxVlFVMVF4WENJc1hDSnVZVzFsWENJNlhDSkNZWE5wWTF3aUxGd2lkSGx3WlZ3aU9sd2ljM1JwWTJ0bGNsd2lMRndpY0hKcFkyVmNJam94T1M0NU9TeGNJbTV2YzF3aU9sd2lNVndpTEZ3aVkzVnljbVZ1WTNsZlkyOWtaVndpT2x3aVZWTkVYQ0lzWENKamRYSnlaVzVqZVY5emFXZHVYQ0k2WENJa1hDSXNYQ0pqYjI1MlpYSnphVzl1WDNKaGRHVmNJam94TEZ3aVozVnRjbTloWkZ3aU9sd2lSazlTUkZkSlRrUlBWVkJUVkRGY0luMGkiLCJleHRyYSI6ImV5SndJam94TlN3aWN5STZkSEoxWlgwPSJ9&wpPage=homepage&intentId=pi_3TRBZMJn9pH5HoWz0BuGtG2D';
    const EVIDENCE = path.join(__dirname, '..', 'test-results', 'KOD-PROD-coupon-validation');

    // Step 1: Open Checkout page
    await page.goto(CHECKOUT_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const couponInput = page.locator('input[placeholder="Enter your coupon code"]');
    const applyBtn    = page.getByRole('button', { name: /apply/i });
    const payBtn      = page.locator('button', { hasText: /Pay \$/ });

    await couponInput.waitFor({ state: 'visible', timeout: 15000 });

    const initialPrice = await payBtn.first().innerText();
    console.log(`💰 Initial price: ${initialPrice}`);
    await snap(context, page, `${EVIDENCE}\\01-checkout-initial.png`);

    // ── TC-01: Valid coupon "get20" ──────────────────────────────────────────
    let apiStatus, apiBody, apiResponseTime;
    const validRes = page.waitForResponse(r => r.url().includes('coupon_validation'));
    const t1 = Date.now();
    await couponInput.fill('get20');
    await applyBtn.click();

    const validResponse = await validRes;
    apiResponseTime = Date.now() - t1;
    apiStatus = validResponse.status();
    try { apiBody = await validResponse.json(); } catch { apiBody = await validResponse.text(); }

    console.log(`📡 Valid Coupon API — Status: ${apiStatus} | Time: ${apiResponseTime}ms`);
    console.log(`📡 Response: ${JSON.stringify(apiBody)}`);

    expect(apiStatus).toBe(200);
    await page.waitForTimeout(1500);

    const discountedPrice = await payBtn.first().innerText();
    console.log(`💰 Discounted price after "get20": ${discountedPrice}`);
    await snap(context, page, `${EVIDENCE}\\02-valid-coupon-applied.png`);

    expect(discountedPrice).not.toBe(initialPrice);
    console.log(`✅ TC-01: Price changed ${initialPrice} → ${discountedPrice}`);

    // ── TC-02: Invalid coupon "get323523" ────────────────────────────────────
    let invalidApiStatus, invalidApiBody, invalidApiResponseTime;
    const invalidRes = page.waitForResponse(r => r.url().includes('coupon_validation'));
    const t2 = Date.now();
    await couponInput.fill('get323523');
    await applyBtn.click();

    const invalidResponse = await invalidRes;
    invalidApiResponseTime = Date.now() - t2;
    invalidApiStatus = invalidResponse.status();
    try { invalidApiBody = await invalidResponse.json(); } catch { invalidApiBody = await invalidResponse.text(); }

    console.log(`📡 Invalid Coupon API — Status: ${invalidApiStatus} | Time: ${invalidApiResponseTime}ms`);
    console.log(`📡 Response: ${JSON.stringify(invalidApiBody)}`);

    await page.waitForTimeout(1500);
    const priceAfterInvalid = await payBtn.first().innerText();
    console.log(`💰 Price after invalid coupon: ${priceAfterInvalid}`);
    await snap(context, page, `${EVIDENCE}\\03-invalid-coupon.png`);

    expect(priceAfterInvalid).toBe(discountedPrice);
    console.log(`✅ TC-02: Price held at ${priceAfterInvalid} after invalid coupon`);

    const isInvalidResponse =
      (invalidApiStatus && invalidApiStatus !== 200) ||
      (invalidApiBody && JSON.stringify(invalidApiBody).match(/invalid|error|not found|false/i));
    expect(isInvalidResponse).toBeTruthy();
    console.log('✅ TC-02: API correctly returned invalid coupon response');

    console.log('\n📊 Summary:');
    console.log(`  Valid   "get20"     → API ${apiStatus} in ${apiResponseTime}ms | ${initialPrice} → ${discountedPrice}`);
    console.log(`  Invalid "get323523" → API ${invalidApiStatus} in ${invalidApiResponseTime}ms | Price held: ${priceAfterInvalid}`);
  });
