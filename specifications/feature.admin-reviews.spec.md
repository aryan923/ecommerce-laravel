# Feature Specification: Admin Review Moderation (Module 32)

## 1. Overview
Module 32 provides complete end-to-end capabilities for store administrators to manage, moderate, filter, and audit customer product reviews. It pairs a robust Laravel backend REST API (`/api/v1/admin/reviews`) with a responsive, modern React Admin SPA page (`ReviewsPage.jsx`) adhering strictly to the design system established in Customer Accounts & Shipping management.

---

## 2. User Stories & Use Cases

### 2.1 Store Administrator
- **Review Summary Analytics**: As an admin, I want to see real-time KPI metrics for total customer reviews, pending approvals, approved reviews, rejected/hidden reviews, and the overall average rating.
- **Review Filtering & Search**: As an admin, I want to filter customer reviews by status (`pending`, `approved`, `rejected`, `hidden`), star rating (`1` to `5` stars), product, or search by reviewer name, email, review title, or review body text.
- **Single Review Moderation**: As an admin, I want to approve, reject, hide, or restore a review with optional administrative notes explaining the decision.
- **Bulk Moderation Actions**: As an admin, I want to select multiple pending or existing reviews and perform bulk approval, bulk rejection, or bulk hide actions.
- **Review Details & Media Inspection**: As an admin, I want to inspect customer uploaded review images, verified purchase order badges, customer profile link, and product catalog details in a modal popup.
- **Audit Logging**: All review status changes, bulk moderation actions, and deletions must be logged in the system audit log.

---

## 3. Data Model & Schema

### `reviews` Table Specification
| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | BigInteger | Primary Key, Auto Increment | Unique review ID |
| `product_id` | BigInteger | Foreign Key (`products.id`), Indexed | Target product ID |
| `user_id` | BigInteger | Foreign Key (`users.id`), Indexed | Review author customer ID |
| `order_id` | BigInteger | Foreign Key (`orders.id`), Nullable, Indexed | Verified purchase order ID |
| `rating` | TinyInteger | 1 to 5, Required, Indexed | Star rating value |
| `title` | String(255) | Nullable | Brief review headline |
| `review` | Text | Required | Main customer feedback review body |
| `images` | JSON | Nullable | Array of image URLs submitted with review |
| `status` | Enum | `'pending'`, `'approved'`, `'rejected'`, `'hidden'`, Default: `'pending'` | Current moderation state |
| `admin_notes` | Text | Nullable | Internal notes by staff explaining moderation choice |
| `moderated_by` | BigInteger | Foreign Key (`admin_users.id`), Nullable | Admin user who performed moderation |
| `moderated_at` | Timestamp | Nullable | Timestamp when review was approved/rejected/hidden |
| `created_at` | Timestamp | Required | Review submission timestamp |
| `updated_at` | Timestamp | Required | Review last update timestamp |

---

## 4. API Endpoint Specifications

### 4.1 `GET /api/v1/admin/reviews/stats`
- **Description**: Returns aggregate summary statistics for the review moderation dashboard.
- **Authentication**: Required (`Bearer` Token, RBAC Permission: `reviews.view`).
- **Response**:
```json
{
  "success": true,
  "message": "Review statistics retrieved successfully.",
  "data": {
    "total_reviews": 128,
    "pending_reviews": 14,
    "approved_reviews": 102,
    "rejected_reviews": 8,
    "hidden_reviews": 4,
    "average_rating": 4.65,
    "rating_breakdown": {
      "5_star": 75,
      "4_star": 30,
      "3_star": 15,
      "2_star": 5,
      "1_star": 3
    }
  },
  "errors": null
}
```

### 4.2 `GET /api/v1/admin/reviews`
- **Description**: Returns paginated review listings with advanced filters and sorting.
- **Query Parameters**:
  - `status`: `pending` | `approved` | `rejected` | `hidden` (optional)
  - `rating`: `1`..`5` (optional)
  - `product_id`: Integer (optional)
  - `search`: String (searches reviewer name, email, review title, review content)
  - `sort_by`: `created_at` | `rating` | `id` (default: `created_at`)
  - `sort_order`: `asc` | `desc` (default: `desc`)
  - `page`: Integer (default: `1`)
  - `per_page`: Integer (default: `12`)

### 4.3 `GET /api/v1/admin/reviews/{id}`
- **Description**: Fetch detailed review details with product, customer, order verification info, and audit trail.

### 4.4 `PATCH /api/v1/admin/reviews/{id}/status`
- **Description**: Update moderation status of a specific review.
- **Request Body**:
```json
{
  "status": "approved", // approved | rejected | hidden | pending
  "admin_notes": "Verified authentic customer feedback."
}
```

### 4.5 `POST /api/v1/admin/reviews/bulk-status`
- **Description**: Bulk update moderation status for multiple review IDs.
- **Request Body**:
```json
{
  "ids": [10, 11, 15],
  "status": "approved",
  "admin_notes": "Bulk approved by moderator."
}
```

### 4.6 `DELETE /api/v1/admin/reviews/{id}`
- **Description**: Delete a review record (RBAC Permission: `reviews.delete`, Audit Logged).

### 4.7 `POST /api/v1/admin/reviews/bulk-delete`
- **Description**: Bulk delete review records (RBAC Permission: `reviews.delete`, Audit Logged).

---

## 5. React Admin SPA View (`ReviewsPage.jsx`)

### 5.1 Design & Layout System
- **Page Top Header Row**: `className="page-header-row"` with Title `Review Moderation & Feedback` and Subtitle description.
- **Top Toolbar**: Refresh button with loading spinner, Currency switcher (if applicable), and Quick status filter buttons.
- **Executive KPI Cards (`stat-cards-grid-4`)**:
  1. **Total Reviews**: Count badge, indigo icon badge (`<MessageSquare size={16} />`).
  2. **Pending Approval**: Count badge, amber active border highlight, amber icon badge (`<Clock size={16} />`).
  3. **Approved Reviews**: Count badge, emerald active border highlight, green icon badge (`<CheckCircle2 size={16} />`).
  4. **Average Rating**: 4.65 ⭐ score, purple icon badge (`<Star size={16} />`).
- **Enclosed Main Card Container**: Single-line top navigation tabs (`All Reviews`, `Pending Moderation`, `Approved`, `Rejected`, `Hidden`), search input, 1-5 star dropdown filter, and responsive table.
- **Review Detail Modal**: Full review modal with star display, photo gallery lightbox, verified customer badge, and moderation notes form.
