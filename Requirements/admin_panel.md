# E-COMMERCE ADMIN PANEL
## Functional Requirements Specification

The e-commerce backend shall include a responsive web-based **Admin Panel** for managing the complete store.

The Admin Panel shall communicate with the backend through secured REST APIs.

---

# 1. ADMIN PANEL OBJECTIVES

The Admin Panel shall allow authorized administrators/staff to:

- Manage products
- Manage categories
- Manage brands
- Manage product attributes
- Manage inventory
- Manage customers
- Manage orders
- Manage payments
- Manage refunds
- Manage returns
- Manage coupons
- Manage shipping
- Manage taxes/GST
- Manage reviews
- Manage banners/content
- Manage notifications
- View reports
- Manage staff and permissions
- Manage store settings
- View system activity/audit logs

---

# 2. ADMIN LOGIN

## 2.1 Login

Admin shall log in using:

- Email/mobile
- Password

Optional:

- OTP
- Two-factor authentication

Fields:

- Email
- Password
- Remember me

Actions:

- Login
- Forgot password

---

# 3. ADMIN DASHBOARD

The dashboard shall provide an overview of store performance.

## 3.1 Summary Cards

Display:

- Total Revenue
- Today's Revenue
- Total Orders
- Today's Orders
- Pending Orders
- Completed Orders
- Cancelled Orders
- Total Customers
- New Customers
- Total Products
- Low Stock Products
- Pending Returns
- Pending Refunds

---

## 3.2 Sales Chart

Admin can view:

- Daily sales
- Weekly sales
- Monthly sales
- Yearly sales

Filters:

- Today
- Yesterday
- Last 7 days
- Last 30 days
- This month
- Last month
- Custom date range

---

## 3.3 Order Statistics

Dashboard shall show:

```text
Pending
Confirmed
Processing
Packed
Shipped
Delivered
Cancelled
Returned
Refunded
```

---

## 3.4 Top Products

Display:

- Product
- SKU
- Units sold
- Revenue

---

## 3.5 Top Categories

Display:

- Category
- Units sold
- Revenue

---

## 3.6 Recent Orders

Display:

- Order number
- Customer
- Amount
- Payment status
- Order status
- Date

Admin can click an order to open its details.

---

## 3.7 Low Stock

Display products below configured stock threshold.

Columns:

- Product
- SKU
- Available stock
- Threshold
- Status

---

# 4. ADMIN SIDEBAR

Recommended navigation:

```text
Dashboard

Catalog
    Products
    Categories
    Brands
    Attributes
    Product Reviews
    Media

Orders
    All Orders
    Pending
    Processing
    Shipped
    Delivered
    Cancelled
    Returns
    Refunds

Customers

Inventory
    Stock
    Stock Adjustments
    Inventory History
    Low Stock

Marketing
    Coupons
    Discounts
    Banners

Shipping
    Shipping Zones
    Shipping Methods
    Shipping Rates
    Shipments

Taxes
    Tax Classes
    Tax Rates
    GST Settings

Reports
    Sales
    Orders
    Products
    Customers
    Inventory
    Payments
    Tax
    Coupons

Content
    Pages
    Banners
    FAQs

Notifications
    Templates
    Notification Logs

Administration
    Admin Users
    Roles
    Permissions
    Audit Logs

Settings
    General
    Store
    Payment
    Shipping
    Tax
    Notifications
    SEO
```

---

# 5. PRODUCT MANAGEMENT

## 5.1 Product Listing

Admin shall see:

- Product image
- Product name
- SKU
- Category
- Price
- Sale price
- Stock
- Status
- Created date
- Actions

Actions:

- View
- Edit
- Duplicate
- Activate
- Deactivate
- Archive
- Delete where permitted

---

## 5.2 Product Search

Admin can search by:

- Product name
- SKU
- Barcode

---

## 5.3 Product Filters

Filters:

- Category
- Brand
- Status
- Stock status
- Price range
- Product type
- Date created

---

## 5.4 Add Product

Product form shall contain:

### Basic Information

- Product name
- SKU
- Product type
- Brand
- Category
- Short description
- Full description

### Pricing

- MRP
- Selling price
- Cost price
- Sale price
- Tax class

### Inventory

- SKU
- Barcode
- Stock quantity
- Low-stock threshold
- Allow backorders
- Stock status

### Shipping

- Weight
- Length
- Width
- Height

### Media

- Main image
- Gallery
- Video

### SEO

- Slug
- Meta title
- Meta description
- Canonical URL
- OG image

### Status

