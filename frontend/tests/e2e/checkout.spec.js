import { test, expect } from '@playwright/test';

test.describe('Module 08: Checkout & Order Processing', () => {
  test.setTimeout(60000);

  test('should render /checkout route with core components', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="checkout-page"]', { timeout: 30000 });

    const checkoutPage = page.locator('[data-testid="checkout-page"]');
    await expect(checkoutPage).toBeVisible();

    const stepper = page.locator('[data-testid="checkout-steps"]');
    await expect(stepper).toBeVisible();

    const addressSelector = page.locator('[data-testid="saved-address-selector"]');
    await expect(addressSelector).toBeVisible();

    const shippingSection = page.locator('[data-testid="shipping-method-section"]');
    await expect(shippingSection).toBeVisible();

    const paymentSection = page.locator('[data-testid="payment-gateway-section"]');
    await expect(paymentSection).toBeVisible();

    const summarySidebar = page.locator('[data-testid="checkout-summary-sidebar"]');
    await expect(summarySidebar).toBeVisible();
  });

  test('should fill contact info and address inputs', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="contact-email-input"]', { timeout: 30000 });

    const emailInput = page.locator('[data-testid="contact-email-input"]');
    await emailInput.fill('customer@example.com');
    await expect(emailInput).toHaveValue('customer@example.com');

    const addressLine1 = page.locator('[data-testid="address-line1-input"]');
    await addressLine1.fill('123 Marine Drive');
    await expect(addressLine1).toHaveValue('123 Marine Drive');

    const cityInput = page.locator('[data-testid="city-input"]');
    await cityInput.fill('Mumbai');
    await expect(cityInput).toHaveValue('Mumbai');
  });

  test('should allow selecting shipping method options', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="shipping-method-option"]', { timeout: 30000 });

    const shippingOptions = page.locator('[data-testid="shipping-method-option"]');
    const count = await shippingOptions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should allow selecting payment gateway options', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="payment-method-option"]', { timeout: 30000 });

    const paymentOptions = page.locator('[data-testid="payment-method-option"]');
    const count = await paymentOptions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should place order and navigate to order success receipt page', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="place-order-btn"]', { timeout: 30000 });

    const emailInput = page.locator('[data-testid="contact-email-input"]');
    await emailInput.fill('customer@example.com');
    await expect(emailInput).toHaveValue('customer@example.com');

    const addressInput = page.locator('[data-testid="address-line1-input"]');
    await addressInput.fill('123 Marine Drive');
    await expect(addressInput).toHaveValue('123 Marine Drive');

    const cityInput = page.locator('[data-testid="city-input"]');
    await cityInput.fill('Mumbai');
    await expect(cityInput).toHaveValue('Mumbai');

    const stateInput = page.locator('[data-testid="state-input"]');
    await stateInput.fill('Maharashtra');
    await expect(stateInput).toHaveValue('Maharashtra');

    const postalInput = page.locator('[data-testid="postal-code-input"]');
    await postalInput.fill('400001');
    await expect(postalInput).toHaveValue('400001');

    const placeOrderBtn = page.locator('[data-testid="place-order-btn"]');
    await expect(placeOrderBtn).toBeVisible();
    await placeOrderBtn.click();

    await page.waitForURL('**/checkout/success/**', { timeout: 60000 });
    await page.waitForSelector('[data-testid="order-receipt-card"]', { timeout: 60000 });
    const receiptCard = page.locator('[data-testid="order-receipt-card"]');
    await expect(receiptCard).toBeVisible();
  });

  test('should render /checkout/success/[order_number] order confirmation receipt', async ({ page }) => {
    await page.goto('/checkout/success/ORD-2026-88492', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="order-receipt-card"]', { timeout: 30000 });

    const orderBadge = page.locator('[data-testid="order-number-badge"]');
    await expect(orderBadge).toHaveText('ORD-2026-88492');
  });
});
