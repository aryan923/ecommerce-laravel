<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class VariantService
{
    /**
     * List all variants belonging to a product with attribute values attached.
     */
    public function list(Product $product): Collection
    {
        return $product->variants()->with('attributeValues')->get();
    }

    /**
     * Generate Cartesian product variant matrix for a product.
     */
    public function generateMatrix(Product $product, array $attributeValueGroups, ?float $basePrice = null, ?int $baseStock = 0): array
    {
        $combinations = $this->cartesianProduct($attributeValueGroups);
        $createdCount = 0;
        $skippedCount = 0;
        $createdVariants = [];

        $defaultPrice = $basePrice ?? (float) $product->price;
        $defaultStock = $baseStock ?? 0;

        foreach ($combinations as $combo) {
            // Ensure combo is array of IDs
            sort($combo);

            // Check if variant already exists with exact combination of attribute values
            $exists = $product->variants()->whereHas('attributeValues', function ($q) use ($combo) {
                $q->whereIn('attribute_values.id', $combo);
            }, '=', count($combo))->whereDoesntHave('attributeValues', function ($q) use ($combo) {
                $q->whereNotIn('attribute_values.id', $combo);
            })->exists();

            if ($exists) {
                $skippedCount++;
                continue;
            }

            $sku = ProductVariant::generateUniqueSku('VAR');
            $variant = $product->variants()->create([
                'sku' => $sku,
                'price' => $defaultPrice,
                'stock_qty' => $defaultStock,
                'status' => 'active',
            ]);

            $variant->attributeValues()->sync($combo);
            $createdVariants[] = $variant->load('attributeValues');
            $createdCount++;
        }

        return [
            'created_count' => $createdCount,
            'skipped_count' => $skippedCount,
            'variants' => $createdVariants,
        ];
    }

    /**
     * Manually create a single variant.
     */
    public function create(Product $product, array $data): ProductVariant
    {
        $attributeValueIds = $data['attribute_value_ids'] ?? [];
        unset($data['attribute_value_ids']);

        if (empty($data['price'])) {
            $data['price'] = $product->price;
        }

        $variant = $product->variants()->create($data);

        if (!empty($attributeValueIds)) {
            $variant->attributeValues()->sync($attributeValueIds);
        }

        return $variant->load('attributeValues');
    }

    /**
     * Update an existing variant.
     */
    public function update(ProductVariant $variant, array $data): ProductVariant
    {
        $attributeValueIds = $data['attribute_value_ids'] ?? null;
        unset($data['attribute_value_ids']);

        $variant->update($data);

        if ($attributeValueIds !== null) {
            $variant->attributeValues()->sync($attributeValueIds);
        }

        return $variant->load('attributeValues');
    }

    /**
     * Toggle status of a variant.
     */
    public function toggleStatus(ProductVariant $variant, string $status): ProductVariant
    {
        $variant->update(['status' => $status]);

        return $variant;
    }

    /**
     * Delete a variant.
     */
    public function delete(ProductVariant $variant): bool
    {
        return $variant->delete();
    }

    /**
     * Compute Cartesian Product of array of arrays.
     */
    protected function cartesianProduct(array $input): array
    {
        $result = [[]];

        foreach ($input as $key => $values) {
            $append = [];
            foreach ($result as $product) {
                foreach ($values as $item) {
                    $append[] = array_merge($product, [$item]);
                }
            }
            $result = $append;
        }

        return $result;
    }
}
