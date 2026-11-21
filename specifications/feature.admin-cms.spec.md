# Feature Specification: Admin CMS / Banners / Pages (Module 35)

## 1. Module Overview

Module 35 provides a complete content management system (CMS) and banner management framework for the e-commerce platform. It empowers store administrators to design, schedule, and publish promotional banners across desktop and mobile storefront interfaces, as well as author rich dynamic CMS pages (e.g., About Us, Privacy Policy, Terms & Conditions, Shipping Policy, Return Policy, FAQs) with dedicated SEO metadata.

The module consists of two main pillars:
1. **Banner Management**: Promotional marketing banners with desktop/mobile responsive imagery, CTA target URLs, button labels, date-based activation scheduling (`starts_at`, `ends_at`), placement positioning (`home_hero`, `category_banner`, `sidebar`, `footer`, `popup`), and display sort ordering.
2. **CMS Page Management**: Rich HTML content authoring, auto-generated custom URL slugs, SEO title and meta description management, and publishing status workflows (`published`, `draft`, `archived`).

In addition to the secure Admin REST API endpoints and React Admin UI screens (`BannersPage.jsx`, `PagesPage.jsx`, `PageEditorModal.jsx`), Module 35 exposes public read endpoints for storefront consumption (`/api/v1/banners` and `/api/v1/pages/{slug}`).

---

## 2. Business Flow

```
+-----------------------------------------------------------------------------------+
|                                BANNER WORKFLOW                                    |
+-----------------------------------------------------------------------------------+
  Admin Creates Banner ──> Assign Placement & Upload Desktop/Mobile Images
                                 │
                                 ▼
                     Set Date Schedule & Sort Order ──> Active & In Date Range?
                                                            │
                                        ┌───────────────────┴───────────────────┐
                                        ▼                                       ▼
                                [ YES: Display on Storefront ]       [ NO: Hidden / Inactive ]
```

```
+-----------------------------------------------------------------------------------+
|                               CMS PAGE WORKFLOW                                   |
+-----------------------------------------------------------------------------------+
  Admin Authors Page ──> Enter Title, Generate/Edit Slug, Write Content & SEO Meta
                                 │
                                 ▼
                         Select Status: [Draft / Published]
                                 │
                                 ├───────────────────────────────┐
                                 ▼                               ▼
                      [ Published Status ]             [ Draft Status ]
                                 │                               │
                                 ▼                               ▼
                     Visible at `/pages/{slug}`       Return 404 on Storefront
```

---

## 3. Functional Requirements

### 3.1 Banner Management
- **Banner Creation & Editing**: Admin can create new banners or edit existing banners with title, desktop image URL, mobile image URL, CTA target URL (`link_url`), button text (`button_text`), placement target, sort order, start date/time (`starts_at`), end date/time (`ends_at`), and status (`is_active`).
- **Placement Targeting**: Banners can be targeted to specific locations:
  - `home_hero` (Homepage Hero Carousel)
  - `category_banner` (Category Page Top Header)
  - `sidebar` (Sidebar Promotional Slot)
  - `footer` (Footer Promo Bar)
  - `popup` (Promotional Modal Popup)
- **Responsive Media**: Desktop and mobile images are managed independently to ensure optimal aspect ratios and load speeds across devices.
- **Date Scheduling**: Banners automatically become active on storefronts when current server time is within `[starts_at, ends_at]` range (if provided) and `is_active` is true.
- **Reordering**: Admin can specify numeric `sort_order` or perform drag-and-and-drop reordering via API to control display sequence.
- **Status Toggle**: One-click activate/deactivate banner toggle without deleting records.

### 3.2 CMS Page Management
- **Page Creation & Authoring**: Admin can create pages with title, slug, HTML content (WYSIWYG editor input), SEO title (`seo_title`), SEO description (`seo_description`), and status (`published`, `draft`, `archived`).
- **Automatic & Custom Slug Generation**: Slug auto-generates from title on creation (URL-friendly kebab-case) but remains fully editable and validated for system-wide uniqueness.
- **Pre-configured System Pages**: Quick templates or pre-seeded entries for standard store pages: About Us (`about-us`), Privacy Policy (`privacy-policy`), Terms & Conditions (`terms-and-conditions`), Shipping Policy (`shipping-policy`), Return Policy (`return-policy`), FAQs (`faqs`).
- **SEO Preview**: Interactive Google search engine result snippet preview in Admin UI (showing title, URL slug, meta description, and character counters).
- **Storefront Page Renderer**: Public REST API delivers sanitized HTML content and SEO metadata for storefront rendering.

---

## 4. Technical Requirements

