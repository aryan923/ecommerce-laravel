# Regression Test Matrix: Frontend Global Navigation & Layout

**Module Name:** Frontend Global Navigation & Layout  
**Module ID:** 02 (Frontend)  
**Regression File:** `plans/regression.frontend-layout.md`  

---

## 1. Layout Guardrails

To prevent regressions across storefront pages:
1. **Responsive Viewport Safety**: Header navigation items must fold gracefully into the mobile drawer on mobile devices (`< 768px`) while `MobileNav` handles primary bottom tab bar navigation.
2. **Dynamic Badges**: Wishlist badge count and Cart badge count MUST re-render reactively whenever items are added/removed.
3. **Cart Drawer State**: The `CartDrawer` must open smoothly when an item is added from any PDP or catalog card.

---

## 2. Regression Checklist

- [ ] `npm run test:e2e` passes 100% for `frontend/tests/e2e/layout.spec.js`.
- [ ] Category dropdown links navigate correctly to `/category/[slug]`.
- [ ] Search input debounces API calls to prevent spamming backend server.
- [ ] Cart drawer slide-over closes when clicking backdrop overlay or `✕` button.
