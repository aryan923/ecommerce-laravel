<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\ReorderCategoriesRequest;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class CategoryController extends BaseController
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/categories",
     *     summary="List Categories (Admin)",
     *     description="Retrieve categories as a paginated list or formatted as a nested tree.",
     *     operationId="adminListCategories",
     *     tags={"Admin Category Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="tree", in="query", required=false, @OA\Schema(type="boolean", default=false)),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="parent_id", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"active","inactive"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Categories retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $asTree = filter_var($request->input('tree', false), FILTER_VALIDATE_BOOLEAN);
        $filters = $request->only(['search', 'parent_id', 'status']);
        $perPage = (int) $request->input('per_page', 15);

        $categories = $this->categoryService->list($filters, $perPage, $asTree);

        if ($asTree) {
            return $this->successResponse($categories, 'Category tree retrieved successfully.');
        }

        return $this->paginatedResponse($categories, 'Categories retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/categories",
     *     summary="Create Category",
     *     description="Create a new top-level or sub-category.",
     *     operationId="adminCreateCategory",
     *     tags={"Admin Category Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Electronics"),
     *             @OA\Property(property="parent_id", type="integer", nullable=true, example=null),
     *             @OA\Property(property="description", type="string", example="Electronic items"),
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="active"),
     *             @OA\Property(property="sort_order", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Category created successfully")
     * )
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->create($request->validated());

        return $this->successResponse($category, 'Category created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/categories/{id}",
     *     summary="View Category Details",
     *     description="Retrieve details of a single category with parent and children relations.",
     *     operationId="adminShowCategory",
     *     tags={"Admin Category Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Category details retrieved successfully")
     * )
     */
    public function show(Category $category): JsonResponse
    {
        return $this->successResponse($category->load(['parent', 'children']), 'Category details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/categories/{id}",
     *     summary="Update Category",
     *     description="Update category fields and parent relationship.",
     *     operationId="adminUpdateCategory",
     *     tags={"Admin Category Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Updated Category"),
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="active")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Category updated successfully"),
     *     @OA\Response(response=422, description="Self-parenting error")
     * )
     */
    public function update(UpdateCategoryRequest $request, Category $category): JsonResponse
    {
        $updatedCategory = $this->categoryService->update($category, $request->validated());

        return $this->successResponse($updatedCategory, 'Category updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/categories/{id}/status",
     *     summary="Toggle Category Status",
     *     description="Toggle category status to active or inactive.",
     *     operationId="adminToggleCategoryStatus",
     *     tags={"Admin Category Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="inactive")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Category status updated successfully")
     * )
     */
    public function toggleStatus(Request $request, Category $category): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,inactive'],
        ]);

        $updatedCategory = $this->categoryService->toggleStatus($category, $request->input('status'));

        return $this->successResponse($updatedCategory, 'Category status updated successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/categories/reorder",
     *     summary="Reorder Categories",
     *     description="Update sort orders for multiple categories.",
     *     operationId="adminReorderCategories",
     *     tags={"Admin Category Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"orders"},
     *             @OA\Property(
     *                 property="orders",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="sort_order", type="integer", example=2)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Categories reordered successfully")
     * )
     */
    public function reorder(ReorderCategoriesRequest $request): JsonResponse
    {
        $this->categoryService->reorder($request->input('orders'));

        return $this->successResponse(null, 'Categories reordered successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/categories/{id}",
     *     summary="Delete Category",
     *     description="Delete a category. Blocked if child sub-categories exist.",
     *     operationId="adminDeleteCategory",
     *     tags={"Admin Category Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Category deleted successfully"),
     *     @OA\Response(response=422, description="Cannot delete category with sub-categories")
     * )
     */
    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return $this->successResponse(null, 'Category deleted successfully.');
    }
}