- Draft
- Active
- Inactive
- Archived

---

# 6. PRODUCT VARIANTS

Admin shall be able to create variants.

Example:

```text
Product: T-Shirt

Size:
S
M
L
XL

Color:
Black
White
Blue
```

The system shall generate/manage combinations.

Each variant can have:

- SKU
- Barcode
- Price
- Sale price
- Cost
- Stock
- Weight
- Image
- Status

---

# 7. CATEGORY MANAGEMENT

Admin can:

- Create category
- Edit category
- Delete/archive category
- Reorder categories
- Create subcategories
- Upload category image
- Add banner
- Configure SEO

Category fields:

- Name
- Slug
- Parent
- Description
- Image
- Banner
- Sort order
- Status
- SEO title
- SEO description

---

# 8. BRAND MANAGEMENT

Admin can:

- Add brand
- Edit brand
- Delete/archive brand
- Upload logo
- Set status
- Configure SEO

---

# 9. ATTRIBUTE MANAGEMENT

Admin can create:

```text
Size
Color
Material
Storage
RAM
Weight
```

Admin can add values for each attribute.

Example:

```text
Color
 ├── Black
 ├── White
 └── Red
```

---

# 10. INVENTORY ADMIN PANEL

## 10.1 Inventory Dashboard

Display:

- Total SKUs
- Total stock units
- Low-stock SKUs
- Out-of-stock SKUs
- Reserved stock
- Inventory value

---

## 10.2 Stock Management

Admin can:

- View stock
- Add stock
- Deduct stock
- Adjust stock
- View stock history

Stock adjustment requires:

- Quantity
- Adjustment type
- Reason
- Remarks

---

# 11. INVENTORY HISTORY

Each stock change shall display:

- Product
- SKU
- Previous quantity
- Changed quantity
- New quantity
- Transaction type
- Reference
- Admin
- Date/time
- Remarks

---

# 12. ORDER MANAGEMENT

## 12.1 Order Listing

Admin shall see:

- Order number
- Customer
- Date
- Items
- Amount
- Payment status
- Order status
- Shipping status
- Actions

---

## 12.2 Order Filters

Filters:

- Order status
- Payment status
- Customer
- Date range
- Payment method
- Shipping method
- Amount range

---

# 13. ORDER DETAILS

Admin order page shall display:

### Customer

- Name
- Email
- Mobile

### Order

- Order number
- Date
- Status
- Items
- Quantities
- Prices
- Discounts
- Tax
- Shipping
- Grand total

### Payment

- Payment method
- Transaction ID
- Gateway
- Payment status
- Payment date

### Addresses

- Billing address
- Shipping address

### Shipment

- Courier
- AWB
- Tracking number
- Shipment status

### Timeline

Complete order history.

---

# 14. ADMIN ORDER ACTIONS

Depending on status and permissions, admin can:

- Confirm order
- Mark processing
- Mark packed
- Create shipment
- Add tracking number
- Mark shipped
- Mark delivered
- Cancel order
- Initiate refund
- Add internal note

All important actions shall be logged.

---

# 15. ORDER NOTES

Admin can add internal notes.

Example:

```text
Customer requested delivery after 5 PM.
```

Internal notes shall not be visible to customers unless explicitly configured.

---

# 16. CUSTOMER MANAGEMENT

Admin can:

- View customers
- Search customers
- Filter customers
- View customer profile
- Edit customer
- Disable customer
- Enable customer
- View customer orders
- View customer addresses
- View customer reviews

---

# 17. CUSTOMER DETAIL PAGE

Display:

```text
Customer Information

Total Orders
Total Spent
Average Order Value
Last Order
Registration Date

Orders
Addresses
Reviews
Returns
Refunds
Activity
```

---

# 18. CUSTOMER ACTIONS

Admin may:

- Edit profile
- Change status
- Reset password through secure flow
- View orders
- View returns
- Add internal notes

Admin shall not be able to view the customer's plaintext password.

---

# 19. COUPON MANAGEMENT

Admin can:

- Create coupon
- Edit coupon
- Activate/deactivate coupon
- Delete/archive coupon
- View usage

Coupon form:

- Coupon code
- Discount type
- Discount value
- Maximum discount
- Minimum order value
- Start date
- End date
- Usage limit
- Per-customer limit
- Applicable products
- Applicable categories
- Applicable customers
- Free shipping option
- Status

---

# 20. COUPON REPORT

Display:

- Coupon
- Total uses
- Total discount
- Orders generated
- Revenue generated
- Remaining usage

---

