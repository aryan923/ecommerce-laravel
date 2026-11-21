# Implementation Plan: Frontend OTP Verification & Account Security

**Module Name:** Frontend OTP Verification & Account Security  
**Module ID:** 13 (Frontend)  
**Plan File:** `frontend/plans/plan.frontend-verify-otp.md`  
**Specification File:** `frontend/specifications/feature.frontend-verify-otp.spec.md`  
**Target Stack:** Next.js 16 (App Router) / React 19 / Axios / Playwright  
**Status:** Ready for Implementation  

---

## 1. Module Summary

This implementation plan outlines the step-by-step technical strategy for **Frontend Module 13: OTP Verification & Account Security (`/auth/verify-otp`)**. It encompasses segmented 6-digit PIN input handling (`OtpForm.jsx`), resend timer countdown logic, account registration activation flow, password reset validation flow, standalone verify page (`frontend/src/app/auth/verify-otp/page.js`), modal overlay (`OtpInputModal.jsx`), and an automated Playwright E2E test suite (`verify-otp.spec.js`).

---

## 2. Development Strategy

1. **OTP Input Component (`OtpForm.jsx`)**:
   - Create `frontend/src/components/auth/OtpForm.jsx` rendering 6 segmented numeric input boxes.
   - Implement auto-focus progression, backspace regression, clipboard paste listener, and automatic form submission on 6th digit.
2. **Resend Cooldown Timer Hook & Logic**:
   - Integrate 60-second countdown timer in `OtpForm.jsx`.
   - Wire "Resend OTP" button to `POST /api/v1/auth/resend-otp` with fallback local resend simulation and toast notification.
3. **Verify OTP API Integration & Auth Sync**:
   - Connect verification handler to `POST /api/v1/auth/verify-otp`.
   - Handle Registration flow: Store Bearer token in local storage / context, trigger guest cart merge (`POST /api/v1/cart/merge`), and redirect to `/account` or `/`.
   - Handle Password Reset flow: Store reset token and redirect to `/auth/reset-password?token=...`.
4. **Modal Component (`OtpInputModal.jsx`)**:
   - Create `frontend/src/components/auth/OtpInputModal.jsx` wrapping `OtpForm` in a modal dialog backdrop for inline verification prompts.
5. **Page Route (`/auth/verify-otp`)**:
   - Create `frontend/src/app/auth/verify-otp/page.js` and `VerifyOtpClient.jsx` handling query parameters (`email`, `type`, `redirect`) with responsive card layout.
6. **Integration with Registration & Forgot Password Flows**:
   - Update `frontend/src/app/auth/register/page.js` to redirect to `/auth/verify-otp?email=...&type=registration` upon successful registration POST.
   - Update `frontend/src/app/auth/forgot-password/page.js` to redirect to `/auth/verify-otp?email=...&type=password_reset` upon sending reset code.
7. **Automated E2E Test Suite**:
   - Create `frontend/tests/e2e/verify-otp.spec.js` covering digits input, auto-focus, paste, invalid code error handling, resend timer, and successful redirection.

---

## 3. Task Breakdown

- [ ] **Task 1: Implement 6-Digit Segmented PIN Input Component**
  - File: `frontend/src/components/auth/OtpForm.jsx`
  - Description: 6 segmented input boxes with auto-advance focus, backspace retreat, paste support, and auto-submit callback.

- [ ] **Task 2: Implement Resend Cooldown Timer & Resend Handler**
  - File: `frontend/src/components/auth/OtpForm.jsx`
  - Description: 60-second timer countdown, disabled resend state, API trigger (`POST /api/v1/auth/resend-otp`), and toast message.

- [ ] **Task 3: Implement Reusable OTP Modal Component**
  - File: `frontend/src/components/auth/OtpInputModal.jsx`
  - Description: Accessible modal dialog wrapper rendering `OtpForm` overlay for modal verification scenarios.

- [ ] **Task 4: Assemble Verify OTP Standalone Page Route**
  - Files: `frontend/src/app/auth/verify-otp/page.js` & `VerifyOtpClient.jsx`
  - Description: Main route reading URL search params, displaying shield logo header, target email badge, and error alert banners.

- [ ] **Task 5: Integrate OTP Flow with Registration & Forgot Password**
  - Files: `frontend/src/app/auth/register/RegisterClient.jsx` & `frontend/src/app/auth/forgot-password/ForgotPasswordClient.jsx`
  - Description: Update auth forms to redirect users to `/auth/verify-otp` with context parameters.

- [ ] **Task 6: Implement Automated Playwright E2E OTP Test Suite**
  - File: `frontend/tests/e2e/verify-otp.spec.js`
  - Description: E2E Playwright test suite validating page load, single-digit input typing, paste feature, invalid code error alert, resend timer, and successful verification redirect.

---

## 4. Verification Plan

### Automated Tests
- Run `npx playwright test frontend/tests/e2e/verify-otp.spec.js` to execute E2E verification test suite.
- Run `npm run test:e2e` to verify complete storefront suite pass rate.

### Manual Verification
- Navigate to `/auth/verify-otp?email=test@example.com&type=registration`.
- Type `1-2-3-4-5-6` into PIN boxes; verify focus advances automatically after each keypress.
- Press Backspace on box 4; verify value clears and focus returns to box 3.
- Paste `987654` from clipboard; verify all 6 boxes populate instantly.
- Click "Resend OTP"; verify 60-second timer starts and toast confirmation displays.
- Submit invalid code (e.g. `000000`); verify inline red error banner displays error message.
- Submit valid code; verify success state and redirection to account dashboard.