- **Backend Stack**: Laravel 11 framework, Eloquent ORM, Sanctum Auth, Spatie Permissions (RBAC).
- **Response Standardization**: All API responses must use `App\Traits\ApiResponseTrait`.
- **Validation**: Form request classes for all admin mutate operations (`StoreBannerRequest`, `UpdateBannerRequest`, `StorePageRequest`, `UpdatePageRequest`).
- **Sanitizations**: HTML content in CMS pages must be sanitized to prevent XSS attacks while permitting standard styling tags (`p`, `h1`-`h6`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `img`, `iframe`, `table`, `blockquote`).
- **Audit Logging**: Any banner/page creation, status update, content change, or deletion must log an event in `audit_logs`.
- **Frontend Admin Stack**: React, Lucide Icons, Tailwind CSS/Vanilla CSS components, HTML editor integration, modal drawers.

---

## 5. Database Changes

### 5.1 `banners` Table Schema

| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | BigInteger | Primary Key, Auto Increment | Unique banner ID |
| `title` | String(255) | Required | Internal descriptive banner title |
| `image_desktop` | String(1024) | Required | Desktop banner image URL/path |
| `image_mobile` | String(1024) | Nullable | Mobile responsive banner image URL/path |
| `link_url` | String(1024) | Nullable | Target URL hyperlink when banner clicked |
| `button_text` | String(100) | Nullable | CTA button caption (e.g., "Shop Now") |
| `placement` | Enum | `'home_hero'`, `'category_banner'`, `'sidebar'`, `'footer'`, `'popup'`, Required, Default: `'home_hero'` | Storefront placement location |
| `sort_order` | Integer | Required, Default: `0` | Display ordering index (ascending) |
| `is_active` | Boolean | Required, Default: `true` | Active/Inactive flag |
| `starts_at` | Timestamp | Nullable | Scheduled start date/time |
| `ends_at` | Timestamp | Nullable | Scheduled end date/time |
| `created_by` | BigInteger | Foreign Key (`admin_users.id`), Nullable | Admin user ID who created banner |
| `created_at` | Timestamp | Required | Creation timestamp |
| `updated_at` | Timestamp | Required | Update timestamp |

Indexes:
- `INDEX idx_banners_placement_active (placement, is_active, sort_order)`
- `INDEX idx_banners_dates (starts_at, ends_at)`

---

### 5.2 `pages` Table Schema

| Column | Type | Attributes | Description |
|---|---|---|---|
| `id` | BigInteger | Primary Key, Auto Increment | Unique page ID |
| `title` | String(255) | Required | Page headline / title |
| `slug` | String(255) | Unique, Required, Indexed | URL path identifier (e.g. `about-us`) |
| `content` | LongText | Required | HTML body content |
| `seo_title` | String(255) | Nullable | Meta title for search engines |
| `seo_description` | Text | Nullable | Meta description for search engines |
| `status` | Enum | `'published'`, `'draft'`, `'archived'`, Required, Default: `'draft'` | Publishing workflow status |
| `created_by` | BigInteger | Foreign Key (`admin_users.id`), Nullable | Admin user ID who authored page |
| `updated_by` | BigInteger | Foreign Key (`admin_users.id`), Nullable | Admin user ID who last edited page |
| `created_at` | Timestamp | Required | Creation timestamp |
| `updated_at` | Timestamp | Required | Update timestamp |

Indexes:
- `UNIQUE idx_pages_slug (slug)`
- `INDEX idx_pages_status (status)`

---

## 6. API Requirements

### 6.1 Storefront Public Endpoints

#### 6.1.1 `GET /api/v1/banners`
- **Access**: Public
- **Query Parameters**:
  - `placement`: String (e.g., `home_hero`, `sidebar`). Optional.
- **Description**: Returns all currently active banners where `is_active = true` AND current time is between `starts_at` and `ends_at` (or null). Ordered by `sort_order ASC`.
- **Response**:
```json
{
  "success": true,
  "message": "Banners retrieved successfully.",
  "data": [
    {
      "id": 1,
      "title": "Summer Super Sale",
      "image_desktop": "/storage/banners/summer_desktop.jpg",
      "image_mobile": "/storage/banners/summer_mobile.jpg",
      "link_url": "/category/summer-collection",
      "button_text": "Shop Sale",
      "placement": "home_hero",
      "sort_order": 1
    }
  ],
  "errors": null
}
```

#### 6.1.2 `GET /api/v1/pages/{slug}`
- **Access**: Public
- **Description**: Returns published page content and SEO metadata by unique slug. Returns 404 if not found or status is not `published`.
- **Response**:
```json
{
  "success": true,
  "message": "Page retrieved successfully.",
  "data": {
    "id": 2,
    "title": "Privacy Policy",
    "slug": "privacy-policy",
    "content": "<h1>Privacy Policy</h1><p>We respect your privacy...</p>",
    "seo_title": "Privacy Policy | Our Store",
    "seo_description": "Read our store privacy policy and data protection terms.",
    "updated_at": "2026-09-17T12:00:00.000000Z"
  },
  "errors": null
}
```

