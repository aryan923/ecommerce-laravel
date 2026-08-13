<?php

namespace App\Services;

use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AttributeService
{
    /**
     * List admin attributes with search, type, status filtering, and pagination.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Attribute::with('values')->withCount('values');

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['type']) && is_string($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status']) && is_string($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->paginate($perPageInt);
    }

    /**
     * Create a new attribute.
     */
    public function create(array $data): Attribute
    {
        return Attribute::create($data);
    }

    /**
     * Update an attribute.
     */
    public function update(Attribute $attribute, array $data): Attribute
    {
        $attribute->update($data);

        return $attribute->load('values');
    }

    /**
     * Toggle status of an attribute.
     */
    public function toggleStatus(Attribute $attribute, string $status): Attribute
    {
        $attribute->update(['status' => $status]);

        return $attribute;
    }

    /**
     * Delete an attribute (cascades deletion of attribute values).
     */
    public function delete(Attribute $attribute): bool
    {
        return $attribute->delete();
    }

    /**
     * List values for a specific attribute.
     */
    public function listValues(Attribute $attribute): Collection
    {
        return $attribute->values;
    }

    /**
     * Add a value to an attribute.
     */
    public function createValue(Attribute $attribute, array $data): AttributeValue
    {
        return $attribute->values()->create($data);
    }

    /**
     * Update an attribute value.
     */
    public function updateValue(AttributeValue $value, array $data): AttributeValue
    {
        $value->update($data);

        return $value;
    }

    /**
     * Delete an attribute value.
     */
    public function deleteValue(AttributeValue $value): bool
    {
        return $value->delete();
    }

    /**
     * Get active filterable attributes for public storefront catalog filters.
     */
    public function getPublicList(): Collection
    {
        return Attribute::active()
            ->filterable()
            ->with('values')
            ->orderBy('sort_order', 'asc')
            ->get();
    }
}
