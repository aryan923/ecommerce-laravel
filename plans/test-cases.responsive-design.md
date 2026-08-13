# Test Cases: Full-Device Responsive Layout Engine

**Module Name:** Full-Device Responsive Layout Engine  
**Module ID:** 26  
**Test File:** `plans/test-cases.responsive-design.md`  
**Specification:** `specifications/feature.responsive-design.spec.md`  
**Plan:** `plans/plan.responsive-design.md`  
**Version:** 1.0  
**Target Stack:** React 18 / CSS Media Queries / Vite  

---

## 1. Happy Path Scenarios

### TC-RESP-001: Mobile Hamburger Drawer Navigation
- **Preconditions**: User is on a mobile device or viewport width set to 375px (iPhone).
- **Input**: Click the hamburger icon (`Menu`) in the top header.
- **Expected Result**: Mobile drawer sidebar slides out smoothly with backdrop overlay. Navigating to a page closes the drawer automatically.

### TC-RESP-002: ProductFormModal Mobile Responsiveness
- **Preconditions**: User opens `ProductFormModal` on a 768px tablet or 375px mobile screen.
- **Input**: Scroll through General, Variants, and Shipping tabs.
- **Expected Result**: Modal card fills 95-100% viewport width with padding. 2-column input fields stack into a clean 1-column layout. Tab bar scrolls horizontally.
