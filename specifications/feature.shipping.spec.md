# Feature Specification: Shipping & Per-Product Combined Rate Engine Module

**Module Name:** Shipping & Per-Product Combined Rate Engine Module  
**Module ID:** 15  
**Specification File:** `specifications/feature.shipping.spec.md`  
**Version:** 3.0 (Updated with Per-Product Custom Shipping Fee & Sum-Per-Item Engine)  
**Status:** Approved / Extended  
**Base SRS References:** `Requirements/srs_apis.md` (§44–§48), `Requirements/admin_panel.md` (§25–§26), `Requirements/development_modules.md` (§Module 15)  
**Tech Stack:** Laravel 12.x / PHP 8.4 / Sanctum Guard & Spatie Permission / OpenAPI 3.0 (`http://localhost:8002`)  

---

## 1. Module Overview

The Shipping Module provides a complete logistics, per-product combined rate engine, and shipment tracking system. It allows administrators to define geographic Shipping Zones; set up Shipping Methods; configure Shipping Rates using Flat Rate, Weight-Based, Price-Tier-Based, **Per-Product Custom Rates (`per_product`)**, and Free Shipping Threshold rules.

The core `ShippingService` evaluates available shipping methods and exact shipping fees for customer carts during checkout, summing per-product custom shipping fees (`product.shipping_fee`), applying price-based free shipping thresholds, combined item discounting, and product-level free shipping overrides.

---

## 2. Combined & Flexible Shipping Strategy Models

### 2.1 Combination Modes

| Strategy Code | Calculation Formula | Business Context |
|---|---|---|
| `per_product` | `Sum(Item.Product.shipping_fee * Quantity)` | Each product charges its own fixed custom shipping fee |
| `highest_item_first` | `Max(Item Shipping Fee) + Sum(Item Additional Fee)` | Prevents overcharging when combining small items with one heavy item |
| `sum_all` | `Sum(Item Shipping Fee)` | Direct additive shipping per item |
| `fixed_base_plus_weight` | `Base Fee + (Total Cart Weight * Rate Per KG)` | Flexible weight-tiered logistics |
| `price_bracket_combined` | Cart Subtotal Tiers ($\ge$ ₹1999: FREE, ₹500–₹1999: ₹40, < ₹500: ₹80) | Order value incentive for higher cart total |

---

## 3. Functional Requirements

- **FR-SHP-001**: System shall support `per_product` shipping rate calculation model where each item in the cart contributes its `product.shipping_fee` to the total shipping fee.
- **FR-SHP-002**: System shall support 5 shipping rate calculation models: `flat_rate`, `weight_based`, `price_based`, `per_product`, `combined_shipping`, and `free_shipping`.
- **FR-SHP-003**: System shall evaluate Per-Product Shipping Strategies (`per_product`, `highest_item_first`, `sum_all`, `fixed_base_plus_weight`, `price_bracket_combined`) during checkout calculation (`POST /api/v1/shipping/calculate`).

---

## 4. Verification Criteria

1. Setting `shipping_fee = 75.00` on Product A and `shipping_fee = 50.00` on Product B results in total cart shipping fee = ₹125.00 when `per_product` strategy is used.
2. Checkout shipping calculator (`POST /api/v1/shipping/calculate`) accurately sums per-product shipping fees.
3. All backend unit and feature tests pass cleanly.
