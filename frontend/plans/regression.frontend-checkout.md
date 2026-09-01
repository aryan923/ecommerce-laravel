# Regression Test Matrix: Frontend Checkout & Order Processing

**Module Name:** Frontend Checkout & Order Processing  
**Module ID:** 08 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-checkout.md`  

---

## 1. Checkout & Order Guardrails

To prevent regressions across order processing, address calculations, and payment gateways:
1. **Dynamic Financial Calculations**: Tax and shipping fee calculations MUST update dynamically whenever the shipping postal code or shipping method selection changes.
2. **Order Creation Payload Validation**: `POST /api/v1/checkout/process` MUST receive valid customer contact details, full shipping address, selected shipping method ID, and payment method ID.
3. **Cart Reset Post-Checkout**: Placing an order successfully MUST automatically clear the active shopping cart items.
4. **Order Confirmation Receipt Integrity**: The order success page (`/checkout/success/[order_number]`) MUST fetch and display valid order data from `GET /api/v1/orders/{order_number}`.

---

## 2. Regression Checklist

- [ ] `npm run test:e2e -- tests/e2e/checkout.spec.js` passes 100% with zero failures.
- [ ] Guest checkout works seamlessly without requiring an account.
- [ ] Logged-in customers can select saved shipping addresses or add new ones.
- [ ] Selecting different shipping options immediately updates the grand total price.
- [ ] Placed orders display correct item breakdown and payment status on the confirmation receipt screen.
