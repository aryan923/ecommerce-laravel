# Regression Test Matrix: Frontend CMS & Dynamic Content (Module 14)

## 1. Overview
This document outlines system regression risks and verification checklists for Frontend Module 14 (Frontend CMS & Dynamic Content). Connecting storefront banners and informational pages dynamically to backend APIs impacts homepage rendering, footer navigation, policy route shortcuts, SEO metadata indexing, and client-side page routing.

---

## 2. Affected System Components

- **Homepage Hero Slider (`HeroSlider.jsx`)**: Must gracefully render active banners or default fallback without layout shift.
- **Footer Component (`Footer.jsx`)**: Links to dynamic CMS page routes (`/pages/privacy-policy`, `/pages/terms-and-conditions`, etc.).
- **Legacy Informational Routes (`/about`, `/privacy`, `/terms`, `/shipping-policy`)**: Must dynamically load CMS page content without broken routes.
- **SEO Metadata Indexing (`generateMetadata`)**: Must export dynamic `<title>` and `<meta name="description">` tags for Next.js App Router.
- **React Admin Panel Synchronization**: Updates published in React Admin Panel (`BannersPage.jsx`, `PagesPage.jsx`, `PageEditorModal.jsx`) must reflect on storefront immediately.

---

## 3. Regression Checklist

| Scenario ID | Affected Component | Regression Test Procedure | Expected Result | Risk Level |
|---|---|---|---|---|
| **REG-FCMS-001** | Homepage Hero Carousel | Visit `/` with backend active banners | Hero slider loads banners from API, autoplays, and handles slide clicks without layout breaking | High |
| **REG-FCMS-002** | Footer Policy Links | Click "Privacy Policy" or "Terms" link in storefront footer | Directs to `/pages/privacy-policy`, displaying dynamic title, breadcrumb, and HTML body | High |
| **REG-FCMS-003** | Dynamic SEO Meta Tags | Inspect DOM head on dynamic page route | `<title>` contains `seo_title` from backend; `<meta name="description">` contains `seo_description` | High |
| **REG-FCMS-004** | HTML Sanitization & Styling | View CMS page containing headings, lists, bold text, links | Content renders safely with consistent prose typography and working hyperlinks | High |
| **REG-FCMS-005** | API Down / Offline Fallback | Block network call to `/api/v1/banners` | Hero slider falls back to default slide without crashing storefront | Medium |
| **REG-FCMS-006** | React Admin SPA Sync | Publish new page in Admin Panel (`/admin/pages`) | Page becomes accessible on storefront at `/pages/{slug}` immediately | High |

---

## 4. Smoke Verification Suite

Run the following automated commands before declaring Module 14 complete:
1. `cd frontend && npx playwright test tests/e2e/cms.spec.js`
2. Verify homepage hero slider displays live banners.
3. Verify `/pages/privacy-policy` renders dynamic content and SEO metadata.