# 21. RETURN MANAGEMENT

Admin can view:

- Return request number
- Order number
- Customer
- Product
- Quantity
- Reason
- Date
- Status

Actions:

- Approve
- Reject
- Request information
- Mark pickup scheduled
- Mark received
- Approve refund

---

# 22. REFUND MANAGEMENT

Refund listing:

- Refund ID
- Order
- Customer
- Amount
- Payment gateway
- Refund status
- Date

Actions:

- Process refund
- Retry failed refund
- View gateway response
- View refund history

Financial records shall not be physically deleted.

---

# 23. PAYMENT MANAGEMENT

Admin can view:

- Payment ID
- Order
- Customer
- Gateway
- Transaction ID
- Amount
- Method
- Status
- Date

Filters:

- Successful
- Pending
- Failed
- Refunded
- Partially refunded

---

# 24. PAYMENT RECONCILIATION

Optional administrative feature.

Admin can compare:

```text
Order Amount
Payment Gateway Amount
Payment Status
Refund Amount
```

Payment discrepancies shall be flagged.

---

# 25. SHIPPING MANAGEMENT

Admin can manage:

### Shipping Zones

- Country
- State
- City
- Postal code

### Shipping Methods

- Standard
- Express
- Same day
- Pickup

### Shipping Rates

- Flat rate
- Weight-based
- Order-value-based
- Free shipping

---

# 26. SHIPMENT MANAGEMENT

Admin can:

- Create shipment
- Assign courier
- Generate AWB
- View tracking
- Cancel shipment where provider supports it
- Synchronize shipment status

---

# 27. TAX/GST ADMINISTRATION

Admin can manage:

- Tax classes
- Tax rates
- GST rates
- CGST
- SGST
- IGST
- Tax-inclusive/exclusive settings

Tax configuration shall be permission controlled.

---

# 28. REVIEW MANAGEMENT

Admin can view:

- Product
- Customer
- Rating
- Review
- Images
- Date
- Status

Actions:

- Approve
- Reject
- Hide
- Delete

---

# 29. BANNER MANAGEMENT

Admin can create promotional banners.

Fields:

- Title
- Image
- Mobile image
- Desktop image
- Link
- Button text
- Start date
- End date
- Sort order
- Status

---

# 30. CMS PAGE MANAGEMENT

Admin can manage pages such as:

- About Us
- Contact Us
- Privacy Policy
- Terms & Conditions
- Shipping Policy
- Return Policy
- FAQ

Fields:

- Page title
- Slug
- Content
- SEO title
- SEO description
- Status

---

# 31. MEDIA LIBRARY

Admin shall have a centralized media library.

Features:

- Upload
- Search
- Preview
- Delete where unused
- Copy media URL

Media can be used by:

- Products
- Categories
- Brands
- Banners
- CMS pages

---

# 32. REPORTING PANEL

## Sales Report

Display:

- Gross sales
- Discounts
- Tax
- Shipping
- Refunds
- Net sales

Filters:

- Date
- Category
- Product
- Customer

---

## Order Report

Display:

- Total orders
- Completed
- Pending
- Cancelled
- Returned

---

## Product Report

Display:

- Units sold
- Revenue
- Returns
- Stock

---

## Customer Report

Display:

- New customers
- Returning customers
- Customer revenue
- Orders/customer

---

## Inventory Report

Display:

- Current stock
- Stock value
- Low stock
- Out of stock
- Stock movements

---

## Tax Report

Display:

- Taxable amount
- CGST
- SGST
- IGST
- Total tax

---

# 33. REPORT EXPORT

Reports can be exported as:

- CSV
- XLSX

Large exports shall be generated using a background queue.

Admin shall receive a notification when the export is ready.

---

# 34. ADMIN USERS

Super Admin can create staff accounts.

Fields:

- Name
- Email
- Mobile
- Role
- Status

Actions:

- Create
- Edit
- Disable
- Enable
- Reset access

---

# 35. ROLE MANAGEMENT

Roles may include:

```text
Super Admin
Store Manager
Order Manager
Product Manager
Inventory Manager
Customer Support
Accountant
Marketing Manager
```

These are examples; actual roles shall be configurable.

---

# 36. PERMISSION MANAGEMENT

Permissions shall be module/action based.

Example:

```text
Products
    View
    Create
    Update
    Delete

Orders
    View
    Update
    Cancel
    Refund

Customers
    View
    Update

Reports
    View
    Export

Settings
    View
    Update
```

A user shall only see and execute actions permitted by their role.

---

