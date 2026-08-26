import { test, expect } from '@playwright/test';

test.describe('Module 02: Global Navigation & Layout', () => {
  test('should render Header with logo, search, and navigation links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const logo = page.locator('header').getByText('LUXORA');
    await expect(logo).toBeVisible();

    const searchBtn = page.locator('header').getByTitle('Search Products');
    await expect(searchBtn).toBeVisible();
  });

  test('should toggle category dropdown menu', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const categoryBtn = page.getByRole('button', { name: 'Categories' });
    await expect(categoryBtn).toBeVisible();
    await categoryBtn.click({ force: true });

    const categoryDropdown = page.locator('[data-testid="category-menu-dropdown"]');
    await expect(categoryDropdown).toBeVisible();
  });

  test('should toggle account dropdown menu', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const accountBtn = page.locator('[data-testid="account-dropdown-trigger"]');
    await expect(accountBtn).toBeVisible();
    await accountBtn.click({ force: true });

    const accountDropdown = page.locator('[data-testid="account-dropdown-menu"]');
    await expect(accountDropdown).toBeVisible();
  });

  test('should open slide-over CartDrawer when clicking cart trigger button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const cartTrigger = page.locator('[data-testid="cart-drawer-trigger"]');
    await expect(cartTrigger).toBeVisible();
    await cartTrigger.click({ force: true });

    const cartPanel = page.locator('[data-testid="cart-drawer-panel"]');
    await expect(cartPanel).toBeVisible({ timeout: 10000 });
  });

  test('should render footer sections and copyright bar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('LUXORA');
    await expect(footer).toContainText('Customer Care');
  });

  test('should render mobile navigation bar on small viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const mobileNav = page.locator('[data-testid="mobile-navigation-bar"]');
    await expect(mobileNav).toBeVisible();
  });
});
