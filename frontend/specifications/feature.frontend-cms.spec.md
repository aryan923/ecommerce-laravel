# Feature Specification: Frontend CMS & Dynamic Content Module

**Module Name:** Frontend CMS & Dynamic Content  
**Module ID:** 14 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-cms.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 14), `frontend/Requirements/srs_pages.md`  

---

## 1. Module Overview

The **Frontend CMS & Dynamic Content** module connects storefront promotional marketing components and dynamic content pages directly to the Laravel backend CMS API (`/api/v1/banners` & `/api/v1/pages/{slug}`). It enables store administrators to dynamically control homepage hero carousels, category promo banners, popups, and policy/informational pages (About Us, Privacy Policy, Terms & Conditions, Shipping Policy, Return Policy, FAQs) directly from the React Admin Panel without deploying code changes.

The module encompasses:
1. **Dynamic Homepage Hero Banner (`HeroSlider.jsx` / `HeroBanner.jsx`)**: Fetches active hero banners (`placement=home_hero`) from `GET /api/v1/banners`, rendering responsive desktop/mobile imagery, title overlays, CTA hyperlinks (`link_url`), and action button captions (`button_text`). Fallbacks to default promotional slides if API is empty or loading.
2. **Dynamic Promo Banners (`PromoBanner.jsx`, `CategoryHeaderBanner.jsx`, `PopupBanner.jsx`)**: Renders promotional placements across storefront category pages, sidebars, footers, and modal popups (`placement=category_banner`, `sidebar`, `footer`, `popup`).
3. **Dynamic CMS Page Renderer (`/pages/[slug]`)**: Next.js App Router dynamic route (`frontend/src/app/pages/[slug]/page.js`) that fetches published page payload from `GET /api/v1/pages/{slug}`. Renders HTML body content safely inside styled prose containers, breadcrumbs, and last updated timestamps.
4. **Dynamic SEO Metadata Generator**: Implements Next.js `generateMetadata` function on `/pages/[slug]` and policy shortcut routes to dynamically bind backend `seo_title` and `seo_description` metadata for search engine indexing.
5. **Legacy Policy Route Shortcuts (`/about`, `/privacy`, `/terms`, `/shipping-policy`)**: Connects legacy storefront routes to fetch dynamic CMS pages (`about-us`, `privacy-policy`, `terms-and-conditions`, `shipping-policy`) from the backend.
6. **Dynamic Footer & Navigation Links**: Configures `Footer.jsx` to dynamically render policy navigation items pointing to published backend CMS page slugs.

---

## 2. Architecture & Component Flow

```
+-----------------------------------------------------------------------------------+
|                         STOREFRONT FRONTEND CMS FLOW                              |
+-----------------------------------------------------------------------------------+

     Storefront User Visits Homepage (/)
                    │
                    ▼
     `HeroSlider.jsx` calls `GET /api/v1/banners?placement=home_hero`
                    │
                    ▼
     Render Active Banners (Desktop Image / Mobile Image / CTA Link / Button Label)

-------------------------------------------------------------------------------------

     Storefront User Visits `/pages/{slug}` (or `/privacy`, `/terms`, `/about`)
                    │
                    ▼
     `generateMetadata()` fetches `GET /api/v1/pages/{slug}` -> Bind SEO Title & Meta Desc
                    │
                    ▼
     `DynamicPageClient.jsx` fetches `GET /api/v1/pages/{slug}`
                    │
                    ├──────────────────────────────────────┐
                    ▼                                      ▼
             [ HTTP 200 OK ]                        [ HTTP 404 Not Found ]
                    │                                      │
                    ▼                                      ▼
     Render Breadcrumbs, Title,              Render Custom Next.js 404
     Sanitized HTML Body, Last Updated      "Page Not Found" Fallback UI
```

---

## 3. Data Models & API Contracts

### 3.1 Storefront Banners Endpoint (`GET /api/v1/banners`)

- **Method**: `GET`
- **Request URL**: `/api/v1/banners?placement=home_hero`
- **Headers**: `Accept: application/json`