---

### 6.2 Admin Endpoints (Sanctum Auth + RBAC Permissions)

#### 6.2.1 Banners Admin Endpoints

- `GET /api/v1/admin/banners` (Permission: `banners.view`)
  - Query params: `placement`, `status` (`active`/`inactive`), `search`, `page`, `per_page`.
- `POST /api/v1/admin/banners` (Permission: `banners.create`)
  - Request Body: `title`, `image_desktop`, `image_mobile`, `link_url`, `button_text`, `placement`, `sort_order`, `is_active`, `starts_at`, `ends_at`.
- `GET /api/v1/admin/banners/{id}` (Permission: `banners.view`)
- `PUT /api/v1/admin/banners/{id}` (Permission: `banners.update`)
- `DELETE /api/v1/admin/banners/{id}` (Permission: `banners.delete`)
- `PATCH /api/v1/admin/banners/{id}/status` (Permission: `banners.update`)
  - Request Body: `{ "is_active": false }`
- `POST /api/v1/admin/banners/reorder` (Permission: `banners.update`)
  - Request Body: `{ "orders": [ { "id": 1, "sort_order": 0 }, { "id": 2, "sort_order": 1 } ] }`

#### 6.2.2 Pages Admin Endpoints

- `GET /api/v1/admin/pages` (Permission: `pages.view`)
  - Query params: `status` (`published`/`draft`/`archived`), `search`, `page`, `per_page`.
- `POST /api/v1/admin/pages` (Permission: `pages.create`)
  - Request Body: `title`, `slug`, `content`, `seo_title`, `seo_description`, `status`.
- `GET /api/v1/admin/pages/{id}` (Permission: `pages.view`)
- `PUT /api/v1/admin/pages/{id}` (Permission: `pages.update`)
- `DELETE /api/v1/admin/pages/{id}` (Permission: `pages.delete`)
- `PATCH /api/v1/admin/pages/{id}/status` (Permission: `pages.update`)
  - Request Body: `{ "status": "published" }`

---

## 7. UI Requirements (React Admin SPA)

### 7.1 Banners Management (`BannersPage.jsx`)
- **Header**: Page title `Banner & Promotional Media`, action button `+ Create Banner`.
- **KPI Summary Cards**:
  - Total Banners
  - Active Banners
  - Scheduled Banners (Upcoming start date)
  - Placements Breakdown
- **Placement Tabs Filter**: `All`, `Home Hero`, `Category Banner`, `Sidebar`, `Footer`, `Popup`.
- **Data Table / Grid**:
  - Image Preview (Desktop Thumbnail & Mobile Badge)
  - Banner Title & Link URL
  - Placement Badge
  - Schedule Dates (`starts_at` - `ends_at`) or `Always Active`
  - Sort Order (editable or drag handle)
  - Active Toggle Switch
  - Actions Menu (Edit, Duplicate, Delete)
- **Banner Modal / Drawer**: Form with image file picker / URL input, live desktop/mobile preview container, placement dropdown, date-time range pickers.

### 7.2 CMS Pages Management (`PagesPage.jsx`)
- **Header**: Page title `CMS Pages & Content`, action button `+ Add New Page`.
- **KPI Summary Cards**:
  - Total Pages
  - Published Pages
  - Draft Pages
  - System Pages Count
- **Filters**: Status tabs (`All`, `Published`, `Draft`, `Archived`), Search input (by title/slug).
- **Data Table**:
  - Page Title
  - Slug (`/pages/{slug}`) with copy link button
  - Status Badge (`Published`: Green, `Draft`: Yellow, `Archived`: Gray)
  - SEO Completeness Indicator (Checkmark if SEO title/desc filled)
  - Last Updated Date & Author
  - Actions (Edit Page, View Storefront Preview, Change Status, Delete)

### 7.3 Page Editor (`PageEditorModal.jsx` or Page View)
- **Title & Slug Bar**: Title input with auto-slug creation, slug custom edit field with validation feedback.
- **WYSIWYG HTML Editor**: Rich text formatting (Bold, Italic, Headers, Lists, Links, Media Embeds, HTML Code view).
- **SEO Card (Google Preview)**:
  - Meta Title input (max 60 chars indicator)
  - Meta Description input (max 160 chars indicator)
  - Live Google SERP snippet preview card showing search result title, green URL path, and meta text.
- **Publishing Sidebar**: Status dropdown (`Draft`, `Published`), Author metadata, Save/Update buttons.

---

## 8. Validation Rules

