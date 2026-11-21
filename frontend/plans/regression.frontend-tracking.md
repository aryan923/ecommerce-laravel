# Regression Test Matrix: Frontend Public Order Tracking & Information Pages

**Module Name:** Frontend Public Order Tracking & Information Pages  
**Module ID:** 11 (Frontend)  
**Regression File:** `frontend/plans/regression.frontend-tracking.md`  

---

## 1. Public Order Tracking & Informational Pages Guardrails

To prevent regressions across guest tracking, API data binding, contact submissions, and static informational routing:
1. **Public Accessibility**: `/track-order`, `/about`, `/contact`, `/shipping-policy`, `/terms`, and `/privacy` MUST be publicly accessible without requiring customer authentication or CSRF blocks.
2. **URL Parameter Deep Linking**: Navigating to `/track-order?tracking_number=...` MUST automatically execute the tracking lookup on initial render.
3. **Timeline Step Continuity**: Shipment tracking status steps (`placed` -> `processed` -> `shipped` -> `out_for_delivery` -> `delivered`) MUST preserve logical order and accurately compute completed versus pending status states.
4. **Form Input Sanitization & Validation**: Contact form and tracking lookup inputs MUST sanitize user strings and enforce valid email/phone formats prior to API submission.
5. **SEO & Accessibility Compliance**: All informational pages MUST output unique `<title>` and `<meta name="description">` tags and pass basic WCAG contrast and screen reader accessibility checks.

---

## 2. Regression Checklist

- [ ] `npx playwright test frontend/tests/e2e/tracking.spec.js` passes 100% with zero failures.
- [ ] Submitting a tracking number on `/track-order` renders the 5-step visual shipment timeline cleanly.
- [ ] Direct navigation to `/track-order?tracking_number=TRK-9823471029` triggers lookup and displays summary card immediately.
- [ ] Entering an invalid tracking code displays user-friendly 404 error alert without application crash.
- [ ] Submitting the contact form on `/contact` validates required fields and renders success confirmation.
- [ ] Clicking FAQ questions on `/contact` toggles accordion expansion smoothy.
- [ ] Accessing `/about`, `/shipping-policy`, `/terms`, and `/privacy` renders all text content, tables, and section headings with zero layout overflow or broken links.
