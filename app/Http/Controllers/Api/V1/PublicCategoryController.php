<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class PublicCategoryController extends BaseController
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/categories",
     *     summary="Get Active Category Tree (Public)",
     *     description="Retrieve active category tree for storefront navigation.",
     *     operationId="getPublicCategoryTree",
     *     tags={"Storefront Catalog"},
     *     @OA\Response(response=200, description="Active category tree retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getPublicTree();

        return $this->successResponse($categories, 'Public category tree retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/categories/{slug}",
     *     summary="Get Category Details by Slug (Public)",
     *     description="Retrieve active category details and sub-categories by slug.",
     *     operationId="getPublicCategoryBySlug",
     *     tags={"Storefront Catalog"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Category details retrieved successfully"),
     *     @OA\Response(response=404, description="Category not found")
     * )
     */
    public function show(string $slug): JsonResponse
    {
        $category = $this->categoryService->getPublicBySlug($slug);

        return $this->successResponse($category, 'Category details retrieved successfully.');
    }
}
