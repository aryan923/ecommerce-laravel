<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class ProductService
{
    /**
     * List admin products with search, multi-field filtering, sorting, and pagination.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Product::with(['brand', 'categories']);

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

        unset($data['category_ids'], $data['primary_category_id']);

        $product = Product::create($data);

        $this->syncCategories($product, $categoryIds, $primaryCategoryId);

        return $product->load(['brand', 'categories']);
    }

    /**
     * Update an existing product.
     */
    public function update(Product $product, array $data): Product
    {
        $categoryIds = $data['category_ids'] ?? null;
        $primaryCategoryId = $data['primary_category_id'] ?? null;

        unset($data['category_ids'], $data['primary_category_id']);

        $product->update($data);

        if ($categoryIds !== null) {
            $this->syncCategories($product, $categoryIds, $primaryCategoryId);
        }

        return $product->load(['brand', 'categories']);
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
}
