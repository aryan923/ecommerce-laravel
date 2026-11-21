# Feature Specification: Frontend OTP Verification & Account Security Module

**Module Name:** Frontend OTP Verification & Account Security  
**Module ID:** 13 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-verify-otp.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 13), `frontend/Requirements/srs_pages.md` (§2.11)  

---

## 1. Module Overview

The **OTP Verification & Account Security** module provides a secure 6-digit One-Time Password (OTP) verification experience for account registration activation and password reset security flows (`/auth/verify-otp`). It ensures customer email/phone ownership verification, prevents unauthorized access, and protects user account creation and credential recovery.

The module consists of:
1. **OTP Verification Route (`/auth/verify-otp`)**: Dedicated client route handling query params (`email`, `type`, `redirect`) and rendering the central security verification card.
2. **Interactive 6-Digit PIN Input (`OtpForm.jsx` / `OtpInputModal.jsx`)**: 6 segmented single-digit input fields with automatic focus progression, backspace focus regression, full 6-digit clipboard paste handling, and clear field validation feedback.
3. **Resend Cooldown Timer**: 60-second countdown timer preventing OTP resend spamming while displaying active countdown status ("Resend OTP in 45s").
4. **Contextual Action Flows**:
   - **Registration Mode (`type=registration`)**: Verifies new user account email, automatically authenticates user with returned Bearer token, merges guest cart, and redirects to account dashboard or previous checkout flow.
   - **Password Reset Mode (`type=password_reset`)**: Validates password recovery OTP, generates temporary reset session token, and navigates user to set new password (`/auth/reset-password`).
5. **Modal & Standalone Layout Variants**: Supports both standalone page rendering (`/auth/verify-otp`) and reusable modal overlay (`OtpInputModal.jsx`) for inline verification triggers.

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Global Storefront Auth Layout                          |
+-----------------------------------------------------------------------------------+
|  OTP Verification Page Route (/auth/verify-otp)                                   |
|  - Reads URL search parameters: ?email=user@example.com&type=registration         |
+-----------------------------------------------------------------------------------+
|  VerifyOtpClient Container Card                                                   |
|  - Brand Header (Luxora Logo & Lock Shield Icon)                                   |
|  - Heading: "Verify Your Email Address" / "Enter Security Code"                    |
|  - Target Identity Info: "We sent a 6-digit verification code to user@example.com" |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | OtpForm / OtpInputModal Component                                         |  |
|  |                                                                             |  |
|  |  +-----+  +-----+  +-----+  +-----+  +-----+  +-----+                       |  |
|  |  |  4  |  |  8  |  |  2  |  |  9  |  |  0  |  |  1  |                       |  |
|  |  +-----+  +-----+  +-----+  +-----+  +-----+  +-----+                       |  |
|  |                                                                             |  |
|  |  - Auto-advance focus on digit keypress                                      |  |
|  |  - Backspace clears and returns focus to previous input                       |  |
|  |  - Paste event auto-fills all 6 boxes                                       |  |
|  |                                                                             |  |
|  |  [ Error Alert Banner ] ("Invalid verification code. Please try again.")    |  |
|  |                                                                             |  |
|  |  [ Verify & Continue CTA Button ] (Disabled until 6 digits entered)          |  |
|  |                                                                             |  |
|  |  Resend Section:                                                            |  |
|  |  - Countdown Timer: "Didn't receive code? Resend in 00:45"                   |  |
|  |  - Active Resend Link: "Resend Code" (Triggers POST /api/v1/auth/resend-otp)   |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  - Navigation Helper: "Entered wrong email? Change Email Address"                 |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Verify OTP Code (`POST /api/v1/auth/verify-otp`)

- **Request URL**: `/api/v1/auth/verify-otp`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`, `Accept: application/json`

#### Request Payload:
```json
{
  "email": "customer@example.com",
  "otp": "482901",
  "type": "registration"
}
```

#### Sample Success Response (`200 OK` - Registration Mode):
```json
{
  "success": true,
  "message": "Account email verified successfully.",
  "data": {
    "token": "72|sanctum_token_hash_string_xyz...",
    "user": {
      "id": 18,
      "first_name": "Jane",
      "last_name": "Doe",
      "email": "customer@example.com",
      "phone": "+15550192834",
      "email_verified_at": "2026-09-17T11:00:00.000000Z"
    }
  }
}
```

#### Sample Success Response (`200 OK` - Password Reset Mode):
```json
{
  "success": true,
  "message": "Security code verified successfully.",
  "data": {
    "reset_token": "reset_stage_token_9918237492",
    "email": "customer@example.com"
  }
}
```

#### Sample Error Response (`422 Unprocessable Entity` / `400 Bad Request`):
```json
{
  "success": false,
  "message": "Invalid or expired verification code. Please request a new code.",
  "errors": {
    "otp": [
      "The entered 6-digit code is invalid."
    ]
  }
}
```

---

### 3.2 Resend OTP Code (`POST /api/v1/auth/resend-otp`)

- **Request URL**: `/api/v1/auth/resend-otp`
- **Method**: `POST`

#### Request Payload:
```json
{
  "email": "customer@example.com",
  "type": "registration"
}
```

#### Sample Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "A new 6-digit verification code has been sent to customer@example.com",
  "data": {
    "resend_cooldown_seconds": 60,
    "expires_in_minutes": 10
  }
}
```

---

## 4. UI/UX & Interaction Specifications

### 4.1 6-Digit Segmented PIN Input Mechanics
1. **Focus Initialization**: When page loads or modal opens, focus is automatically assigned to the 1st input box (`input-0`).
2. **Character Filtering**: Input fields accept numeric digits (`0-9`) only. Non-numeric keystrokes are suppressed.
3. **Auto-Advancement**: Typing a valid digit into box `N` immediately advances keyboard focus to box `N+1`.
4. **Backspace Regression**: Pressing Backspace on an empty box `N` clears box `N-1` and retreats focus to box `N-1`.
5. **Clipboard Paste Integration**: Pasting a string (e.g. `482901` copied from email/SMS) extracts the first 6 digits and distributes them across boxes `0` through `5`, moving focus to box `5`.
6. **Auto-Submission**: When the 6th digit is entered or pasted, the form automatically initiates verification.

### 4.2 Resend Cooldown Timer
- Displays a 60-second countdown (`01:00` down to `00:00`).
- While timer > 0: "Resend Code" CTA is disabled with helper text "Resend code in 45s".
- When timer reaches 0: CTA unlocks as clickable link "Resend OTP".
- Clicking "Resend OTP" resets timer back to 60 seconds and shows toast confirmation ("New verification code sent").

---

## 5. Security & Error Handling Requirements

1. **Throttling & Rate Limiting**: Limit verification attempts to 5 failed entries before locking form for 5 minutes.
2. **Session Persistence**: Preserve `email` and `type` context in `sessionStorage` fallback if user refreshes page.
3. **Sanitisation**: Strip non-numeric characters prior to API submission.
4. **Accessibility (a11y)**: `aria-label="Digit 1 of 6"`, `autocomplete="one-time-code"`, full keyboard navigation support.
