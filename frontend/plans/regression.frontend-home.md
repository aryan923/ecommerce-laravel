# Regression Test Matrix: Frontend Home Page Storefront

**Module Name:** Frontend Home Page Storefront  
**Module ID:** 03 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-home.md`  

---

## 1. Home Page Guardrails

To prevent regressions across home page sections:
1. **API Fallbacks**: If backend API is loading or fails gracefully, product sections and category banners MUST render skeleton placeholders instead of crashing.
2. **Product Card Dynamic Pricing**: Product prices inside `ProductCard` MUST react to active currency changes from `CurrencyContext`.
3. **Cart Drawer Trigger**: Clicking "Add to Cart" on any product card MUST update `cartCount` badge in Header immediately.

---

## 2. Regression Checklist

- [ ] `npm run test:e2e` passes 100% for `frontend/tests/e2e/home.spec.js`.
- [ ] Product card image hover effects animate cleanly without layout shifts.
- [ ] Brand grid links navigate to `/brand/[slug]`.
- [ ] Category banner links navigate to `/category/[slug]`.
