# Implementation Plan: Frontend Wishlist Management

**Module Name:** Frontend Wishlist Management  
**Module ID:** 10 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-wishlist.md`  
**Specification File:** `frontend/specifications/feature.frontend-wishlist.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Completed  

---

## 1. Module Summary

This implementation plan outlines the step-by-step development roadmap for **Frontend Module 10: Wishlist Management (`/wishlist`)**. It implements global wishlist state management (`WishlistContext.js`), interactive heart icon toggles on product cards and PDPs, dedicated wishlist page route (`frontend/src/app/wishlist/page.jsx`), wishlist items grid (`WishlistGrid.jsx`), wishlist toolbar (`WishlistHeader.jsx`), empty wishlist placeholder (`EmptyWishlist.jsx`), and an automated Playwright E2E test suite (`wishlist.spec.js`).

---

## 2. Development Strategy

1. **Global Wishlist Context & Session Sync**:
   - Create `frontend/src/context/WishlistContext.js` managing saved items array (`wishlistItems`), total count (`wishlistCount`), loading state, and helper functions (`isWishlisted`, `toggleWishlist`, `removeFromWishlist`, `moveToCart`, `clearWishlist`).
   - Wrap `AppProviders.jsx` with `WishlistProvider`.
2. **Header Wishlist Badge Sync**:
   - Update `frontend/src/components/layout/Header.jsx` to render live badge counter connected to `WishlistContext`.
3. **Interactive Heart Toggle Integration**:
   - Update `frontend/src/components/product/ProductCard.jsx` to toggle heart icon state with instant visual feedback and Toast notification.
   - Update `frontend/src/components/pdp/AddToCartSection.jsx` to connect PDP wishlist heart button to `WishlistContext`.
4. **Wishlist Card & Grid Components**:
   - Create `frontend/src/components/wishlist/WishlistCard.jsx` rendering thumbnail, title, brand, variant details, price, discount badge, stock status badge, "Move to Cart" CTA, and "Remove" icon.
   - Create `frontend/src/components/wishlist/WishlistGrid.jsx` to render responsive grid of `WishlistCard` items.
5. **Wishlist Toolbar & Clear Action**:
   - Create `frontend/src/components/wishlist/WishlistHeader.jsx` displaying page header, total items count, "Clear All Wishlist" button with modal confirmation, and "Continue Shopping" CTA.
6. **Empty Wishlist Placeholder**:
   - Create `frontend/src/components/wishlist/EmptyWishlist.jsx` rendering friendly empty wishlist illustration, message, and CTA leading to `/products`.
7. **Assemble Wishlist Route**:
   - Create `frontend/src/app/wishlist/page.jsx` and `WishlistClient.jsx` integrating all components with skeleton loader fallback and dynamic Next.js SEO metadata.
8. **Automated E2E Test Suite**:
   - Create `frontend/tests/e2e/wishlist.spec.js` and execute `npm run test:e2e` to validate heart toggling, wishlist grid rendering, move-to-cart transfer, item deletion, and clear wishlist flow.

---

## 3. Task Breakdown

- [x] **Task 1: Implement Wishlist Context & State Provider**
  - File: `frontend/src/context/WishlistContext.js`
  - Description: Global context managing wishlist items, session sync with `GET /api/v1/wishlist`, heart toggle, move-to-cart, and clear functions.

- [x] **Task 2: Integrate Wishlist Badge in Header Layout**
  - File: `frontend/src/components/layout/Header.jsx` & `frontend/src/components/providers/AppProviders.jsx`
  - Description: Connect header wishlist heart icon badge to `WishlistContext` live count.

- [x] **Task 3: Integrate Wishlist Heart Toggle on Product Cards & PDP**
  - Files: `frontend/src/components/product/ProductCard.jsx` & `frontend/src/components/pdp/AddToCartSection.jsx`
  - Description: Interactive heart toggle buttons calling `toggleWishlist()` with animated visual feedback.

- [x] **Task 4: Implement Wishlist Card & Grid Components**
  - Files: `frontend/src/components/wishlist/WishlistCard.jsx` & `frontend/src/components/wishlist/WishlistGrid.jsx`
  - Description: Responsive grid layout rendering product cards with pricing, stock status, "Move to Cart", and "Remove" actions.

- [x] **Task 5: Implement Wishlist Toolbar & Header Component**
  - File: `frontend/src/components/wishlist/WishlistHeader.jsx`
  - Description: Page title, saved items counter, clear all wishlist confirmation trigger, and continue shopping link.

- [x] **Task 6: Implement Empty Wishlist Placeholder Component**
  - File: `frontend/src/components/wishlist/EmptyWishlist.jsx`
  - Description: Friendly empty wishlist view with shopping icon, messaging, and "Explore Catalog" CTA button.

- [x] **Task 7: Assemble Wishlist Page Route (`/wishlist`)**
  - Files: `frontend/src/app/wishlist/page.jsx` & `frontend/src/app/wishlist/WishlistClient.jsx`
  - Description: Dedicated `/wishlist` route unifying toolbar, grid, empty state, skeleton loader, and Next.js SEO metadata.

- [x] **Task 8: Implement Automated Playwright E2E Wishlist Test Suite**
  - File: `frontend/tests/e2e/wishlist.spec.js`
  - Description: E2E Playwright test suite validating heart toggling, `/wishlist` route rendering, item deletion, move-to-cart transfer, and clear wishlist.

---

## 4. Verification Plan

### Automated Tests
- Run `npx playwright test frontend/tests/e2e/wishlist.spec.js` to execute E2E tests.
- Run `npm run test:e2e` to verify zero regressions across the storefront suite.

### Manual Verification
- Click heart icon on home page product card; verify heart fills red and header wishlist badge increments.
- Navigate to `/wishlist` route; verify saved item renders with image, title, variant, price, and stock status badge.
- Click "Move to Cart" button; verify item transfers to cart drawer and disappears from wishlist grid.
- Click "Remove" button on item; verify item is deleted from wishlist.
- Click "Clear All Wishlist"; verify confirmation modal opens and clearing renders `EmptyWishlist` view.
