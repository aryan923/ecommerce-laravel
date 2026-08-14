# Test Cases: Module 25 — Admin Inventory Management

**Module Name:** Admin Inventory Management  
**Module ID:** 25  
**Test Documentation File:** `plans/test-cases.admin-inventory.md`  
**Specification File:** `specifications/feature.admin-inventory.spec.md`  

---

## 1. Happy Path Test Scenarios

| Test Case ID | Description | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-INV-001** | Fetch Admin Inventory KPIs | Send `GET /api/v1/admin/inventory/kpis` with valid Sanctum Bearer token | HTTP 200 OK with `total_skus`, `total_stock_units`, `low_stock_count`, `out_of_stock_count`, `reserved_stock_units`, `total_inventory_value` |
| **TC-INV-002** | Fetch Paginated Inventory Catalog | Send `GET /api/v1/admin/inventory?page=1&per_page=10` | HTTP 200 OK with paginated items, product metadata, available, reserved, and threshold stock values |
| **TC-INV-003** | Search Inventory by SKU / Product Name | Send `GET /api/v1/admin/inventory?search=PRD-1234` | HTTP 200 OK returning only matching SKUs |
| **TC-INV-004** | Perform Stock Addition (Add) | Send `POST /api/v1/admin/inventory/adjust` with `type: "add"`, `quantity: 10`, `reason: "Supplier Restock"` | HTTP 200 OK, `available_qty` increased by 10, `inventory_transactions` record created |
| **TC-INV-005** | Perform Stock Deduction (Deduct) | Send `POST /api/v1/admin/inventory/adjust` with `type: "deduct"`, `quantity: 5`, `reason: "Damaged Stock"` | HTTP 200 OK, `available_qty` reduced by 5, audit record logged |
| **TC-INV-006** | Perform Absolute Stock Override (Set) | Send `POST /api/v1/admin/inventory/adjust` with `type: "set"`, `quantity: 50`, `reason: "Audit Adjustment"` | HTTP 200 OK, `available_qty` updated directly to 50, audit log records exact change delta |
| **TC-INV-007** | Fetch Inventory Transaction Log | Send `GET /api/v1/admin/inventory/transactions` | HTTP 200 OK returning historical transaction logs sorted by latest timestamp |
| **TC-INV-008** | Export Inventory Snapshot to CSV | Send `GET /api/v1/admin/inventory/export` | HTTP 200 OK with `text/csv` header and properly formatted CSV stock headers/rows |

---

## 2. Validation & Negative Test Scenarios

| Test Case ID | Description | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-INV-009** | Reject Stock Adjustment with Non-Existent Variant | Send `POST /api/v1/admin/inventory/adjust` with `product_variant_id: 99999` | HTTP 422 Unprocessable Entity validation error |
| **TC-INV-010** | Reject Invalid Adjustment Type | Send `POST /api/v1/admin/inventory/adjust` with `type: "invalid_action"` | HTTP 422 Unprocessable Entity validation error |
| **TC-INV-011** | Reject Deduction Exceeding Available Quantity | Attempt to deduct 100 units from an inventory with only 10 available units | HTTP 422 Unprocessable Entity error: "Cannot deduct more stock than currently available." |
| **TC-INV-012** | Require Adjustment Reason | Send `POST /api/v1/admin/inventory/adjust` omitting `reason` | HTTP 422 Unprocessable Entity validation error |

---

## 3. Permission & Security Scenarios

| Test Case ID | Description | Test Steps | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-INV-013** | Reject Unauthenticated Requests | Send `GET /api/v1/admin/inventory` without Bearer token | HTTP 401 Unauthorized |
| **TC-INV-014** | Reject Unauthorized Staff Role | Send `POST /api/v1/admin/inventory/adjust` with user lacking `inventory.update` permission | HTTP 403 Forbidden |
