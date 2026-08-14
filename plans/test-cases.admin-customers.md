# Test Cases — Module 26: Admin Customer Management

**Module Name:** Admin Customer Management  
**Module ID:** 26  
**Test File:** `tests/Feature/AdminCustomerManagementTest.php`  

---

## Test Cases Suite

### TC-CUST-001: Fetch Customer Executive Stats (`GET /api/v1/admin/customers/stats`)
- **Objective**: Verify admin receives total customer count, active count, suspended count, new customers count, and total revenue.
- **Preconditions**: Authenticated Admin User with `customers.view` permission.
- **Expected Outcome**: HTTP 200 response with JSON keys `total_customers`, `active_customers`, `suspended_customers`, `new_customers_this_month`, `total_revenue`.

### TC-CUST-002: Fetch Paginated Customer List (`GET /api/v1/admin/customers`)
- **Objective**: Verify paginated listing of customers with default ordering.
- **Preconditions**: Authenticated Admin User.
- **Expected Outcome**: HTTP 200 response with paginated `data` array containing customer objects and order aggregate counts.

### TC-CUST-003: Search Customers by Name, Email, or Phone
- **Objective**: Verify search filter matches name, email, or phone.
- **Preconditions**: Customers "John Doe" (`john@example.com`) and "Jane Smith" exist.
- **Execution**: Send `GET /api/v1/admin/customers?search=john`.
- **Expected Outcome**: HTTP 200 response containing only "John Doe".

### TC-CUST-004: Filter Customers by Status (`active` / `suspended`)
- **Objective**: Verify filtering by account status.
- **Execution**: Send `GET /api/v1/admin/customers?status=suspended`.
- **Expected Outcome**: HTTP 200 containing only suspended customers.

### TC-CUST-005: Fetch Single Customer Profile (`GET /api/v1/admin/customers/{id}`)
- **Objective**: Verify detailed profile payload containing aggregated lifetime stats.
- **Expected Outcome**: HTTP 200 response containing `user`, `total_orders`, `total_spent`, `avg_order_value`, `last_order_at`, `registration_date`.

### TC-CUST-006: Update Customer Details (`PUT /api/v1/admin/customers/{id}`)
- **Objective**: Verify admin can update customer name, email, and phone.
- **Execution**: Send `PUT /api/v1/admin/customers/{id}` with `{ "name": "Updated Name", "email": "updated@example.com", "phone": "+123456789" }`.
- **Expected Outcome**: HTTP 200 response with updated customer record.

### TC-CUST-007: Toggle Customer Account Status (`PATCH /api/v1/admin/customers/{id}/status`)
- **Objective**: Verify admin can suspend or activate a customer account.
- **Execution**: Send `PATCH /api/v1/admin/customers/{id}/status` with `{ "status": "suspended", "reason": "Policy violation" }`.
- **Expected Outcome**: HTTP 200 response and customer status updated to `suspended`.

### TC-CUST-008: Fetch Customer Order History (`GET /api/v1/admin/customers/{id}/orders`)
- **Objective**: Verify paginated order history list for specific customer.
- **Expected Outcome**: HTTP 200 response with customer's orders.

### TC-CUST-009: Fetch Customer Saved Addresses (`GET /api/v1/admin/customers/{id}/addresses`)
- **Objective**: Verify saved shipping and billing addresses list for specific customer.
- **Expected Outcome**: HTTP 200 response with address records.

### TC-CUST-010: Add Internal Admin Note (`POST /api/v1/admin/customers/{id}/notes`)
- **Objective**: Verify staff can attach internal notes to customer profile.
- **Execution**: Send `POST /api/v1/admin/customers/{id}/notes` with `{ "note": "Customer contacted support regarding order #1002" }`.
- **Expected Outcome**: HTTP 201 response and note created.

### TC-CUST-011: Trigger Password Reset Notification (`POST /api/v1/admin/customers/{id}/reset-password`)
- **Objective**: Verify secure password reset notification dispatch. Plaintext passwords MUST NEVER be accessible.
- **Expected Outcome**: HTTP 200 response confirming password reset email link dispatched.

### TC-CUST-012: Export Customers CSV (`GET /api/v1/admin/customers/export`)
- **Objective**: Verify streamed CSV export of customer master list.
- **Expected Outcome**: HTTP 200 response with `Content-Type: text/csv` header.
