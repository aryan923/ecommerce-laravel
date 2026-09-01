# Regression Test Matrix: Frontend Customer Authentication & Session Merge

**Module Name:** Frontend Customer Authentication & Session Merge  
**Module ID:** 07 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-auth.md`  

---

## 1. Customer Authentication Guardrails

To prevent regressions across user authentication, session persistence, and cart handoff:
1. **Token Persistence**: Sanctum Bearer tokens MUST be stored securely in `localStorage` / HTTP headers and attached to every API request via `apiClient`.
2. **Post-Login Cart Merge**: Logging in or registering MUST automatically trigger `POST /api/v1/cart/merge` passing the active `X-Session-ID` guest token.
3. **Redirect Memory**: Unauthenticated users attempting to access protected routes (e.g., `/checkout` or `/account`) MUST be redirected to `/auth/login` and returned back to their intended destination post-login.
4. **Clean Error Handling**: API authentication errors (401, 422) MUST display human-readable alert messages without crashing the UI.

---

## 2. Regression Checklist

- [ ] `npm run test:e2e -- tests/e2e/auth.spec.js` passes 100% with zero failures.
- [ ] Refreshing page (`F5`) while logged in preserves user authentication state (`useAuth`).
- [ ] Guest cart items merge seamlessly into customer account upon login.
- [ ] Clicking "Sign Out" clears Sanctum Bearer token and resets cart count.
- [ ] Accessing `/auth/login` while already authenticated redirects to `/` or `/account`.
