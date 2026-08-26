<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class PublicProductController extends BaseController
{
    public function __construct(
        protected ProductService $productService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/products",
     *     summary="Get Active Storefront Products Catalog",
     *     description="Retrieve active products with search, category slug, brand slug, price range, sorting, and pagination.",
     *     operationId="getPublicProductsCatalog",
     *     tags={"Storefront Catalog"},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="category", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="brand", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="featured", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="min_price", in="query", required=false, @OA\Schema(type="number")),
     *     @OA\Parameter(name="max_price", in="query", required=false, @OA\Schema(type="number")),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"latest","price_low_high","price_high_low","name_asc"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Products catalog retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category', 'brand', 'featured', 'min_price', 'max_price', 'sort_by']);
        $defaultPerPage = app(\App\Services\StoreSettingsService::class)->getSettingsByGroup('commerce')['products_per_page'] ?? 12;
        $perPage = (int) $request->input('per_page', $defaultPerPage);

        $products = $this->productService->getPublicCatalog($filters, $perPage);

        return $this->paginatedResponse($products, 'Products catalog retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/products/{slug}",
     *     summary="Get Active Product Details by Slug",
     *     description="Retrieve details of an active product including brand, primary category, category breadcrumbs, and related items.",
     *     operationId="getPublicProductBySlug",
     *     tags={"Storefront Catalog"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Product details retrieved successfully"),
     *     @OA\Response(response=404, description="Product not found or inactive")
     * )
     */
    public function show(string $slug): JsonResponse
    {
        $result = $this->productService->getPublicBySlug($slug);

        return $this->successResponse($result, 'Product details retrieved successfully.');
    }
}
