# Regression Test Matrix: Frontend OTP Verification & Account Security

**Module Name:** Frontend OTP Verification & Account Security  
**Module ID:** 13 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-verify-otp.md`  

---

## 1. OTP Verification & Security Guardrails

To prevent regressions across user registration activation, password recovery, PIN input UX, and auth state security:
1. **6-Digit Input Integrity**: The OTP form MUST strictly enforce 6 numeric digits. Partial codes (< 6 digits) MUST NOT submit to API.
2. **AutoFocus & Paste Support**: Keypress auto-advance, backspace focus regression, and paste event handlers MUST function reliably on all browsers (Chrome, Firefox, Safari).
3. **Resend Throttling**: The 60-second resend cooldown timer MUST be enforced client-side to prevent rate-limit spam to the mail gateway.
4. **Token Persistence & Cart Merge**: Upon successful registration OTP verification, the returned Sanctum Bearer token MUST be persisted in localStorage / auth context, and guest cart items MUST be merged.
5. **Flow Isolation**: The `type` query param (`registration` vs `password_reset`) MUST strictly control post-verification redirection targets (`/account` vs `/auth/reset-password`).

---

## 2. Regression Checklist

- [ ] `npx playwright test frontend/tests/e2e/verify-otp.spec.js` passes 100% with zero failures.
- [ ] Direct navigation to `/auth/verify-otp?email=test@example.com` renders 6 input boxes and target email address badge.
- [ ] Typing digits 1 through 6 advances keyboard focus sequentially across input boxes.
- [ ] Pressing Backspace clears digit and moves focus backwards.
- [ ] Pasting a 6-digit code populates all fields immediately.
- [ ] Submitting invalid code displays inline error alert without resetting the entered email context.
- [ ] Resend link displays active 60s countdown before enabling click action.
- [ ] Successful OTP verification sets auth token and redirects user cleanly.
