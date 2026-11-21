# Test Cases: Frontend OTP Verification & Account Security

**Module Name:** Frontend OTP Verification & Account Security  
**Module ID:** 13 (Frontend)  
**Test File:** `frontend/plans/test-cases.frontend-verify-otp.md`  
**Specification:** `frontend/specifications/feature.frontend-verify-otp.spec.md`  
**Target Playwright Spec:** `frontend/tests/e2e/verify-otp.spec.js`  

---

## 1. Test Suite Overview

This document defines the automated End-to-End (E2E) test cases for **Frontend Module 13: OTP Verification & Account Security**. Tests are executed using Playwright against `http://localhost:3000`.

---

## 2. Test Cases Matrix

| Test ID | Title | Objective | Expected Result |
|---|---|---|---|
| **TC-OTP-001** | Verify OTP Page Render | Verify `/auth/verify-otp` loads cleanly with target email header | Displays verification card, target email badge, and 6 empty PIN boxes |
| **TC-OTP-002** | Auto-Focus Progression | Verify typing a digit advances focus to next box | Typing digit in box `N` automatically shifts active input focus to box `N+1` |
| **TC-OTP-003** | Backspace Focus Regression | Verify pressing Backspace on empty box retreats focus | Clears previous digit and shifts active input focus back to box `N-1` |
| **TC-OTP-004** | Clipboard Paste 6-Digit Code | Verify pasting 6 digits populates all input boxes | All 6 PIN boxes populate instantly and focus shifts to 6th box |
| **TC-OTP-005** | Numeric Key Filtering | Verify entering non-numeric characters is suppressed | Letters and symbols are ignored; input remains empty |
| **TC-OTP-006** | Invalid OTP Error Handling | Verify entering incorrect OTP displays error message | Red alert banner appears: "Invalid or expired verification code" |
| **TC-OTP-007** | Resend Timer Countdown | Verify countdown timer disables resend CTA for 60s | Displays "Resend in 60s" countdown, unlocking link when timer expires |
| **TC-OTP-008** | Trigger Resend OTP Action | Verify clicking "Resend OTP" sends new code | Triggers resend API, shows toast alert, and restarts 60s timer |
| **TC-OTP-009** | Registration OTP Verification Success | Verify valid OTP in registration mode redirects to account | Authenticates user, merges cart, and navigates to `/account` or `/` |
| **TC-OTP-010** | Password Reset OTP Verification Success | Verify valid OTP in reset mode redirects to new password screen | Validates code and navigates to `/auth/reset-password` |
