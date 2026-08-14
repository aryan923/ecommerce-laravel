<?php

use App\Http\Controllers\Api\V1\Admin\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AttributeController;
use App\Http\Controllers\Api\V1\Admin\AttributeValueController;
use App\Http\Controllers\Api\V1\Admin\BrandController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Admin\CustomerController;
use App\Http\Controllers\Api\V1\Admin\InventoryController;
use App\Http\Controllers\Api\V1\Admin\WarehouseController;
use App\Http\Controllers\Api\V1\Admin\PermissionController;
use App\Http\Controllers\Api\V1\Admin\ProductController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\VariantController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\PublicAttributeController;
use App\Http\Controllers\Api\V1\PublicBrandController;
use App\Http\Controllers\Api\V1\PublicCategoryController;
use App\Http\Controllers\Api\V1\PublicProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // System Health Check Endpoint
    Route::get('/health', [HealthController::class, 'check']);

    // Public Storefront Catalog Endpoints
    Route::get('/categories', [PublicCategoryController::class, 'index']);
    Route::get('/categories/{slug}', [PublicCategoryController::class, 'show']);
    Route::get('/brands', [PublicBrandController::class, 'index']);
    Route::get('/brands/{slug}', [PublicBrandController::class, 'show']);
    Route::get('/attributes', [PublicAttributeController::class, 'index']);
    Route::get('/currencies', [\App\Http\Controllers\Api\V1\CurrencyController::class, 'index']);

    Route::get('/products', [PublicProductController::class, 'index']);
    Route::get('/products/{slug}', [PublicProductController::class, 'show']);
    Route::get('/products/{product_id}/reviews', [\App\Http\Controllers\Api\V1\PublicProductReviewController::class, 'index']);

    // Customer Authentication Endpoints
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        // Protected Customer Routes
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Admin Panel Endpoints
    Route::prefix('admin')->group(function () {
        // Admin Authentication
        Route::prefix('auth')->group(function () {
            Route::post('/login', [AdminAuthController::class, 'login']);

            Route::middleware('auth:sanctum')->group(function () {
                Route::get('/me', [AdminAuthController::class, 'me']);
                Route::post('/logout', [AdminAuthController::class, 'logout']);
            });
        });

        // Protected Admin Management APIs
        Route::middleware('auth:sanctum')->group(function () {
            // Staff User Management
            Route::get('/users', [AdminUserController::class, 'index'])->middleware('permission:staff.view');
            Route::post('/users', [AdminUserController::class, 'store'])->middleware('permission:staff.create');
            Route::get('/users/{user}', [AdminUserController::class, 'show'])->middleware('permission:staff.view');
            Route::put('/users/{user}', [AdminUserController::class, 'update'])->middleware('permission:staff.update');
            Route::patch('/users/{user}/status', [AdminUserController::class, 'toggleStatus'])->middleware('permission:staff.update');
            Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->middleware('permission:staff.delete');

            // Admin Customer Management
            Route::get('/customers/stats', [CustomerController::class, 'stats'])->middleware('permission:customers.view');
            Route::get('/customers', [CustomerController::class, 'index'])->middleware('permission:customers.view');
            Route::get('/customers/{id}', [CustomerController::class, 'show'])->middleware('permission:customers.view');
            Route::get('/customers/{id}/orders', [CustomerController::class, 'orders'])->middleware('permission:customers.view');
            Route::get('/customers/{id}/addresses', [CustomerController::class, 'addresses'])->middleware('permission:customers.view');
            Route::get('/customers/{id}/reviews', [CustomerController::class, 'reviews'])->middleware('permission:customers.view');
            Route::get('/customers/{id}/returns', [CustomerController::class, 'returns'])->middleware('permission:customers.view');
            Route::get('/customers/{id}/refunds', [CustomerController::class, 'refunds'])->middleware('permission:customers.view');
            Route::patch('/customers/{id}/status', [CustomerController::class, 'updateStatus'])->middleware('permission:customers.update');
            Route::patch('/customers/{id}/notes', [CustomerController::class, 'updateNotes'])->middleware('permission:customers.update');

            // Role Management
            Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:roles.view');
            Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:roles.create');
            Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('permission:roles.view');
            Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:roles.update');
            Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');

            // Permissions List
            Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:roles.view');

            // Category Management
            Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:categories.view');
            Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:categories.create');
            Route::post('/categories/reorder', [CategoryController::class, 'reorder'])->middleware('permission:categories.update');
            Route::get('/categories/{category}', [CategoryController::class, 'show'])->middleware('permission:categories.view');
            Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('permission:categories.update');
            Route::patch('/categories/{category}/status', [CategoryController::class, 'toggleStatus'])->middleware('permission:categories.update');
            Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:categories.delete');

            // Brand Management
            Route::get('/brands', [BrandController::class, 'index'])->middleware('permission:brands.view');
            Route::post('/brands', [BrandController::class, 'store'])->middleware('permission:brands.create');
            Route::get('/brands/{brand}', [BrandController::class, 'show'])->middleware('permission:brands.view');
            Route::put('/brands/{brand}', [BrandController::class, 'update'])->middleware('permission:brands.update');
            Route::patch('/brands/{brand}/status', [BrandController::class, 'toggleStatus'])->middleware('permission:brands.update');
            Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->middleware('permission:brands.delete');

            // Attribute & Attribute Value Management
            Route::get('/attributes', [AttributeController::class, 'index'])->middleware('permission:attributes.view');
            Route::post('/attributes', [AttributeController::class, 'store'])->middleware('permission:attributes.create');
            Route::get('/attributes/{attribute}', [AttributeController::class, 'show'])->middleware('permission:attributes.view');
            Route::put('/attributes/{attribute}', [AttributeController::class, 'update'])->middleware('permission:attributes.update');
            Route::patch('/attributes/{attribute}/status', [AttributeController::class, 'toggleStatus'])->middleware('permission:attributes.update');
            Route::delete('/attributes/{attribute}', [AttributeController::class, 'destroy'])->middleware('permission:attributes.delete');

            Route::get('/attributes/{attribute}/values', [AttributeValueController::class, 'index'])->middleware('permission:attributes.view');
            Route::post('/attributes/{attribute}/values', [AttributeValueController::class, 'store'])->middleware('permission:attributes.create');
            Route::put('/attribute-values/{value}', [AttributeValueController::class, 'update'])->middleware('permission:attributes.update');
            Route::delete('/attribute-values/{value}', [AttributeValueController::class, 'destroy'])->middleware('permission:attributes.delete');

            // Product Management
            Route::get('/products', [ProductController::class, 'index'])->middleware('permission:products.view');
            Route::post('/products', [ProductController::class, 'store'])->middleware('permission:products.create');
            Route::post('/products/bulk', [ProductController::class, 'bulk'])->middleware('permission:products.update');
            Route::post('/products/import', [ProductController::class, 'import'])->middleware('permission:products.create');
            Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('permission:products.view');
            Route::put('/products/{product}', [ProductController::class, 'update'])->middleware('permission:products.update');
            Route::patch('/products/{product}/status', [ProductController::class, 'toggleStatus'])->middleware('permission:products.update');
            Route::post('/products/{product}/duplicate', [ProductController::class, 'duplicate'])->middleware('permission:products.create');
            Route::delete('/products/{product}', [ProductController::class, 'destroy'])->middleware('permission:products.delete');

            // Product Variant Management
            Route::get('/products/{product}/variants', [VariantController::class, 'index'])->middleware('permission:products.view');
            Route::post('/products/{product}/variants/generate', [VariantController::class, 'generate'])->middleware('permission:products.create');
            Route::post('/products/{product}/variants', [VariantController::class, 'store'])->middleware('permission:products.create');
            Route::put('/variants/{variant}', [VariantController::class, 'update'])->middleware('permission:products.update');
            Route::patch('/variants/{variant}/status', [VariantController::class, 'toggleStatus'])->middleware('permission:products.update');
            Route::delete('/variants/{variant}', [VariantController::class, 'destroy'])->middleware('permission:products.delete');

            // Inventory & Warehouse Management
            Route::get('/warehouses', [WarehouseController::class, 'index'])->middleware('permission:inventory.view');
            Route::post('/warehouses', [WarehouseController::class, 'store'])->middleware('permission:inventory.update');
            Route::get('/warehouses/{id}', [WarehouseController::class, 'show'])->middleware('permission:inventory.view');
            Route::put('/warehouses/{id}', [WarehouseController::class, 'update'])->middleware('permission:inventory.update');
            Route::delete('/warehouses/{id}', [WarehouseController::class, 'destroy'])->middleware('permission:inventory.update');
            Route::post('/warehouses/{id}/default', [WarehouseController::class, 'setDefault'])->middleware('permission:inventory.update');

            Route::get('/inventory/dashboard', [InventoryController::class, 'dashboard'])->middleware('permission:inventory.view');
            Route::get('/inventory/kpis', [InventoryController::class, 'kpis'])->middleware('permission:inventory.view');
            Route::get('/inventory', [InventoryController::class, 'index'])->middleware('permission:inventory.view');
            Route::get('/inventory/alerts', [InventoryController::class, 'alerts'])->middleware('permission:inventory.view');
            Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock'])->middleware('permission:inventory.view');
            Route::get('/inventory/history', [InventoryController::class, 'history'])->middleware('permission:inventory.view');
            Route::get('/inventory/transactions', [InventoryController::class, 'transactions'])->middleware('permission:inventory.view');
            Route::get('/inventory/export', [InventoryController::class, 'export'])->middleware('permission:inventory.view');
            Route::get('/inventory/sample-template', [InventoryController::class, 'sampleTemplate'])->middleware('permission:inventory.view');
            Route::post('/inventory/adjust', [InventoryController::class, 'adjust'])->middleware('permission:inventory.update');
            Route::post('/inventory/transfer', [InventoryController::class, 'transfer'])->middleware('permission:inventory.update');
            Route::post('/inventory/import', [InventoryController::class, 'import'])->middleware('permission:inventory.update');
            Route::post('/inventory/reserve', [InventoryController::class, 'reserve'])->middleware('permission:inventory.update');
            Route::post('/inventory/release', [InventoryController::class, 'release'])->middleware('permission:inventory.update');
            Route::post('/inventory/commit', [InventoryController::class, 'commit'])->middleware('permission:inventory.update');
            Route::get('/inventory/{variant_id}', [InventoryController::class, 'show'])->middleware('permission:inventory.view');

            // Media Management
            Route::post('/media/upload', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'upload'])->middleware('permission:media.create');
            Route::get('/media', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'index'])->middleware('permission:media.view');
            Route::get('/media/{id}', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'show'])->middleware('permission:media.view');
            Route::post('/media/attach', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'attach'])->middleware('permission:media.update');
            Route::post('/media/detach', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'detach'])->middleware('permission:media.update');
            Route::put('/media/{id}', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'update'])->middleware('permission:media.update');
            Route::post('/media/sort', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'sort'])->middleware('permission:media.update');
            Route::delete('/media/unused', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'purgeUnused'])->middleware('permission:media.delete');
            Route::delete('/media/{id}', [\App\Http\Controllers\Api\V1\Admin\MediaController::class, 'destroy'])->middleware('permission:media.delete');

            // Coupon Management
            Route::get('/coupons', [\App\Http\Controllers\Api\V1\Admin\CouponController::class, 'index']);
            Route::post('/coupons', [\App\Http\Controllers\Api\V1\Admin\CouponController::class, 'store']);
            Route::get('/coupons/{id}', [\App\Http\Controllers\Api\V1\Admin\CouponController::class, 'show']);
            Route::put('/coupons/{id}', [\App\Http\Controllers\Api\V1\Admin\CouponController::class, 'update']);
            Route::delete('/coupons/{id}', [\App\Http\Controllers\Api\V1\Admin\CouponController::class, 'destroy']);
            Route::patch('/coupons/{id}/status', [\App\Http\Controllers\Api\V1\Admin\CouponController::class, 'toggleStatus']);
            Route::get('/coupons/{id}/reports', [\App\Http\Controllers\Api\V1\Admin\CouponController::class, 'report']);

            // Tax Class Management
            Route::get('/tax-classes', [\App\Http\Controllers\Api\V1\Admin\TaxClassController::class, 'index']);
            Route::post('/tax-classes', [\App\Http\Controllers\Api\V1\Admin\TaxClassController::class, 'store']);
            Route::get('/tax-classes/{id}', [\App\Http\Controllers\Api\V1\Admin\TaxClassController::class, 'show']);
            Route::put('/tax-classes/{id}', [\App\Http\Controllers\Api\V1\Admin\TaxClassController::class, 'update']);
            Route::delete('/tax-classes/{id}', [\App\Http\Controllers\Api\V1\Admin\TaxClassController::class, 'destroy']);

            // Tax Rate Management
            Route::get('/tax-rates', [\App\Http\Controllers\Api\V1\Admin\TaxRateController::class, 'index']);
            Route::post('/tax-rates', [\App\Http\Controllers\Api\V1\Admin\TaxRateController::class, 'store']);
            Route::get('/tax-rates/{id}', [\App\Http\Controllers\Api\V1\Admin\TaxRateController::class, 'show']);
            Route::put('/tax-rates/{id}', [\App\Http\Controllers\Api\V1\Admin\TaxRateController::class, 'update']);
            Route::delete('/tax-rates/{id}', [\App\Http\Controllers\Api\V1\Admin\TaxRateController::class, 'destroy']);

            // Shipping Zone Management
            Route::get('/shipping-zones', [\App\Http\Controllers\Api\V1\Admin\ShippingZoneController::class, 'index']);
            Route::post('/shipping-zones', [\App\Http\Controllers\Api\V1\Admin\ShippingZoneController::class, 'store']);
            Route::get('/shipping-zones/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingZoneController::class, 'show']);
            Route::put('/shipping-zones/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingZoneController::class, 'update']);
            Route::delete('/shipping-zones/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingZoneController::class, 'destroy']);

            // Shipping Method Management
            Route::get('/shipping-methods', [\App\Http\Controllers\Api\V1\Admin\ShippingMethodController::class, 'index']);
            Route::post('/shipping-methods', [\App\Http\Controllers\Api\V1\Admin\ShippingMethodController::class, 'store']);
            Route::get('/shipping-methods/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingMethodController::class, 'show']);
            Route::put('/shipping-methods/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingMethodController::class, 'update']);
            Route::delete('/shipping-methods/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingMethodController::class, 'destroy']);

            // Shipping Rate Management
            Route::get('/shipping-rates', [\App\Http\Controllers\Api\V1\Admin\ShippingRateController::class, 'index']);
            Route::post('/shipping-rates', [\App\Http\Controllers\Api\V1\Admin\ShippingRateController::class, 'store']);
            Route::get('/shipping-rates/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingRateController::class, 'show']);
            Route::put('/shipping-rates/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingRateController::class, 'update']);
            Route::delete('/shipping-rates/{id}', [\App\Http\Controllers\Api\V1\Admin\ShippingRateController::class, 'destroy']);

            // Shipment Management
            Route::get('/shipments', [\App\Http\Controllers\Api\V1\Admin\ShipmentController::class, 'index']);
            Route::post('/shipments', [\App\Http\Controllers\Api\V1\Admin\ShipmentController::class, 'store']);
            Route::get('/shipments/{id}', [\App\Http\Controllers\Api\V1\Admin\ShipmentController::class, 'show']);
            Route::post('/shipments/{id}/tracking', [\App\Http\Controllers\Api\V1\Admin\ShipmentController::class, 'addTracking']);

            // Admin Payment Management
            Route::get('/payments', [\App\Http\Controllers\Api\V1\Admin\PaymentAdminController::class, 'index']);
            Route::get('/payments/{id}', [\App\Http\Controllers\Api\V1\Admin\PaymentAdminController::class, 'show']);
            Route::post('/payments/{id}/mark-paid', [\App\Http\Controllers\Api\V1\Admin\PaymentAdminController::class, 'markPaid']);

            // Admin Return Management
            Route::get('/returns', [\App\Http\Controllers\Api\V1\Admin\ReturnAdminController::class, 'index']);
            Route::get('/returns/{id}', [\App\Http\Controllers\Api\V1\Admin\ReturnAdminController::class, 'show']);
            Route::post('/returns/{id}/status', [\App\Http\Controllers\Api\V1\Admin\ReturnAdminController::class, 'updateStatus']);
            Route::post('/returns/{id}/restock', [\App\Http\Controllers\Api\V1\Admin\ReturnAdminController::class, 'restock']);

            // Admin Refund Management
            Route::get('/refunds', [\App\Http\Controllers\Api\V1\Admin\RefundAdminController::class, 'index']);
            Route::post('/refunds/process', [\App\Http\Controllers\Api\V1\Admin\RefundAdminController::class, 'process']);

            // Admin Review Management
            Route::get('/reviews', [\App\Http\Controllers\Api\V1\Admin\ReviewAdminController::class, 'index']);
            Route::get('/reviews/{id}', [\App\Http\Controllers\Api\V1\Admin\ReviewAdminController::class, 'show']);
            Route::post('/reviews/{id}/status', [\App\Http\Controllers\Api\V1\Admin\ReviewAdminController::class, 'updateStatus']);
            Route::delete('/reviews/{id}', [\App\Http\Controllers\Api\V1\Admin\ReviewAdminController::class, 'destroy']);

            // Admin Notification Management
            Route::get('/notifications/templates', [\App\Http\Controllers\Api\V1\Admin\NotificationAdminController::class, 'indexTemplates']);
            Route::post('/notifications/templates', [\App\Http\Controllers\Api\V1\Admin\NotificationAdminController::class, 'storeTemplate']);
            Route::get('/notifications/templates/{id}', [\App\Http\Controllers\Api\V1\Admin\NotificationAdminController::class, 'showTemplate']);
            Route::put('/notifications/templates/{id}', [\App\Http\Controllers\Api\V1\Admin\NotificationAdminController::class, 'updateTemplate']);
            Route::get('/notifications/logs', [\App\Http\Controllers\Api\V1\Admin\NotificationAdminController::class, 'indexLogs']);
            Route::post('/notifications/test-dispatch', [\App\Http\Controllers\Api\V1\Admin\NotificationAdminController::class, 'testDispatch']);

            // Admin Dashboard Management
            Route::prefix('dashboard')->group(function () {
                Route::get('/kpis', [\App\Http\Controllers\Api\V1\Admin\AdminDashboardController::class, 'kpis']);
                Route::get('/sales-chart', [\App\Http\Controllers\Api\V1\Admin\AdminDashboardController::class, 'salesChart']);
                Route::get('/order-stats', [\App\Http\Controllers\Api\V1\Admin\AdminDashboardController::class, 'orderStats']);
                Route::get('/top-performers', [\App\Http\Controllers\Api\V1\Admin\AdminDashboardController::class, 'topPerformers']);
                Route::get('/highlights', [\App\Http\Controllers\Api\V1\Admin\AdminDashboardController::class, 'highlights']);
            });
        });
    });
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Protected Customer Profile & Address Routes
Route::middleware('auth:sanctum')->prefix('v1/customer')->group(function () {
    Route::get('/profile', [\App\Http\Controllers\Api\V1\Customer\CustomerProfileController::class, 'show']);
    Route::put('/profile', [\App\Http\Controllers\Api\V1\Customer\CustomerProfileController::class, 'update']);
    Route::post('/change-password', [\App\Http\Controllers\Api\V1\Customer\CustomerProfileController::class, 'changePassword']);

    Route::get('/addresses', [\App\Http\Controllers\Api\V1\Customer\AddressController::class, 'index']);
    Route::post('/addresses', [\App\Http\Controllers\Api\V1\Customer\AddressController::class, 'store']);
    Route::get('/addresses/{id}', [\App\Http\Controllers\Api\V1\Customer\AddressController::class, 'show']);
    Route::put('/addresses/{id}', [\App\Http\Controllers\Api\V1\Customer\AddressController::class, 'update']);
    Route::delete('/addresses/{id}', [\App\Http\Controllers\Api\V1\Customer\AddressController::class, 'destroy']);
    Route::patch('/addresses/{id}/default-shipping', [\App\Http\Controllers\Api\V1\Customer\AddressController::class, 'setDefaultShipping']);
    Route::patch('/addresses/{id}/default-billing', [\App\Http\Controllers\Api\V1\Customer\AddressController::class, 'setDefaultBilling']);

    // Protected Customer Order Routes
    Route::get('/orders', [\App\Http\Controllers\Api\V1\Customer\CustomerOrderController::class, 'index']);
    Route::get('/orders/{order_number}', [\App\Http\Controllers\Api\V1\Customer\CustomerOrderController::class, 'show']);
    Route::get('/orders/{order_number}/tracking', [\App\Http\Controllers\Api\V1\Customer\CustomerOrderController::class, 'tracking']);
    Route::post('/orders/{order_number}/cancel', [\App\Http\Controllers\Api\V1\Customer\CustomerOrderController::class, 'cancel']);

    // Protected Customer Return Routes
    Route::get('/returns', [\App\Http\Controllers\Api\V1\Customer\ReturnController::class, 'index']);
    Route::post('/returns', [\App\Http\Controllers\Api\V1\Customer\ReturnController::class, 'store']);
    Route::get('/returns/{return_number}', [\App\Http\Controllers\Api\V1\Customer\ReturnController::class, 'show']);

    // Protected Customer Review Routes
    Route::get('/reviews', [\App\Http\Controllers\Api\V1\Customer\ReviewController::class, 'index']);
    Route::post('/reviews', [\App\Http\Controllers\Api\V1\Customer\ReviewController::class, 'store']);

    // Protected Customer Notification Routes
    Route::get('/notifications', [\App\Http\Controllers\Api\V1\Customer\CustomerNotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [\App\Http\Controllers\Api\V1\Customer\CustomerNotificationController::class, 'markAsRead']);
});

// Protected Customer Wishlist Routes
Route::middleware('auth:sanctum')->prefix('v1/wishlist')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\V1\Customer\WishlistController::class, 'index']);
    Route::post('/', [\App\Http\Controllers\Api\V1\Customer\WishlistController::class, 'store']);
    Route::get('/check/{product_id}', [\App\Http\Controllers\Api\V1\Customer\WishlistController::class, 'check']);
    Route::post('/{id}/move-to-cart', [\App\Http\Controllers\Api\V1\Customer\WishlistController::class, 'moveToCart']);
    Route::delete('/{id}', [\App\Http\Controllers\Api\V1\Customer\WishlistController::class, 'destroy']);
    Route::delete('/', [\App\Http\Controllers\Api\V1\Customer\WishlistController::class, 'clear']);
});

// Shopping Cart Routes (supports guests via X-Session-ID + authenticated customers)
Route::prefix('v1/cart')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'index']);
    Route::post('/items', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'addItem']);
    Route::put('/items/{id}', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'updateItem']);
    Route::delete('/items/{id}', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'removeItem']);
    Route::delete('/', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'clear']);
    Route::post('/apply-coupon', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'applyCoupon']);
    Route::delete('/remove-coupon', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'removeCoupon']);
    Route::post('/validate', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'validateCart']);
    // Merge route requires authenticated user
    Route::middleware('auth:sanctum')->post('/merge', [\App\Http\Controllers\Api\V1\Customer\CartController::class, 'merge']);
});

