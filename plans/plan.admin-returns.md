# Implementation Plan: Module 28 — Admin Return & Refund Management (with Saved Bank Accounts & Dual-Channel Refunds)

## 1. Overview
This plan establishes the full administrative lifecycle for customer return requests (RMA) and dual-channel refund operations (Original Payment Gateway Reversal + Manual Bank Account Transfer / IMPS / NEFT / UPI to customer's saved bank accounts) in `ecommerce_laravel`.

---

## 2. Technical Architecture & Component Breakdown

### Database Migrations & Models
1. **Migration `create_customer_bank_accounts_table`**:
   - `user_id` (foreignId to users cascade)
   - `account_holder_name` (string)
   - `bank_name` (string)
   - `account_number` (string)
   - `ifsc_code` (string)
   - `account_type` (`savings`, `current`)
   - `upi_id` (string nullable)
   - `is_default` (boolean default false)
   - `is_verified` (boolean default false)
   - timestamps
2. **Migration `add_bank_and_channel_fields_to_returns_and_refunds_tables`**:
   - `returns`: `bank_account_id` (nullable FK), `bank_details_snapshot` (JSON nullable), `restocked_at` (timestamp nullable).
   - `refunds`: `refund_channel` (`original_gateway`, `bank_transfer`, `store_credit`, `manual_cash`), `bank_account_id` (nullable FK), `bank_details_snapshot` (JSON nullable), `transaction_reference` (string nullable).
3. **Models**:
   - `CustomerBankAccount.php`: model with relationships, masked account helper, and `$casts`.
   - `User.php`: `bankAccounts()` relationship.
   - `ReturnRequest.php`: update `$fillable`, `$casts`, and `bankAccount()` relationship.
   - `Refund.php`: update `$fillable`, `$casts`, and `bankAccount()` relationship.

---

### Backend Services & Controllers
1. **`CustomerBankAccountController.php`** (Customer Portal API):
   - `index()`: `GET /api/v1/customer/bank-accounts`
   - `store()`: `POST /api/v1/customer/bank-accounts`
   - `setDefault()`: `PATCH /api/v1/customer/bank-accounts/{id}/default`
   - `destroy()`: `DELETE /api/v1/customer/bank-accounts/{id}`
2. **`ReturnService.php`**:
   - `getDashboardStats()`: Total returns, requested, under review, pickup scheduled, QC, approved, refunded, total refunded sum.
   - `listAdminReturns()`: Enhanced search by return #, order #, customer name/email, status filter, channel filter, date range, pagination.
   - `updateReturnStatus()`: Lifecycle milestones with audit logging and timestamps.
   - `restockReturnedItems()`: Restocks item variants into inventory with `restocked_at` guard.
3. **`RefundService.php`**:
   - `getDashboardStats()`: Refund count, total refunded volume, breakdown by channel (`original_gateway`, `bank_transfer`, `store_credit`).
   - `getRefundDetails(int $id)`: Single refund record inspection with frozen bank details and processor details.
   - `processRefund(array $data, $adminUser)`: Dual-channel processing (auto-gateway or bank transfer with UTR and frozen snapshot).
   - `retryRefund(int $id, $adminUser)`: Re-attempt failed refunds.
4. **`ReturnAdminController.php` & `RefundAdminController.php`**:
   - Complete OpenAPI 3.0 `@OA\*` annotations and REST endpoints.
5. **`routes/api.php`**:
   - Register customer bank account routes and admin return/refund routes under Sanctum and Spatie permission middleware.

---

### Frontend React Admin SPA
1. **`resources/js/admin/components/ProcessRefundModal.jsx`**:
   - Interactive dialog supporting **Original Gateway**, **Saved Customer Bank Account / Manual Bank Transfer**, and **Store Credit**.
   - For `bank_transfer`: displays customer's saved bank accounts dropdown or pre-selected snapshot, formatted A/C No, IFSC, Holder Name, UPI ID with copy-to-clipboard buttons, and inputs for UTR/Bank Reference Number.
   - Real-time amount calculation and maximum refundable balance enforcement.
2. **`resources/js/admin/components/ReturnDetailModal.jsx`**:
   - 360-degree return inspection drawer.
   - Milestone tracker with quick status transition buttons.
   - Order & Customer snapshot cards.
   - Customer Selected Bank Account card with one-click copy.
   - Itemized return line items table.
   - Customer photo evidence lightbox & return remarks.
   - Inventory Restock button & Process Refund button.
   - Printable RMA Receiving Slip.
3. **`resources/js/admin/pages/ReturnsPage.jsx`**:
   - Executive KPI summary cards at top.
   - Dual View Tabs: **Return Requests** and **Refund History**.
   - Multi-Filter Toolbar (Search, Status, Channel/Gateway, Date Range, Reset).
   - Return and Refund data grids.
4. **`resources/js/admin/App.jsx`**:
   - Register `/returns` route and navigation menu item.

---

### Automated Feature Testing
- **`tests/Feature/AdminReturnRefundManagementTest.php`**:
  - Customer bank account CRUD & set default.
  - Return stats endpoint (`/api/v1/admin/returns/stats`).
  - Return listing with filters and search.
  - Return 360 detail view with frozen bank details.
  - Return milestone status transitions and audit logging.
  - Inventory restocking with double-restock protection.
  - Gateway refund processing with payment status updates.
  - Manual bank transfer refund with customer bank account snapshot & UTR recording.
  - Refund retry and single refund retrieval.

---

## 3. Verification & Build
1. Execute feature test suite: `php artisan test tests/Feature/AdminReturnRefundManagementTest.php`.
2. Compile production bundle: `cmd.exe /c "npm run build"`.
3. Update `walkthrough.md`.
