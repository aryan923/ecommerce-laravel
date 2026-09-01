# Test Cases: Frontend Checkout & Order Processing

**Module Name:** Frontend Checkout & Order Processing  
**Module ID:** 08 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-checkout.md`  
**Specification:** `frontend/specifications/feature.frontend-checkout.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/checkout.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 08: Checkout & Order Processing**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-CHK-001** | Render Checkout Page (`/checkout`) | Verify checkout route renders stepper, forms, and order summary sidebar | Stepper progress bar, address fields, and summary sidebar render |
| **TC-CHK-002** | Contact Info & Address Inputs | Verify filling email and shipping address details | Inputs store customer contact and address values |
| **TC-CHK-003** | Select Shipping Method | Verify selecting Standard vs Express shipping updates shipping fee | Selecting Express shipping adds delivery charge to summary |
| **TC-CHK-004** | Select Payment Gateway | Verify selecting payment methods (COD, Card, UPI) | Active payment method radio updates selected state |
| **TC-CHK-005** | Order Placement & Redirection | Verify clicking Place Order submits checkout form and redirects | `POST /api/v1/checkout/process` completes and redirects to `/checkout/success/[order_number]` |
| **TC-CHK-006** | Render Order Success Receipt | Verify `/checkout/success/[order_number]` renders order receipt details | Order ID, items table, shipping address, and payment status render |
| **TC-CHK-007** | Empty Cart Redirect Guard | Verify accessing `/checkout` with empty cart redirects to `/cart` or `/products` | User is redirected with informative alert |