// Coupon Validation Route (public/guest + customer support)
Route::post('v1/coupons/validate', [\App\Http\Controllers\Api\V1\Customer\CouponController::class, 'validateCode']);

// Public Tax Calculation Route
Route::post('v1/tax/calculate', [\App\Http\Controllers\Api\V1\TaxController::class, 'calculate']);

// Public Shipping Engine Routes
Route::post('v1/shipping/calculate', [\App\Http\Controllers\Api\V1\ShippingController::class, 'calculate']);
Route::get('v1/shipments/track/{tracking_number}', [\App\Http\Controllers\Api\V1\ShippingController::class, 'track']);

// Checkout & Order Routes (supports guests via X-Session-ID / guest fields & authenticated customers)
Route::post('v1/checkout/process', [\App\Http\Controllers\Api\V1\Customer\CheckoutController::class, 'process']);
Route::get('v1/orders/{order_number}', [\App\Http\Controllers\Api\V1\Customer\CheckoutController::class, 'show']);

// Payment & Webhook Routes
Route::get('v1/payments/methods', [\App\Http\Controllers\Api\V1\Customer\PaymentController::class, 'methods']);
Route::post('v1/payments/initiate', [\App\Http\Controllers\Api\V1\Customer\PaymentController::class, 'initiate']);
Route::post('v1/payments/verify', [\App\Http\Controllers\Api\V1\Customer\PaymentController::class, 'verify']);
Route::post('v1/webhooks/payment/{gateway}', [\App\Http\Controllers\Api\V1\WebhookController::class, 'handle']);


