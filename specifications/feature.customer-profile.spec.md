# Feature Specification: Customer Profile & Address Management Module

**Module Name:** Customer Profile & Address Management  
**Module ID:** 10  
**Specification File:** `specifications/feature.customer-profile.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§8.1–§8.2, §9), `Requirements/development_modules.md` (§Module 10)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Authentication / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Customer Profile & Address Management module enables authenticated customers (`User` model) to retrieve and manage their personal profile details, change their password, and maintain a book of multiple saved delivery/billing addresses (`Home`, `Office`, `Other`) with single default billing and shipping address assignment logic.

All API endpoints extend `BaseController`, utilize `ApiResponseTrait`, execute on `http://localhost:8002`, are protected under `auth:sanctum` middleware, and MUST include full OpenAPI 3.0 annotations for live Swagger documentation generation via `php artisan l5-swagger:generate`.

---

## 2. Business Flow

### 2.1 Customer Profile & Password Management Flow
1. Authenticated customer accesses their profile via `GET /api/v1/customer/profile`.
2. Customer updates profile info (`first_name`, `last_name`, `mobile`, `avatar`, `dob`, `gender`) via `PUT /api/v1/customer/profile`.
3. Customer updates password via `POST /api/v1/customer/change-password` by submitting `current_password`, `password`, and `password_confirmation`.
4. System verifies `current_password` against stored hash using `Hash::check()`. Upon validation, updates password hash and revokes existing Sanctum tokens if security policy dictates.

### 2.2 Address Book Management & Default Designation Flow
1. Customer lists saved addresses via `GET /api/v1/customer/addresses`.
2. Customer creates a new address via `POST /api/v1/customer/addresses` specifying `name`, `mobile`, `line_1`, `line_2`, `landmark`, `city`, `state`, `country`, `postal_code`, `type` (`home`, `office`, `other`), `is_default_shipping`, and `is_default_billing`.
3. If `is_default_shipping` is set to `true` (or if it's the customer's first saved address), the system automatically unsets `is_default_shipping` on all other addresses belonging to that customer.
4. Likewise, if `is_default_billing` is set to `true`, the system automatically unsets `is_default_billing` on all other addresses belonging to that customer.
5. Customer can explicitly update defaults via `PATCH /api/v1/customer/addresses/{id}/default-shipping` and `PATCH /api/v1/customer/addresses/{id}/default-billing`.

---

## 3. Functional Requirements

- **FR-PRF-001**: System shall allow authenticated customers to view their profile details (`id`, `first_name`, `last_name`, `name`, `email`, `mobile`, `avatar`, `dob`, `gender`, `email_verified_at`, `mobile_verified_at`).
- **FR-PRF-002**: System shall allow customers to update profile fields (`first_name`, `last_name`, `mobile`, `avatar`, `dob`, `gender`).
- **FR-PRF-003**: System shall validate mobile number uniqueness upon profile update.
- **FR-PRF-004**: System shall allow customers to change password requiring correct current password verification.
- **FR-PRF-005**: System shall enforce password complexity (minimum 8 characters).
- **FR-PRF-006**: System shall allow customers to create, read, update, and delete saved addresses in `addresses` table.
- **FR-PRF-007**: System shall classify addresses into types: `home`, `office`, `other`.
- **FR-PRF-008**: System shall enforce strictly one default shipping address and one default billing address per customer.
- **FR-PRF-009**: System shall automatically designate the first created address as both default shipping and default billing address if no previous defaults exist.
- **FR-PRF-010**: System shall prevent customers from accessing, modifying, or deleting addresses belonging to other customers (`user_id` authorization check).
- **FR-PRF-011**: Every API endpoint in this module MUST contain complete OpenAPI 3.0 annotations (`@OA\Get`, `@OA\Post`, `@OA\Put`, `@OA\Patch`, `@OA\Delete`) referencing server `http://localhost:8002`.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x with PHP 8.4.
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **Authentication Guard**: `auth:sanctum`.
- **Ownership Isolation**: Scope all address queries by `where('user_id', auth()->id())`.
- **OpenAPI Target**: `http://localhost:8002` (Auto-generated via `php artisan l5-swagger:generate`).

---

## 5. Database Changes

### 5.1 Create `addresses` Table Migration
Migration File: `database/migrations/2026_08_11_000018_create_addresses_table.php`

