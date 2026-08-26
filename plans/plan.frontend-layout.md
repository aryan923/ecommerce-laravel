# Implementation Plan: Frontend Global Navigation & Layout

**Module Name:** Frontend Global Navigation & Layout  
**Module ID:** 02 (Frontend)  
**Plan File:** `plans/plan.frontend-layout.md`  
**Specification File:** `specifications/feature.frontend-layout.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Ready for Implementation  

---

## 1. Module Summary

This implementation plan outlines the development roadmap for **Frontend Module 02: Global Navigation & Layout**. It builds the main storefront layout framework including `Header.jsx`, `CategoryMenu.jsx`, `LiveSearch.jsx`, `CurrencySwitcher.jsx`, `AccountDropdown.jsx`, `MobileNav.jsx`, `CartDrawer.jsx`, `Footer.jsx`, and automated Playwright E2E tests (`layout.spec.js`).

---

## 2. Development Strategy

1. **Slide-Over Cart Drawer**:
   - Implement `frontend/src/components/cart/CartDrawer.jsx` connected to `CartContext` to display slide-over cart items, subtotal, quantity steppers, and Checkout redirection.
2. **Live Search Auto-Suggest**:
   - Implement `frontend/src/components/layout/LiveSearch.jsx` with debounced input querying `GET /api/v1/products?search=<query>` and rendering search preview popup.
3. **Category Mega-Menu & Currency Switcher**:
   - Implement `frontend/src/components/layout/CategoryMenu.jsx` fetching categories from `GET /api/v1/categories`.
   - Implement `frontend/src/components/layout/CurrencySwitcher.jsx` connecting to `CurrencyContext`.
4. **Customer Account Dropdown**:
   - Implement `frontend/src/components/layout/AccountDropdown.jsx` connected to `AuthContext` to display logged-in profile links or Sign In CTA.
5. **Main Header**:
   - Assemble `frontend/src/components/layout/Header.jsx` integrating Logo, CategoryMenu, LiveSearch, CurrencySwitcher, Wishlist count, Cart button, and AccountDropdown.
6. **Footer & Mobile Bottom Navigation**:
   - Implement `frontend/src/components/layout/Footer.jsx` with store links, policy links, social icons, and newsletter form.
   - Implement `frontend/src/components/layout/MobileNav.jsx` fixed at bottom of viewport for mobile screens (`< 768px`).
7. **Root Layout Integration**:
   - Update `frontend/src/app/layout.js` to render `<Header />`, `<main className="flex-1">{children}</main>`, `<Footer />`, `<MobileNav />`, and `<CartDrawer />`.
8. **Automated E2E Testing**:
   - Create `frontend/tests/e2e/layout.spec.js` and execute `npm run test:e2e` to verify navigation, search popup, cart drawer, and responsive rendering.

---

## 3. Task Breakdown

- [x] **Task 1: Implement Cart Drawer Component**
  - File: `frontend/src/components/cart/CartDrawer.jsx`
  - Description: Slide-over drawer displaying cart items, quantities, subtotal, and checkout CTAs.

- [x] **Task 2: Implement Live Search Auto-Suggest**
  - File: `frontend/src/components/layout/LiveSearch.jsx`
  - Description: Debounced search bar with auto-suggest dropdown for product matches.

- [x] **Task 3: Implement Category Menu & Currency Switcher**
  - File: `frontend/src/components/layout/CategoryMenu.jsx` & `frontend/src/components/layout/CurrencySwitcher.jsx`
  - Description: Dynamic category dropdown menu and multi-currency selector.

- [x] **Task 4: Implement Account Dropdown Component**
  - File: `frontend/src/components/layout/AccountDropdown.jsx`
  - Description: Dropdown displaying user details/links when authenticated or Login CTA when guest.

- [x] **Task 5: Implement Main Header Component**
  - File: `frontend/src/components/layout/Header.jsx`
  - Description: Top navigation bar assembling logo, search, category menu, currency switcher, wishlist badge, cart button, and account dropdown.

- [x] **Task 6: Implement Footer & Mobile Navigation**
  - File: `frontend/src/components/layout/Footer.jsx` & `frontend/src/components/layout/MobileNav.jsx`
  - Description: Responsive store footer and fixed bottom tab bar for mobile viewports.

- [x] **Task 7: Integrate Layout Components into Root Layout**
  - File: `frontend/src/app/layout.js`
  - Description: Integrate Header, Footer, MobileNav, and CartDrawer into Next.js App Router root layout.

- [x] **Task 8: Implement Playwright E2E Layout Test Suite**
  - File: `frontend/tests/e2e/layout.spec.js`
  - Description: Playwright test suite validating navigation links, live search, cart drawer toggle, and layout rendering.
