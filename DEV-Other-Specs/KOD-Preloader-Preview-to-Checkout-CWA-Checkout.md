# Final QA Report — KOD Preloader Between Preview & Checkout

**Project:** CWA MVP — Checkout Flow
**Property:** KOD (Dodge Window Sticker)
**Feature:** Preloader Screen (Preview → Checkout Transition)
**Environment:** DEV
**Test Date:** Friday, 24 April 2026
**Prepared By:** Shahnawaz (QA Engineer)
**Report Status:** ✅ PASSED

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| Property | KOD — Dodge Window Sticker |
| Feature | Preloader between Preview → Checkout |
| Total Test Cases | 7 |
| Passed | 7 |
| Failed | 0 |
| Automation | Playwright v1.59.1 |
| Overall Result | ✅ PASSED |

---

## 2. Feature Description

When a user lands on the **Preview page**, clicks **"Access Records"**, a popup "Get your Window Sticker" appears. After entering email and clicking **"Access Records"** inside the popup, the user sees a **Preloader screen** ("Preparing Your Checkout") before being redirected to Checkout.

---

## 3. Test Environment

| Item | Detail |
|------|--------|
| VIN Tested | `1FM5K7F88HGC38165` (2017 Ford Explorer) |
| Preview URL | `https://dev.dodgewindowsticker.com/vin-check/ws-preview?vin=1FM5K7F88HGC38165&type=sticker&wpPage=homepage` |
| Checkout URL | `https://dev.dodgewindowsticker.com/checkout?type=sticker&data=...` |
| Report Type | Window Sticker |
| Browser | Chromium (Playwright) |
| Test Tool | Playwright v1.59.1 |

---

## 4. Test Cases & Results

| # | Test Case | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| TC-01 | Open Preview page | Page loads | Page loaded | ✅ Pass |
| TC-02 | Click "Access Records" on page | Popup appears | "Get your Window Sticker" popup appeared | ✅ Pass |
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
| Preloader → Checkout navigation time | **10.15 seconds** |
| Total test execution time | **30.1 seconds** |

> ✅ 10.15s is within acceptable range.
> ⚠️ Recommended alert threshold: **20 seconds** in production.

---

## 6. Evidence

All evidence auto-captured by Playwright during the test run.

| File | Description |
|------|-------------|
| [`01-KOD-preview-page.png`](../test-results/KOD-preloader-preview-to-checkout/01-KOD-preview-page.png) | Preview page on load |
| [`02-KOD-email-popup.png`](../test-results/KOD-preloader-preview-to-checkout/02-KOD-email-popup.png) | "Get your Window Sticker" popup with email entered |
| [`03-KOD-preloader-screen.png`](../test-results/KOD-preloader-preview-to-checkout/03-KOD-preloader-screen.png) | Preloader — "Preparing Your Checkout" |
| [`04-KOD-checkout-page.png`](../test-results/KOD-preloader-preview-to-checkout/04-KOD-checkout-page.png) | Checkout page after redirect |
| [`KOD-preview-to-checkout-flow.webm`](../test-results/KOD-preloader-preview-to-checkout/KOD-preview-to-checkout-flow.webm) | 🎥 Full screen recording |

### Step 1 — Preview Page
![Preview Page](../test-results/KOD-preloader-preview-to-checkout/01-KOD-preview-page.png)

### Step 2 — Email Popup
![Email Popup](../test-results/KOD-preloader-preview-to-checkout/02-KOD-email-popup.png)

### Step 3 — Preloader Screen
![Preloader](../test-results/KOD-preloader-preview-to-checkout/03-KOD-preloader-screen.png)

### Step 4 — Checkout Page
![Checkout](../test-results/KOD-preloader-preview-to-checkout/04-KOD-checkout-page.png)

### 🎥 Video Recording
> [`KOD-preview-to-checkout-flow.webm`](../test-results/KOD-preloader-preview-to-checkout/KOD-preview-to-checkout-flow.webm)

---

## 7. Automation Script

**File:** `code/KOD-preloader-checkout.spec.js`

```
Console Output:
✅ KOD Preloader appeared
⏱ KOD Time from Preloader to Checkout: 10.15s
✅ KOD Checkout page loaded successfully

1 passed (30.1s)
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
*Part of CWA MVP Checkout QA cycle — KOD Property.*
