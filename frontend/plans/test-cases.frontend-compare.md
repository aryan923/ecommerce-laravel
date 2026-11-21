# Test Cases: Frontend Product Comparison Engine

**Module Name:** Frontend Product Comparison Engine  
**Module ID:** 12 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-compare.md`  
**Specification:** `frontend/specifications/feature.frontend-compare.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/compare.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 12: Product Comparison Engine**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-CMP-001** | Add Product to Compare | Verify clicking compare toggle on `ProductCard` adds item | Item adds to compare context, toast notification displays, and sticky `CompareBar` appears |
| **TC-CMP-002** | Sticky CompareBar Counter Sync | Verify `CompareBar` displays live item count and thumbnails | Shows accurate count (e.g., "2 of 4 selected") and thumbnail pills |
| **TC-CMP-003** | Max 4 Products Limit Enforcement | Verify attempting to add 5th product triggers limit warning | Prevents 5th item addition and displays "Maximum 4 products" toast warning |
| **TC-CMP-004** | Remove Product from Sticky Bar | Verify clicking remove (X) icon on sticky pill removes item | Item is removed from compare state and count updates |
| **TC-CMP-005** | Navigate to Compare Page | Verify clicking "Compare Now" button opens `/compare` route | Route loads `/compare` with full side-by-side comparison matrix table |
| **TC-CMP-006** | Compare Matrix Side-by-Side Render | Verify matrix renders product columns, image, title, price, and specs | Table displays pricing, discount badges, ratings, brand, and attribute rows |
| **TC-CMP-007** | Highlight Differences Toggle | Verify toggling "Highlight Differences" filter dims matching rows | Hides or dims rows with identical values across compared products |
| **TC-CMP-008** | Add to Cart from Compare Matrix | Verify clicking "Add to Cart" button in product column | Adds selected product directly to cart drawer/context |
| **TC-CMP-009** | Remove Single Item from Matrix | Verify clicking remove button on column removes product | Column is removed from comparison matrix table and count updates |
| **TC-CMP-010** | Clear All Compare Items | Verify clicking "Clear All" empties comparison list | Clears all compared items and renders `EmptyCompare` placeholder view |
| **TC-CMP-011** | Empty Compare View Render | Accessing `/compare` with 0 items renders empty placeholder | Displays friendly scales illustration, message, and "Explore Catalog" CTA |
