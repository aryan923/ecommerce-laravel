# Regression Test Matrix: Frontend Product Comparison Engine

**Module Name:** Frontend Product Comparison Engine  
**Module ID:** 12 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-compare.md`  

---

## 1. Product Comparison Engine Guardrails

To prevent regressions across product selection, sticky bar UI, matrix rendering, and cart integration:
1. **Max Item Constraint (4 Items)**: The system MUST strictly enforce a maximum limit of 4 compared items. Adding a 5th item MUST be rejected gracefully with a user notification.
2. **Session Persistence**: Compare selections MUST persist across page navigation and reloads via `localStorage` (`luxora_compare_items`).
3. **Real-Time Currency Conversion Sync**: All product prices in `CompareBar` and `CompareMatrix` MUST react dynamically to currency changes from `CurrencyContext`.
4. **Move-to-Cart Atomicity**: Clicking "Add to Cart" inside a matrix column MUST add the item to the cart context without disrupting remaining compare selections.
5. **Responsive Matrix Scrolling**: On mobile screens (<768px), the compare matrix MUST render inside a horizontally scrollable container without breaking page layout boundaries.

---

## 2. Regression Checklist

- [ ] `npx playwright test frontend/tests/e2e/compare.spec.js` passes 100% with zero failures.
- [ ] Toggling compare checkbox on catalog product card updates sticky `CompareBar` counter instantly.
- [ ] Attempting to select more than 4 products triggers limit toast alert.
- [ ] Navigating to `/compare` displays full matrix comparing title, image, price, discount %, rating, brand, stock, and attributes.
- [ ] Toggling "Highlight Differences" filters matrix rows correctly.
- [ ] Clicking "Add to Cart" on a compared item adds item to cart drawer.
- [ ] Clearing all compare items renders `EmptyCompare` placeholder view cleanly.