# 37. AUDIT LOG PANEL

Admin can view system activity.

Columns:

- Date/time
- User
- Action
- Module
- Entity
- Entity ID
- IP address

Admin can filter by:

- User
- Module
- Action
- Date range

Example:

```text
11 Aug 2026 10:32
Admin: John
Action: Updated Product
Product: SKU-123
```

---

# 38. NOTIFICATION MANAGEMENT

Admin can manage:

- Email templates
- SMS templates
- Push notification templates
- Notification status

Templates support variables:

```text
{{customer_name}}
{{order_number}}
{{order_total}}
{{tracking_number}}
```

---

# 39. NOTIFICATION LOGS

Admin can see:

- Recipient
- Channel
- Template
- Status
- Sent time
- Failure reason

Statuses:

```text
Queued
Sent
Delivered
Failed
```

---

# 40. STORE SETTINGS

Admin can configure:

### General

- Store name
- Logo
- Favicon
- Email
- Phone
- Address

### Localization

- Currency
- Timezone
- Date format
- Number format

### Commerce

- Guest checkout
- Inventory management
- Reviews
- Minimum order value

---

# 41. PAYMENT SETTINGS

Admin can configure enabled gateways.

Example:

```text
Razorpay
Stripe
PayPal
COD
```

Each gateway shall have:

- Enable/disable
- API credentials
- Test/live mode

Secret credentials must be encrypted/protected and never exposed through normal APIs.

---

# 42. SHIPPING SETTINGS

Admin can configure:

- Shipping providers
- API credentials
- Default shipping method
- Shipping zones
- Shipping rates
- Free shipping threshold

---

# 43. TAX SETTINGS

Admin can configure:

- Tax mode
- Default tax class
- GST settings
- Tax-inclusive pricing
- Tax-exclusive pricing

Tax changes shall be permission restricted and audit logged.

---

# 44. SEO SETTINGS

Admin can configure:

- Default meta title
- Default meta description
- Default OG image
- Sitemap settings
- Robots configuration where supported

Individual products/categories/pages shall be able to override global SEO settings.

---

# 45. ADMIN SEARCH

Global admin search may search:

```text
Orders
Customers
Products
SKUs
Coupons
Returns
Payments
```

Example:

```text
Search:
ORD-20260811-12587
```

The system should directly show the corresponding order.

---

# 46. ADMIN NOTIFICATIONS

Admin notification center shall show:

- New order
- Failed payment
- Low stock
- Return request
- Refund request
- Failed shipment
- System errors

Notifications may be marked:

- Read
- Unread

---

# 47. ADMIN RESPONSIVE DESIGN

The Admin Panel shall support:

- Desktop
- Laptop
- Tablet

Mobile support may be provided for basic administration, but the primary administrative experience shall be optimized for desktop/tablet.

---

# 48. ADMIN SECURITY

Admin Panel shall implement:

- Separate admin authentication
- Role-based authorization
- Permission checks
- Rate limiting
- Secure password hashing
- Session/token expiration
- Optional 2FA
- Audit logging
- IP/device logging where appropriate
- Secure file uploads
- HTTPS
- CSRF protection where applicable

---

# 49. ADMIN API SECURITY

Every admin API must verify:

```text
Authenticated?
        ↓
Admin account active?
        ↓
Role?
        ↓
Permission?
        ↓
Perform action
```

Frontend hiding a button shall NOT be considered authorization.

The backend must enforce all permissions.

---

# 50. ADMIN DASHBOARD PERMISSION EXAMPLE

A Store Manager might have:

```text
Dashboard       ✓
Products        ✓
Categories      ✓
Orders          ✓
Customers       ✓
Inventory       ✓
Coupons         ✓
Reports         ✓
Payments        View only
Refunds         View only
Settings        ✗
Admin Users     ✗
Roles           ✗
Audit Logs      View
```

---

# 51. ADMIN PANEL URL STRUCTURE

Recommended:

```text
/admin/login
/admin/dashboard

/admin/products
/admin/products/create
/admin/products/{id}/edit

/admin/categories
/admin/brands
/admin/attributes

/admin/orders
/admin/orders/{id}

/admin/customers
/admin/customers/{id}

/admin/inventory
/admin/inventory/adjustments

/admin/coupons

/admin/returns
/admin/refunds

/admin/payments

/admin/shipping
/admin/shipping/zones
/admin/shipping/methods

/admin/taxes

/admin/reviews

/admin/reports

/admin/content/pages
/admin/content/banners
/admin/media

/admin/notifications

/admin/users
/admin/roles
/admin/audit-logs

/admin/settings
```

