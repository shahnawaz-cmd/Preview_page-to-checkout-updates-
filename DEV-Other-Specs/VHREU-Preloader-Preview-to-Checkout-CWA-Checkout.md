# Final QA Report — VHREU Preloader Between Preview & Checkout

**Project:** CWA MVP — Checkout Flow
**Property:** VHREU (Access Auto History — EU)
**Feature:** Preloader Screen (Preview → Checkout Transition)
**Environment:** DEV
**Test Date:** Friday, 24 April 2026
**Prepared By:** Shahnawaz (QA Engineer)
**Report Status:** ✅ PASSED

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| Property | VHREU — Access Auto History EU |
| Feature | Preloader between Preview → Checkout |
| Total Test Cases | 7 |
| Passed | 7 |
| Failed | 0 |
| Automation | Playwright v1.59.1 |
| Overall Result | ✅ PASSED |

---

## 2. Feature Description

When a user lands on the **Preview page**, clicks **"Access Records"**, a popup "Secure Your Report" appears. After entering email and clicking **"Access Records"** inside the popup, the user sees a **Preloader screen** ("Preparing Your Checkout") before being redirected to Checkout.

---

## 3. Test Environment

| Item | Detail |
|------|--------|
| VIN Tested | `2C3CDXCT0GH126868` (2016 Dodge Charger) |
| Preview URL | `https://vhreu.accessautohistory.com/vin-check/preview?vin=2C3CDXCT0GH126868&type=vhr&wpPage=homepage` |
| Checkout URL | `https://vhreu.accessautohistory.com/checkout?type=vhr&data=...` |
| Report Type | VHR (Vehicle History Report) |
| Browser | Chromium (Playwright) |
| Test Tool | Playwright v1.59.1 |

---

## 4. Test Cases & Results

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| TC-01 | Open Preview page | Page loads | Page loaded | ✅ Pass |
| TC-02 | Click "Access Records" on page | Popup appears | "Secure Your Report" popup appeared | ✅ Pass |
| TC-03 | Enter email in popup | Email field accepts input | Email entered successfully | ✅ Pass |
| TC-04 | Click "Access Records" in popup | Preloader appears | Preloader visible — "Preparing Your Checkout" | ✅ Pass |
| TC-05 | Preloader progress steps visible | 4 steps shown | Steps displayed correctly | ✅ Pass |
| TC-06 | Auto-redirect to Checkout | Navigates to `/checkout` | Redirected correctly | ✅ Pass |
| TC-07 | Checkout page loads | "Choose payment method" visible | Checkout loaded | ✅ Pass |

---

## 5. Timing

| Metric | Value |
|--------|-------|
| Preloader appeared after submit | < 1 second |
| Preloader → Checkout navigation time | **12.50 seconds** |
| Total test execution time | **39.7 seconds** |

> ✅ 12.50s is within acceptable range.
> ⚠️ Recommended alert threshold: **20 seconds** in production.

---

## 6. Evidence

All evidence auto-captured by Playwright during the test run.

| File | Description |
|------|-------------|
| [`01-VHREU-preview-page.png`](../test-results/VHREU-preloader-preview-to-checkout/01-VHREU-preview-page.png) | Preview page on load |
| [`02-VHREU-email-popup.png`](../test-results/VHREU-preloader-preview-to-checkout/02-VHREU-email-popup.png) | "Secure Your Report" popup with email entered |
| [`03-VHREU-preloader-screen.png`](../test-results/VHREU-preloader-preview-to-checkout/03-VHREU-preloader-screen.png) | Preloader — "Preparing Your Checkout" |
| [`04-VHREU-checkout-page.png`](../test-results/VHREU-preloader-preview-to-checkout/04-VHREU-checkout-page.png) | Checkout page after redirect |
| [`VHREU-preview-to-checkout-flow.webm`](../test-results/VHREU-preloader-preview-to-checkout/VHREU-preview-to-checkout-flow.webm) | 🎥 Full screen recording |

### Step 1 — Preview Page
![Preview Page](../test-results/VHREU-preloader-preview-to-checkout/01-VHREU-preview-page.png)

### Step 2 — Email Popup
![Email Popup](../test-results/VHREU-preloader-preview-to-checkout/02-VHREU-email-popup.png)

### Step 3 — Preloader Screen
![Preloader](../test-results/VHREU-preloader-preview-to-checkout/03-VHREU-preloader-screen.png)

### Step 4 — Checkout Page
![Checkout](../test-results/VHREU-preloader-preview-to-checkout/04-VHREU-checkout-page.png)

### 🎥 Video Recording
> [`VHREU-preview-to-checkout-flow.webm`](../test-results/VHREU-preloader-preview-to-checkout/VHREU-preview-to-checkout-flow.webm)

---

## 7. Automation Script

**File:** `code/VHREU-preloader-checkout.spec.js`

```
Console Output:
✅ VHREU Preloader appeared
⏱ VHREU Time from Preloader to Checkout: 12.50s
✅ VHREU Checkout page loaded successfully

1 passed (39.7s)
```

---

## 8. UX Observations

| | Observation | Severity |
|---|-------------|----------|
| ✅ | Preloader provides clear visual feedback during backend processing | — |
| ✅ | "256-bit SSL encrypted" badge builds trust | — |
| ✅ | VIN and email correctly passed through to Checkout | — |
| ⚠️ | No timeout/error state if backend takes > 20s | Low |
| ⚠️ | Browser back button during preloader may cause broken state | Low |

---

## 9. Sign-off

| Role | Name | Status |
|------|------|--------|
| QA Engineer | Shahnawaz | ✅ Verified & Report Complete |
| Developer | — | ⏳ Pending Review |
| Product Owner | — | ⏳ Pending Sign-off |

---

*Automated test evidence captured via Playwright v1.59.1 on 24 April 2026.*
*Part of CWA MVP Checkout QA cycle — VHREU Property.*
