# Regression Strategy: Customer Profile & Address Management Module

**Module Name:** Customer Profile & Address Management  
**Module ID:** 10  
**Regression File:** `plans/regression.customer-profile.md`  
**Specification:** `specifications/feature.customer-profile.spec.md`  
**Plan:** `plans/plan.customer-profile.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Existing Affected Features

Customer Profile & Address Management impacts:
- Module 02 Customer Authentication (Sanctum session verification, password hash updates)
- Module 10 Cart & Checkout (Shipping & Billing address selection during checkout)
- Module 11 Order Management (Storing snapshot of shipping address on order placement)
- Module 13 Customer Management Admin Panel (Admin customer detail view & status checks)

---

## 2. Regression Scenarios

### REG-PRF-001: Password Hash Security Verification
- **Scenario**: Verify that changing password updates the stored bcrypt hash in `users` table and invalidates previous session tokens if configured, while retaining active authentication capabilities with the new password.
- **Priority**: Critical
- **Expected Result**: Password updated securely; authentication works with new password.

### REG-PRF-002: Default Shipping/Billing Address Exclusivity Demotion
- **Scenario**: Verify that updating or marking an address as default shipping/billing automatically demotes all other saved addresses for that customer to non-default status, ensuring checkout workflows always retrieve exactly one default shipping and billing address.
- **Priority**: High
- **Expected Result**: Single default shipping and billing address maintained per customer.

### REG-PRF-003: Cross-Customer Data Isolation Integrity
- **Scenario**: Verify that customers cannot view, edit, or delete another customer's saved address records, even if guessing address IDs directly.
- **Priority**: Critical
- **Expected Result**: Zero data leakage across customer boundaries.

---

## 3. Smoke Test Suite

1. Execute `php artisan test` to verify all existing application test suites pass.
2. Execute `php artisan l5-swagger:generate` to verify documentation generation.
3. Execute `php artisan test --filter=CustomerProfileTest`.
4. Perform end-to-end API verification: Register Customer → Fetch Profile → Update Profile → Change Password → Create Address (Auto-Default) → Create 2nd Address & Set Default → Delete Address.