---

# 52. ADMIN PANEL NON-FUNCTIONAL REQUIREMENTS

The Admin Panel shall:

- Be responsive.
- Provide loading states.
- Provide validation messages.
- Provide confirmation before destructive actions.
- Handle API errors gracefully.
- Support pagination.
- Support search/filter/sort.
- Prevent unauthorized actions.
- Display appropriate empty states.
- Display success/error notifications.
- Avoid exposing sensitive API information.
- Maintain consistent UI components.

---

# 53. DESTRUCTIVE ACTION CONFIRMATION

The following actions require confirmation:

- Delete product
- Delete category
- Delete customer
- Cancel order
- Process refund
- Deduct stock
- Delete media
- Disable admin
- Change tax configuration

Example:

```text
Are you sure you want to cancel this order?

[Cancel] [Confirm]
```

---

# 54. ADMIN ACTIVITY RULES

The following actions must be audit logged:

- Product price change
- Product deletion/archive
- Inventory adjustment
- Order cancellation
- Refund
- Coupon creation/update
- Tax configuration change
- Payment setting change
- Shipping setting change
- Admin user creation
- Role/permission changes
- Customer status change

---

# 55. ADMIN PANEL ACCEPTANCE CRITERIA

The Admin Panel shall be considered complete when authorized administrators can successfully:

1. Log in.
2. Access the dashboard.
3. Create/edit products.
4. Manage product variants.
5. Manage categories.
6. Manage brands.
7. Manage attributes.
8. Upload product media.
9. Manage inventory.
10. View stock history.
11. View customers.
12. View customer orders.
13. View and manage orders.
14. Change permitted order statuses.
15. Manage shipments.
16. Process permitted cancellations.
17. Manage returns.
18. Process refunds.
19. View payments.
20. Create and manage coupons.
21. Configure shipping.
22. Configure taxes/GST.
23. Moderate reviews.
24. Manage banners/pages.
25. View reports.
26. Export supported reports.
27. Manage notification templates.
28. Manage admin users.
29. Manage roles.
30. Manage permissions.
31. View audit logs.
32. Configure store settings.
33. Perform all actions according to their assigned permissions.

---

# 56. FINAL ADMIN PANEL SCOPE

The final Admin Panel scope shall therefore contain:

```text
┌─────────────────────────────────┐
│           ADMIN PANEL            │
├─────────────────────────────────┤
│ Dashboard                       │
│                                 │
│ Catalog                         │
│ ├── Products                    │
│ ├── Categories                  │
│ ├── Brands                      │
│ ├── Attributes                  │
│ ├── Media                       │
│ └── Reviews                     │
│                                 │
│ Orders                          │
│ ├── Orders                      │
│ ├── Returns                     │
│ ├── Refunds                     │
│ └── Shipments                   │
│                                 │
│ Customers                       │
│                                 │
│ Inventory                       │
│ ├── Stock                       │
│ ├── Adjustments                 │
│ └── History                     │
│                                 │
│ Marketing                       │
│ ├── Coupons                     │
│ └── Banners                     │
│                                 │
│ Payments                        │
│                                 │
│ Shipping                        │
│                                 │
│ Taxes / GST                     │
│                                 │
│ Reports                         │
│                                 │
│ Content                         │
│ ├── Pages                       │
│ └── Banners                     │
│                                 │
│ Notifications                   │
│                                 │
│ Administration                  │
│ ├── Admin Users                 │
│ ├── Roles                       │
│ ├── Permissions                 │
│ └── Audit Logs                  │
│                                 │
│ Settings                        │
└─────────────────────────────────┘
```

## 57. PROJECT SCOPE DEFINITION

For commercial/development purposes, **"E-Commerce Backend" shall mean both:**

### A. Backend/API

- Laravel backend
- Database
- REST APIs
- Authentication
- Business logic
- Payment integration
- Shipping integration
- Inventory
- Orders
- Coupons
- Taxes
- Notifications
- Queues
- Scheduled jobs
- Webhooks
- Security

### B. Admin Panel

- Responsive admin web application
- Dashboard
- Product management
- Catalog management
- Order management
- Customer management
- Inventory management
- Payment management
- Return/refund management
- Coupon management
- Shipping management
- Tax/GST management
- Review management
- CMS/content management
- Reports
- Staff management
- Roles & permissions
- Audit logs
- Settings

**Customer-facing website and mobile application are separate frontend deliverables and are not included merely because their APIs are included in this SRS.**