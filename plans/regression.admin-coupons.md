# Regression Matrix: Module 29 — Admin Coupon Management

**Module Name:** Admin Coupon Management  
**Module ID:** 29  
**Regression File:** `plans/regression.admin-coupons.md`  
**Specification File:** `specifications/feature.admin-coupons.spec.md`  

---

## 1. Affected Existing Modules

Modifying or implementing Admin Coupon Management impacts the following existing modules and application layers:

1. **Module 13 (Coupons & Discounts - Customer / Cart Validation)**:
   - Admin CRUD changes directly alter rule validation evaluated during checkout (`POST /api/v1/coupons/validate`).
2. **Module 06 (Checkout & Order Processing)**:
   - Order placement relies on coupon discount amounts and records redemptions into `coupon_usages`.
3. **Module 03 (Admin Auth & RBAC)**:
   - Endpoint access depends on Sanctum authentication and Spatie permissions (`coupons.view`, `coupons.create`, `coupons.update`, `coupons.delete`).

---

## 2. Regression Scenarios & Checklist

| Priority | Feature / Flow | Test Scenario | Expected Result |
| :--- | :--- | :--- | :--- |
| **High** | Cart Coupon Validation | Deactivating an active coupon in Admin immediately invalidates it for customer carts. | Customer validation API returns "Coupon is inactive or invalid" (HTTP 422). |
| **High** | Order Placement Usages | Completing an order with a valid coupon increments `uses_count` in `coupons` table. | `uses_count` is incremented by 1, and `coupon_usages` log is created. |
| **High** | Usage Limits | Updating `usage_limit` in Admin dynamically restricts redemptions. | Carts trying to apply maxed-out coupons receive usage limit error. |
| **Medium** | Soft Delete Protection | Archiving/Deleting a coupon in Admin does not break historic order detail views or invoices. | Existing orders retain their `coupon_code` and `discount_amount` values without foreign key failure. |
| **Medium** | Swagger / OpenAPI | Regenerating OpenAPI docs via `l5-swagger:generate` preserves all public and admin endpoints. | Swagger UI renders cleanly at `http://localhost:8002/api/documentation`. |

---

## 3. Automated Regression Command

```bash
php artisan test --filter=CouponsTest
php artisan test --filter=AdminCouponManagementTest
php artisan test --filter=CheckoutTest
```