| Column | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `bigIncrements` | `primary` | Primary Key |
| `user_id` | `unsignedBigInteger` | `foreign`, `index` | Foreign key referencing `users(id)` |
| `name` | `string` | | Recipient full name |
| `mobile` | `string`, `20` | | Recipient contact phone number |
| `line_1` | `string` | | Street address line 1 |
| `line_2` | `string` | `nullable` | Apartment, suite, unit line 2 |
| `landmark` | `string` | `nullable` | Nearby landmark |
| `city` | `string` | `100` | City name |
| `state` | `string` | `100` | State / Province |
| `country` | `string` | `100`, `default('India')` | Country name |
| `postal_code` | `string` | `20`, `index` | Postal / PIN code |
| `type` | `enum` | `['home', 'office', 'other']`, `default('home')` | Address classification |
| `is_default_billing` | `boolean` | `default(false)`, `index` | Flag for default billing address |
| `is_default_shipping` | `boolean` | `default(false)`, `index` | Flag for default shipping address |
| `timestamps` | `timestamps` | | Created / Updated at |

---

## 6. API Requirements

### 6.1 Customer Profile & Address APIs (`/api/v1/customer`)
- `GET /api/v1/customer/profile` — Get authenticated customer profile
- `PUT /api/v1/customer/profile` — Update customer profile
- `POST /api/v1/customer/change-password` — Change customer password
- `GET /api/v1/customer/addresses` — List saved addresses
- `POST /api/v1/customer/addresses` — Create a new saved address
- `GET /api/v1/customer/addresses/{id}` — Get single address details
- `PUT /api/v1/customer/addresses/{id}` — Update saved address
- `DELETE /api/v1/customer/addresses/{id}` — Delete saved address
- `PATCH /api/v1/customer/addresses/{id}/default-shipping` — Mark address as default shipping
- `PATCH /api/v1/customer/addresses/{id}/default-billing` — Mark address as default billing

---

## 7. Validation Rules

### 7.1 Update Profile Request (`UpdateProfileRequest`)
- `first_name`: `sometimes|string|max:100`
- `last_name`: `sometimes|string|max:100`
- `mobile`: `sometimes|string|max:20|unique:users,mobile,{user_id}`
- `avatar`: `nullable|string|url|max:255`
- `dob`: `nullable|date|before:today`
- `gender`: `nullable|in:male,female,other`

### 7.2 Change Password Request (`ChangePasswordRequest`)
- `current_password`: `required|string`
- `password`: `required|string|min:8|confirmed`

### 7.3 Address Request (`AddressRequest`)
- `name`: `required|string|max:150`
- `mobile`: `required|string|max:20`
- `line_1`: `required|string|max:255`
- `line_2`: `nullable|string|max:255`
- `landmark`: `nullable|string|max:255`
- `city`: `required|string|max:100`
- `state`: `required|string|max:100`
- `country`: `required|string|max:100`
- `postal_code`: `required|string|max:20`
- `type`: `sometimes|in:home,office,other`
- `is_default_shipping`: `sometimes|boolean`
- `is_default_billing`: `sometimes|boolean`

---

## 8. Business Rules

1. **Ownership Isolation**: Every address operation (`show`, `update`, `destroy`, `setDefault`) MUST verify that `$address->user_id === auth()->id()`. Returning HTTP 404/403 for unauthorized access attempts.
2. **Single Default Exclusivity**: Setting `is_default_shipping = true` on an address automatically updates all other addresses for the same `user_id` to `is_default_shipping = false`. Same logic applies for `is_default_billing`.
3. **First Address Default Fallback**: When a customer creates their first address, the system automatically sets both `is_default_shipping` and `is_default_billing` to `true`.
4. **Current Password Verification**: `change-password` endpoint MUST execute `Hash::check($request->current_password, $user->password)` before allowing password updates.

---

## 9. Acceptance Criteria

- [ ] Migration `2026_08_11_000018_create_addresses_table.php` executes cleanly.
- [ ] `Address` Eloquent model created with `belongsTo(User::class)` and default scopes.
- [ ] `User` model updated with `addresses()` relationship and helper accessors.
- [ ] `CustomerProfileController` implemented handling profile fetch, profile update, and password change.
- [ ] `AddressController` implemented handling 7 address management endpoints (`index`, `store`, `show`, `update`, `destroy`, `setDefaultShipping`, `setDefaultBilling`).
- [ ] All 10 API endpoints contain complete OpenAPI 3.0 annotations.
- [ ] `php artisan l5-swagger:generate` completes with zero errors.
- [ ] Automated feature test suite `CustomerProfileTest.php` passes with 100% success rate.
