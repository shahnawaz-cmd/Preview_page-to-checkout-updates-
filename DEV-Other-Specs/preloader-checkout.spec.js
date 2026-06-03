const { test, expect } = require('@playwright/test');
const path = require('path');

// Enable parallel execution for tests within this file
test.describe.configure({ mode: 'parallel' });

const BASE_URL_VHR = 'https://developtestsite.com/members/vin-check/preview?type=vhr&utm_details=&vin=';
const BASE_URL_STICKER = 'https://developtestsite.com/members/vin-check/preview?type=sticker&utm_details=&vin=';
const BASE_VIN = '1FTFW1ET2DFD78356';
const EVIDENCE_DIR = path.join(__dirname, '..', 'test-results', 'preloader-preview-to-checkout');

function randomVin() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  return BASE_VIN.slice(0, -1) + chars[Math.floor(Math.random() * chars.length)];
}

// ─── Shared Base Class ───────────────────────────────────────────────────────
class PreloaderBase {
  constructor(page, baseUrl, prefix) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.prefix = prefix;
  }

  async runCheckoutFlow(t0) {
    const t1 = await this.clickFlowAccessRecords();

    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      const preloader = this.page.locator('text=Preparing Your Checkout, text=Loading, text=Processing');
      await preloader.waitFor({ state: 'hidden', timeout: 60000 });
      await this.page.screenshot({ path: `${EVIDENCE_DIR}/${this.prefix}-03-preloader-hidden.png`, fullPage: true });
      console.log('✅ Preloader hidden');
    } catch (e) {
      console.log('⚠️ Preloader did not hide, checking for navigation...');
    }

    await this.page.waitForURL('**/members/checkout**', { timeout: 120000, waitUntil: 'load' });
    const t2 = Date.now();
    const preloaderElapsed = ((t2 - t1) / 1000).toFixed(2);
    console.log(`⏱ Preloader → Checkout: ${preloaderElapsed}s`);

    if (t0) {
      const totalElapsed = ((t2 - t0) / 1000).toFixed(2);
      console.log(`⏱ Preview → Checkout Total: ${totalElapsed}s`);
    }

    const checkoutIndicators = [
      this.page.locator('text=Choose payment method'),
      this.page.locator('text=Enter your card details'),
      this.page.locator('text=Shipping Information'),
      this.page.locator('text=Order Summary'),
      // Adding mobile/generic container locators, form, and header as fallbacks
      this.page.locator('.checkout-container, [class*="checkout" i], #checkout-page, form, header').first()
    ];
    
    try {
        await Promise.race(checkoutIndicators.map(locator => locator.waitFor({ state: 'visible', timeout: 120000 })));
    } catch (e) {
        console.error('❌ Checkout indicators not found. URL:', this.page.url());
        await this.page.screenshot({ path: `${EVIDENCE_DIR}/${this.prefix}-DEBUG-timeout.png`, fullPage: true });
        throw e;
    }

    await this.page.screenshot({ path: `${EVIDENCE_DIR}/${this.prefix}-04-checkout.png`, fullPage: true });
    console.log('✅ Checkout page loaded');

    expect(parseFloat(preloaderElapsed)).toBeLessThan(90);
  }

  async clickFlowAccessRecords() {
    await this.page.getByRole('button', { name: /access records/i }).first().click();
    console.log('✅ Clicked Access Records');

    const emailInput = this.page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    const email = `test_${Date.now()}@example.com`;
    await emailInput.fill(email);
    console.log(`📧 Email: ${email}`);
    await this.page.screenshot({ path: `${EVIDENCE_DIR}/${this.prefix}-02-popup.png`, fullPage: true });

    const t1 = Date.now();
    await this.page.getByRole('button', { name: /proceed to checkout|access records/i }).last().click();
    console.log('✅ Clicked Proceed to Checkout');
    return t1;
  }

  async run(vin) {
    const PREVIEW_URL = `${this.baseUrl}${vin}&wpPage=homepage&landing=normal`;
    const t0 = Date.now();
    
    await this.page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
    await this.page.screenshot({ path: `${EVIDENCE_DIR}/${this.prefix}-01-preview.png`, fullPage: true });

    await this.runCheckoutFlow(t0);
  }

  async runCachebackFlow(vin) {
    const PREVIEW_URL = `${this.baseUrl}${vin}&wpPage=homepage&landing=normal`;
    const t0 = Date.now();
    
    // Ensure clean state
    await this.page.context().clearCookies();
    
    // Attempt 1: Standard flow
    await this.page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
    await this.page.screenshot({ path: `${EVIDENCE_DIR}/${this.prefix}-01-preview.png`, fullPage: true });
    await this.runCheckoutFlow(t0);

    // Navigate back
    console.log('🔙 Navigating back to preview...');
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // Human delay

    // Attempt 2: Cached flow
    console.log('🔄 Attempting cached access...');
    await this.page.getByRole('button', { name: /access records/i }).first().click();
    await this.page.waitForTimeout(2000); // Human delay
    
    await this.page.waitForURL('**/members/checkout**', { timeout: 60000, waitUntil: 'load' });
    await this.page.waitForTimeout(2000); // Human delay before final assertion
    console.log('✅ Successfully landed on checkout page in 2nd attempt');
    await this.page.screenshot({ path: `${EVIDENCE_DIR}/${this.prefix}-05-checkout-cached.png`, fullPage: true });
  }
}

