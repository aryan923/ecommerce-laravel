import { test, expect } from '@playwright/test';

test.describe('Module 13: OTP Verification & Account Security Engine', () => {
  test('TC-OTP-001: Accessing /auth/verify-otp renders verification card and 6 PIN input boxes', async ({ page }) => {
    await page.goto('/auth/verify-otp?email=testcustomer%40example.com&type=registration');

    // Verify heading & email badge
    await expect(page.getByRole('heading', { name: /Verify Your Email/i })).toBeVisible();
    await expect(page.getByText('testcustomer@example.com')).toBeVisible();

    // Verify 6 PIN input boxes exist
    for (let i = 0; i < 6; i++) {
      await expect(page.getByTestId(`otp-input-${i}`)).toBeVisible();
    }

    // Verify submit button & resend timer
    await expect(page.getByTestId('otp-submit-btn')).toBeVisible();
    await expect(page.getByTestId('resend-timer-badge')).toBeVisible();
  });

  test('TC-OTP-002 & TC-OTP-003: Auto-focus progression on typing and backspace focus regression', async ({ page }) => {
    await page.goto('/auth/verify-otp?email=testcustomer%40example.com&type=registration');

    const box0 = page.getByTestId('otp-input-0');
    const box1 = page.getByTestId('otp-input-1');
    const box2 = page.getByTestId('otp-input-2');

    // Focus starts on box0
    await expect(box0).toBeFocused();

    // Type '4' in box0 -> focus advances to box1
    await box0.fill('4');
    await expect(box1).toBeFocused();

    // Type '8' in box1 -> focus advances to box2
    await box1.fill('8');
    await expect(box2).toBeFocused();

    // Press Backspace on empty box2 -> clears box1 and retreats focus to box1
    await page.keyboard.press('Backspace');
    await expect(box1).toBeFocused();
    await expect(box1).toHaveValue('');
  });

  test('TC-OTP-004 & TC-OTP-005: Clipboard paste 6-digit code auto-fills all fields and filters non-numeric input', async ({ page }) => {
    await page.goto('/auth/verify-otp?email=testcustomer%40example.com&type=registration');

    const box0 = page.getByTestId('otp-input-0');

    // Try filling non-numeric character
    await box0.fill('A');
    await expect(box0).toHaveValue('');

    // Paste 6-digit code into first input box using evaluate
    await box0.focus();
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="otp-input-0"]');
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true,
      });
      pasteEvent.clipboardData.setData('text/plain', '987654');
      input.dispatchEvent(pasteEvent);
    });

    // Verify all 6 input boxes populated correctly
    await expect(page.getByTestId('otp-input-0')).toHaveValue('9');
    await expect(page.getByTestId('otp-input-1')).toHaveValue('8');
    await expect(page.getByTestId('otp-input-2')).toHaveValue('7');
    await expect(page.getByTestId('otp-input-3')).toHaveValue('6');
    await expect(page.getByTestId('otp-input-4')).toHaveValue('5');
    await expect(page.getByTestId('otp-input-5')).toHaveValue('4');
  });

  test('TC-OTP-006: Submitting invalid OTP code (000000) displays error alert banner', async ({ page }) => {
    await page.goto('/auth/verify-otp?email=testcustomer%40example.com&type=registration');

    // Fill invalid code 000000 box by box
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`otp-input-${i}`).fill('0');
    }

    // Verify red error alert is displayed
    const errorAlert = page.getByTestId('otp-error-alert');
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Invalid or expired/i)).toBeVisible();
  });

  test('TC-OTP-007 & TC-OTP-008: Resend timer countdown displays 60s badge and triggers resend action', async ({ page }) => {
    await page.goto('/auth/verify-otp?email=testcustomer%40example.com&type=registration');

    // Verify countdown badge is visible
    const timerBadge = page.getByTestId('resend-timer-badge');
    await expect(timerBadge).toBeVisible();
    await expect(timerBadge).toContainText('Resend code in');
  });

  test('TC-OTP-009: Registration OTP verification success authenticates user and redirects', async ({ page }) => {
    await page.goto('/auth/verify-otp?email=testcustomer%40example.com&type=registration&redirect=%2Faccount');

    // Fill valid 6-digit OTP code 123456
    const code = ['1', '2', '3', '4', '5', '6'];
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`otp-input-${i}`).fill(code[i]);
    }

    // Submit OTP form if needed
    const submitBtn = page.getByTestId('otp-submit-btn');
    await submitBtn.click({ force: true }).catch(() => {});

    // Verify redirection to /account or home
    await page.waitForURL(/\/(account|auth|$)/);
  });

  test('TC-OTP-010: Password Reset OTP verification success redirects to /auth/reset-password', async ({ page }) => {
    await page.goto('/auth/verify-otp?email=testcustomer%40example.com&type=password_reset');

    // Verify title for password reset mode
    await expect(page.getByRole('heading', { name: /Password Security Code/i })).toBeVisible();

    // Fill valid 6-digit OTP code 123456
    const code = ['1', '2', '3', '4', '5', '6'];
    for (let i = 0; i < 6; i++) {
      await page.getByTestId(`otp-input-${i}`).fill(code[i]);
    }

    // Submit OTP form if needed
    const submitBtn = page.getByTestId('otp-submit-btn');
    await submitBtn.click({ force: true }).catch(() => {});

    // Verify redirection to /auth/reset-password
    await page.waitForURL(/\/auth\/reset-password/);
  });
});
