<?php

namespace App\Services;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class BrandService
{
    /**
     * List admin brands with search, status filtering, and pagination.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Brand::query();

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status']) && is_string($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->paginate($perPageInt);
    }

    /**
     * Create a new brand.
     */
    public function create(array $data): Brand
    {
        return Brand::create($data);
    }

    /**
     * Update an existing brand.
     */
    public function update(Brand $brand, array $data): Brand
    {
        $brand->update($data);

        return $brand;
    }

    /**
     * Toggle status of a brand.
     */
    public function toggleStatus(Brand $brand, string $status): Brand
    {
        $brand->update(['status' => $status]);

        return $brand;
    }

    /**
     * Delete a brand.
     */
    public function delete(Brand $brand): bool
    {
        return $brand->delete();
    }

    /**
     * Get active brands list for public storefront.
     */
    public function getPublicList(): Collection
    {
        return Brand::active()->orderBy('sort_order', 'asc')->get();
    }

    /**
     * Get active brand details by slug for public storefront.
     */
    public function getPublicBySlug(string $slug): Brand
    {
        $brand = Brand::active()->where('slug', $slug)->first();

        if (!$brand) {
            throw ValidationException::withMessages([
                'slug' => ['Brand not found.'],
            ]);
        }

        return $brand;
    }
}
