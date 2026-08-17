# Test Cases: Module 29 — Admin Coupon Management

**Module Name:** Admin Coupon Management  
**Module ID:** 29  
**Test Case File:** `plans/test-cases.admin-coupons.md`  
**Specification File:** `specifications/feature.admin-coupons.spec.md`  

---

## 1. Test Suite Summary

This document defines all automated and manual test scenarios for Module 29 (Admin Coupon Management). It covers happy path CRUD operations, negative input validation, date-window constraints, active status toggling, soft-delete archiving, restriction pivot synchronization, performance report metrics, and permission guarding.

---

## 2. Test Cases Breakdown

### 2.1 Happy Path Scenarios

| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-ACPN-001** | Coupon Listing | Admin requests `GET /api/v1/admin/coupons` with valid token. | HTTP 200 OK with paginated list of coupons and metadata. |
| **TC-ACPN-002** | Coupon Creation | Admin submits `POST /api/v1/admin/coupons` with valid percentage coupon data. | HTTP 201 Created with coupon object, code converted to UPPERCASE. |
| **TC-ACPN-003** | Fixed Amount Coupon | Admin creates fixed amount coupon with `min_order_value`. | HTTP 201 Created with fixed amount attributes saved. |
| **TC-ACPN-004** | Free Shipping Coupon | Admin creates free shipping coupon (`type = free_shipping`). | HTTP 201 Created with `free_shipping = true`. |
| **TC-ACPN-005** | Single Coupon View | Admin requests `GET /api/v1/admin/coupons/{id}`. | HTTP 200 OK with full coupon data and restriction relations. |
| **TC-ACPN-006** | Coupon Update | Admin submits `PUT /api/v1/admin/coupons/{id}` with modified `usage_limit`. | HTTP 200 OK with updated attributes. |
| **TC-ACPN-007** | Status Toggle | Admin submits `PATCH /api/v1/admin/coupons/{id}/status` with `{"status": "inactive"}`. | HTTP 200 OK, status changes to `inactive`. |
| **TC-ACPN-008** | Coupon Archiving | Admin submits `DELETE /api/v1/admin/coupons/{id}`. | HTTP 200 OK, coupon soft-deleted/archived, `coupon_usages` preserved. |
| **TC-ACPN-009** | Usage Analytics | Admin requests `GET /api/v1/admin/coupons/{id}/reports`. | HTTP 200 OK with total redemptions, discount value, orders, and revenue. |

### 2.2 Validation & Negative Scenarios

| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-ACPN-010** | Duplicate Code | Admin creates coupon with an already existing code. | HTTP 422 Unprocessable Entity with code validation error. |
| **TC-ACPN-011** | Invalid Date Order | Admin submits `start_date` after `end_date`. | HTTP 422 Unprocessable Entity with date validation error. |
| **TC-ACPN-012** | Invalid Percentage | Admin submits percentage discount > 100%. | HTTP 422 Unprocessable Entity with value validation error. |
| **TC-ACPN-013** | Negative Minimum Value | Admin submits negative `min_order_value`. | HTTP 422 Unprocessable Entity with numerical error. |
| **TC-ACPN-014** | Invalid Type Enum | Admin submits invalid coupon `type` (`invalid_type`). | HTTP 422 Unprocessable Entity. |
| **TC-ACPN-015** | Non-existent Relations | Admin submits invalid `product_ids` or `category_ids`. | HTTP 422 Unprocessable Entity with relation validation error. |

### 2.3 Permission Scenarios

| Test Case ID | Feature | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-ACPN-016** | Unauthenticated Access | Guest requests admin coupon endpoints without Bearer token. | HTTP 401 Unauthenticated. |
| **TC-ACPN-017** | Unauthorized Role | Admin user without `coupons.create` permission tries to post coupon. | HTTP 403 Forbidden. |
| **TC-ACPN-018** | Delete Without Permission | Admin user without `coupons.delete` permission tries to delete coupon. | HTTP 403 Forbidden. |

---

## 3. Execution Command

```bash
php artisan test --filter=AdminCouponManagementTest
```
