# Implementation Plan: Frontend Core Architecture & API Infrastructure

**Module Name:** Frontend Core Architecture & API Infrastructure  
**Module ID:** 01 (Frontend)  
**Plan File:** `plans/plan.frontend-core.md`  
**Specification File:** `specifications/feature.frontend-core.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Ready for Implementation  

---

## 1. Module Summary

This implementation plan defines the step-by-step development roadmap for **Frontend Module 01: Core Architecture & API Infrastructure**. It sets up the global HTTP client (`api-client.js`), session utilities (`session.js`), authentication context (`AuthContext.js`), cart context (`CartContext.js`), toast system (`ToastContext.js`), multi-currency context (`CurrencyContext.js`), React Error Boundary (`ErrorBoundary.jsx`), combined provider wrapper (`AppProviders.jsx`), and automated Playwright E2E tests (`core.spec.js`).

---

## 2. Development Strategy

1. **Session Utilities & Cookie Management**:
   - Implement `frontend/src/lib/session.js` to manage cookies (`getCookie`, `setCookie`, `removeCookie`) and generate/retrieve persistent UUID v4 `guest_session_id`.
2. **Centralized Axios Client**:
   - Implement `frontend/src/lib/api-client.js` with Axios interceptors:
     - Request Interceptor: Attach Sanctum `Authorization: Bearer <token>` and `X-Session-ID: <uuid>`.
     - Response Interceptor: Format 422 errors and trigger 401 token cleanup.
3. **Toast Notification System**:
   - Implement `frontend/src/context/ToastContext.js` and `frontend/src/components/common/ToastContainer.jsx` for auto-dismissing toast notifications.
4. **Authentication Context**:
   - Implement `frontend/src/context/AuthContext.js` to manage user token, `user` profile, `login()`, `logout()`, `register()`, and `checkAuth()` (`GET /api/v1/auth/me`).
5. **Cart Context**:
   - Implement `frontend/src/context/CartContext.js` to manage cart state, item counts, totals, drawer visibility, and connect to `GET /api/v1/cart`.
6. **Multi-Currency Context**:
   - Implement `frontend/src/context/CurrencyContext.js` to fetch currencies from `GET /api/v1/currencies` and format amounts with appropriate currency symbols.
7. **Error Boundary & App Providers Wrapper**:
   - Create `frontend/src/components/common/ErrorBoundary.jsx` and combine all providers into `frontend/src/components/providers/AppProviders.jsx`.
   - Update `frontend/src/app/layout.js` to wrap the app with `AppProviders`.
8. **Automated E2E Testing**:
   - Create `frontend/tests/e2e/core.spec.js` and execute `npm run test:e2e` to verify headers, cookies, toasts, and provider rendering.

---

## 3. Task Breakdown

- [x] **Task 1: Create Session Utilities**
  - File: `frontend/src/lib/session.js`
  - Description: Cookie getter/setter and UUID `guest_session_id` generator/retriever.

- [x] **Task 2: Create Centralized Axios API Client**
  - File: `frontend/src/lib/api-client.js`
  - Description: Axios instance with request/response interceptors for Auth tokens, Guest Session IDs, and error formatting.

- [x] **Task 3: Implement Toast Notification System**
  - File: `frontend/src/context/ToastContext.js` & `frontend/src/components/common/ToastContainer.jsx`
  - Description: Global toast context provider and auto-dismissing toast popup components.

- [x] **Task 4: Implement Authentication Context**
  - File: `frontend/src/context/AuthContext.js`
  - Description: React context managing user login, register, logout, Sanctum token storage, and `auth/me` profile hydration.

- [x] **Task 5: Implement Shopping Cart Context**
  - File: `frontend/src/context/CartContext.js`
  - Description: React context managing cart items, counts, drawer visibility, and API syncing with `GET /api/v1/cart`.

- [x] **Task 6: Implement Multi-Currency Context**
  - File: `frontend/src/context/CurrencyContext.js`
  - Description: React context fetching `GET /api/v1/currencies` and providing formatted price utility `formatPrice(amount)`.

- [x] **Task 7: Implement Error Boundary & Root AppProviders Wrapper**
  - File: `frontend/src/components/common/ErrorBoundary.jsx` & `frontend/src/components/providers/AppProviders.jsx`
  - Description: React Error Boundary and global Provider wrapper integrated into `frontend/src/app/layout.js`.

- [x] **Task 8: Implement Playwright E2E Core Test Suite**
  - File: `frontend/tests/e2e/core.spec.js`
  - Description: E2E tests validating session cookies, API interceptor headers, toast triggers, and Error Boundary fallback.
