# Test Cases: Product Reviews Module

**Module Name:** Product Reviews  
**Module ID:** 20  
**Test File:** `plans/test-cases.reviews.md`  
**Specification:** `specifications/feature.reviews.spec.md`  
**Plan:** `plans/plan.reviews.md`  
**Version:** 1.0  
**Target Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-REV-001: Customer Submit Review for Delivered Order Product
- **Preconditions**: Customer has delivered order `ORD-20260813-1001` containing product 1. Customer authenticated.
- **Input**: `POST /api/v1/customer/reviews` with payload:
  `{"order_id": 1, "product_id": 1, "rating": 5, "title": "Excellent product", "review": "Great quality and fast delivery"}`
- **Expected Result**: HTTP 201 Created, returns review object with `status = 'pending'`.

### TC-REV-002: Public Product Review Endpoint Shows Only Approved Reviews & Rating Summary
- **Preconditions**: Product 1 has 1 `approved` review (rating 5) and 1 `pending` review (rating 1).
- **Input**: `GET /api/v1/products/1/reviews`
- **Expected Result**: HTTP 200 OK, returns paginated list containing ONLY the 1 approved review, with `average_rating = 5.0` and `total_reviews = 1`.

### TC-REV-003: Admin Moderates Review to Approved Status
- **Preconditions**: Review 1 has status `pending`. Admin authenticated with `manage-reviews`.
- **Input**: `POST /api/v1/admin/reviews/1/status` with `{"status": "approved"}`
- **Expected Result**: HTTP 200 OK, review status updated to `approved`, `moderated_at` timestamp recorded.

### TC-REV-004: Customer Views Their Submitted Reviews
- **Preconditions**: Customer has submitted 2 reviews.
- **Input**: `GET /api/v1/customer/reviews`
- **Expected Result**: HTTP 200 OK, returns paginated array of 2 reviews submitted by customer.

---

## 2. Negative & Edge Case Scenarios

### TC-REV-005: Submit Review for Product Not in Delivered Order Fails
- **Preconditions**: Customer order is in status `confirmed` or `shipped` (not `delivered`), or product was never purchased.
- **Input**: `POST /api/v1/customer/reviews` with unpurchased `product_id`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "Reviews can only be submitted for products in delivered orders."

### TC-REV-006: Duplicate Review Submission for Same Order Product Fails
- **Preconditions**: Customer has already submitted a review for `(order_id: 1, product_id: 1)`.
- **Input**: `POST /api/v1/customer/reviews` with `order_id: 1, product_id: 1`.
- **Expected Result**: HTTP 422 Unprocessable Entity, error message "You have already reviewed this product for this order."

### TC-REV-007: Review Rating Outside 1 to 5 Range Fails Validation
- **Input**: `POST /api/v1/customer/reviews` with `rating = 6` or `rating = 0`.
- **Expected Result**: HTTP 422 Unprocessable Entity, validation error on `rating`.
