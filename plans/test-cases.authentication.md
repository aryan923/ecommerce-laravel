# Test Cases: User Authentication (Customer) Module

**Module Name:** User Authentication (Customer)  
**Module ID:** 02  
**Test File:** `plans/test-cases.authentication.md`  
**Specification:** `specifications/feature.authentication.spec.md`  
**Plan:** `plans/plan.authentication.md`  
**Version:** 1.2  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-AUTH-001: User Registration Success
- **Preconditions**: Email and mobile do not exist in database.
- **Input**: Valid `first_name`, `last_name`, `email`, `mobile`, `password`, `password_confirmation`, `terms_accepted: true`.
- **Expected Result**: HTTP 201 Created response, user record created in `users` table, Sanctum bearer token returned in data payload.

### TC-AUTH-002: User Login with Email Success
- **Preconditions**: Registered user exists with active status.
- **Input**: Valid `login` (email) and correct `password`.
- **Expected Result**: HTTP 200 OK, valid Sanctum bearer token returned.

### TC-AUTH-003: User Login with Mobile Success
- **Preconditions**: Registered user exists with mobile number and active status.
- **Input**: Valid `login` (mobile number) and correct `password`.
- **Expected Result**: HTTP 200 OK, valid Sanctum bearer token returned.

### TC-AUTH-004: Get Authenticated User Profile (`/me`)
- **Preconditions**: User is logged in with active Sanctum bearer token.
- **Input**: `GET /api/v1/auth/me` with `Authorization: Bearer <token>` header.
- **Expected Result**: HTTP 200 OK, returns user profile object without password hash.

### TC-AUTH-005: User Logout Success
- **Preconditions**: Active bearer token provided in header.
- **Input**: `POST /api/v1/auth/logout`.
- **Expected Result**: HTTP 200 OK, current token deleted from `personal_access_tokens` table.

### TC-AUTH-006: Forgot Password Request Success
- **Preconditions**: User with given email exists.
- **Input**: `POST /api/v1/auth/forgot-password` with valid `identifier`.
- **Expected Result**: HTTP 200 OK, OTP record created in `otps` table.

### TC-AUTH-007: Password Reset with Valid OTP Success
- **Preconditions**: Valid unexpired OTP exists in `otps` table.
- **Input**: `POST /api/v1/auth/reset-password` with valid `identifier`, `otp_code`, and new `password`.
- **Expected Result**: HTTP 200 OK, password updated in database, existing tokens revoked.

---

## 2. Negative Test Scenarios

### TC-AUTH-008: Registration with Duplicate Email
- **Input**: Registration payload with an existing registered email.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `email` field.

### TC-AUTH-009: Registration with Duplicate Mobile
- **Input**: Registration payload with an existing registered mobile number.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `mobile` field.

### TC-AUTH-010: Login with Incorrect Password
- **Input**: Existing email with wrong password.
- **Expected Result**: HTTP 401 Unauthorized, message "Invalid login credentials".

### TC-AUTH-011: Login with Suspended Account Status
- **Preconditions**: User status set to `suspended` in database.
- **Input**: Correct login credentials.
- **Expected Result**: HTTP 403 Forbidden, message "Account is suspended".

### TC-AUTH-012: Access `/me` without Bearer Token
- **Input**: `GET /api/v1/auth/me` without Authorization header.
- **Expected Result**: HTTP 401 Unauthorized.

### TC-AUTH-013: Reset Password with Expired OTP Code
- **Preconditions**: OTP record created > 15 minutes ago.
- **Input**: `POST /api/v1/auth/reset-password` with expired code.
- **Expected Result**: HTTP 422 Unprocessable Entity, message "Invalid or expired OTP".

---

## 3. Validation Tests

- **TC-AUTH-014**: Registration fails when `terms_accepted` is `false` (HTTP 422).
- **TC-AUTH-015**: Registration fails when password is less than 8 characters or lacks uppercase/lowercase/numbers (HTTP 422).
- **TC-AUTH-016**: Reset password fails when `password_confirmation` does not match `password` (HTTP 422).

---

## 4. Permission & Security Tests

- **TC-AUTH-017**: Sanctum token cannot be reused after calling `/logout` endpoint (HTTP 401).
- **TC-AUTH-018**: Rate limiting triggers after 5 failed login attempts per minute (HTTP 429 Too Many Requests).
- **TC-AUTH-019**: Swagger API documentation at `http://localhost:8002/api/documentation` contains all Auth endpoints (`/register`, `/login`, `/me`, `/logout`, `/forgot-password`, `/reset-password`).
