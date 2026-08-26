# Feature Specification: Frontend Home Page Storefront Module

**Module Name:** Frontend Home Page Storefront  
**Module ID:** 03 (Frontend)  
**Specification File:** `specifications/feature.frontend-home.spec.md`  
**Version:** 1.0  
**Status:** Draft / Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 03), `frontend/Requirements/srs_pages.md` (§2.1)  

---

## 1. Module Overview

The **Home Page Storefront** module is the high-converting, visually rich landing page at `frontend/src/app/page.js`. It presents interactive promotional hero sliders, featured category banners, tabbed product carousels (Featured, New Arrivals, Best Sellers), promotional coupon banners, brand logo grids, value proposition trust badges, and recently viewed items. It connects to backend API endpoints for categories (`GET /api/v1/categories`), brands (`GET /api/v1/brands`), and catalog products (`GET /api/v1/products`).

---

## 2. Page Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            HeroSlider (Promotional Banners)                       |
+-----------------------------------------------------------------------------------+
|                        TrustBadges (Value Propositions)                           |
+-----------------------------------------------------------------------------------+
|                      CategoryBanners (Top Category Grid)                          |
+-----------------------------------------------------------------------------------+
|             ProductSection (Tabbed: Featured | New Arrivals | Best Sellers)       |
+-----------------------------------------------------------------------------------+
|                   PromoBanner (Discount Code & Coupon Callout)                    |
+-----------------------------------------------------------------------------------+
|                         BrandGrid (Top Brand Logo Showcase)                       |
+-----------------------------------------------------------------------------------+
|                       RecentlyViewed (LocalStorage Products)                       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Functional Requirements

- **FR-FHM-001**: System shall render the Home page at `frontend/src/app/page.js` with metadata titled "ECOMSTORE | Online Electronics, Fashion & Home Shopping".
- **FR-FHM-002**: System shall provide `HeroSlider.jsx` rendering animated promotional slide banners with titles, subtitles, background images, and "Shop Now" CTAs linking to `/products`.
- **FR-FHM-003**: System shall provide `TrustBadges.jsx` displaying value icons for Free Shipping, Secure Payments, 30-Day Returns, and 24/7 Support.
- **FR-FHM-004**: System shall provide `CategoryBanners.jsx` fetching categories from `GET /api/v1/categories` and displaying a 4-column responsive grid with images, titles, product counts, and link overlays to `/category/[slug]`.
- **FR-FHM-005**: System shall provide `ProductSection.jsx` rendering interactive tabs: **Featured**, **New Arrivals**, and **Best Sellers**.
  - Selecting **Featured** queries `GET /api/v1/products?featured=1&limit=8`.
  - Selecting **New Arrivals** queries `GET /api/v1/products?sort=latest&limit=8`.
  - Selecting **Best Sellers** queries `GET /api/v1/products?sort=popular&limit=8`.
- **FR-FHM-006**: Products rendered inside `ProductSection` shall use a reusable `ProductCard.jsx` displaying primary image, product title, category name, rating stars, price formatted via `CurrencyContext`, discount % badge, quick "Add to Cart" button (triggering `CartContext.addItem`), and Wishlist heart toggle.
- **FR-FHM-007**: System shall provide `PromoBanner.jsx` featuring active promotional banners with discount coupon callout (e.g. `WELCOME20`), countdown timer, and "Claim Discount" CTA.
- **FR-FHM-008**: System shall provide `BrandGrid.jsx` fetching brand logos from `GET /api/v1/brands` and rendering a responsive grid linking to `/brand/[slug]`.
- **FR-FHM-009**: System shall provide `RecentlyViewed.jsx` reading saved product items from localStorage and rendering a recently viewed product carousel if items exist.
- **FR-FHM-010**: System shall provide automated Playwright E2E test spec `frontend/tests/e2e/home.spec.js` validating hero slider rendering, category grid cards, product section tab switching, add-to-cart action from product cards, and brand logo loading.

---

## 4. Technical Specifications & File Map

| Component | Target File Location | Purpose |
|---|---|---|
| Home Page Route | `frontend/src/app/page.js` | Main storefront landing page |
| Hero Slider | `frontend/src/components/home/HeroSlider.jsx` | Visual hero banner carousel |
| Trust Badges | `frontend/src/components/home/TrustBadges.jsx` | Store value proposition badges |
| Category Banners | `frontend/src/components/home/CategoryBanners.jsx` | Category grid preview cards |
| Product Section | `frontend/src/components/home/ProductSection.jsx` | Tabbed product grid (Featured/New/Best) |
| Product Card | `frontend/src/components/product/ProductCard.jsx` | Reusable product display card |
| Promo Banner | `frontend/src/components/home/PromoBanner.jsx` | Coupon promotion banner section |
| Brand Grid | `frontend/src/components/home/BrandGrid.jsx` | Brand logo grid showcase |
| Recently Viewed | `frontend/src/components/home/RecentlyViewed.jsx` | LocalStorage recently viewed products |
| E2E Home Spec | `frontend/tests/e2e/home.spec.js` | Playwright test suite for home page |
