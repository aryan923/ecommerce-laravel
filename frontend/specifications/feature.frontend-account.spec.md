# Feature Specification: Frontend Customer Account Portal Module

**Module Name:** Frontend Customer Account Portal  
**Module ID:** 09 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-account.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 09), `frontend/Requirements/srs_pages.md` (§2.7)  

---

## 1. Module Overview

The **Customer Account Portal** module provides an authenticated self-service portal for managing user profile settings, saved shipping & billing addresses, order history, invoice details, order cancellations, return requests, bank accounts for instant refund processing, and in-app notifications across nine dedicated sub-routes under `/account/*`:

1. **Dashboard Overview (`/account`)**: Summary dashboard with quick stats (Total Orders, Pending Returns, Saved Addresses), recent order preview, and quick navigation cards.
2. **Profile & Password Settings (`/account/profile`)**: Manage name, phone number, email address, and update security password.
3. **Saved Addresses (`/account/addresses`)**: Full CRUD management of customer shipping & billing addresses with default address toggling.
4. **Order History List (`/account/orders`)**: Paginated list of customer orders with filter tabs (All, Processing, Shipped, Delivered, Cancelled) and status badges.
5. **Order Detail & Tracking (`/account/orders/[order_number]`)**: Comprehensive order view with shipment tracking status timeline, itemized invoice breakdown, PDF invoice download CTA, and self-service order cancellation.
6. **Returns List (`/account/returns`)**: Overview of submitted return/exchange requests with current RMA status (Pending, Approved, Item Received, Refunded, Rejected).
7. **New Return Request (`/account/returns/new`)**: Form to initiate item returns/exchanges, select order items, select return reason, upload item photos, and pick refund payout method.
8. **Bank Accounts for Refunds (`/account/bank-accounts`)**: Save bank accounts (Account Number, IFSC Code, Account Holder Name, Bank Name) for instant refund processing.
9. **Customer Notifications (`/account/notifications`)**: List of customer notifications with unread indicators and mark-as-read actions.

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                        Account Layout Wrapper (AccountLayout.jsx)                 |
+------------------------------------+----------------------------------------------+
|  AccountSidebar.jsx (Navigation)   |  Sub-route Content View                      |
|  - User Avatar & Greeting Header   |  - /account: AccountOverviewClient.jsx       |
|  - Nav Link: Overview              |  - /account/profile: ProfileSettingsClient   |
|  - Nav Link: Orders                |  - /account/addresses: AddressesClient       |
|  - Nav Link: Returns               |  - /account/orders: OrderHistoryClient       |
|  - Nav Link: Saved Addresses       |  - /account/orders/[id]: OrderDetailClient   |
|  - Nav Link: Refund Bank Accounts  |  - /account/returns: ReturnsClient           |
|  - Nav Link: Notifications         |  - /account/returns/new: NewReturnClient     |
|  - Action: Logout                  |  - /account/bank-accounts: BankAccountsClient|
|                                    |  - /account/notifications: Notifications    |
+------------------------------------+----------------------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Customer Profile Endpoints
- **Get Profile:** `GET /api/v1/customer/profile`
- **Update Profile:** `PUT /api/v1/customer/profile` (`{ name, phone }`)
- **Change Password:** `POST /api/v1/customer/change-password` (`{ current_password, new_password, new_password_confirmation }`)

### 3.2 Address Management Endpoints
- **List Addresses:** `GET /api/v1/customer/addresses`
- **Add Address:** `POST /api/v1/customer/addresses`
- **Update Address:** `PUT /api/v1/customer/addresses/{id}`
- **Delete Address:** `DELETE /api/v1/customer/addresses/{id}`
- **Set Default Address:** `POST /api/v1/customer/addresses/{id}/set-default`

### 3.3 Orders & Tracking Endpoints
- **List Orders:** `GET /api/v1/customer/orders` (Query params: `page`, `status`, `search`)
- **Get Order Detail:** `GET /api/v1/customer/orders/{order_number}`
- **Cancel Order:** `POST /api/v1/customer/orders/{order_number}/cancel` (`{ cancellation_reason }`)

### 3.4 Returns Management Endpoints
- **List Returns:** `GET /api/v1/customer/returns`
- **Submit Return:** `POST /api/v1/customer/returns` (`{ order_id, order_item_ids, reason, comments, refund_method }`)

### 3.5 Refund Bank Accounts Endpoints
- **List Bank Accounts:** `GET /api/v1/customer/bank-accounts`
- **Add Bank Account:** `POST /api/v1/customer/bank-accounts` (`{ account_holder_name, account_number, ifsc_code, bank_name, is_default }`)
- **Delete Bank Account:** `DELETE /api/v1/customer/bank-accounts/{id}`

### 3.6 Customer Notifications Endpoint
- **List Notifications:** `GET /api/v1/customer/notifications`
- **Mark Notification Read:** `POST /api/v1/customer/notifications/{id}/read`

---

## 4. UI/UX Requirements

1. **Responsive Dashboard Grid**:
   - Max width: `max-w-6xl` with `px-4 sm:px-6 lg:px-8`.
   - Desktop layout: 3-column or 4-column AccountSidebar on left (25% width) + Active tab view on right (75% width). Mobile layout: Horizontal scrollable tab pill bar on top.
2. **Profile & Security View**:
   - Editable form fields for Name, Email (disabled/readonly), and Phone Number.
   - Separate "Change Password" card with current password validation and password strength feedback.
3. **Address Book View**:
   - Grid of address cards showing name, address lines, city, state, pincode, phone, and "Default Shipping" / "Default Billing" badges.
   - Modal or inline drawer form to add/edit address.
4. **Order History & Detail View**:
   - Status badges with distinct color themes: `Pending` (amber), `Processing` (blue), `Shipped` (purple), `Delivered` (emerald), `Cancelled` (rose).
   - Order detail page featuring shipment timeline progress bar, item breakdown table, order financial summary, and a "Cancel Order" button for pending/processing orders.
5. **Returns & Refunds View**:
   - Return request status timeline and refund destination indicator.
   - Bank account management form validating 9-18 digit account numbers and 11-character IFSC codes.

---

## 5. E2E Test Strategy & Playwright Scenarios

Create `frontend/tests/e2e/account.spec.js` covering:
1. `should render /account dashboard overview with sidebar navigation`
2. `should allow editing profile information and changing password`
3. `should allow adding, editing, and deleting saved addresses`
4. `should render /account/orders order history list and order details`
5. `should allow submitting a return request on eligible orders`
6. `should allow managing refund bank accounts and viewing notifications`
