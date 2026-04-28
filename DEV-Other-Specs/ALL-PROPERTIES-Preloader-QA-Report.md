# Final QA Report — Preloader (Preview → Checkout) All Properties

**Project:** CWA MVP — Checkout Flow
**Feature:** Preloader Screen Between Preview & Checkout
**Environment:** DEV
**Test Date:** Friday, 24 April 2026
**Prepared By:** Shahnawaz (QA Engineer)
**Overall Status:** ✅ ALL PASSED

---

## Summary

| Property | VIN | Preloader Time | Total Run | Result |
|----------|-----|---------------|-----------|--------|
| CWA | `1FTFW1ET2DFD78356` | 11.59s | 1m 6s | ✅ Pass |
| KOD | `1FM5K7F88HGC38165` | 10.15s | 30.1s | ✅ Pass |
| VNCA | `WDDGF8AB2EG181635` | 10.91s | 24.9s | ✅ Pass |
| VHREU | `2C3CDXCT0GH126868` | 12.50s | 39.7s | ✅ Pass |

---

## Test Cases (Same for All Properties)

| # | Step | Status |
|---|------|--------|
| TC-01 | Open Preview page | ✅ Pass |
| TC-02 | Click "Access Records" — popup appears | ✅ Pass |
| TC-03 | Enter email in popup | ✅ Pass |
| TC-04 | Submit → Preloader "Preparing Your Checkout" visible | ✅ Pass |
| TC-05 | Preloader 4-step animation displayed | ✅ Pass |
| TC-06 | Auto-redirect to Checkout page | ✅ Pass |
| TC-07 | Checkout page loads with "Choose payment method" | ✅ Pass |

**Total: 28/28 test cases passed across all 4 properties**

---

## Property Details

### 1. CWA
- **URL:** `https://developtestsite.com/members/vin-check/preview?type=vhr&...&vin=1FTFW1ET2DFD78356`
- **Vehicle:** 2013 Ford F150
- **Popup:** "Access Records" popup with email field
- **Submit Button:** Access Records
- **Preloader → Checkout:** 11.59s

### 2. KOD (Dodge Window Sticker)
- **URL:** `https://dev.dodgewindowsticker.com/vin-check/ws-preview?vin=1FM5K7F88HGC38165&type=sticker`
- **Vehicle:** 2017 Ford Explorer
- **Popup:** "Get your Window Sticker" with email field
- **Submit Button:** Access Records
- **Preloader → Checkout:** 10.15s

### 3. VNCA (VIN Check Advisor)
- **URL:** `https://dev.developtestsite.com/vin-check/preview?vin=WDDGF8AB2EG181635&type=vhr`
- **Vehicle:** 2014 Mercedes Benz C300
- **Popup:** "Secure Your Report" with email field
- **Submit Button:** Get My Report Now
- **Preloader → Checkout:** 10.91s

### 4. VHREU (Access Auto History EU)
- **URL:** `https://vhreu.accessautohistory.com/vin-check/preview?vin=2C3CDXCT0GH126868&type=vhr`
- **Vehicle:** 2016 Dodge Charger
- **Popup:** "Secure Your Report" with email field
- **Submit Button:** Access Records
- **Preloader → Checkout:** 12.50s

---

## Test Evidence

### CWA
| Step | Screenshot |
|------|-----------|
| Preview Page | ![](../test-results/preloader-preview-to-checkout/01-preview-page.png) |
| Email Popup | ![](../test-results/preloader-preview-to-checkout/02-email-popup.png) |
| Preloader | ![](../test-results/preloader-preview-to-checkout/03-preloader-screen.png) |
| Checkout | ![](../test-results/preloader-preview-to-checkout/04-checkout-page.png) |
| 🎥 Video | [preview-to-checkout-flow.webm](../test-results/preloader-preview-to-checkout/preview-to-checkout-flow.webm) |

### KOD
| Step | Screenshot |
|------|-----------|
| Preview Page | ![](../test-results/KOD-preloader-preview-to-checkout/01-KOD-preview-page.png) |
| Email Popup | ![](../test-results/KOD-preloader-preview-to-checkout/02-KOD-email-popup.png) |
| Preloader | ![](../test-results/KOD-preloader-preview-to-checkout/03-KOD-preloader-screen.png) |
| Checkout | ![](../test-results/KOD-preloader-preview-to-checkout/04-KOD-checkout-page.png) |
| 🎥 Video | [KOD-preview-to-checkout-flow.webm](../test-results/KOD-preloader-preview-to-checkout/KOD-preview-to-checkout-flow.webm) |

### VNCA
| Step | Screenshot |
|------|-----------|
| Preview Page | ![](../test-results/VNCA-preloader-preview-to-checkout/01-VNCA-preview-page.png) |
| Email Popup | ![](../test-results/VNCA-preloader-preview-to-checkout/02-VNCA-email-popup.png) |
| Preloader | ![](../test-results/VNCA-preloader-preview-to-checkout/03-VNCA-preloader-screen.png) |
| Checkout | ![](../test-results/VNCA-preloader-preview-to-checkout/04-VNCA-checkout-page.png) |
| 🎥 Video | [VNCA-preview-to-checkout-flow.webm](../test-results/VNCA-preloader-preview-to-checkout/VNCA-preview-to-checkout-flow.webm) |

### VHREU
| Step | Screenshot |
|------|-----------|
| Preview Page | ![](../test-results/VHREU-preloader-preview-to-checkout/01-VHREU-preview-page.png) |
| Email Popup | ![](../test-results/VHREU-preloader-preview-to-checkout/02-VHREU-email-popup.png) |
| Preloader | ![](../test-results/VHREU-preloader-preview-to-checkout/03-VHREU-preloader-screen.png) |
| Checkout | ![](../test-results/VHREU-preloader-preview-to-checkout/04-VHREU-checkout-page.png) |
| 🎥 Video | [VHREU-preview-to-checkout-flow.webm](../test-results/VHREU-preloader-preview-to-checkout/VHREU-preview-to-checkout-flow.webm) |

---

## Automation

| Property | Spec File |
|----------|-----------|
| CWA | `code/preloader-checkout.spec.js` |
| KOD | `code/KOD-preloader-checkout.spec.js` |
| VNCA | `code/VNCA-preloader-checkout.spec.js` |
| VHREU | `code/VHREU-preloader-checkout.spec.js` |

---

## Recommendations

- ⚠️ Add timeout fallback on preloader if redirect exceeds 20s
- ⚠️ Disable browser back navigation during preloader to prevent broken state
- ⚠️ Monitor preloader duration in production — alert if median exceeds 15s

---

## Sign-off

| Role | Name | Status |
|------|------|--------|
| QA Engineer | Shahnawaz | ✅ Complete |
| Developer | — | ⏳ Pending |
| Product Owner | — | ⏳ Pending |

---
*Playwright v1.59.1 — 24 April 2026*
