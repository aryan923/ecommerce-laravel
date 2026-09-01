# Feature Specification: Frontend Customer Authentication & Session Merge Module

**Module Name:** Frontend Customer Authentication & Session Merge  
**Module ID:** 07 (Frontend)  
**Specification File:** `frontend/specifications/feature.frontend-auth.spec.md`  
**Version:** 1.0  
**Status:** Ready for Implementation  
**Base SRS Document:** `frontend/Requirements/development_modules.md` (§Module 07), `frontend/Requirements/srs_pages.md` (§2.5)  

---

## 1. Module Overview

The **Customer Authentication & Session Merge** module handles customer onboarding, login, password recovery, session persistence, and automatic guest cart merging across four dedicated auth routes:
1. **Customer Login (`/auth/login`)**: Customer signin form with email/password credentials, error feedback alerts, and redirect memory (e.g., returning to `/checkout` if intercepted).
2. **Customer Registration (`/auth/register`)**: Account creation form with name, email, password confirmation, and terms agreement.
3. **Forgot Password (`/auth/forgot-password`)**: Password recovery email submission with success confirmation feedback.
4. **Reset Password (`/auth/reset-password`)**: Secure token-based password reset form.

Upon successful authentication (login or registration), the system automatically triggers `POST /api/v1/cart/merge` passing the active guest `X-Session-ID` to combine guest cart items into the authenticated customer's account seamlessly.

---

## 2. Architecture & Component Structure

```
+-----------------------------------------------------------------------------------+
|                            Auth Page Layout (Split Screen)                        |
+---------------------------------------------------+-------------------------------+
|  Auth Branding & Benefits Feature Banner          |  Auth Form Container          |
|  - Brand Logo & Tagline                           |  - Route Header & Subtitle    |
|  - Security & Trust Highlights                    |  - Interactive Form Fields    |
|  - Customer Testimonial / Visual Graphic          |  - Error & Success Alerts     |
|                                                   |  - Submit CTA Button          |
|                                                   |  - Alternative Route Links    |
+---------------------------------------------------+-------------------------------+

+-----------------------------------------------------------------------------------+
|                                 Global Auth Context                               |
+-----------------------------------------------------------------------------------+
|  AuthContext.js / useAuth Hook                                                    |
|  - State: user, token, isAuthenticated, isLoading, authError                      |
|  - Actions: login(), register(), logout(), forgotPassword(), resetPassword()      |
|  - Side Effect: Automatic trigger of cart.merge() after login/register            |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & API Contracts

### 3.1 Login Endpoint (`POST /api/v1/auth/login`)
**Request:**
```json
{
  "email": "customer@example.com",
  "password": "SecretPassword123!"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "1|sanctum_token_string_here",
    "user": {
      "id": 12,
      "name": "Jane Doe",
      "email": "customer@example.com",
      "avatar_url": "https://example.com/avatar.jpg"
    }
  }
}
```

### 3.2 Registration Endpoint (`POST /api/v1/auth/register`)
**Request:**
```json
{
  "name": "Jane Doe",
  "email": "customer@example.com",
  "password": "SecretPassword123!",
  "password_confirmation": "SecretPassword123!"
}
```

### 3.3 Cart Merge Endpoint (`POST /api/v1/cart/merge`)
**Headers:** `Authorization: Bearer <token>`, `X-Session-ID: <guest_session_id>`  
**Response:**
```json
{
  "success": true,
  "message": "Guest cart merged into user account successfully",
  "data": {
    "merged_items_count": 3
  }
}
```

---

## 4. UI/UX & Functional Requirements

### 4.1 Login View (`/auth/login`)
- **Route**: `frontend/src/app/auth/login/page.js` & `LoginForm.jsx`
- **Fields**: Email input (with validation), Password input (with show/hide toggle), "Remember me" checkbox.
- **Actions**: "Sign In" primary CTA, "Forgot password?" link (`/auth/forgot-password`), "Don't have an account? Create one" link (`/auth/register`).
- **Post-Login Side Effect**: Triggers cart merge and redirects user to `redirectUrl` (defaults to `/`).

### 4.2 Registration View (`/auth/register`)
- **Route**: `frontend/src/app/auth/register/page.js` & `RegisterForm.jsx`
- **Fields**: Full Name, Email Address, Password (with strength indicator), Password Confirmation, Terms & Conditions checkbox.
- **Actions**: "Create Account" primary CTA, "Already have an account? Sign In" link (`/auth/login`).

### 4.3 Forgot Password View (`/auth/forgot-password`)
- **Route**: `frontend/src/app/auth/forgot-password/page.js` & `ForgotPasswordForm.jsx`
- **Fields**: Registered Email Address input.
- **Actions**: "Send Password Reset Link" CTA button, green success banner upon dispatch, "Back to Sign In" link (`/auth/login`).

### 4.4 Reset Password View (`/auth/reset-password`)
- **Route**: `frontend/src/app/auth/reset-password/page.js` & `ResetPasswordForm.jsx`
- **Fields**: Email Address, New Password, Confirm Password, Reset Token (parsed from URL query params `?token=xyz`).
- **Actions**: "Reset Password" CTA button, auto-redirect to `/auth/login` on success.

---

## 5. Test Suite & Validation Criteria

- **Unit & Integration Testing**:
  - Verify `AuthContext` stores Bearer token in `localStorage` / HTTP headers and sets `isAuthenticated = true`.
  - Verify cart merging triggers immediately after login.
- **E2E Playwright Specs (`frontend/tests/e2e/auth.spec.js`)**:
  1. Test rendering Login page (`/auth/login`) and submitting empty fields (validation error alerts).
  2. Test rendering Register page (`/auth/register`) and checking form controls.
  3. Test rendering Forgot Password page (`/auth/forgot-password`).
  4. Test rendering Reset Password page (`/auth/reset-password`).
  5. Test navigation links between auth pages.
