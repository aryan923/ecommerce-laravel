# Implementation Plan: Frontend Customer Authentication & Session Merge

**Module Name:** Frontend Customer Authentication & Session Merge  
**Module ID:** 07 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-auth.md`  
**Specification File:** `frontend/specifications/feature.frontend-auth.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Completed  

---

## 1. Module Summary

This implementation plan details the development roadmap for **Frontend Module 07: Customer Authentication & Session Merge (`/auth/*`)**. It delivers global authentication state management (`AuthContext.js`), reusable auth layout container (`AuthLayout.jsx`), login page (`/auth/login`), registration page (`/auth/register`), password recovery flow (`/auth/forgot-password` and `/auth/reset-password`), guest-to-account cart merging (`POST /api/v1/cart/merge`), and an automated Playwright E2E test suite (`auth.spec.js`).

---

## 2. Development Strategy

1. **Global Auth Context & Token Management**:
   - Refine `frontend/src/context/AuthContext.js` to handle token storage, `login`, `register`, `logout`, `forgotPassword`, `resetPassword`, `me` profile checks, and automatic invocation of `cart.merge()` upon successful authentication.
2. **Shared Auth Layout & Styling System**:
   - Implement `frontend/src/components/auth/AuthLayout.jsx` providing a modern split-screen layout with branding graphics, trust badges, and centered form cards.
3. **Login Form & Page (`/auth/login`)**:
   - Implement `frontend/src/components/auth/LoginForm.jsx` and `frontend/src/app/auth/login/page.js` with password visibility toggle, remember-me state, error alerts, and redirect handling.
4. **Registration Form & Page (`/auth/register`)**:
   - Implement `frontend/src/components/auth/RegisterForm.jsx` and `frontend/src/app/auth/register/page.js` with name, email, password confirmation, and terms agreement check.
5. **Forgot Password Form & Page (`/auth/forgot-password`)**:
   - Implement `frontend/src/components/auth/ForgotPasswordForm.jsx` and `frontend/src/app/auth/forgot-password/page.js` with email submission and success alerts.
6. **Reset Password Form & Page (`/auth/reset-password`)**:
   - Implement `frontend/src/components/auth/ResetPasswordForm.jsx` and `frontend/src/app/auth/reset-password/page.js` parsing `?token=` from query parameters.
7. **Automated Playwright E2E Test Suite**:
   - Create `frontend/tests/e2e/auth.spec.js` testing login, register, forgot-password, reset-password, and navigation links.

---

## 3. Task Breakdown

- [x] **Task 1: Refine Auth Context & Automatic Cart Merge**
  - File: `frontend/src/context/AuthContext.js`
  - Description: Manage Sanctum Bearer tokens, user profile, auth actions, and call `apiClient.post('/cart/merge')` on login/register.

- [x] **Task 2: Implement AuthLayout Container**
  - File: `frontend/src/components/auth/AuthLayout.jsx`
  - Description: Modern split-screen layout with branding visuals, security guarantees, and responsive form wrapper.

- [x] **Task 3: Implement LoginForm Component & `/auth/login` Route**
  - Files: `frontend/src/components/auth/LoginForm.jsx` & `frontend/src/app/auth/login/page.js`
  - Description: Login form with email/password validation, password toggle, error feedback alerts, and redirect handling.

- [x] **Task 4: Implement RegisterForm Component & `/auth/register` Route**
  - Files: `frontend/src/components/auth/RegisterForm.jsx` & `frontend/src/app/auth/register/page.js`
  - Description: Registration form with name, email, password, confirm password, and terms check.

- [x] **Task 5: Implement ForgotPasswordForm Component & `/auth/forgot-password` Route**
  - Files: `frontend/src/components/auth/ForgotPasswordForm.jsx` & `frontend/src/app/auth/forgot-password/page.js`
  - Description: Password recovery form with email input, success banner, and back to login link.

- [x] **Task 6: Implement ResetPasswordForm Component & `/auth/reset-password` Route**
  - Files: `frontend/src/components/auth/ResetPasswordForm.jsx` & `frontend/src/app/auth/reset-password/page.js`
  - Description: Reset password form extracting token from query params and updating customer password.

- [x] **Task 7: Implement Automated Playwright E2E Test Suite**
  - File: `frontend/tests/e2e/auth.spec.js`
  - Description: Playwright test suite for login, register, forgot password, reset password, and route navigation.

---

## 4. Verification Plan

### Automated Tests
- Run `npx playwright test frontend/tests/e2e/auth.spec.js` to execute E2E tests.

### Manual Verification
- Navigate to `/auth/login` and verify form elements and split-screen layout.
- Submit invalid login credentials and verify red error alert appears.
- Navigate to `/auth/register` and test registration form controls.
- Navigate to `/auth/forgot-password` and verify email recovery form.
- Test guest cart merging into user account after login.
