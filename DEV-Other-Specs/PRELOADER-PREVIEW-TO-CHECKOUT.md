# Preloader Added Between Preview & Checkout — QA Report

## User Story

> As a user, when I click **"Access Records"** on the Preview page and submit my email,
> I should see a **Preloader screen** ("Preparing Your Checkout") before being redirected
> to the Checkout page — so the transition feels smooth and trustworthy.

---

## Feature Summary

| Item | Detail |
|------|--------|
| Feature | Preloader screen between Preview → Checkout |
| VIN Tested | `1FTFW1ET2DFD78356` |
| Preview URL | `https://developtestsite.com/members/vin-check/preview?type=vhr&utm_details=&vin=1FTFW1ET2DFD78356&wpPage=homepage&landing=normal` |
| Checkout URL | `https://developtestsite.com/members/checkout?type=vhr&data=...` |
| Tested On | Friday, April 24, 2026 |
| Tested By | QA Engineer |
| Tool Used | Playwright v1.59.1 |

---

## Test Flow

1. Open Preview page
2. Click **"Access Records"** button
3. Pop-up appears → Enter email (`test@example.com`)
4. Click **"Access Records"** inside the pop-up
5. ✅ Preloader screen appears — "Preparing Your Checkout"
6. Preloader shows 4 animated steps:
   - ✅ Creating your account
   - 🔄 Verifying vehicle details...
   - ⬜ Setting up secure payment
   - ⬜ Finalizing checkout
7. ✅ Navigates to Checkout page automatically

---

## Test Result

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| Open Preview page | Page loads | Page loaded | ✅ Pass |
| Click "Access Records" | Button clickable | Clicked successfully | ✅ Pass |
| Email popup appears | Popup visible | Popup appeared | ✅ Pass |
| Enter email & submit | Form accepts input | Email entered & submitted | ✅ Pass |
| Preloader screen appears | "Preparing Your Checkout" shown | Preloader visible | ✅ Pass |
| Navigate to Checkout | Redirect to `/members/checkout` | Redirected correctly | ✅ Pass |
| Checkout page loads | "Choose payment method" visible | Checkout loaded | ✅ Pass |

**Overall Result: ✅ PASSED**

---

## Timing

| Metric | Value |
|--------|-------|
| Preloader → Checkout navigation time | **11.79 seconds** |
| Total test execution time | **49.8 seconds** |

> ⚠️ Note: ~12 seconds on the preloader is acceptable. If this exceeds **15–20 seconds**
> in production, consider adding a timeout fallback or error state on the preloader.

---

## Playwright Automated Test

**File:** `preloader-checkout.spec.js`

```js
const { test, expect } = require('@playwright/test');

const PREVIEW_URL =
  'https://developtestsite.com/members/vin-check/preview?type=vhr&utm_details=&vin=1FTFW1ET2DFD78356&wpPage=homepage&landing=normal';

test('Preview → Preloader → Checkout flow with timing', async ({ page }) => {
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /access records/i }).first().click();

  const emailInput = page.locator('input[type="email"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill('test@example.com');

  await page.getByRole('button', { name: /access records/i }).last().click();

  const startTime = Date.now();

  const preloader = page.locator('text=Preparing Your Checkout');
  await expect(preloader).toBeVisible({ timeout: 15000 });
  console.log('✅ Preloader appeared');

  await page.waitForURL('**/members/checkout**', { timeout: 60000, waitUntil: 'domcontentloaded' });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱ Time from Preloader to Checkout: ${elapsed}s`);

  await expect(page.locator('text=Choose payment method')).toBeVisible({ timeout: 10000 });
  console.log('✅ Checkout page loaded successfully');

  expect(parseFloat(elapsed)).toBeLessThan(30);
});
```

**Console Output:**
```
✅ Preloader appeared
⏱ Time from Preloader to Checkout: 11.79s
✅ Checkout page loaded successfully

1 passed (49.8s)
```

---

## Test Result Screenshots & Videos

> 📁 All evidence auto-captured by Playwright during test run.
> Location: `../test-results/preloader-preview-to-checkout/`

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
![Preloader Screen](../test-results/preloader-preview-to-checkout/03-preloader-screen.png)

### Step 4 — Checkout Page
![Checkout Page](../test-results/preloader-preview-to-checkout/04-checkout-page.png)

### 🎥 Video Recording
> Full flow video: [`preview-to-checkout-flow.webm`](../test-results/preloader-preview-to-checkout/preview-to-checkout-flow.webm)

---

## UX Observations

- ✅ Preloader gives users visual feedback during the wait — reduces drop-off
- ✅ "256-bit SSL encrypted" badge on preloader builds trust
- ✅ Step-by-step progress animation feels professional
- ⚠️ No error/timeout state if backend takes too long — recommend adding a fallback message after 20s
- ⚠️ No back-button handling on preloader — user could get stuck if they navigate back

---

## Recommendations

1. Add a **timeout fallback** on the preloader (e.g., after 20s show "Taking longer than expected...")
2. Disable browser back navigation during preloader to prevent broken state
3. Monitor preloader duration in production — alert if median exceeds 15s
