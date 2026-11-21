# Implementation Plan: Frontend CMS & Dynamic Content (Module 14)

## 1. Module Summary

Module 14 connects storefront marketing components (hero banners, promo banners) and dynamic policy pages (About Us, Privacy Policy, Terms, Shipping Policy, FAQs) to backend CMS API endpoints (`GET /api/v1/banners` & `GET /api/v1/pages/{slug}`). All storefront marketing imagery and policy text become 100% manageable in real time from the React Admin Panel.

---

## 2. Development Strategy

1. **API Client Helper Functions**:
   - Add CMS & Banner API methods in `frontend/src/lib/cms-api.js` (or `api-client.js`): `getBanners(placement)`, `getPageBySlug(slug)`.

2. **Homepage Hero Slider Component**:
   - Refactor `HeroSlider.jsx` (`frontend/src/components/home/HeroSlider.jsx`) to fetch active hero banners from `GET /api/v1/banners?placement=home_hero`.
   - Implement responsive desktop/mobile image switching, CTA links, button labels, auto-play, and fallback slide if API returns empty array.

3. **Dynamic CMS Page Renderer (`/pages/[slug]`)**:
   - Create Next.js App Router dynamic route: `frontend/src/app/pages/[slug]/page.js`.
   - Implement `generateMetadata({ params })` to fetch page SEO metadata (`seo_title`, `seo_description`) for Next.js App Router metadata export.
   - Build `DynamicPageClient.jsx` component displaying breadcrumbs, page headline, updated timestamp, styled HTML content container (`dangerouslySetInnerHTML`), loading pulse skeleton bars, and 404 Not Found fallback UI.

4. **Policy Shortcuts & Footer Navigation**:
   - Update policy pages (`/about`, `/privacy`, `/terms`, `/shipping-policy`) to load dynamic page content matching backend slugs (`about-us`, `privacy-policy`, `terms-and-conditions`, `shipping-policy`).
   - Update `Footer.jsx` links to point to dynamic CMS page routes.

5. **Playwright E2E Automated Testing**:
   - Create `frontend/tests/e2e/cms.spec.js` testing hero slider API integration, dynamic `/pages/[slug]` HTML fetch, SEO metadata generation, and 404 fallback handling.
   - Run `npm run test:e2e` to verify 100% pass rate.

---

## 3. Architecture & Component Structure

```text
Frontend Architecture:
├── frontend/src/lib/
│   └── cms-api.js
├── frontend/src/components/home/
│   └── HeroSlider.jsx
├── frontend/src/components/cms/
│   └── DynamicPageClient.jsx
├── frontend/src/app/
│   ├── pages/
│   │   └── [slug]/
│   │       └── page.js
│   ├── about/
│   │   └── page.js
│   ├── privacy/
│   │   └── page.js
│   ├── terms/
│   │   └── page.js
│   └── shipping-policy/
│       └── page.js
└── frontend/tests/e2e/
    └── cms.spec.js
```

---

## 4. Task Breakdown

- [x] **Task 1: API Helper Methods (`cms-api.js`)**
  - Implement `fetchBanners(placement)` and `fetchPageBySlug(slug)` using `apiClient`.

- [x] **Task 2: Dynamic Storefront Hero Slider (`HeroSlider.jsx`)**
  - Update `HeroSlider.jsx` to fetch active banners from `GET /api/v1/banners?placement=home_hero`.
  - Render desktop/mobile imagery, CTA target link, button caption, auto-play carousel controls, and default fallback.

- [x] **Task 3: Dynamic Page Route (`/pages/[slug]/page.js`)**
  - Create dynamic route `frontend/src/app/pages/[slug]/page.js`.
  - Implement `generateMetadata` fetching `seo_title` and `seo_description` from API.

- [x] **Task 4: Dynamic Page Client Component (`DynamicPageClient.jsx`)**
  - Build `DynamicPageClient.jsx` rendering breadcrumbs, title, updated date, sanitized HTML body container (`.cms-prose-content`), skeleton loader, and 404 Not Found card.

- [x] **Task 5: Policy Route Shortcuts & Footer Navigation**
  - Update `/about`, `/privacy`, `/terms`, `/shipping-policy` pages to render dynamic page components matching backend slugs.
  - Update `Footer.jsx` links to point to dynamic CMS page routes.

- [x] **Task 6: E2E Playwright Automation & Verification**
  - Create `frontend/tests/e2e/cms.spec.js` covering hero slider banner render, dynamic CMS page load, SEO metadata check, and 404 page fallback.
  - Execute `npm run test:e2e` and verify 100% pass rate.
