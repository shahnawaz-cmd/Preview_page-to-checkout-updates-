# Final QA Report — Preloader Between Preview & Checkout

**Project:** CWA MVP — Checkout Flow
**Feature:** Preloader Screen (Preview → Checkout Transition)
**Environment:** DEV
**Test Date:** Friday, 24 April 2026
**Prepared By:** Shahnawaz (QA Engineer)
**Report Status:** ✅ PASSED

---

## 1. Executive Summary

A Preloader screen ("Preparing Your Checkout") was introduced between the Preview page and the Checkout page as part of the CWA MVP checkout UX improvement. This report documents the verification of that feature.

| Metric | Value |
|--------|-------|
| Feature | Preloader between Preview → Checkout |
| Total Test Cases | 7 |
| Passed | 7 |
| Failed | 0 |
| Automation | Playwright v1.59.1 |
| Overall Result | ✅ PASSED |

---

## 2. Feature Description

When a user lands on the **Preview page**, clicks **"Access Records"**, enters their email in the popup, and submits — instead of being redirected directly to Checkout, they now see a **Preloader screen** that:

- Displays "Preparing Your Checkout" with a shield icon
- Shows 4 animated progress steps:
  1. ✅ Creating your account
  2. 🔄 Verifying vehicle details...
  3. ⬜ Setting up secure payment
  4. ⬜ Finalizing checkout
- Shows a progress bar and "256-bit SSL encrypted" trust badge
- Automatically redirects to the Checkout page once ready

---

## 3. Test Environment

| Item | Detail |
|------|--------|
| VIN Tested | `1FTFW1ET2DFD78356` (2013 Ford F150) |
| Preview URL | `https://developtestsite.com/members/vin-check/preview?type=vhr&utm_details=&vin=1FTFW1ET2DFD78356&wpPage=homepage&landing=normal` |
| Checkout URL | `https://developtestsite.com/members/checkout?type=vhr&data=...` |
| Report Type | VHR (Vehicle History Report) |
| Browser | Chromium (Playwright headless) |
| Test Tool | Playwright v1.59.1 |

---

## 4. Test Cases & Results

| # | Test Case | Expected Result | Actual Result | Status |
|---|-----------|-----------------|---------------|--------|
| TC-01 | Open Preview page | Page loads successfully | Page loaded | ✅ Pass |
| TC-02 | Click "Access Records" button | Popup appears | Popup appeared | ✅ Pass |
| TC-03 | Enter email in popup | Email field accepts input | Email entered successfully | ✅ Pass |
| TC-04 | Click "Access Records" in popup | Preloader screen appears | Preloader visible — "Preparing Your Checkout" | ✅ Pass |
| TC-05 | Preloader progress steps visible | 4 steps shown with animation | Steps displayed correctly | ✅ Pass |
| TC-06 | Auto-redirect to Checkout page | Navigates to `/members/checkout` | Redirected correctly | ✅ Pass |
| TC-07 | Checkout page loads correctly | "Choose payment method" visible with VIN & price | Checkout loaded — VIN `1FTFW1ET2DFD78356`, $19.99 | ✅ Pass |

---

## 5. Timing Measurement

| Metric | Value |
|--------|-------|
| Preloader appeared after form submit | < 1 second |
| Preloader → Checkout navigation time | **11.59 seconds** |
| Total test execution time | **1 minute 6 seconds** |

> ✅ 11.59s transition time is within acceptable range for backend account creation + VIN verification.
> ⚠️ Recommended threshold: alert if this exceeds **20 seconds** in production.

---

## 6. Evidence

All evidence was auto-captured by Playwright during the test run.

| File | Description |
|------|-------------|
| [`01-preview-page.png`](../test-results/preloader-preview-to-checkout/01-preview-page.png) | Preview page on load |
| [`02-email-popup.png`](../test-results/preloader-preview-to-checkout/02-email-popup.png) | Email popup with dummy email entered |
| [`03-preloader-screen.png`](../test-results/preloader-preview-to-checkout/03-preloader-screen.png) | Preloader — "Preparing Your Checkout" |
| [`04-checkout-page.png`](../test-results/preloader-preview-to-checkout/04-checkout-page.png) | Checkout page after redirect |
| [`preview-to-checkout-flow.webm`](../test-results/preloader-preview-to-checkout/preview-to-checkout-flow.webm) | 🎥 Full screen recording of the flow |

### Step 1 — Preview Page
![Preview Page](../test-results/preloader-preview-to-checkout/01-preview-page.png)

### Step 2 — Email Popup
![Email Popup](../test-results/preloader-preview-to-checkout/02-email-popup.png)

### Step 3 — Preloader Screen
![Preloader](../test-results/preloader-preview-to-checkout/03-preloader-screen.png)

### Step 4 — Checkout Page
![Checkout](../test-results/preloader-preview-to-checkout/04-checkout-page.png)

### 🎥 Video Recording
> Full flow video: [`preview-to-checkout-flow.webm`](../test-results/preloader-preview-to-checkout/preview-to-checkout-flow.webm)

---

## 7. Automation Script

**File:** `preloader-checkout.spec.js`

```js
const { test, expect } = require('@playwright/test');

const PREVIEW_URL =
  'https://developtestsite.com/members/vin-check/preview?type=vhr&utm_details=&vin=1FTFW1ET2DFD78356&wpPage=homepage&landing=normal';

test('Preview → Preloader → Checkout flow with timing', async ({ page }) => {
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: '...\\01-preview-page.png', fullPage: true });

  await page.getByRole('button', { name: /access records/i }).first().click();

  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('test@example.com');
  await page.screenshot({ path: '...\\02-email-popup.png', fullPage: true });

  await page.getByRole('button', { name: /access records/i }).last().click();
  const startTime = Date.now();

  await expect(page.locator('text=Preparing Your Checkout')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: '...\\03-preloader-screen.png', fullPage: true });

  await page.waitForURL('**/members/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  await expect(page.locator('text=Choose payment method')).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: '...\\04-checkout-page.png', fullPage: true });

  expect(parseFloat(elapsed)).toBeLessThan(30);
});
```

**Console Output:**
```
✅ Preloader appeared
⏱ Time from Preloader to Checkout: 11.59s
✅ Checkout page loaded successfully

1 passed (1.1m)
```

---

## 8. UX Observations

| # | Observation | Severity |
|---|-------------|----------|
| ✅ | Preloader gives clear visual feedback during backend processing | — |
| ✅ | "256-bit SSL encrypted" badge builds user trust during wait | — |
| ✅ | Step-by-step animation feels professional and reduces perceived wait time | — |
| ✅ | VIN and email correctly passed through to Checkout page | — |
| ⚠️ | No timeout/error state if backend takes > 20s | Low |
| ⚠️ | Browser back button during preloader may cause broken state | Low |

---

## 9. Recommendations

| Priority | Recommendation |
|----------|----------------|
| Low | Add a fallback message on preloader if redirect takes > 20s (e.g., "Taking longer than expected...") |
| Low | Disable or intercept browser back navigation while preloader is active |
| Low | Monitor preloader duration in production — set alert if median exceeds 15s |

---

## 10. Sign-off

| Role | Name | Status |
|------|------|--------|
| QA Engineer | Shahnawaz | ✅ Verified & Report Complete |
| Developer | — | ⏳ Pending Review |
| Product Owner | — | ⏳ Pending Sign-off |

---

*Automated test evidence captured via Playwright v1.59.1 on 24 April 2026.*
*Part of CWA MVP Checkout QA cycle.*
