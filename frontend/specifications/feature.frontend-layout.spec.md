# Feature Specification: Frontend Global Navigation & Layout Module

**Module Name:** Frontend Global Navigation & Layout  
**Module ID:** 02 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-layout.spec.md`  
**Version:** 1.0  
**Status:** Draft / Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 02), `frontend/Requirements/srs_pages.md` (§2.0)  

---

## 1. Module Overview

The **Global Navigation & Layout** module provides a consistent, accessible, and responsive navigation header, mega-menu, search auto-suggest popup, currency switcher, customer account menu, mobile tab bar, slide-over cart drawer, and footer across all storefront routes. It connects directly to backend API endpoints for categories (`GET /api/v1/categories`), currencies (`GET /api/v1/currencies`), and live search (`GET /api/v1/products`).

---

## 2. UI Layout Architecture & Component Hierarchy

```
+-----------------------------------------------------------------------------------+
|                               Top Announcement Bar                                |
+-----------------------------------------------------------------------------------+
| Logo | Search Bar (LiveSearch) | Category Menu | Currency Switcher | Cart | Account |
+-----------------------------------------------------------------------------------+
|                               Main Content ({children})                           |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|                                      Footer                                       |
+-----------------------------------------------------------------------------------+
|                       MobileNav (Fixed Bottom Bar on Mobile)                       |
+-----------------------------------------------------------------------------------+
|                        CartDrawer (Slide-Over Side Drawer)                        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Functional Requirements

- **FR-FLAY-001**: System shall render a global `Header` component (`frontend/src/components/layout/Header.jsx`) at the top of every page.
- **FR-FLAY-002**: Header shall display the brand logo linking directly to the Home page (`/`).
- **FR-FLAY-003**: System shall provide `CategoryMenu.jsx` fetching dynamic multi-level category data from `GET /api/v1/categories` and displaying category hover/click dropdowns linking to `/category/[slug]`.
- **FR-FLAY-004**: System shall provide `LiveSearch.jsx` in the Header. As the user types (debounced by 300ms), it shall query `GET /api/v1/products?search=<query>&limit=5` and render an auto-suggest popup displaying product image, title, price, and category. Clicking a search item navigates to `/products/[slug]`.
- **FR-FLAY-005**: System shall provide `CurrencySwitcher.jsx` displaying active currency symbol/code and allowing customers to select available currencies fetched from `CurrencyContext`.
- **FR-FLAY-006**: Header shall render a Wishlist button displaying a live item count badge linking to `/wishlist`.
- **FR-FLAY-007**: Header shall render a Cart button displaying a live item count badge (`CartCount`) that opens `CartDrawer.jsx` when clicked.
- **FR-FLAY-008**: System shall provide `AccountDropdown.jsx`. If authenticated, it displays the customer's name/avatar with dropdown links to `/account`, `/account/orders`, `/account/profile`, and a Logout action. If guest, it renders a "Sign In" button linking to `/auth/login`.
- **FR-FLAY-009**: System shall provide `CartDrawer.jsx`, a slide-over side drawer displaying current cart items, variant options, item quantity controls (`[+]`/`[-]`), price subtotal, "View Cart" CTA (`/cart`), and "Checkout" CTA (`/checkout`).
- **FR-FLAY-010**: System shall render a responsive `Footer` component (`frontend/src/components/layout/Footer.jsx`) containing brand overview, quick store links, policy page links, social links, and a newsletter subscription form.
- **FR-FLAY-011**: System shall render a `MobileNav` component (`frontend/src/components/layout/MobileNav.jsx`) fixed at the bottom of the viewport on screen sizes `< 768px` with touch-friendly icons for Home, Search, Cart, Wishlist, and Account.
- **FR-FLAY-012**: System shall provide automated Playwright E2E test spec `frontend/tests/e2e/layout.spec.js` validating Header links, Category menu fetching, Live Search input, Currency switcher, Cart drawer toggle, and Footer rendering.

---

## 4. Technical Specifications & File Map

| Component | Target File Location | Purpose |
|---|---|---|
| Main Header | `frontend/src/components/layout/Header.jsx` | Storefront main navigation bar |
| Category Menu | `frontend/src/components/layout/CategoryMenu.jsx` | Category mega-menu dropdown |
| Live Search | `frontend/src/components/layout/LiveSearch.jsx` | Debounced live search auto-suggest popup |
| Currency Switcher | `frontend/src/components/layout/CurrencySwitcher.jsx` | Active currency selector dropdown |
| Account Dropdown | `frontend/src/components/layout/AccountDropdown.jsx` | Customer profile / login dropdown |
| Mobile Navigation | `frontend/src/components/layout/MobileNav.jsx` | Fixed bottom mobile tab bar |
| Main Footer | `frontend/src/components/layout/Footer.jsx` | Storefront footer with links & newsletter |
| Cart Drawer | `frontend/src/components/cart/CartDrawer.jsx` | Slide-over cart preview drawer |
| E2E Layout Spec | `frontend/tests/e2e/layout.spec.js` | Playwright test suite for layout & navigation |
