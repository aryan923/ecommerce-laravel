<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class BrandController extends BaseController
{
    public function __construct(
        protected BrandService $brandService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/brands",
     *     summary="List Brands (Admin)",
     *     description="Retrieve paginated list of brands with search and status filters.",
     *     operationId="adminListBrands",
     *     tags={"Admin Brand Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"active","inactive"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Brands retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status']);
        $perPage = (int) $request->input('per_page', 15);

        $brands = $this->brandService->list($filters, $perPage);

        return $this->paginatedResponse($brands, 'Brands retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/brands",
     *     summary="Create Brand",
     *     description="Create a new brand profile.",
     *     operationId="adminCreateBrand",
     *     tags={"Admin Brand Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Apple"),
     *             @OA\Property(property="website", type="string", example="https://apple.com"),
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="active")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Brand created successfully")
     * )
     */
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand = $this->brandService->create($request->validated());

        return $this->successResponse($brand, 'Brand created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/brands/{id}",
     *     summary="View Brand Details",
     *     description="Retrieve details of a single brand.",
     *     operationId="adminShowBrand",
     *     tags={"Admin Brand Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Brand details retrieved successfully")
     * )
     */
    public function show(Brand $brand): JsonResponse
    {
        return $this->successResponse($brand, 'Brand details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/brands/{id}",
     *     summary="Update Brand",
     *     description="Update brand properties.",
     *     operationId="adminUpdateBrand",
     *     tags={"Admin Brand Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Apple Inc.")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Brand updated successfully")
     * )
     */
    public function update(UpdateBrandRequest $request, Brand $brand): JsonResponse
    {
        $updatedBrand = $this->brandService->update($brand, $request->validated());

        return $this->successResponse($updatedBrand, 'Brand updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/brands/{id}/status",
     *     summary="Toggle Brand Status",
     *     description="Toggle brand status to active or inactive.",
     *     operationId="adminToggleBrandStatus",
     *     tags={"Admin Brand Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="inactive")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Brand status updated successfully")
     * )
     */
    public function toggleStatus(Request $request, Brand $brand): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,inactive'],
        ]);

        $updatedBrand = $this->brandService->toggleStatus($brand, $request->input('status'));

        return $this->successResponse($updatedBrand, 'Brand status updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/brands/{id}",
     *     summary="Delete Brand",
     *     description="Delete a brand profile.",
     *     operationId="adminDeleteBrand",
     *     tags={"Admin Brand Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Brand deleted successfully")
     * )
     */
    public function destroy(Brand $brand): JsonResponse
    {
        $this->brandService->delete($brand);

        return $this->successResponse(null, 'Brand deleted successfully.');
    }
}