#### Sample Success Response Payload (`200 OK`):
```json
{
  "success": true,
  "message": "Banners retrieved successfully.",
  "data": [
    {
      "id": 1,
      "title": "Summer Super Sale",
      "image_desktop": "/storage/banners/summer_desktop.jpg",
      "image_mobile": "/storage/banners/summer_mobile.jpg",
      "link_url": "/category/summer-collection",
      "button_text": "Shop Sale Now",
      "placement": "home_hero",
      "sort_order": 1
    },
    {
      "id": 2,
      "title": "New Tech Electronics Launch",
      "image_desktop": "/storage/banners/tech_desktop.jpg",
      "image_mobile": "/storage/banners/tech_mobile.jpg",
      "link_url": "/category/electronics",
      "button_text": "Explore Tech",
      "placement": "home_hero",
      "sort_order": 2
    }
  ],
  "errors": null
}
```

---

### 3.2 Storefront CMS Page Endpoint (`GET /api/v1/pages/{slug}`)

- **Method**: `GET`
- **Request URL**: `/api/v1/pages/{slug}` (e.g. `/api/v1/pages/privacy-policy`)
- **Headers**: `Accept: application/json`

#### Sample Success Response Payload (`200 OK`):
```json
{
  "success": true,
  "message": "Page retrieved successfully.",
  "data": {
    "id": 2,
    "title": "Privacy Policy",
    "slug": "privacy-policy",
    "content": "<h1>Privacy Policy</h1><p>We respect your data and privacy online...</p>",
    "seo_title": "Privacy Policy | E-Commerce Store",
    "seo_description": "Read our official store privacy policy, cookie policy, and data protection terms.",
    "updated_at": "2026-09-17T12:00:00.000000Z"
  },
  "errors": null
}
```

#### Sample Error Response Payload (`404 Not Found`):
```json
{
  "success": false,
  "message": "Page not found.",
  "data": null
}
```

---

## 4. Component Specifications

### 4.1 Dynamic Hero Slider (`frontend/src/components/home/HeroSlider.jsx`)
- **API Call**: `GET /api/v1/banners?placement=home_hero`
- **Behavior**:
  - Displays autoplay carousel with next/prev arrows and dot indicators.
  - Automatically handles responsive image switching: uses `image_mobile` when viewport < 768px (if present), else uses `image_desktop`.
  - Clicking banner or CTA button navigates to `link_url` via Next.js `Link`.
  - Fallback: Renders default curated hero slide if API request returns empty array or fails.

### 4.2 Dynamic Page Renderer (`frontend/src/app/pages/[slug]/page.js` & `DynamicPageClient.jsx`)
- **API Call**: `GET /api/v1/pages/{slug}`
- **Behavior**:
  - `generateMetadata()`: Fetches page payload server-side and returns `{ title: data.seo_title || data.title, description: data.seo_description }`.
  - Renders Breadcrumbs (`Home > Pages > [Page Title]`).
  - Renders Page Headline `<h1>` and updated date badge.
  - Renders HTML body content safely via `dangerouslySetInnerHTML={{ __html: page.content }}` inside a styled prose wrapper (`.cms-prose-content`).
  - Skeleton Loading State: Renders title skeleton and 4 content paragraph pulse bars during data load.
  - 404 Fallback: If page status is draft or slug not found, renders clean "404 - Page Not Found" error card with "Back to Home" button.

### 4.3 Policy Route Shortcuts (`/about`, `/privacy`, `/terms`, `/shipping-policy`)
- **Files**:
  - `frontend/src/app/about/page.js` -> Maps to `/pages/about-us`
  - `frontend/src/app/privacy/page.js` -> Maps to `/pages/privacy-policy`
  - `frontend/src/app/terms/page.js` -> Maps to `/pages/terms-and-conditions`
  - `frontend/src/app/shipping-policy/page.js` -> Maps to `/pages/shipping-policy`
- **Behavior**: Renders dynamic CMS content matching each policy slug from backend API.

### 4.4 Dynamic Footer Policy Links (`frontend/src/components/layout/Footer.jsx`)
- Navigates to `/pages/about-us`, `/pages/privacy-policy`, `/pages/terms-and-conditions`, `/pages/shipping-policy`, and `/pages/faqs`.

---

## 5. Non-Functional & Acceptance Criteria

1. **SEO Compliance**: Dynamic meta tags generated on all CMS pages using Next.js App Router metadata API.
2. **HTML Styling & Responsive Typography**: CMS HTML content supports headings (`h1`-`h6`), bullet lists, bold text, links, tables, and blockquotes with consistent storefront typography and theme styling.
3. **Graceful Error Handling**: API timeout or network error displays toast error or fallback static content without crashing Next.js application.
4. **E2E Playwright Test Coverage**: Verified by Playwright test suite `frontend/tests/e2e/cms.spec.js`.
