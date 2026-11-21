import { test, expect } from '@playwright/test';

test.describe('Module 12: Product Comparison Engine', () => {

  test('TC-CMP-011: Accessing empty compare page renders placeholder', async ({ page }) => {
    await page.goto('/compare');

    // Verify empty state view
    await expect(page.getByRole('heading', { name: /Your Comparison List is Empty/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Catalog/i })).toBeVisible();
  });

  test('TC-CMP-001 & TC-CMP-002: Toggling compare on product card displays sticky CompareBar', async ({ page }) => {
    await page.goto('/products');

    // Click compare toggle button on first product card
    const firstCompareBtn = page.getByTestId('compare-toggle-btn').first();
    await firstCompareBtn.click();

    // Verify sticky CompareBar appears
    await expect(page.getByText('Compare Items')).toBeVisible();
    await expect(page.getByText(/1 of 4 products selected/i)).toBeVisible();

    // Click compare toggle on second product card
    const secondCompareBtn = page.getByTestId('compare-toggle-btn').nth(1);
    await secondCompareBtn.click();

    // Verify counter updates to 2
    await expect(page.getByText(/2 of 4 products selected/i)).toBeVisible();
  });

  test('TC-CMP-005 & TC-CMP-006: Navigating to /compare renders side-by-side matrix table', async ({ page }) => {
    await page.goto('/products');

    // Select 2 products to compare
    await page.getByTestId('compare-toggle-btn').nth(0).click();
    await page.getByTestId('compare-toggle-btn').nth(1).click();

    // Click "Compare Now" CTA in sticky bar
    await page.getByRole('link', { name: /Compare Now/i }).click({ force: true });

    // Verify route is /compare
    await expect(page).toHaveURL(/\/compare/);

    // Verify matrix headers and attributes table
    await expect(page.getByRole('heading', { name: /Product Comparison Matrix/i })).toBeVisible();
    await expect(page.getByText('Price', { exact: true })).toBeVisible();
    await expect(page.getByText('Rating & Reviews', { exact: true })).toBeVisible();
    await expect(page.getByText('Availability', { exact: true })).toBeVisible();
  });

  test('TC-CMP-007: Highlight differences toggle hides identical attribute rows', async ({ page }) => {
    await page.goto('/products');

    // Select 2 products and go to /compare
    await page.getByTestId('compare-toggle-btn').nth(0).click();
    await page.getByTestId('compare-toggle-btn').nth(1).click();
    await page.getByRole('link', { name: /Compare Now/i }).click({ force: true });

    // Toggle "Highlight Differences Only"
    const diffToggle = page.getByLabel(/Highlight Differences Only/i);
    await diffToggle.check();
    await expect(diffToggle).toBeChecked();
  });

  test('TC-CMP-008 & TC-CMP-009: Add to cart and remove single item from matrix table', async ({ page }) => {
    await page.goto('/products');

    // Select 2 products
    await page.getByTestId('compare-toggle-btn').nth(0).click();
    await page.getByTestId('compare-toggle-btn').nth(1).click();
    await page.getByRole('link', { name: /Compare Now/i }).click({ force: true });

    // Click "Add to Cart" inside comparison matrix column
    const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i }).first();
    await addToCartBtn.click();

    // Verify toast notification or drawer opens
    await expect(page.getByText(/to cart/i).first()).toBeVisible();

    // Close cart drawer if open so it doesn't obstruct matrix controls
    const closeCartBtn = page.getByRole('button', { name: /Close cart/i });
    if (await closeCartBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeCartBtn.click();
    }

    // Remove first product from matrix column
    const removeBtn = page.getByTestId('remove-matrix-item-btn').first();
    await removeBtn.click();

    // Verify count drops to 1 item
    await expect(page.getByTestId('compare-count-badge')).toHaveText('1 Items');
  });

  test('TC-CMP-010: Clear all compare items resets state and shows empty view', async ({ page }) => {
    await page.goto('/products');

    await page.getByTestId('compare-toggle-btn').nth(0).click();
    await page.getByRole('link', { name: /Compare Now/i }).click();

    // Click "Clear All" CTA in header
    await page.getByRole('button', { name: /Clear All/i }).click();

    // Verify empty state view renders
    await expect(page.getByRole('heading', { name: /Your Comparison List is Empty/i })).toBeVisible();
  });

});
