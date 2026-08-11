<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class CategoryService
{
    /**
     * List admin categories (flat paginated or tree structure).
     */
    public function list(array $filters = [], int $perPage = 15, bool $asTree = false)
    {
        if ($asTree) {
            $query = Category::root()->with('children');

            if (!empty($filters['status']) && is_string($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            return $query->orderBy('sort_order', 'asc')->get();
        }

        $query = Category::with('parent');

        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where('name', 'like', "%{$search}%");
        }

        if (array_key_exists('parent_id', $filters) && $filters['parent_id'] !== null && is_scalar($filters['parent_id'])) {
            if ($filters['parent_id'] === 'null' || $filters['parent_id'] === 'root') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $filters['parent_id']);
            }
        }

        if (!empty($filters['status']) && is_string($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPageInt = is_numeric($perPage) && $perPage > 0 ? (int) $perPage : 15;

        return $query->orderBy('sort_order', 'asc')->orderBy('id', 'desc')->paginate($perPageInt);
    }

    /**
     * Create a new category.
     */
    public function create(array $data): Category
    {
        return Category::create($data)->load('parent');
    }

    /**
     * Update a category (preventing self-parenting loops).
     */
    public function update(Category $category, array $data): Category
    {
        if (isset($data['parent_id']) && $data['parent_id'] == $category->id) {
            throw ValidationException::withMessages([
                'parent_id' => ['A category cannot be its own parent.'],
            ]);
        }

        if (isset($data['parent_id']) && $this->isDescendant($category, $data['parent_id'])) {
            throw ValidationException::withMessages([
                'parent_id' => ['Cannot set a descendant category as parent.'],
            ]);
        }

        $category->update($data);

        return $category->load(['parent', 'children']);
    }

    /**
     * Toggle status of a category.
     */
    public function toggleStatus(Category $category, string $status): Category
    {
        $category->update(['status' => $status]);

        return $category;
    }

    /**
     * Update sort order for multiple categories.
     */
    public function reorder(array $orders): void
    {
        foreach ($orders as $item) {
            Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }
    }

    /**
     * Delete a category (prevent deletion if sub-categories exist).
     */
    public function delete(Category $category): bool
    {
        if ($category->children()->exists()) {
            throw ValidationException::withMessages([
                'category' => ['Cannot delete category that contains sub-categories.'],
            ]);
        }

        return $category->delete();
    }

    /**
     * Get public active category tree for storefront.
     */
    public function getPublicTree(): Collection
    {
        return Category::active()
            ->root()
            ->with(['children' => fn($query) => $query->active()])
            ->orderBy('sort_order', 'asc')
            ->get();
    }

    /**
     * Get public active category details by slug.
     */
    public function getPublicBySlug(string $slug): Category
    {
        $category = Category::active()
            ->where('slug', $slug)
            ->with(['parent', 'children' => fn($query) => $query->active()])
            ->first();

        if (!$category) {
            throw ValidationException::withMessages([
                'slug' => ['Category not found.'],
            ]);
        }

        return $category;
    }

    /**
     * Check if potentialParentId is a descendant of category.
     */
    protected function isDescendant(Category $category, int $potentialParentId): bool
    {
        $children = $category->children;
        foreach ($children as $child) {
            if ($child->id == $potentialParentId || $this->isDescendant($child, $potentialParentId)) {
                return true;
            }
        }

        return false;
    }
}
