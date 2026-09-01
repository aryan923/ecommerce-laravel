# Regression Test Matrix: Frontend Customer Account Portal

**Module Name:** Frontend Customer Account Portal  
**Module ID:** 09 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-account.md`  

---

## 1. Customer Account Guardrails

To prevent regressions across customer self-service, order management, and profile security:
1. **Authentication Guardrails**: Unauthenticated requests to any `/account/*` route MUST automatically redirect to `/auth/login?redirect=/account`.
2. **Profile Data Syncing**: Profile updates (`PUT /api/v1/customer/profile`) MUST immediately refresh the active session user state across `AuthContext`.
3. **Address Book Integrity**: Address CRUD operations (`GET/POST/PUT/DELETE /api/v1/customer/addresses`) MUST maintain default shipping/billing flag consistency.
4. **Order Status Consistency**: Order list and order detail views MUST parse order status badges correctly and present appropriate action triggers (e.g. Cancel Order allowed only for `pending` or `processing` status).
5. **Return Request Validation**: Initiating a return request (`POST /api/v1/customer/returns`) MUST require selecting valid delivered order line items and a return reason.

---

## 2. Regression Checklist

- [ ] `npm run test:e2e -- tests/e2e/account.spec.js` passes 100% with zero failures.
- [ ] Sidebar navigation works smoothly across all 9 sub-routes on both desktop and mobile views.
- [ ] Updating name and phone number reflects instantly in the top header and sidebar greeting.
- [ ] Adding, editing, and deleting saved addresses updates the address grid dynamically.
- [ ] Order detail page renders shipment tracking timeline, itemized table, and cancellation button.
- [ ] Refund bank accounts accept valid IFSC codes and display masked account numbers.
