# Test Cases: Frontend Customer Authentication & Session Merge

**Module Name:** Frontend Customer Authentication & Session Merge  
**Module ID:** 07 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-auth.md`  
**Specification:** `frontend/specifications/feature.frontend-auth.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/auth.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 07: Customer Authentication & Session Merge**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-ATH-001** | Render Login Page (`/auth/login`) | Verify login page renders split-screen layout & fields | Email, password input, "Remember me", and submit button render |
| **TC-ATH-002** | Login Empty Form Validation | Verify submitting empty login form triggers error alert | Validation feedback indicates required email and password |
| **TC-ATH-003** | Toggle Password Visibility | Verify clicking eye icon toggles password field type | Field type switches between `password` and `text` |
| **TC-ATH-004** | Render Registration Page (`/auth/register`) | Verify register page renders name, email, password fields | Name, email, password, confirm password, and terms check render |
| **TC-ATH-005** | Registration Password Mismatch | Verify password mismatch triggers validation error | Error alert indicates password confirmation does not match |
| **TC-ATH-006** | Render Forgot Password Page | Verify `/auth/forgot-password` renders recovery form | Email input field and "Send Reset Link" button render |
| **TC-ATH-007** | Forgot Password Success Dispatch | Verify submitting email displays green success banner | Success alert confirms password reset instructions sent |
| **TC-ATH-008** | Render Reset Password Page | Verify `/auth/reset-password?token=xyz` renders reset form | Email, new password, confirm password, and token fields render |
| **TC-ATH-009** | Inter-Auth Route Navigation | Verify clicking link on Login navigates to Register page | URL changes to `/auth/register` and registration form displays |
| **TC-ATH-010** | Automatic Cart Session Merge | Verify logging in merges active guest cart into account | `POST /api/v1/cart/merge` is called with guest session token |
