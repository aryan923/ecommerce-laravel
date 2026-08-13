# Feature Specification: Product Reviews Module

**Module Name:** Product Reviews  
**Module ID:** 20  
**Specification File:** `specifications/feature.reviews.spec.md`  
**Version:** 1.0  
**Status:** Draft / Pending Implementation  
**Base SRS References:** `Requirements/srs_apis.md` (§55–§56), `Requirements/admin_panel.md` (§28), `Requirements/development_modules.md` (§Module 20)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Product Reviews module enables verified customers (who have completed/delivered purchases) to submit star ratings (1 to 5), review titles, detailed text descriptions, and optional photo URLs for purchased products. It enforces a verified post-purchase validation rule ensuring customers can only review products from delivered orders.

To maintain catalog quality and mitigate spam, all submitted reviews default to `pending` moderation status. Store administrators can inspect, approve, reject, hide, or delete reviews via dedicated Admin Review Management endpoints. Public review listing APIs (`GET /api/v1/products/{product_id}/reviews`) serve approved reviews along with calculated average rating statistics.

All API responses strictly follow `ApiResponseTrait` standards outputting JSON on `http://localhost:8002` with OpenAPI 3.0 annotations.

---

## 2. Business Flow

```text
  Customer Submits Verified Purchase Review
  (POST /api/v1/customer/reviews)
              │
              ▼
  Verify Order Belongs to Customer & Status == 'delivered'
              │
              ▼
  Review Created with Status 'pending'
              │
              ▼
  Admin Moderates Review
  (POST /api/v1/admin/reviews/{id}/status)
              │
      ┌───────┼───────────────┐
      ▼       ▼               ▼
  Approved  Rejected        Hidden
      │       │               │
      ▼       ▼               ▼
  Public    Hidden from     Hidden from
  Catalog   Catalog         Catalog
```

---

## 3. Functional Requirements

- **FR-REV-001**: Customer review submission (`POST /api/v1/customer/reviews`) shall enforce verified purchase validation (customer must have a delivered order containing the target `product_id`).
- **FR-REV-002**: Rating must be an integer between 1 and 5 inclusive.
- **FR-REV-003**: System shall prevent duplicate review submissions for the same product in the same order (`user_id`, `order_id`, `product_id` uniqueness).
- **FR-REV-004**: Submitted reviews shall default to `pending` status.
- **FR-REV-005**: Public review listing endpoint (`GET /api/v1/products/{product_id}/reviews`) shall return ONLY reviews with `status = 'approved'`, including average rating score and total review count breakdown.
- **FR-REV-006**: Customer shall be able to view their submitted reviews (`GET /api/v1/customer/reviews`).
- **FR-REV-007**: Admin review listing endpoint (`GET /api/v1/admin/reviews`) shall support pagination and filtering by `status`, `rating`, or product/customer search terms.
- **FR-REV-008**: Admin review status update endpoint (`POST /api/v1/admin/reviews/{id}/status`) shall allow transitioning status between `approved`, `rejected`, `hidden`, and `pending`.
- **FR-REV-009**: Admin shall be able to delete inappropriate reviews (`DELETE /api/v1/admin/reviews/{id}`).
- **FR-REV-010**: Every endpoint must include OpenAPI 3.0 (`@OA`) documentation annotations.

---

## 4. Technical Requirements

- **Framework**: Laravel 12.x / PHP 8.4.
- **Authentication & RBAC**: Sanctum Guard (`auth:sanctum`) and Spatie Permission (`manage-reviews`).
- **Base Controller**: `App\Http\Controllers\Api\V1\BaseController`.
- **Response Trait**: `App\Traits\ApiResponseTrait`.
- **OpenAPI Target**: `http://localhost:8002`.

---

## 5. Database Schema Specification

### 5.1 Table: `reviews`
Migration: `database/migrations/2026_08_11_000039_create_reviews_table.php`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `bigIncrements` | Primary | Primary Key |
| `product_id` | `foreignId` | FK -> `products` | Target Product FK |
| `user_id` | `foreignId` | FK -> `users` | Customer FK |
| `order_id` | `foreignId` | FK -> `orders` | Delivered Purchase Order FK |
| `rating` | `unsignedTinyInteger` | `1` to `5` | Star rating score |
| `title` | `string` | Nullable | Review title summary |
| `review` | `text` | | Detailed review content |
| `images` | `json` | Nullable | Array of photo URLs |
| `status` | `enum` | `['pending', 'approved', 'rejected', 'hidden']`, Default `'pending'` | Moderation status |
| `admin_notes` | `text` | Nullable | Admin internal notes |
| `moderated_at` | `timestamp` | Nullable | Moderation timestamp |
| `moderated_by` | `foreignId` | Nullable, FK -> `admin_users` | Admin user FK |
| `timestamps` | `timestamps` | | Timestamps |

**Indexes & Constraints:**
- Unique Index: `(user_id, order_id, product_id)` to prevent duplicate reviews for the same order item.

---

## 6. API Endpoints Specification

### 6.1 Public Catalog Review Endpoints
- `GET /api/v1/products/{product_id}/reviews` — Public listing of approved product reviews + average rating summary.

### 6.2 Customer Review Endpoints (`auth:sanctum`)
- `POST /api/v1/customer/reviews` — Submit verified purchase product review.
- `GET /api/v1/customer/reviews` — List authenticated customer's reviews.

### 6.3 Admin Review Management Endpoints (`auth:sanctum`)
- `GET /api/v1/admin/reviews` — Admin list all reviews (filters: status, rating, search).
- `GET /api/v1/admin/reviews/{id}` — Admin view review detail.
- `POST /api/v1/admin/reviews/{id}/status` — Update review status (`approved`, `rejected`, `hidden`).
- `DELETE /api/v1/admin/reviews/{id}` — Delete review.

---

## 7. Verification & Acceptance Criteria

1. Database migration runs cleanly with unique constraints.
2. Review submission verifies order ownership, delivery status, and product presence in order.
3. Unapproved reviews do not appear in public product review API response.
4. Admin status updates accurately change review availability in public catalog.
5. OpenAPI documentation updates cleanly via `php artisan l5-swagger:generate`.
