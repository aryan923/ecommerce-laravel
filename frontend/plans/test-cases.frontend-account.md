# Test Cases: Frontend Customer Account Portal

**Module Name:** Frontend Customer Account Portal  
**Module ID:** 09 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-account.md`  
**Specification:** `frontend/specifications/feature.frontend-account.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/account.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 09: Customer Account Portal (`/account/*`)**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-ACC-001** | Render Account Dashboard (`/account`) | Verify `/account` route renders dashboard metrics, sidebar navigation, and quick links | Account sidebar, user greeting, stat counters, and quick links render |
| **TC-ACC-002** | Profile Information & Password Edit (`/account/profile`) | Verify editing customer name/phone and submitting password change form | `PUT /api/v1/customer/profile` and `POST /api/v1/customer/change-password` succeed |
| **TC-ACC-003** | Saved Address Book Management (`/account/addresses`) | Verify listing, creating, editing, and deleting saved addresses | Address card grid updates and address CRUD actions execute cleanly |
| **TC-ACC-004** | Order History & Filtering (`/account/orders`) | Verify paginated order history list renders with status filter tabs | Order items render with status badges (Processing, Shipped, Delivered, Cancelled) |
| **TC-ACC-005** | Order Detail & Cancellation (`/account/orders/[order_number]`) | Verify order detail invoice view, shipment timeline, and cancellation CTA | Order invoice, shipment tracking steps, and cancel order button render |
| **TC-ACC-006** | Returns & RMA Submission (`/account/returns` & `/account/returns/new`) | Verify listing return requests and submitting new return form | Return status cards render and return submission form posts successfully |
| **TC-ACC-007** | Refund Bank Accounts (`/account/bank-accounts`) | Verify adding and deleting saved bank accounts for instant refund processing | Bank account cards render with masked account number and delete button |
| **TC-ACC-008** | Customer Notifications (`/account/notifications`) | Verify rendering customer notification list and toggling read state | In-app notification items render with unread badges and mark as read buttons |
| **TC-ACC-009** | Unauthenticated Access Guard | Verify accessing `/account/*` routes without authentication redirects to login | Redirects unauthenticated user to `/auth/login?redirect=/account` |
