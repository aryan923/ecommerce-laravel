# Feature Specification: User Authentication (Customer) Module

**Module Name:** User Authentication (Customer)  
**Module ID:** 02  
**Specification File:** `specifications/feature.authentication.spec.md`  
**Version:** 1.2  
**Status:** Draft / Pending Implementation  
**Base SRS Document:** `Requirements/srs_apis.md` (§7.1–§7.7, §86, §87, §88, §100), `Requirements/development_modules.md` (§Module 02)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The User Authentication (Customer) module provides secure token-based authentication (Laravel Sanctum) and account lifecycle management for customers. It supports customer registration, dual-identifier login (email or mobile with password), profile retrieval, single or all-device logout token revocation, 6-digit OTP password reset, and email verification. All endpoints extend `BaseController`, use `ApiResponseTrait`, target `http://localhost:8002`, and MUST generate OpenAPI 3.0 annotations for live Swagger documentation.

---

## 2. Business Flow

### 2.1 Customer Registration Flow
1. Customer submits registration payload (`first_name`, `last_name`, `email`, `mobile`, `password`, `password_confirmation`, `terms_accepted`).
2. `RegisterRequest` validates input data against constraints.
3. System checks for duplicate `email` and `mobile` numbers.
4. System creates user record in `users` table with status `active` (or `pending_verification`).
5. Password is automatically hashed using bcrypt / Argon2id.
6. System issues a new Sanctum Bearer Token.
7. Response returns HTTP 201 Created with user profile data and Bearer token.

### 2.2 Dual-Identifier Login Flow
1. Customer submits login credentials (`login` containing email or mobile number, and `password`).
2. `LoginRequest` validates payload.
3. `AuthService` detects whether `login` field is an email address or a mobile number.
4. System verifies user credentials against `users` database table.
5. System verifies account status (`active`). If `suspended` or `inactive`, request is rejected with HTTP 403.
6. System issues a new Sanctum API Bearer Token.
7. Response returns HTTP 200 OK with Bearer Token and User Profile payload.

### 2.3 Profile Retrieval (`/me`) Flow
1. Authenticated customer sends `GET /api/v1/auth/me` with `Authorization: Bearer <token>` header.
2. `auth:sanctum` middleware authenticates token.
3. Controller returns customer profile data without password or secret attributes.

### 2.4 Logout Flow
1. Authenticated customer sends `POST /api/v1/auth/logout` with `Authorization: Bearer <token>`.
2. System revokes current Sanctum token (or all tokens if `logout_all=true`).
3. Response returns HTTP 200 OK success message.

### 2.5 Forgot & Reset Password Flow
1. Customer requests password reset by submitting `POST /api/v1/auth/forgot-password` with `identifier` (email or mobile).
2. System verifies user existence, generates a 6-digit numeric OTP valid for 15 minutes, hashes code, and stores in `otps` table.
3. Customer submits `POST /api/v1/auth/reset-password` with `identifier`, `otp_code`, `password`, and `password_confirmation`.
4. System verifies OTP validity, non-expiration, and attempt limits.
5. Password is updated in `users` table, OTP marked as verified, and all existing active Sanctum tokens are revoked for security.

---

## 3. Functional Requirements

- **FR-AUTH-001**: System shall support customer registration with first name, last name, email, mobile, password, and mandatory terms acceptance.
- **FR-AUTH-002**: System shall enforce strict unique constraints on `email` and `mobile` fields.
- **FR-AUTH-003**: System shall support dual-identifier login using either email or mobile number with password.
- **FR-AUTH-004**: System shall issue Sanctum Bearer Tokens upon successful registration and login.
- **FR-AUTH-005**: System shall revoke active token on `POST /api/v1/auth/logout`.
- **FR-AUTH-006**: System shall support revoking all tokens across all devices when `logout_all=true`.
- **FR-AUTH-007**: System shall support password recovery via 6-digit OTP code with 15-minute expiration.
- **FR-AUTH-008**: System shall enforce OTP attempt limits (maximum 3 failed attempts before invalidating OTP).
- **FR-AUTH-009**: System shall verify user status before issuing tokens (`active` status required).
- **FR-AUTH-010**: System shall provide `GET /api/v1/auth/me` endpoint to fetch authenticated customer profile.
- **FR-AUTH-011**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Post`, `@OA\Get`, `@OA\RequestBody`, `@OA\Response`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Authentication**: Laravel Sanctum (`Laravel\Sanctum\HasApiTokens`).
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).
- **Rate Limiting**: `throttle:login` (5 attempts per minute per IP/login identifier).

---

## 5. Database Changes

### 5.1 Update `users` Table Migration
Migration: `database/migrations/2026_08_11_000001_add_auth_fields_to_users_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `first_name` | `string` | `nullable` | Customer first name |
| `last_name` | `string` | `nullable` | Customer last name |
| `mobile` | `string` | `unique`, `nullable` | Customer mobile number |
| `mobile_verified_at` | `timestamp` | `nullable` | Mobile verification timestamp |
| `profile_image` | `string` | `nullable` | Profile picture URL |
| `date_of_birth` | `date` | `nullable` | Date of birth |
| `gender` | `enum` | `['male', 'female', 'other']`, `nullable` | Gender |
| `status` | `enum` | `['active', 'inactive', 'suspended', 'pending_verification']`, `default('active')` | User status |
| `role` | `enum` | `['customer', 'admin', 'staff', 'vendor']`, `default('customer')` | User role |
| `terms_accepted` | `boolean` | `default(false)` | Terms acceptance flag |

