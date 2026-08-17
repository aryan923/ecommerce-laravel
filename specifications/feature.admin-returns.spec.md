# Feature Specification: Module 28 — Admin Return & Refund Management

## 1. Objective
Provide administrators and customer service teams with an end-to-end, secure, audit-logged, and responsive administrative console and REST API to manage customer return requests (RMA), track physical return logistics and warehouse quality checks (QC), restock returned items, and process dual-channel refunds (automated refund to Original Payment Gateway or manual Bank Account Transfer / IMPS / NEFT / UPI to customer's saved bank accounts) with frozen zero-relation audit snapshots.

---

## 2. Problem Statement
When customers request returns for orders—especially for **Cash on Delivery (COD)** orders or when original payment methods are expired/inaccessible—store administrators require:
1. A structured workflow to review return reasons and photographic evidence.
2. The ability for customers to save multiple bank accounts (A/C number, IFSC, Bank Name, Holder Name, UPI ID) and choose one preferred payout account per return/refund.
3. An administrative refund processor that supports:
   - **Original Gateway Refund** (auto-reversed via Razorpay/Stripe API).
   - **Manual Bank Transfer** (IMPS/NEFT/UPI) where the admin views the customer's selected bank details, copies account numbers/IFSC/UPI, executes payout, and enters the transaction UTR / bank reference number.
   - **Store Credit / Wallet**.
4. A **Zero-Relation Frozen Snapshot Architecture** in `refunds.bank_details_snapshot` and `returns.bank_details_snapshot` ensuring financial records remain permanently verifiable even if the customer subsequently modifies or deletes their bank account.

---

## 3. Scope
### In Scope
1. **Customer Bank Accounts Management**:
   - Customer can create, view, set default, and delete saved bank accounts.
   - Bank accounts store Account Holder Name, Bank Name, Account Number, IFSC Code, Account Type (`savings`/`current`), and UPI ID.
2. **Dual-Channel Refund Processing**:
   - **Channel 1: Original Payment Gateway (`original_gateway`)** — automated gateway API reversal.
   - **Channel 2: Manual Bank Transfer (`bank_transfer`)** — admin transfers via IMPS/NEFT/RTGS/UPI to customer's selected saved bank account and records the Bank UTR / Reference ID.
   - **Channel 3: Store Credit (`store_credit`)** — wallet balance credit.
   - **Channel 4: Cash Refund (`manual_cash`)** — over-the-counter return refund.
3. **Zero-Relation Bank Snapshot Architecture**:
   - Freezes bank details (`account_holder_name`, `bank_name`, `account_number`, `ifsc_code`, `upi_id`) in `returns.bank_details_snapshot` and `refunds.bank_details_snapshot`.
4. **Executive KPIs & Metrics**:
   - Total Returns, Pending Review, In Logistics, Quality Check, Total Refunded Amount, Gateway vs Bank Transfer distribution.
5. **Multi-Filtered Return Catalog**:
   - Search by Return #, Order #, Customer Name/Email/Mobile, Status, Refund Channel, Date Range, and Pagination.
6. **360-Degree Return Inspection Modal**:
   - Milestone tracker banner (`requested` $\rightarrow$ `under_review` $\rightarrow$ `approved` $\rightarrow$ `pickup_scheduled` $\rightarrow$ `picked_up` $\rightarrow$ `received` $\rightarrow$ `quality_check` $\rightarrow$ `approved_for_refund` $\rightarrow$ `refunded` $\rightarrow$ `closed`).
   - Order & Customer Snapshot cards.
   - Customer Selected Bank Account details card with copy-to-clipboard controls.
   - Return Items breakdown table (product, variant SKU, qty, unit price, refund subtotal).
   - Customer photographic evidence gallery & return description.
   - Internal staff audit remarks.
   - Quick action triggers: Approve/Reject, Schedule Pickup, Mark Received, Quality Check, Restock Inventory, and Process Refund.
7. **Process Refund Dialog**:
   - Channel Selector (`Original Gateway` vs `Manual Bank Transfer` vs `Store Credit`).
   - Pre-filled customer bank details with one-click copy.
   - Amount calculator with full/partial refund options and maximum refundable limit validation.
   - Bank UTR / Transaction Reference number input.
8. **Warehouse Restocking Safeguard**:
   - Increases available inventory stock upon physical receipt with anti-double-restock guard.
9. **Printable RMA Receiving Slip**:
   - Instant printable document for warehouse receiving inspection.
10. **Automated Feature Test Suite**:
    - Comprehensive test coverage for all return milestones, customer bank accounts, and dual-channel refunds.

---

## 4. Out of Scope
- Direct banking API host-to-host payout gateways (e.g. RazorpayX Payouts API) — handled via manual admin bank transfer and UTR recording.
- Physical barcode scanner hardware drivers.

---

## 5. Actors / Users
1. **Customer**: Manages saved bank accounts, submits return requests with photo evidence, and selects preferred bank account for refund.
2. **Super Administrator**: Full authority to review returns, schedule pickups, mark items received, restock inventory, and process refunds via any channel.
3. **Order Manager / Support Staff**: Authority to review returns, verify bank accounts, and initiate refunds within assigned permission roles.

---

## 6. User Stories
- **US-01**: As a Customer, I want to save my bank account details in my profile so that I can receive refunds for COD orders without retyping bank info.
- **US-02**: As an Admin, I want to view the customer's selected bank account and copy account numbers/IFSC/UPI so that I can transfer the refund money via corporate netbanking.
- **US-03**: As an Admin, I want to record the Bank UTR / Transaction Reference number against the refund so that there is an immutable financial audit trail.
- **US-04**: As an Admin, I want to process gateway refunds for prepaid card/UPI orders so that the gateway automatically reverses the charge.
- **US-05**: As an Admin, I want to restock returned goods into inventory once inspected so that available stock is accurately replenished.
- **US-06**: As an Admin, I want to ensure that deleting a bank account never corrupts historical refund records through frozen snapshot preservation.

---

## 7. Functional Requirements
- **FR-001**: System shall provide customer endpoints to list, create, set default, and delete `customer_bank_accounts`.
- **FR-002**: System shall allow customer to attach a `bank_account_id` when submitting a return request, freezing bank details into `returns.bank_details_snapshot`.
- **FR-003**: System shall provide `GET /api/v1/admin/returns/stats` returning counts for returns by milestone and refund volume metrics.
- **FR-004**: System shall provide `GET /api/v1/admin/returns` supporting multi-filtering by search, status, date range, and pagination.
- **FR-005**: System shall provide `GET /api/v1/admin/returns/{id}` returning full return details, order snapshot, customer info, itemized lines, photo evidence, bank account snapshot, and refund histories.
- **FR-006**: System shall provide `POST /api/v1/admin/returns/{id}/status` to transition milestone state with audit logging.
- **FR-007**: System shall provide `POST /api/v1/admin/returns/{id}/restock` to restock returned items into inventory with double-restock protection.
- **FR-008**: System shall provide `GET /api/v1/admin/refunds` supporting search, status, gateway/channel filtering, and pagination.
- **FR-009**: System shall provide `GET /api/v1/admin/refunds/{id}` returning full refund transaction details including frozen bank details and UTR reference.
- **FR-010**: System shall provide `POST /api/v1/admin/refunds/process` supporting `refund_channel` (`original_gateway`, `bank_transfer`, `store_credit`, `manual_cash`), `bank_account_id`, `bank_details_snapshot`, `transaction_reference`, and amount validation.
- **FR-011**: System shall provide `POST /api/v1/admin/refunds/{id}/retry` to retry failed refund operations.

---

## 8. Business Rules
- **BR-001**: A return request can only be submitted for an order with status `delivered` within the return window (7 days).
- **BR-002**: For COD or manual bank refunds, a valid bank account snapshot (Account Holder, Bank Name, Account Number, IFSC) or UPI ID must be attached.
- **BR-003**: Total refunded amount across all refunds for an order cannot exceed `order.grand_total`.
- **BR-004**: When refunding via `bank_transfer`, `transaction_reference` (UTR / Bank Ref) is recorded.
- **BR-005**: Inventory restocking can only be performed once per return request (`restocked_at` timestamp check).
- **BR-006**: Financial records (`refunds`, `payments`) shall never be physically deleted from the database.

---

## 9. Inputs
- `refund_channel`: `['original_gateway', 'bank_transfer', 'store_credit', 'manual_cash']`.
- `bank_account_id`: Optional customer bank account primary key.
- `bank_details_snapshot`: Optional manual bank account details object (`account_holder_name`, `bank_name`, `account_number`, `ifsc_code`, `upi_id`).
- `transaction_reference`: Optional UTR / Bank Reference Number string.
- `amount`: Decimal monetary value.
- `reason`: Refund remarks string.

---

## 10. Outputs
- Standard JSON envelope: `{ "success": true, "message": "...", "data": {...} }`.

---

## 11. Validation Rules
- `refund_channel`: Required, in: `original_gateway,bank_transfer,store_credit,manual_cash`.
- `amount`: Required, numeric, min: 0.01, max: remaining refundable balance of order.
- `ifsc_code`: If provided, must match Indian IFSC regex format `^[A-Z]{4}0[A-Z0-9]{6}$`.
- `account_number`: If provided, numeric string 9 to 18 digits.

---

## 12. Permissions
- `orders.view` / `returns.view`: Read returns and refunds data.
- `orders.update` / `returns.update`: Update return milestone states and restock inventory.
- `orders.refund` / `refunds.process`: Issue full/partial refunds across any channel.

---

## 13. Error Scenarios
- Attempting to refund more than remaining balance $\rightarrow$ HTTP 422 `Refund amount exceeds refundable balance`.
- Bank transfer without bank account details $\rightarrow$ HTTP 422 `Bank details are required for bank transfer refund`.
- Double restocking attempt $\rightarrow$ HTTP 422 `Return items have already been restocked`.

---

## 14. Edge Cases
- Customer has multiple saved bank accounts $\rightarrow$ Customer selects one, snapshot is copied to return and refund records.
- Customer deletes their saved bank account later $\rightarrow$ Refund record maintains frozen `bank_details_snapshot` without error.
- Partial return of 1 item out of 3 $\rightarrow$ Itemized refund amount calculated from return item unit price and quantity.

---

## 15. Data Requirements
### New Table: `customer_bank_accounts`
- `id`: unsigned big integer PK
- `user_id`: unsigned big integer FK $\rightarrow$ `users(id)` ON DELETE CASCADE
- `account_holder_name`: string(150)
- `bank_name`: string(150)
- `account_number`: string(50)
- `ifsc_code`: string(20)
- `account_type`: enum(`savings`, `current`), default `savings`
- `upi_id`: string(100) nullable
- `is_default`: boolean, default false
- `is_verified`: boolean, default false
- `created_at`, `updated_at`: timestamps

### Updated Table: `returns`
- Add `bank_account_id`: unsigned big integer FK nullable $\rightarrow$ `customer_bank_accounts(id)` ON DELETE SET NULL
- Add `bank_details_snapshot`: JSON nullable
- Add `restocked_at`: timestamp nullable

### Updated Table: `refunds`
- Add `refund_channel`: enum(`original_gateway`, `bank_transfer`, `store_credit`, `manual_cash`), default `original_gateway`
- Add `bank_account_id`: unsigned big integer FK nullable $\rightarrow$ `customer_bank_accounts(id)` ON DELETE SET NULL
- Add `bank_details_snapshot`: JSON nullable
- Add `transaction_reference`: string(100) nullable (UTR / Bank Ref Number)

---

## 16. API Requirements
### Customer Bank Accounts
1. `GET /api/v1/customer/bank-accounts`
2. `POST /api/v1/customer/bank-accounts`
3. `PATCH /api/v1/customer/bank-accounts/{id}/default`
4. `DELETE /api/v1/customer/bank-accounts/{id}`

### Admin Returns & Refunds
1. `GET /api/v1/admin/returns/stats`
2. `GET /api/v1/admin/returns`
3. `GET /api/v1/admin/returns/{id}`
4. `POST /api/v1/admin/returns/{id}/status`
5. `POST /api/v1/admin/returns/{id}/restock`
6. `GET /api/v1/admin/refunds/stats`
7. `GET /api/v1/admin/refunds`
8. `GET /api/v1/admin/refunds/{id}`
9. `POST /api/v1/admin/refunds/process`
10. `POST /api/v1/admin/refunds/{id}/retry`

---

## 17. UI Requirements
- React Admin SPA page mounted at `/returns`.
- Top KPI Summary Cards.
- Dual Tabs: **Return Requests** and **Refund History**.
- Multi-Filter Toolbar with Search, Status, Channel, and Date Range.
- 360-Degree Return Inspection Drawer with Bank Account Snapshot card and copy-to-clipboard buttons.
- Process Refund Dialog supporting Original Gateway, Customer Saved Bank Accounts, and Store Credit with UTR input.
- Printable RMA Receiving Slip.

---

## 18. Non-Functional Requirements
- Sub-200ms query latency on indexed search.
- Zero financial record hard deletion.
- Atomic transactions on all state transitions and refunds.

---

## 19. Security Requirements
- Sanctum token authentication on all endpoints.
- Strict authorization: Customers can only access their own bank accounts; Admin staff requires Spatie permissions.
- Masked bank account display in lists (e.g. `•••• •••• 1234`) with full details available in privileged admin drawer.

---

## 20. Acceptance Criteria
1. Customer can manage multiple saved bank accounts and select one for return refunds.
2. Admin can view customer's selected bank account details in 360 return drawer with one-click copy buttons.
3. Admin can process gateway refunds for prepaid orders and manual bank transfers with UTR recording for COD orders.
4. Refunds and returns store frozen `bank_details_snapshot` with zero dependency on active records.
5. Returned goods can be restocked into inventory with anti-double-restock protection.
6. Feature test suite passes 100% green.

---

## 21. Open Questions
*None.*

---

## 22. Assumptions
- Banking IFSC codes follow standard format.
- Manual payouts are processed by store accountants/admins through corporate banking portals, and UTR reference numbers are recorded in the admin console.
