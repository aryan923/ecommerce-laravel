<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class PublicBrandController extends BaseController
{
    public function __construct(
        protected BrandService $brandService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/brands",
     *     summary="Get Active Brands List (Public)",
     *     description="Retrieve active brands list for storefront.",
     *     operationId="getPublicBrandsList",
     *     tags={"Storefront Catalog"},
     *     @OA\Response(response=200, description="Active brands list retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $brands = $this->brandService->getPublicList();

        return $this->successResponse($brands, 'Public brands retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/brands/{slug}",
     *     summary="Get Brand Details by Slug (Public)",
     *     description="Retrieve active brand details by slug.",
     *     operationId="getPublicBrandBySlug",
     *     tags={"Storefront Catalog"},
     *     @OA\Parameter(name="slug", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Brand details retrieved successfully"),
     *     @OA\Response(response=404, description="Brand not found")
     * )
     */
    public function show(string $slug): JsonResponse
    {
        $brand = $this->brandService->getPublicBySlug($slug);

        return $this->successResponse($brand, 'Brand details retrieved successfully.');
    }
}
