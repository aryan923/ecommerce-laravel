import { test, expect } from '@playwright/test';

test.describe('Admin Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');
    });

    test('should render the login page form elements correctly', async ({ page }) => {
        await expect(page.locator('h2')).toHaveText('Admin Portal');
        await expect(page.getByText('Sign in to access your e-commerce dashboard')).toBeVisible();

        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toContainText('Sign In to Panel');
    });

    test('should show error message for invalid credentials', async ({ page }) => {
        await page.locator('input[type="email"]').fill('invalid@example.com');
        await page.locator('input[type="password"]').fill('WrongPassword123');
        await page.locator('button[type="submit"]').click();

        await expect(page.getByText(/invalid/i)).toBeVisible();
        expect(page.url()).toContain('/admin/login');
    });

    test('should successfully login as admin with valid credentials', async ({ page }) => {
        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('SecretAdmin123!');

        await Promise.all([
            page.locator('button[type="submit"]').click(),
            page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 })
        ]);

        await expect(page.locator('.user-menu-trigger-btn')).toBeVisible();
    });

    test('should successfully logout when clicking Logout button', async ({ page }) => {
        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('SecretAdmin123!');

        await Promise.all([
            page.locator('button[type="submit"]').click(),
            page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 })
        ]);

        await expect(page.locator('.user-menu-trigger-btn')).toBeVisible();

        await page.locator('.user-menu-trigger-btn').click();
        await page.locator('button.user-menu-item.danger').click();

        await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 10000 });
        await expect(page.locator('h2')).toHaveText('Admin Portal');
    });
});
