<?php

namespace App\Services;

use App\Jobs\ImportProductsJob;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductService
{
    /**
     * List admin products with search, multi-field filtering, sorting, and pagination.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::with(['brand', 'categories', 'taxClass', 'shippingClass', 'media', 'productImages.media', 'variants.attributeValues']);

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type']) && is_string($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status']) && is_string($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['brand_id']) && is_numeric($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (!empty($filters['category_id']) && is_numeric($filters['category_id'])) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('categories.id', $filters['category_id']);
            });
        }

        if (array_key_exists('featured', $filters) && $filters['featured'] !== null) {
            $query->where('featured', filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        $sortBy = $filters['sort_by'] ?? 'latest';
        match ($sortBy) {
            'price_low_high' => $query->orderBy('price', 'asc'),
            'price_high_low' => $query->orderBy('price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            'oldest' => $query->orderBy('id', 'asc'),
            default => $query->orderBy('id', 'desc'),
        };

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->paginate($perPageInt);
    }

    /**
     * Create a new product and sync category pivot.
     */
    public function create(array $data): Product
    {
        $categoryIds = $data['category_ids'] ?? [];
        $primaryCategoryId = $data['primary_category_id'] ?? ($categoryIds[0] ?? null);
        $variantsData = $data['variants'] ?? null;

        unset($data['category_ids'], $data['primary_category_id'], $data['variants']);

        $product = Product::create($data);

        $this->syncCategories($product, $categoryIds, $primaryCategoryId);

        if ($variantsData !== null && is_array($variantsData) && count($variantsData) > 0) {
            $this->syncVariants($product, $variantsData);
        } else {
            if ($product->variants()->count() === 0) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $product->sku ?: ProductVariant::generateUniqueSku(),
                    'price' => $product->price ?? 0,
                    'sale_price' => $product->sale_price ?? null,
                    'cost_price' => $product->cost_price ?? null,
                    'stock_qty' => isset($data['stock_qty']) ? (int) $data['stock_qty'] : 0,
                    'status' => 'active',
                ]);
            }
        }

        return $product->load(['brand', 'categories', 'media', 'productImages.media', 'variants.attributeValues']);
    }

    /**
     * Update an existing product.
     */
    public function update(Product $product, array $data): Product
    {
        $categoryIds = $data['category_ids'] ?? null;
        $primaryCategoryId = $data['primary_category_id'] ?? null;
        $variantsData = $data['variants'] ?? null;

        unset($data['category_ids'], $data['primary_category_id'], $data['variants']);

        $product->update($data);

        if ($categoryIds !== null) {
            $this->syncCategories($product, $categoryIds, $primaryCategoryId);
        }

        if ($variantsData !== null && is_array($variantsData)) {
            $this->syncVariants($product, $variantsData);
        }

        return $product->load(['brand', 'categories', 'media', 'productImages.media', 'variants.attributeValues']);
    }

    /**
     * Toggle status of a product.
     */
    public function toggleStatus(Product $product, string $status): Product
    {
        $product->update(['status' => $status]);

        return $product;
    }

    /**
     * Delete a product.
     */
    public function delete(Product $product): bool
    {
        return $product->delete();
    }

    /**
     * Get active storefront catalog listing.
     */
    public function getPublicCatalog(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::active()->with(['brand', 'categories']);

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category']) && is_string($filters['category'])) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('categories.slug', $filters['category']);
            });
        }

        if (!empty($filters['brand']) && is_string($filters['brand'])) {
            $query->whereHas('brand', function ($q) use ($filters) {
                $q->where('brands.slug', $filters['brand']);
            });
        }

        if (isset($filters['min_price']) && is_numeric($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price']) && is_numeric($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (array_key_exists('featured', $filters) && $filters['featured'] !== null) {
            $query->where('featured', filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = $filters['sort_by'] ?? 'latest';
        match ($sortBy) {
            'price_low_high' => $query->orderBy('price', 'asc'),
            'price_high_low' => $query->orderBy('price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            default => $query->orderBy('id', 'desc'),
        };

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->paginate($perPageInt);
    }

    /**
     * Get active product details by slug for public storefront.
     */
    public function getPublicBySlug(string $slug): array
    {
        $product = Product::active()
            ->where('slug', $slug)
            ->with(['brand', 'categories', 'variants' => fn($q) => $q->active()->with('attributeValues')])
            ->first();

        if (!$product) {
            throw ValidationException::withMessages([
                'slug' => ['Product not found or inactive.'],
            ]);
        }

        $primaryCategory = $product->categories->first(fn($c) => $c->pivot->is_primary) ?? $product->categories->first();
        $breadcrumbs = $primaryCategory ? $this->getCategoryBreadcrumbs($primaryCategory) : [];

        // Related products in same category or brand
        $relatedProducts = Product::active()
            ->where('id', '!=', $product->id)
            ->where(function ($q) use ($product, $primaryCategory) {
                if ($primaryCategory) {
                    $q->whereHas('categories', fn($cQ) => $cQ->where('categories.id', $primaryCategory->id));
                }
                if ($product->brand_id) {
                    $q->orWhere('brand_id', $product->brand_id);
                }
            })
            ->with('brand')
            ->take(6)
            ->get();

        return [
            'product' => $product,
            'primary_category' => $primaryCategory,
            'breadcrumbs' => $breadcrumbs,
            'related_products' => $relatedProducts,
        ];
    }

    /**
     * Helper to sync categories with is_primary indicator.
     */
    protected function syncCategories(Product $product, array $categoryIds, ?int $primaryCategoryId = null): void
    {
        $pivotData = [];
        $primaryId = $primaryCategoryId ?? ($categoryIds[0] ?? null);

        foreach ($categoryIds as $catId) {
            $pivotData[$catId] = ['is_primary' => ($catId == $primaryId)];
        }

        $product->categories()->sync($pivotData);
    }

    /**
     * Helper to sync product variants and their attribute value mappings.
     */
    protected function syncVariants(Product $product, array $variantsData): void
    {
        $keptVariantIds = [];
        $usedSkusInBatch = [];

        // 1. Validation phase: check for duplicate SKUs in batch or database
        foreach ($variantsData as $vData) {
            $variantId = isset($vData['id']) && is_numeric($vData['id']) ? (int) $vData['id'] : null;
            $sku = !empty($vData['sku']) ? trim($vData['sku']) : null;

            if ($sku) {
                $upperSku = strtoupper($sku);

                // Check duplicate within current form submission list
                if (in_array($upperSku, $usedSkusInBatch)) {
                    throw ValidationException::withMessages([
                        'variants' => ["The SKU '{$sku}' is used multiple times in your variants list. Variant SKUs must be unique."],
                    ]);
                }
                $usedSkusInBatch[] = $upperSku;

                // Check duplicate against existing variant records in database
                $exists = \App\Models\ProductVariant::where('sku', $sku)
                    ->where('id', '!=', $variantId)
                    ->exists();

                if ($exists) {
                    throw ValidationException::withMessages([
                        'variants' => ["The variant SKU '{$sku}' is already taken by another product. Variant SKUs must be unique."],
                    ]);
                }
            }
        }

        // 2. Execution phase: create or update variants
        foreach ($variantsData as $vData) {
            $variantId = isset($vData['id']) && is_numeric($vData['id']) ? (int) $vData['id'] : null;
            $attributeValueIds = $vData['attribute_value_ids'] ?? [];

            $sku = !empty($vData['sku']) ? trim($vData['sku']) : \App\Models\ProductVariant::generateUniqueSku('VAR');

            $payload = [
                'sku' => $sku,
                'price' => isset($vData['price']) && is_numeric($vData['price']) ? (float) $vData['price'] : $product->price,
                'sale_price' => isset($vData['sale_price']) && is_numeric($vData['sale_price']) ? (float) $vData['sale_price'] : null,
                'cost_price' => isset($vData['cost_price']) && is_numeric($vData['cost_price']) ? (float) $vData['cost_price'] : null,
                'stock_qty' => isset($vData['stock_qty']) ? (int) $vData['stock_qty'] : 10,
                'image' => $vData['image'] ?? null,
                'download_url' => $vData['download_url'] ?? null,
                'download_limit' => isset($vData['download_limit']) ? (int) $vData['download_limit'] : null,
                'download_expiry_days' => isset($vData['download_expiry_days']) ? (int) $vData['download_expiry_days'] : null,
                'status' => $vData['status'] ?? 'active',
            ];

            if ($variantId) {
                $variant = $product->variants()->find($variantId);
                if ($variant) {
                    $variant->update($payload);
                } else {
                    $variant = $product->variants()->create($payload);
                }
            } else {
                $variant = $product->variants()->create($payload);
            }

            $keptVariantIds[] = $variant->id;

            if (!empty($attributeValueIds) && is_array($attributeValueIds)) {
                $variant->attributeValues()->sync($attributeValueIds);
            }
        }

        // Delete any existing variants that were removed from the form matrix
        if ($product->type === 'variable' || $product->type === 'digital') {
            $product->variants()->whereNotIn('id', $keptVariantIds)->delete();
        }
    }

    /**
     * Helper to generate breadcrumb trail for a category.
     */
    protected function getCategoryBreadcrumbs(Category $category): array
    {
        $breadcrumbs = [];
        $curr = $category;

        while ($curr) {
            array_unshift($breadcrumbs, [
                'id' => $curr->id,
                'name' => $curr->name,
                'slug' => $curr->slug,
            ]);
            $curr = $curr->parent;
        }

        return $breadcrumbs;
    }

    /**
     * Duplicate a product and its associated categories and variants.
     */
    public function duplicate(Product $product): Product
    {
        return DB::transaction(function () use ($product) {
            $product->load(['categories', 'variants']);

            $newName = $product->name . ' (Copy)';
            $newSlug = Product::generateUniqueSlug($newName);
            $newSku = Product::generateUniqueSku('COPY');

            $newProduct = Product::create([
                'brand_id' => $product->brand_id,
                'name' => $newName,
                'slug' => $newSlug,
                'sku' => $newSku,
                'type' => $product->type,
                'status' => 'draft',
                'price' => $product->price,
                'sale_price' => $product->sale_price,
                'cost_price' => $product->cost_price,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'weight' => $product->weight,
                'length' => $product->length,
                'width' => $product->width,
                'height' => $product->height,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'images' => $product->images,
                'tax_class' => $product->tax_class,
            ]);

            // Sync categories
            if ($product->categories->isNotEmpty()) {
                $categoryIds = $product->categories->pluck('id')->toArray();
                $primaryCat = $product->categories->first(fn ($c) => $c->pivot->is_primary);
                $this->syncCategories($newProduct, $categoryIds, $primaryCat?->id);
            }

            // Clone variants
            foreach ($product->variants as $variant) {
                $newVarSku = $newSku . '-' . $variant->id;
                ProductVariant::create([
                    'product_id' => $newProduct->id,
                    'sku' => $newVarSku,
                    'price' => $variant->price,
                    'sale_price' => $variant->sale_price,
                    'stock_qty' => $variant->stock_qty,
                    'status' => $variant->status,
                ]);
            }

            return $newProduct->load(['brand', 'categories', 'variants']);
        });
    }

    /**
     * Perform bulk operations across selected product IDs.
     */
    public function bulkAction(array $productIds, string $action, array $data = []): int
    {
        return DB::transaction(function () use ($productIds, $action, $data) {
            $count = 0;
            $products = Product::whereIn('id', $productIds)->get();

            foreach ($products as $product) {
                switch ($action) {
                    case 'activate':
                        $product->update(['status' => 'active']);
                        $count++;
                        break;
                    case 'deactivate':
                        $product->update(['status' => 'inactive']);
                        $count++;
                        break;
                    case 'archive':
                        $product->update(['status' => 'archived']);
                        $count++;
                        break;
                    case 'delete':
                        $product->delete();
                        $count++;
                        break;
                    case 'update_category':
                        if (!empty($data['category_id'])) {
                            $this->syncCategories($product, [(int) $data['category_id']], (int) $data['category_id']);
                            $count++;
                        }
                        break;
                    case 'update_price':
                        if (isset($data['price']) && is_numeric($data['price'])) {
                            $product->update(['price' => (float) $data['price']]);
                            $count++;
                        }
                        break;
                    case 'update_stock':
                        if (isset($data['stock_qty']) && is_numeric($data['stock_qty'])) {
                            $newStock = (int) $data['stock_qty'];
                            foreach ($product->variants as $variant) {
                                $variant->update(['stock_qty' => $newStock]);
                                Inventory::updateOrCreate(
                                    ['product_variant_id' => $variant->id],
                                    ['sku' => $variant->sku, 'available_qty' => $newStock]
                                );
                            }
                            $count++;
                        }
                        break;
                }
            }

            return $count;
        });
    }

    /**
     * Submit CSV/XLSX product import batch.
     */
    public function importProducts(array $productsData): array
    {
        if (config('queue.default') === 'sync') {
            return $this->processImportBatch($productsData);
        }

        ImportProductsJob::dispatch($productsData);

        return [
            'status' => 'queued',
            'message' => 'Product import job queued successfully.',
            'total_records' => count($productsData),
        ];
    }

    /**
     * Process product import batch.
     */
    public function processImportBatch(array $productsData): array
    {
        $importedCount = 0;
        $errors = [];

        foreach ($productsData as $index => $row) {
            try {
                if (empty($row['name']) || !isset($row['price'])) {
                    $errors[] = "Row #" . ($index + 1) . ": Name and price are required.";
                    continue;
                }

                $sku = !empty($row['sku']) ? $row['sku'] : Product::generateUniqueSku();

                $product = Product::create([
                    'name' => $row['name'],
                    'type' => $row['type'] ?? 'simple',
                    'status' => $row['status'] ?? 'draft',
                    'price' => (float) $row['price'],
                    'sale_price' => isset($row['sale_price']) ? (float) $row['sale_price'] : null,
                    'sku' => $sku,
                    'short_description' => $row['short_description'] ?? null,
                    'description' => $row['description'] ?? null,
                ]);

                // Create default variant for simple product
                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $sku,
                    'price' => (float) $row['price'],
                    'stock_qty' => isset($row['stock_qty']) ? (int) $row['stock_qty'] : 10,
                ]);

                $importedCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row #" . ($index + 1) . ": " . $e->getMessage();
            }
        }

        return [
            'status' => 'completed',
            'imported_count' => $importedCount,
            'errors' => $errors,
        ];
    }
}
