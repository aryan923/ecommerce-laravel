# Test Cases Matrix: Frontend CMS & Dynamic Content (Module 14)

## 1. Overview
This document defines the automated and manual test cases matrix for Frontend Module 14 (Frontend CMS & Dynamic Content). It verifies storefront banner rendering, dynamic `/pages/[slug]` HTML body rendering, SEO metadata binding, and 404 error fallback handling.

---

## 2. Test Cases Matrix

| Test ID | Category | Description | Input / Condition | Expected Result | Priority |
|---|---|---|---|---|---|
| **TC-FCMS-001** | Happy Path | Dynamic Hero Slider Banner Fetch | Visit Homepage `/`, API returns 2 active banners for `placement=home_hero` | Hero slider renders banner image, title overlay, CTA link, and slide navigation arrows | High |
| **TC-FCMS-002** | Happy Path | Dynamic CMS Page Render by Slug | Navigate to `/pages/privacy-policy` | HTTP 200 OK, page title "Privacy Policy", breadcrumb, and HTML body rendered | High |
| **TC-FCMS-003** | Happy Path | Dynamic SEO Metadata Generation | Inspect `<head>` tags on `/pages/privacy-policy` | `<title>` tag contains `seo_title` ("Privacy Policy \| E-Commerce Store") and meta description contains `seo_description` | High |
| **TC-FCMS-004** | Happy Path | Policy Route Shortcut (`/terms`) | Visit `/terms` | Page fetches backend slug `terms-and-conditions` and renders dynamic HTML content | High |
| **TC-FCMS-005** | Negative | Missing Page Slug Fallback 404 | Visit `/pages/non-existent-page-slug-999` | Renders clean custom "404 - Page Not Found" UI card with "Back to Home" button | High |
| **TC-FCMS-006** | Negative | Draft Page Restricted Access | Page status is `'draft'`, visit `/pages/secret-draft` | Backend returns 404, frontend displays 404 Not Found card | High |
| **TC-FCMS-007** | Fallback | Hero Slider API Fallback | API returns empty array or 500 server error | HeroSlider renders curated default promo slide without breaking layout | Medium |
| **TC-FCMS-008** | Navigation | Footer Policy Link Navigation | Click "Privacy Policy" link in storefront footer | Smooth client-side transition to `/pages/privacy-policy` | High |
| **TC-FCMS-009** | Component | Responsive Mobile Banner Switch | Shrink viewport < 768px | Banner image switches to `image_mobile` if present | Medium |
| **TC-FCMS-010** | E2E | Full Playwright E2E Spec | Run `npx playwright test cms.spec.js` | All Playwright CMS spec assertions pass exit code 0 | High |

---

## 3. Playwright E2E Test Suite Outline (`cms.spec.js`)

```javascript
test.describe('Module 14: Frontend CMS & Dynamic Content', () => {
  test('Hero slider fetches and renders active banners', async ({ page }) => { ... });
  test('Dynamic page route /pages/[slug] renders HTML body and breadcrumbs', async ({ page }) => { ... });
  test('SEO metadata tags populate dynamically from backend payload', async ({ page }) => { ... });
  test('Invalid page slug displays 404 Not Found fallback card', async ({ page }) => { ... });
  test('Footer policy links navigate to dynamic CMS page URLs', async ({ page }) => { ... });
});
```
