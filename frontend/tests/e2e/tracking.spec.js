import { test, expect } from '@playwright/test';

test.describe('Module 11: Public Order Tracking & Information Pages', () => {

  test('TC-TRK-001: Tracking form blank submission validation', async ({ page }) => {
    await page.goto('/track-order');

    // Click track button without filling tracking input
    const submitBtn = page.getByRole('button', { name: /Track Order/i });
    await submitBtn.click();

    // Verify validation message
    await expect(page.getByText('Please enter a tracking number or order number.')).toBeVisible();
  });

  test('TC-TRK-002 & TC-TRK-003: Valid tracking lookup renders shipment details & timeline', async ({ page }) => {
    await page.goto('/track-order');

    // Fill valid tracking number
    const trackingInput = page.locator('#tracking-number-input');
    await trackingInput.fill('TRK-9823471029');

    // Submit form
    await page.getByRole('button', { name: /Track Order/i }).click();

    // Verify shipment summary details
    await expect(page.getByText('TRK-9823471029')).toBeVisible();
    await expect(page.getByText('In Transit').first()).toBeVisible();
    await expect(page.getByText('FedEx Express')).toBeVisible();

    // Verify 5-step visual timeline steps
    await expect(page.getByText('Shipment Progress')).toBeVisible();
    await expect(page.getByText('Order Placed', { exact: true })).toBeVisible();
    await expect(page.getByText('Processed & Packed', { exact: true })).toBeVisible();
    await expect(page.getByText('Shipped', { exact: true })).toBeVisible();
    await expect(page.getByText('Out for Delivery', { exact: true })).toBeVisible();
    await expect(page.getByText('Delivered', { exact: true })).toBeVisible();
  });

  test('TC-TRK-004: Activity checkpoints & items list render accurately', async ({ page }) => {
    await page.goto('/track-order?tracking_number=TRK-9823471029');

    // Verify activity history table
    await expect(page.getByText('Tracking History & Checkpoints')).toBeVisible();
    await expect(page.getByText('Regional Sorting Hub - Boise, ID')).toBeVisible();
    await expect(page.getByText('Package arrived at regional sorting facility.')).toBeVisible();

    // Verify items list
    await expect(page.getByText('Items in This Package')).toBeVisible();
    await expect(page.getByText('Italian Leather Bifold Wallet')).toBeVisible();
  });

  test('TC-TRK-005: Invalid tracking number displays error alert', async ({ page }) => {
    await page.goto('/track-order');

    const trackingInput = page.locator('#tracking-number-input');
    await trackingInput.fill('TRK-0000000');
    await page.getByRole('button', { name: /Track Order/i }).click();

    // Verify 404 error alert
    await expect(page.getByText('Shipment Not Found')).toBeVisible();
    await expect(page.getByText(/No shipment found matching tracking number/i)).toBeVisible();
  });

  test('TC-TRK-006: Direct URL query lookup executes tracking on load', async ({ page }) => {
    // Navigate directly with tracking_number URL parameter
    await page.goto('/track-order?tracking_number=TRK-DELIVERED-100');

    // Verify automatically fetched delivered status
    await expect(page.getByText('TRK-DELIVERED-100')).toBeVisible();
    await expect(page.getByText('Delivered').first()).toBeVisible();
    await expect(page.getByText('DHL Express')).toBeVisible();
  });

  test('TC-TRK-007: About Us page renders mission, metrics, and values', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /Redefining Modern Luxury Commerce/i })).toBeVisible();
    await expect(page.getByText('150K+')).toBeVisible();
    await expect(page.getByText('Happy Customers')).toBeVisible();
    await expect(page.getByText('Uncompromised Quality')).toBeVisible();
    await expect(page.getByText('Ethical Sourcing')).toBeVisible();
  });

  test('TC-TRK-008 & TC-TRK-009: Contact Us form submission & FAQ accordion toggle', async ({ page }) => {
    await page.goto('/contact');

    // Verify contact header and info cards
    await expect(page.getByRole('heading', { name: /Contact Customer Care/i })).toBeVisible();
    await expect(page.locator('main').getByText('support@luxora.com')).toBeVisible();

    // Fill contact form
    await page.locator('#contact-name').fill('Alex Johnson');
    await page.locator('#contact-email').fill('alex@example.com');
    await page.locator('#contact-message').fill('I need assistance with modifying my shipping address for my order.');

    await page.getByRole('button', { name: /Submit Inquiry/i }).click();

    // Verify submission success message
    await expect(page.getByText('Message Received')).toBeVisible();

    // Test FAQ accordion toggle
    const faqBtn = page.getByRole('button', { name: /What are your standard delivery timeframes\?/i });
    await faqBtn.click();
    await expect(page.getByText('Standard domestic delivery takes 3–5 business days.')).toBeVisible();
  });

  test('TC-TRK-010: Shipping Policy page renders delivery rules', async ({ page }) => {
    await page.goto('/shipping-policy');

    await expect(page.getByRole('heading', { name: /Shipping & Delivery Policy/i })).toBeVisible();
    await expect(page.getByText('Order Processing Time')).toBeVisible();
    await expect(page.getByText('Standard Domestic Shipping')).toBeVisible();
  });

  test('TC-TRK-011: Terms and Privacy pages render legal content', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: /Terms of Service/i })).toBeVisible();

    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: /Privacy Policy/i })).toBeVisible();
  });

});
