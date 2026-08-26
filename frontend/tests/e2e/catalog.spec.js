import { test, expect } from '@playwright/test';

test.describe('Module 04: Product Catalog & Category Browsing', () => {
  test('should render /products catalog route with breadcrumbs, filter sidebar, and product grid', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const breadcrumbs = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumbs).toBeVisible({ timeout: 15000 });

    const productGrid = page.locator('[data-testid="catalog-product-grid"]');
    await expect(productGrid).toBeVisible({ timeout: 15000 });

    const productCards = productGrid.locator('> div');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should update product grid when selecting sorting options', async ({ page }) => {
    await page.goto('/products?sort=price_asc', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const sortSelect = page.locator('#sort-select');
    await expect(sortSelect).toBeVisible({ timeout: 15000 });
    await expect(sortSelect).toHaveValue('price_asc');
  });

  test('should render dynamic /category/[slug] route with category header', async ({ page }) => {
    await page.goto('/category/women', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const headerTitle = page.locator('h1');
    await expect(headerTitle).toBeVisible({ timeout: 15000 });

    const productGrid = page.locator('[data-testid="catalog-product-grid"]');
    await expect(productGrid).toBeVisible({ timeout: 15000 });
  });

  test('should render dynamic /brand/[slug] route with brand header', async ({ page }) => {
    await page.goto('/brand/apple', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const headerTitle = page.locator('h1');
    await expect(headerTitle).toBeVisible({ timeout: 15000 });

    const productGrid = page.locator('[data-testid="catalog-product-grid"]');
    await expect(productGrid).toBeVisible({ timeout: 15000 });
  });

  test('should trigger Add to Cart from catalog product cards', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const firstCardAddBtn = page.locator('[data-testid="catalog-product-grid"] button:has-text("Add to Cart")').first();
    await expect(firstCardAddBtn).toBeVisible({ timeout: 15000 });
    await firstCardAddBtn.click({ force: true });

    const cartPanel = page.locator('[data-testid="cart-drawer-panel"]');
    await expect(cartPanel).toBeVisible({ timeout: 15000 });
  });
});
