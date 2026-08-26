# Feature Specification: Frontend Core Architecture & API Infrastructure

**Module Name:** Frontend Core Architecture & API Infrastructure  
**Module ID:** 01 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-core.spec.md`  
**Version:** 1.0  
**Status:** Draft / Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 01), `frontend/Requirements/srs_pages.md` (§1.1)  

---

## 1. Module Overview

The **Frontend Core Architecture & API Infrastructure** module establishes the foundation for the Next.js Storefront application. It provides:
1. A centralized Axios HTTP client (`frontend/src/lib/api-client.js`) pre-configured with interceptors for Sanctum `Bearer` tokens, guest session `X-Session-ID` cookies, and global error handling.
2. React Context Providers for **Authentication** (`AuthContext.js`), **Shopping Cart** (`CartContext.js`), **Global Toasts** (`ToastContext.js`), and **Multi-Currency** (`CurrencyContext.js`).
3. An **Error Boundary** component (`ErrorBoundary.jsx`) to handle uncaught React rendering exceptions gracefully.
4. An automated **Playwright E2E Test Spec** (`frontend/tests/e2e/core.spec.js`) to validate global infrastructure functions before building UI modules.

---

## 2. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                 Next.js App Root                                  |
|  (RootLayout -> ErrorBoundary -> ToastProvider -> AuthProvider -> CartProvider)   |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
                         +---------------------------------+
                         |   apiClient (Axios Instance)    |
                         +---------------------------------+
                                /                   \
                               v                     v
                +-------------------------+   +----------------------------+
                | Request Interceptor     |   | Response Interceptor       |
                | - Bearer Token (Sanctum)|   | - 401 Unauthorized Clear  |
                | - X-Session-ID (Guest)  |   | - 422 Validation Format    |
                +-------------------------+   | - Global Error Toasts      |
                                              +----------------------------+
                                                             |
                                                             v
                                              +----------------------------+
                                              | Laravel API Server (:8002) |
                                              +----------------------------+
```

---

## 3. Functional Requirements

- **FR-FEC-001**: System shall provide a single Axios client instance at `frontend/src/lib/api-client.js` targeted at `NEXT_PUBLIC_API_BASE_URL` (defaulting to `http://localhost:8002/api/v1`).
- **FR-FEC-002**: Request interceptor MUST automatically inspect `Cookies` / `localStorage` for a Sanctum Bearer token and attach header `Authorization: Bearer <token>` if present.
- **FR-FEC-003**: Request interceptor MUST automatically check for a guest session UUID (`X-Session-ID`). If absent, it MUST generate a valid UUID v4 and store it in cookies (`guest_session_id`, 30-day expiry), attaching header `X-Session-ID: <uuid>` to ALL outgoing requests.
- **FR-FEC-004**: Response interceptor MUST catch HTTP `401 Unauthorized` responses on protected endpoints, clear local auth tokens, and reset `AuthContext` state.
- **FR-FEC-005**: Response interceptor MUST catch HTTP `422 Unprocessable Entity` responses and parse Laravel validation error arrays into a standardized key-value map.
- **FR-FEC-006**: System shall provide `AuthContext` at `frontend/src/context/AuthContext.js` supporting `user`, `isAuthenticated`, `isLoading`, `login()`, `register()`, `logout()`, and `checkAuth()` (calling `GET /api/v1/auth/me`).
- **FR-FEC-007**: System shall provide `CartContext` at `frontend/src/context/CartContext.js` supporting `cart`, `cartCount`, `cartTotal`, `isCartOpen`, `toggleCart()`, `fetchCart()` (calling `GET /api/v1/cart`), `addItem()`, `updateQuantity()`, `removeItem()`, and `applyCoupon()`.
- **FR-FEC-008**: System shall provide `ToastContext` at `frontend/src/context/ToastContext.js` providing `showToast(message, type)` to render auto-dismissing toast popups for `success`, `error`, and `info`.
- **FR-FEC-009**: System shall provide `CurrencyContext` at `frontend/src/context/CurrencyContext.js` fetching available currencies from `GET /api/v1/currencies`, managing active currency selection, and providing a helper `formatPrice(amount)` returning formatted prices (e.g. `$19.99` or `₹1,499.00`).
- **FR-FEC-010**: System shall provide a React Error Boundary component (`frontend/src/components/common/ErrorBoundary.jsx`) catching uncaught UI errors and displaying a user-friendly fallback screen with a "Reload Page" button.
- **FR-FEC-011**: System shall provide Playwright test spec `frontend/tests/e2e/core.spec.js` validating `X-Session-ID` creation, API request headers, toast displays, and error fallback rendering.

---

## 4. Technical Specifications & File Map

| Component | Target File Location | Purpose |
|---|---|---|
| API Client | `frontend/src/lib/api-client.js` | Axios instance with auth & guest session interceptors |
| Session Utilities | `frontend/src/lib/session.js` | Cookie read/write helpers & UUID generator |
| Auth Context | `frontend/src/context/AuthContext.js` | User login, token, & profile state provider |
| Cart Context | `frontend/src/context/CartContext.js` | Shopping cart state & drawer toggle provider |
| Toast Context | `frontend/src/context/ToastContext.js` | Global notification popup provider |
| Currency Context | `frontend/src/context/CurrencyContext.js` | Multi-currency state & price formatter |
| Error Boundary | `frontend/src/components/common/ErrorBoundary.jsx` | Fallback UI component for React errors |
| Root Providers | `frontend/src/components/providers/AppProviders.jsx` | Wrapper combining all context providers |
| E2E Core Spec | `frontend/tests/e2e/core.spec.js` | Playwright test suite for core infrastructure |