// ─── Specific Classes ────────────────────────────────────────────────────────
class PreloaderForVHR extends PreloaderBase {
  constructor(page) { super(page, BASE_URL_VHR, 'vhr-flow'); }
}

class PreloaderForSticker extends PreloaderBase {
  constructor(page) { super(page, BASE_URL_STICKER, 'sticker-flow'); }
}

class EmailCacheback extends PreloaderForVHR {
  constructor(page) { super(page); this.prefix = 'cacheback-flow'; }
  async run(vin) { await this.runCachebackFlow(vin); }
}

class EmailCachebackForWS extends PreloaderForSticker {
  constructor(page) { super(page); this.prefix = 'cacheback-flow-ws'; }
  async run(vin) { await this.runCachebackFlow(vin); }
}

class Previncheckflow {
  constructor(page) {
    this.vhr = new PreloaderForVHR(page);
    this.page = page;
  }
  async run(vin) {
    await this.vhr.run(vin);

    // Verify screen absence after navigating back
    console.log('🔙 Navigating back to preview...');
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000); // Added human delay
    
    const searchScreenText = 'Please wait while we search records for your VIN';
    const searchScreen = this.page.locator(`text="${searchScreenText}"`);
    
    await expect(searchScreen).not.toBeVisible({ timeout: 10000 });
    console.log('✅ Screen did not appear after navigating back');

    // Verify screen absence after refresh
    console.log('🔄 Refreshing page...');
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await expect(searchScreen).not.toBeVisible({ timeout: 10000 });
    console.log('✅ Screen did not appear after refresh');
  }
}

// ─── Test Cases ──────────────────────────────────────────────────────────────

test('Preview → Preloader → Checkout flow (Previncheckflow)', async ({ page }) => {
  test.setTimeout(180000);
  try {
    const vincheck = new Previncheckflow(page);
    await vincheck.run(randomVin());
  } finally {
    await page.close();
  }
});

test('Preview → Preloader → Checkout flow (Email Cacheback)', async ({ page }) => {
  test.setTimeout(300000);
  try {
    const cacheback = new EmailCacheback(page);
    await cacheback.run(randomVin());
  } finally {
    await page.close();
  }
});

test('Preview → Preloader → Checkout flow (Email Cacheback for WS)', async ({ page }) => {
  test.setTimeout(300000);
  try {
    const cachebackWs = new EmailCachebackForWS(page);
    await cachebackWs.run(randomVin());
  } finally {
    await page.close();
  }
});

test('Preview → Preloader → Checkout flow (VHR)', async ({ page }) => {
  test.setTimeout(180000);
  try {
    const vhr = new PreloaderForVHR(page);
    await vhr.run(randomVin());
  } finally {
    await page.close();
  }
});

test('Preview → Preloader → Checkout flow (Sticker)', async ({ page }) => {
  test.setTimeout(180000);
  try {
    const sticker = new PreloaderForSticker(page);
    await sticker.run(randomVin());
  } finally {
    await page.close();
  }
});
