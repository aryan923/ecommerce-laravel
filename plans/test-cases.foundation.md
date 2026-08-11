# Test Cases: Foundation & Infrastructure Module

**Module Name:** Foundation & Infrastructure  
**Module ID:** 01  
**Test File:** `plans/test-cases.foundation.md`  
**Specification:** `specifications/feature.foundation.spec.md`  
**Plan:** `plans/plan.foundation.md`  
**Version:** 1.3  
**Target Stack:** Laravel 12.x / PHP 8.4 / L5-Swagger (`http://localhost:8002`)  

---

## 1. Happy Path Scenarios

### TC-FND-001: Health Check Endpoint Success
- **Input**: `GET /api/v1/health` with `Accept: application/json`.
- **Expected Result**: HTTP 200 OK, `success: true`, `message` indicating healthy status, `data.status: "up"`.

### TC-FND-002: ApiResponseTrait Success Envelope
- **Input**: Call `successResponse($data, $message, 200)`.
- **Expected Result**: Returns JSON payload containing `success: true`, `message`, `data`, and `errors: null`.

### TC-FND-003: ApiResponseTrait Created Envelope
- **Input**: Call `successResponse($data, $message, 201)`.
- **Expected Result**: Returns HTTP 201 Created with standard JSON payload.

### TC-FND-004: Interactive Swagger UI Access on http://localhost:8002
- **Input**: `GET /api/documentation`.
- **Expected Result**: HTTP 200 OK, renders Swagger UI HTML page with loaded `api-docs.json` pointing to `http://localhost:8002`.

---

## 2. Negative Test Scenarios

### TC-FND-005: Global 404 Exception Format
- **Input**: `GET /api/v1/non-existent-endpoint`.
- **Expected Result**: HTTP 404 Not Found, JSON payload `success: false`, `message: "Resource or endpoint not found"`, `errors: null`.

### TC-FND-006: Global 405 Method Not Allowed Format
- **Input**: `POST /api/v1/health`.
- **Expected Result**: HTTP 405 Method Not Allowed, JSON payload `success: false`.

### TC-FND-007: Global 401 Unauthenticated Format
- **Input**: `GET /api/user` without Bearer token.
- **Expected Result**: HTTP 401 Unauthorized, JSON payload `success: false`, `message: "Unauthenticated"`.

### TC-FND-008: Global 422 Validation Error Format
- **Input**: Submit invalid request payload to an API endpoint triggering validation error.
- **Expected Result**: HTTP 422 Unprocessable Entity, `success: false`, `errors` object containing key-value field errors.

---

## 3. Configuration & Security Tests

### TC-FND-009: CORS Header Verification
- **Input**: `OPTIONS /api/v1/health` with `Origin: http://localhost:3000`.
- **Expected Result**: HTTP 200 / 204 with `Access-Control-Allow-Origin` headers.

### TC-FND-010: OpenAPI JSON Specification Server URL Verification
- **Input**: `GET /docs/api-docs.json`.
- **Expected Result**: HTTP 200 OK, valid JSON containing `openapi: 3.0.0` specification with `servers[0].url = "http://localhost:8002"`.
