<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTaxClassRequest;
use App\Http\Requests\Admin\UpdateTaxClassRequest;
use App\Models\TaxClass;
use App\Services\TaxService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin - Tax Management",
 *     description="API Endpoints for Managing Store Tax Classes and GST Configurations"
 * )
 */
class TaxClassController extends Controller
{
    use ApiResponseTrait;

    protected TaxService $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-classes",
     *     summary="List all tax classes",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Tax classes retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $taxClasses = $this->taxService->getAdminTaxClasses(
            $request->all(),
            (int) $request->input('per_page', 15)
        );

        return $this->paginatedResponse($taxClasses, 'Tax classes retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/tax-classes",
     *     summary="Create a new tax class",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=201, description="Tax class created successfully")
     * )
     */
    public function store(StoreTaxClassRequest $request): JsonResponse
    {
        $taxClass = $this->taxService->createTaxClass($request->validated());

        return $this->successResponse($taxClass, 'Tax class created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-classes/{id}",
     *     summary="Get single tax class details",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax class details retrieved")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $taxClass = TaxClass::with('rates')->findOrFail($id);

        return $this->successResponse($taxClass, 'Tax class details retrieved.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/tax-classes/{id}",
     *     summary="Update a tax class",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax class updated successfully")
     * )
     */
    public function update(UpdateTaxClassRequest $request, int $id): JsonResponse
    {
        $taxClass = TaxClass::findOrFail($id);
        $updated = $this->taxService->updateTaxClass($taxClass, $request->validated());

        return $this->successResponse($updated, 'Tax class updated successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/tax-classes/{id}/set-default",
     *     summary="Set tax class as system default",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Default tax class updated successfully")
     * )
     */
    public function setDefault(int $id): JsonResponse
    {
        $taxClass = TaxClass::findOrFail($id);
        $updated = $this->taxService->setTaxClassDefault($taxClass);

        return $this->successResponse($updated, 'Default tax class updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/tax-classes/{id}",
     *     summary="Delete a tax class",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax class deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $taxClass = TaxClass::findOrFail($id);
        $this->taxService->deleteTaxClass($taxClass);

        return $this->successResponse(null, 'Tax class deleted successfully.');
    }
}
