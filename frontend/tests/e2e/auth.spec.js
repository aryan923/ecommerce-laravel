import { test, expect } from '@playwright/test';

test.describe('Module 07: Customer Authentication & Session Merge', () => {
  test.setTimeout(60000);

  test('should render /auth/login route with core elements', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="auth-layout"]', { timeout: 30000 });

    const layout = page.locator('[data-testid="auth-layout"]');
    await expect(layout).toBeVisible();

    const title = page.locator('[data-testid="auth-title"]');
    await expect(title).toHaveText('Welcome Back');

    const emailInput = page.locator('[data-testid="login-email-input"]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('[data-testid="login-password-input"]');
    await expect(passwordInput).toBeVisible();

    const submitBtn = page.locator('[data-testid="login-submit-btn"]');
    await expect(submitBtn).toBeVisible();
  });

  test('should trigger validation error on empty login submit', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 30000 });

    const submitBtn = page.locator('[data-testid="login-submit-btn"]');
    await submitBtn.click();

    // Check for inline email validation error
    const emailError = page.locator('text=Email address is required');
    await expect(emailError).toBeVisible();
  });

  test('should toggle password visibility in login form', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="login-password-input"]', { timeout: 30000 });

    const passwordInput = page.locator('[data-testid="login-password-input"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.click('[data-testid="toggle-password-btn"]', { force: true });

    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should render /auth/register route with core elements', async ({ page }) => {
    await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="register-form"]', { timeout: 30000 });

    const nameInput = page.locator('[data-testid="register-name-input"]');
    await expect(nameInput).toBeVisible();

    const emailInput = page.locator('[data-testid="register-email-input"]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('[data-testid="register-password-input"]');
    await expect(passwordInput).toBeVisible();

    const confirmInput = page.locator('[data-testid="register-confirm-password-input"]');
    await expect(confirmInput).toBeVisible();
  });

  test('should render /auth/forgot-password route and submit email', async ({ page }) => {
    await page.goto('/auth/forgot-password', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="forgot-password-form"]', { timeout: 30000 });

    const emailInput = page.locator('[data-testid="forgot-email-input"]');
    await expect(emailInput).toBeVisible();

    await emailInput.fill('customer@example.com');
    const submitBtn = page.locator('[data-testid="forgot-password-submit-btn"]');
    await submitBtn.click();
  });

  test('should render /auth/reset-password route with query token', async ({ page }) => {
    await page.goto('/auth/reset-password?token=sample-token&email=customer@example.com', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="reset-password-form"]', { timeout: 30000 });

    const tokenInput = page.locator('[data-testid="reset-token-input"]');
    await expect(tokenInput).toHaveValue('sample-token');

    const emailInput = page.locator('[data-testid="reset-email-input"]');
    await expect(emailInput).toHaveValue('customer@example.com');
  });

  test('should navigate between auth pages via links', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="register-page-link"]', { timeout: 30000 });

    const registerLink = page.locator('[data-testid="register-page-link"]');
    await registerLink.click();

    await page.waitForURL('**/auth/register');
    const registerForm = page.locator('[data-testid="register-form"]');
    await expect(registerForm).toBeVisible();
  });
});
