<?php

use App\Http\Controllers\Api\V1\Admin\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AttributeController;
use App\Http\Controllers\Api\V1\Admin\AttributeValueController;
use App\Http\Controllers\Api\V1\Admin\BrandController;
use App\Http\Controllers\Api\V1\Admin\CategoryController;
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

    Route::get('/products', [PublicProductController::class, 'index']);
    Route::get('/products/{slug}', [PublicProductController::class, 'show']);

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
            Route::get('/products/{product}', [ProductController::class, 'show'])->middleware('permission:products.view');
            Route::put('/products/{product}', [ProductController::class, 'update'])->middleware('permission:products.update');
            Route::patch('/products/{product}/status', [ProductController::class, 'toggleStatus'])->middleware('permission:products.update');
            Route::delete('/products/{product}', [ProductController::class, 'destroy'])->middleware('permission:products.delete');

            // Product Variant Management
            Route::get('/products/{product}/variants', [VariantController::class, 'index'])->middleware('permission:products.view');
            Route::post('/products/{product}/variants/generate', [VariantController::class, 'generate'])->middleware('permission:products.create');
            Route::post('/products/{product}/variants', [VariantController::class, 'store'])->middleware('permission:products.create');
            Route::put('/variants/{variant}', [VariantController::class, 'update'])->middleware('permission:products.update');
            Route::patch('/variants/{variant}/status', [VariantController::class, 'toggleStatus'])->middleware('permission:products.update');
            Route::delete('/variants/{variant}', [VariantController::class, 'destroy'])->middleware('permission:products.delete');
        });
    });
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
