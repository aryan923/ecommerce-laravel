# Test Cases: Customer Profile & Address Management Module

**Module Name:** Customer Profile & Address Management  
**Module ID:** 10  
**Test File:** `plans/test-cases.customer-profile.md`  
**Specification:** `specifications/feature.customer-profile.spec.md`  
**Plan:** `plans/plan.customer-profile.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-PRF-001: Fetch Authenticated Customer Profile
- **Preconditions**: Authenticated customer with valid Sanctum Bearer token.
- **Input**: `GET /api/v1/customer/profile`.
- **Expected Result**: HTTP 200 OK, returns customer profile details (`first_name`, `last_name`, `email`, `mobile`, `dob`, `gender`).

### TC-PRF-002: Update Profile Information Success
- **Input**: `PUT /api/v1/customer/profile` with `first_name: "John"`, `last_name: "Doe"`, `mobile: "+19876543210"`.
- **Expected Result**: HTTP 200 OK, `users` record updated in database.

### TC-PRF-003: Change Password Success
- **Input**: `POST /api/v1/customer/change-password` with `current_password: "oldpassword"`, `password: "newsecret123"`, `password_confirmation: "newsecret123"`.
- **Expected Result**: HTTP 200 OK, password hash updated in database and new password works for login.

### TC-PRF-004: Create First Saved Address (Auto-Default Assignment)
- **Input**: `POST /api/v1/customer/addresses` with `name: "Home Address"`, `line_1: "123 Main St"`, `city: "Mumbai"`, `state: "Maharashtra"`, `postal_code: "400001"`, `type: "home"`.
- **Expected Result**: HTTP 201 Created, address created with `is_default_shipping = true` and `is_default_billing = true` (first address auto-default rule).

### TC-PRF-005: Create Second Address & Update Default Shipping
- **Preconditions**: Address 1 is default shipping.
- **Input**: `POST /api/v1/customer/addresses` with `is_default_shipping: true`.
- **Expected Result**: HTTP 201 Created, Address 2 marked `is_default_shipping = true`, Address 1 updated to `is_default_shipping = false`.

### TC-PRF-006: Delete Saved Address Success
- **Input**: `DELETE /api/v1/customer/addresses/{id}`.
- **Expected Result**: HTTP 200 OK, address removed from database.

---

## 2. Negative Test Scenarios

### TC-PRF-007: Change Password Incorrect Current Password Failure
- **Input**: `POST /api/v1/customer/change-password` with `current_password: "wrongpassword"`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `current_password`.

### TC-PRF-008: Password Confirmation Mismatch Validation Error
- **Input**: `POST /api/v1/customer/change-password` with `password: "pass1234"`, `password_confirmation: "different1234"`.
- **Expected Result**: HTTP 422 Unprocessable Entity.

### TC-PRF-009: Cross-Customer Address Access Security Prevention
- **Preconditions**: User A owns Address ID 1. User B attempts access.
- **Input**: User B issues `GET /api/v1/customer/addresses/1` or `DELETE /api/v1/customer/addresses/1`.
- **Expected Result**: HTTP 404 Not Found or 403 Forbidden, preventing unauthorized cross-customer data access.

### TC-PRF-010: Unauthenticated Profile Access Attempt
- **Input**: `GET /api/v1/customer/profile` without Bearer token.
- **Expected Result**: HTTP 401 Unauthorized.
