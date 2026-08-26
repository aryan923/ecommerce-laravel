# Implementation Plan: Frontend Home Page Storefront

**Module Name:** Frontend Home Page Storefront  
**Module ID:** 03 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-home.md`  
**Specification File:** `frontend/specifications/feature.frontend-home.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Ready for Implementation  

---

## 1. Module Summary

This implementation plan outlines the development strategy for **Frontend Module 03: Home Page Storefront (`/`)**. It builds the landing page components including `HeroSlider.jsx`, `TrustBadges.jsx`, `CategoryBanners.jsx`, `ProductCard.jsx`, `ProductSection.jsx`, `PromoBanner.jsx`, `BrandGrid.jsx`, `RecentlyViewed.jsx`, integrates them into `frontend/src/app/page.js`, and implements automated Playwright E2E tests (`home.spec.js`).

---

## 2. Development Strategy

1. **Reusable Product Card Component**:
   - Implement `frontend/src/components/product/ProductCard.jsx` displaying image, badge (discount/featured/sale), brand name, product title, rating stars, price formatted via `CurrencyContext`, Add to Cart button (triggers `CartContext.addItem`), and Wishlist toggle button.
2. **Hero Slider & Trust Badges**:
   - Implement `frontend/src/components/home/HeroSlider.jsx` with animated slide transitions and CTAs.
   - Implement `frontend/src/components/home/TrustBadges.jsx` displaying store guarantees.
3. **Featured Category Grid**:
   - Implement `frontend/src/components/home/CategoryBanners.jsx` fetching data from `GET /api/v1/categories`.
4. **Tabbed Product Section**:
   - Implement `frontend/src/components/home/ProductSection.jsx` with tabs (Featured, New Arrivals, Best Sellers) fetching from `GET /api/v1/products` with query params and rendering `ProductCard` items.
5. **Promo Banner & Brand Grid**:
   - Implement `frontend/src/components/home/PromoBanner.jsx` with discount callout and CTA.
   - Implement `frontend/src/components/home/BrandGrid.jsx` fetching brand logos from `GET /api/v1/brands`.
6. **Recently Viewed Products**:
   - Implement `frontend/src/components/home/RecentlyViewed.jsx` reading items from localStorage.
7. **Assemble Home Page Route**:
   - Update `frontend/src/app/page.js` to render all sections seamlessly with metadata.
8. **Automated E2E Testing**:
   - Update `frontend/tests/e2e/home.spec.js` and run `npm run test:e2e` to verify hero banner, category cards, product tabs, add-to-cart clicks, and brand logos.

---

## 3. Task Breakdown

- [x] **Task 1: Implement Reusable ProductCard Component**
  - File: `frontend/src/components/product/ProductCard.jsx`
  - Description: Product display card with pricing, discount badge, star rating, quick Add to Cart, and Wishlist toggle.

- [x] **Task 2: Implement HeroSlider Component**
  - File: `frontend/src/components/home/HeroSlider.jsx`
  - Description: Hero banner carousel with promotional slides and CTAs.

- [x] **Task 3: Implement TrustBadges & CategoryBanners Components**
  - File: `frontend/src/components/home/TrustBadges.jsx` & `frontend/src/components/home/CategoryBanners.jsx`
  - Description: Value proposition badges and category grid cards connected to `GET /api/v1/categories`.

- [x] **Task 4: Implement ProductSection Component**
  - File: `frontend/src/components/home/ProductSection.jsx`
  - Description: Tabbed product section (Featured / New Arrivals / Best Sellers) fetching products from API.

- [x] **Task 5: Implement PromoBanner Component**
  - File: `frontend/src/components/home/PromoBanner.jsx`
  - Description: Promotional coupon callout banner section.

- [x] **Task 6: Implement BrandGrid Component**
  - File: `frontend/src/components/home/BrandGrid.jsx`
  - Description: Brand logo showcase grid connected to `GET /api/v1/brands`.

- [x] **Task 7: Implement RecentlyViewed Component & Assemble Home Page**
  - File: `frontend/src/components/home/RecentlyViewed.jsx` & `frontend/src/app/page.js`
  - Description: Recently viewed carousel and assembly of Home page sections.

- [x] **Task 8: Implement Playwright E2E Home Test Suite**
  - File: `frontend/tests/e2e/home.spec.js`
  - Description: Playwright E2E test suite validating hero slider, categories, product tabs, and card actions.