### 8.1 Banner Rules
- `title`: Required, string, max 255 chars.
- `image_desktop`: Required on create, valid URL or relative storage path, max 1024 chars.
- `image_mobile`: Optional, valid URL or relative storage path, max 1024 chars.
- `link_url`: Optional, valid URL string or relative path, max 1024 chars.
- `button_text`: Optional, string, max 100 chars.
- `placement`: Required, string, in: `home_hero,category_banner,sidebar,footer,popup`.
- `sort_order`: Optional, integer, min 0. Default 0.
- `is_active`: Optional, boolean.
- `starts_at`: Optional, date_format `Y-m-d H:i:s`.
- `ends_at`: Optional, date_format `Y-m-d H:i:s`, strictly `after:starts_at` if starts_at is provided.

### 8.2 CMS Page Rules
- `title`: Required, string, max 255 chars.
- `slug`: Required, string, max 255 chars, regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique in `pages` table (ignoring current ID on update).
- `content`: Required, string (HTML).
- `seo_title`: Optional, string, max 255 chars.
- `seo_description`: Optional, string, max 1000 chars.
- `status`: Required, string, in: `published,draft,archived`.

---

## 9. Permission Rules (RBAC)

| Role | `banners.view` | `banners.create` | `banners.update` | `banners.delete` | `pages.view` | `pages.create` | `pages.update` | `pages.delete` |
|---|---|---|---|---|---|---|---|---|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Content Manager** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **Marketing Staff** | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Store Staff** | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 10. Business Rules

1. **Date-Window Display Logic**: Storefront banner API must strictly filter banners using SQL equivalent:
   `WHERE is_active = 1 AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW())`.
2. **Unique Slug Enforcement**: A page slug cannot clash with another existing page slug. If admin changes page title, auto-slug should prompt or keep existing slug unless requested.
3. **Protected System Slugs**: System reserved slugs (e.g. `cart`, `checkout`, `account`, `login`, `admin`, `api`) are blocked from page slug creation.
4. **Draft Privacy**: Pages with status `draft` or `archived` MUST respond with HTTP 404 on storefront public endpoints (`/api/v1/pages/{slug}`) to prevent unpublished content leaks.
5. **Sanitization**: XSS script tags (`<script>`, `onload=`, etc.) must be scrubbed from page content before storing/rendering.

---

## 11. Error Handling

- `404 Not Found`: When querying an invalid banner ID or querying an inactive/draft CMS page via public API.
- `422 Unprocessable Entity`: Triggered on validation errors (e.g. `ends_at` before `starts_at`, duplicate page slug, missing required image).
- `403 Forbidden`: Returned when staff without `banners.create` or `pages.delete` permissions attempt mutation endpoints.
- `500 Internal Server Error`: Generic exception caught, logged, and formatted using `ApiResponseTrait::error()`.

---

## 12. Acceptance Criteria

- [ ] Migration creates `banners` and `pages` tables with specified columns and indexes.
- [ ] Models `Banner` and `Page` created with proper `$fillable`, `$casts`, and user relationships.
- [ ] Admin CRUD endpoints operational for both Banners and Pages with Sanctum authentication & RBAC middleware.
- [ ] Storefront public endpoints `/api/v1/banners` and `/api/v1/pages/{slug}` operational and verified.
- [ ] React Admin UI views (`BannersPage.jsx`, `PagesPage.jsx`, `PageEditorModal.jsx`) built and functioning in Admin SPA.
- [ ] Automatic and custom slug generation with unique validation working seamlessly.
- [ ] SEO Google SERP preview rendering dynamically in Page Editor.
- [ ] Audit logs captured for all banner and page mutation events.

---

## 13. Edge Cases

- **Overlapping Dates**: Multiple banners scheduled for same placement and same date range -> System uses `sort_order ASC` to order display sequence.
- **Null End Dates**: Banners with `starts_at` set but `ends_at` null -> Active indefinitely once `starts_at` has passed.
- **Special Characters in Slug**: Title containing accents or special characters -> Kebab-case converter cleanly strips non-alphanumeric chars (`"About & Story!"` -> `"about-story"`).
- **Html Content Size**: Extremely long CMS pages -> MySQL `LONGTEXT` data type prevents truncation.
- **Concurrent Admin Editing**: Two admins editing same page -> Last writer wins, with `updated_at` collision detection recommended.

---

## 14. Dependencies

- `App\Traits\ApiResponseTrait` for standardized JSON envelopes.
- `App\Models\AuditLog` for logging staff modifications.
- React Admin SPA components (`AdminLayout`, `DataTable`, `Modal`, `Button`, `Badge`).

---

## 15. Open Questions

- *None*. Requirements are completely specified based on `srs_apis.md`, `admin_panel.md`, and `development_modules.md`.
