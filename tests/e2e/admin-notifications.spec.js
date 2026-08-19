import { test, expect } from '@playwright/test';

test.describe('Admin Notification Templates & Delivery Audit Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');

        await page.locator('input[type="email"]').fill('admin@example.com');
        await page.locator('input[type="password"]').fill('SecretAdmin123!');

        await Promise.all([
            page.locator('button[type="submit"]').click(),
            page.waitForURL((url) => url.pathname === '/admin' || url.pathname === '/admin/', { timeout: 10000 })
        ]);
    });

    test('should navigate to Notification Center and render page title, KPI cards, tabs, and tables', async ({ page }) => {
        await page.goto('/admin/notifications');

        // Header Title
        await expect(page.locator('h2.page-header-title')).toHaveText('Notification Templates & Delivery Audit');

        // Metric KPI Cards
        await expect(page.getByText('Total Templates', { exact: true })).toBeVisible();
        await expect(page.getByText('Active Templates', { exact: true })).toBeVisible();
        await expect(page.getByText('Delivered Notifications', { exact: true })).toBeVisible();
        await expect(page.getByText('Failed Dispatches', { exact: true })).toBeVisible();

        // Single-Line Navigation Tabs
        await expect(page.getByText('All Templates', { exact: true })).toBeVisible();
        await expect(page.getByText('Email Templates', { exact: true })).toBeVisible();
        await expect(page.getByText('SMS Templates', { exact: true })).toBeVisible();
        await expect(page.getByText('Broadcast Campaigns', { exact: true })).toBeVisible();
        await expect(page.getByText('Delivery Audit Logs', { exact: true })).toBeVisible();

        // Click Delivery Audit Logs Tab
        await page.getByText('Delivery Audit Logs', { exact: true }).click();
        await expect(page.getByText('Recipient', { exact: true })).toBeVisible();

        // Switch back to Email Templates Tab
        await page.getByText('Email Templates', { exact: true }).click();
        await expect(page.getByText('Event Trigger', { exact: true })).toBeVisible();
    });
});
