# Regression Test Matrix: Frontend Core Architecture & API Infrastructure

**Module Name:** Frontend Core Architecture & API Infrastructure  
**Module ID:** 01 (Frontend)  
**Regression File:** `plans/regression.frontend-core.md`  

---

## 1. Core Infrastructure Guardrails

To prevent regressions as subsequent frontend modules (Modules 02–13) are built on top of Module 01, the following non-negotiable architectural rules must be enforced:

1. **Zero API Direct Instantiation**: No component or page file shall invoke raw `fetch()` or construct a custom `axios` instance directly. All API calls MUST use `apiClient` imported from `@/lib/api-client`.
2. **Session Persistence**: The `X-Session-ID` guest session cookie must NOT be deleted or mutated when navigating across pages or when logging in/out.
3. **Cookie Expiry**: The `guest_session_id` cookie MUST be initialized with a minimum 30-day expiration window.
4. **Provider Wrap Order**: The root provider hierarchy in `AppProviders.jsx` must preserve context dependencies (`ErrorBoundary` -> `ToastProvider` -> `CurrencyProvider` -> `AuthProvider` -> `CartProvider`).

---

## 2. Regression Checklist

- [ ] `npm run test:e2e` passes 100% for `frontend/tests/e2e/core.spec.js`.
- [ ] `X-Session-ID` is present on all network requests inspected in browser dev tools.
- [ ] `Authorization: Bearer <token>` is present on protected routes.
- [ ] Page reloads preserve active guest cart and user session.
- [ ] Unhandled JS errors trigger the `ErrorBoundary` recovery UI instead of blank white screens.
