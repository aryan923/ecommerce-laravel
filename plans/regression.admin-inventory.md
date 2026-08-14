# Regression Scenarios: Module 25 — Admin Inventory Management

**Module Name:** Admin Inventory Management  
**Module ID:** 25  
**Regression Documentation File:** `plans/regression.admin-inventory.md`  
**Specification File:** `specifications/feature.admin-inventory.spec.md`  

---

## 1. Affected Existing Features

| Feature / Area | Impact Risk | Description |
| :--- | :--- | :--- |
| **Product Variants (`ProductVariant`)** | High | `product_variants.stock_qty` must stay perfectly in sync with `inventories.available_qty`. |
| **Orders & Checkout Reservation** | High | Order stock reservations must not conflict with manual stock adjustments. |
| **Public Storefront Catalog** | Medium | Out-of-stock badges on storefront products depend on accurate `available_qty`. |
| **Dashboard KPIs** | Low | Main admin dashboard inventory highlights must remain consistent. |

---

## 2. Regression Test Matrix

| Scenario ID | Affected Module | Test Scenario | Priority | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **REG-INV-001** | Product Management | Updating product variant price or attributes does not alter stock quantity or inventory records. | High | Variant details update successfully without resetting `inventories.available_qty`. |
| **REG-INV-002** | Order Processing | Placing a customer order reserves stock without breaking manual stock adjustments. | High | Order reservation increments `reserved_qty` and reduces `available_qty` atomically. |
| **REG-INV-003** | Public Catalog | Adjusting stock to 0 automatically updates product availability on customer catalog API. | Medium | `/api/v1/products` reflects out-of-stock state. |
| **REG-INV-004** | Role Permissions | Super Admin retains unrestricted stock control while restricted staff are scoped to `inventory.view`. | High | RBAC permission middleware functions seamlessly across role switches. |