### 5.2 Create `otps` Table Migration
Migration: `database/migrations/2026_08_11_000002_create_otps_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `identifier` | `string` | `index` | Email or mobile number |
| `code` | `string` | | Hashed 6-digit OTP code |
| `type` | `enum` | `['email_verification', 'password_reset', 'login']` | Purpose of OTP |
| `attempts` | `integer` | `default(0)` | Failed attempt counter |
| `expires_at` | `timestamp` | | Expiration timestamp |
| `verified_at` | `timestamp` | `nullable` | Verification timestamp |
| `timestamps` | `timestamps` | | Created / Updated at |

---

## 6. API Requirements

Base URL: `/api/v1/auth`

### 6.1 Register Endpoint
`POST /api/v1/auth/register`

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "mobile": "+1234567890",
    "password": "SecretPassword123!",
    "password_confirmation": "SecretPassword123!",
    "terms_accepted": true
}
```

**Success Response (201 Created):**
```json
{
    "success": true,
    "message": "User registered successfully.",
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "mobile": "+1234567890",
            "role": "customer",
            "status": "active"
        },
        "token": "1|sanctum_token_string_here",
        "token_type": "Bearer"
    },
    "errors": null
}
```

### 6.2 Login Endpoint
`POST /api/v1/auth/login`

**Request Body:**
```json
{
    "login": "john.doe@example.com",
    "password": "SecretPassword123!"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "role": "customer"
        },
        "token": "2|sanctum_token_string_here",
        "token_type": "Bearer"
    },
    "errors": null
}
```

### 6.3 Authenticated User Profile Endpoint
`GET /api/v1/auth/me`  
**Headers:** `Authorization: Bearer <token>`

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "User profile retrieved successfully.",
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "mobile": "+1234567890",
            "role": "customer",
            "status": "active"
        }
    },
    "errors": null
}
```

### 6.4 Logout Endpoint
`POST /api/v1/auth/logout`  
**Headers:** `Authorization: Bearer <token>`

**Request Body (Optional):**
```json
{
    "logout_all": false
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Logged out successfully.",
    "data": null,
    "errors": null
}
```

### 6.5 Forgot Password Endpoint
`POST /api/v1/auth/forgot-password`

**Request Body:**
```json
{
    "identifier": "john.doe@example.com"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "If the account exists, a password reset code has been sent.",
    "data": null,
    "errors": null
}
```

### 6.6 Reset Password Endpoint
`POST /api/v1/auth/reset-password`

**Request Body:**
```json
{
    "identifier": "john.doe@example.com",
    "otp_code": "123456",
    "password": "NewSecretPassword123!",
    "password_confirmation": "NewSecretPassword123!"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Password reset successfully.",
    "data": null,
    "errors": null
}
```

---

## 7. UI Requirements

*N/A for backend API. All API endpoints must be documented in interactive Swagger UI at `http://localhost:8002/api/documentation`.*

---

## 8. Validation Rules

- `first_name`: `required|string|max:100`
- `last_name`: `required|string|max:100`
- `email`: `required|email|unique:users,email|max:255`
- `mobile`: `nullable|string|unique:users,mobile|regex:/^\+?[1-9]\d{7,14}$/`
- `password`: `required|string|min:8|regex:/[a-z]/|regex:/[A-Z]/|regex:/[0-9]/`
- `terms_accepted`: `required|boolean|accepted`
- `login`: `required|string`
- `identifier`: `required|string`
- `otp_code`: `required|string|digits:6`

---

## 9. Permission Rules

- Public Endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/forgot-password`
  - `POST /api/v1/auth/reset-password`
- Protected Endpoints (`auth:sanctum` Middleware Required):
  - `GET /api/v1/auth/me`
  - `POST /api/v1/auth/logout`

---

## 10. Business Rules

- Plaintext passwords MUST NEVER be logged or returned in any API response payload.
- Mobile numbers MUST be sanitized and stored in international E.164 format.
- Swagger OpenAPI annotations MUST be added to `AuthController` for all endpoints.

---

## 11. Error Handling

- **401 Unauthorized**: Missing/invalid Bearer token, or invalid login credentials.
- **403 Forbidden**: Account is `suspended` or `inactive`.
- **422 Unprocessable Entity**: Validation failure (email taken, password mismatch, invalid OTP).
- **429 Too Many Requests**: Rate limit exceeded on authentication endpoints.

---

## 12. Acceptance Criteria

- [ ] Migrations update `users` table and create `otps` table cleanly.
- [ ] User registration creates database record and returns valid Sanctum Bearer Token.
- [ ] Dual-identifier login accepts email or mobile number with password.
- [ ] Profile retrieval (`GET /me`) returns user data for valid Bearer token.
- [ ] Logout revokes active token (or all tokens when `logout_all=true`).
- [ ] Password reset validates 6-digit OTP code and updates password.
- [ ] `php artisan l5-swagger:generate` compiles OpenAPI spec containing all Auth endpoints targeting `http://localhost:8002`.
- [ ] All unit/feature tests pass with 100% success rate.

---

## 13. Edge Cases

- User attempts registration with duplicate email using different casing (`John@Example.com` vs `john@example.com`).
- User attempts login with suspended account status.
- User attempts password reset with expired or already verified OTP code.

---

## 14. Dependencies

- `Module 01: Foundation & Infrastructure` (`ApiResponseTrait`, `BaseController`, Exception Handler).
- `Laravel\Sanctum\HasApiTokens` package.

---

## 15. Open Questions

- None. Requirements align fully with `instruction.md`, `Requirements/srs_apis.md`, and `Requirements/development_modules.md`.
