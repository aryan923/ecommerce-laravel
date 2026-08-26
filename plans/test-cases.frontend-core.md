# Test Cases: Frontend Core Architecture & API Infrastructure

**Module Name:** Frontend Core Architecture & API Infrastructure  
**Module ID:** 01 (Frontend)  
**Test File:** `plans/test-cases.frontend-core.md`  
**Specification:** `specifications/feature.frontend-core.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/core.spec.js`  

---

## 1. Test Suite Overview

This document specifies the automated End-to-End (E2E) test cases for **Frontend Module 01**. Tests will be executed using Playwright against the Next.js development server (`http://localhost:3000`) connected to the backend Laravel API (`http://localhost:8002/api/v1`).

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-CORE-001** | Guest Session Cookie Generation | Verify `guest_session_id` cookie is created on initial site load | `guest_session_id` cookie exists with valid UUID v4 value |
| **TC-CORE-002** | X-Session-ID Header Attachment | Verify outgoing API requests contain `X-Session-ID` header | Backend receives header matching guest session cookie |
| **TC-CORE-003** | Sanctum Token Header Attachment | Verify `Authorization: Bearer <token>` header is attached when logged in | Requests include `Authorization: Bearer <token>` |
| **TC-CORE-004** | Global Toast Notification Render | Verify `ToastContext.showToast()` renders a visible toast popup | Toast element appears with correct message and auto-dismisses |
| **TC-CORE-005** | Unauthorized 401 Interceptor Handling | Verify 401 response clears token and resets Auth state | User logged out, token cleared from cookies/storage |
| **TC-CORE-006** | Validation Error 422 Parsing | Verify 422 API errors format correctly for form error display | Form error object structured into field error arrays |
| **TC-CORE-007** | Currency Formatting Helper | Verify `formatPrice(100)` formats according to active currency | Formatted string contains symbol and correct converted amount |
| **TC-CORE-008** | Error Boundary Fallback UI | Verify unhandled React render error triggers Error Boundary | User-friendly error message & "Reload Page" button rendered |
