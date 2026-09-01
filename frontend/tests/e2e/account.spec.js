const { test, expect } = require('@playwright/test');

test.describe('Module 09: Customer Account Portal', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Intercept backend API requests from localhost:8002
    await page.route('**/api/v1/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            phone: '+91 9876543210',
          },
        }),
      });
    });

    await page.route('**/api/v1/customer/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.addInitScript(() => {
      document.cookie = 'auth_token=mock_token_123456; path=/;';
      localStorage.setItem('auth_token', 'mock_token_123456');
    });
  });

  test('should render /account dashboard overview with sidebar navigation', async ({ page }) => {
    await page.goto('/account', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="account-portal-layout"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="account-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-overview"]')).toBeVisible();
    await expect(page.getByText('Welcome back, Sarah Connor!')).toBeVisible();
  });

  test('should render profile settings view (/account/profile)', async ({ page }) => {
    await page.goto('/account/profile', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="profile-settings"]')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Personal Details')).toBeVisible();
    await expect(page.getByText('Security & Change Password')).toBeVisible();
  });

  test('should render saved address book management (/account/addresses)', async ({ page }) => {
    await page.goto('/account/addresses', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="addresses-management"]')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Saved Addresses', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add New Address' })).toBeVisible();
  });

  test('should render order history list (/account/orders)', async ({ page }) => {
    await page.goto('/account/orders', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="order-history-list"]')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Order History', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Search by order #...')).toBeVisible();
  });

  test('should render return requests management (/account/returns)', async ({ page }) => {
    await page.goto('/account/returns', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="returns-management"]')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Returns & Exchanges', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Request New Return' })).toBeVisible();
  });

  test('should render refund bank accounts (/account/bank-accounts)', async ({ page }) => {
    await page.goto('/account/bank-accounts', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="bank-accounts-management"]')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'Refund Bank Accounts', exact: true })).toBeVisible();
  });

  test('should render customer notifications (/account/notifications)', async ({ page }) => {
    await page.goto('/account/notifications', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="customer-notifications"]')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('heading', { name: 'In-App Notifications', exact: true })).toBeVisible();
  });
});
