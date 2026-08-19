<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTaxRateRequest;
use App\Http\Requests\Admin\UpdateTaxRateRequest;
use App\Models\TaxRate;
use App\Services\TaxService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin - Tax Management",
 *     description="API Endpoints for Managing Tax Component Rates"
 * )
 */
class TaxRateController extends Controller
{
    use ApiResponseTrait;

    protected TaxService $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-rates",
     *     summary="List all tax rates",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="tax_class_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Tax rates retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $rates = $this->taxService->getAdminTaxRates(
            $request->all(),
            (int) $request->input('per_page', 15)
        );

        return $this->paginatedResponse($rates, 'Tax rates retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/tax-rates",
     *     summary="Create a new tax rate",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=201, description="Tax rate created successfully")
     * )
     */
    public function store(StoreTaxRateRequest $request): JsonResponse
    {
        $rate = $this->taxService->createTaxRate($request->validated());

        return $this->successResponse($rate, 'Tax rate created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-rates/{id}",
     *     summary="Get single tax rate details",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax rate details retrieved")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $rate = TaxRate::with('taxClass')->findOrFail($id);

        return $this->successResponse($rate, 'Tax rate details retrieved.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/tax-rates/{id}",
     *     summary="Update a tax rate",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax rate updated successfully")
     * )
     */
    public function update(UpdateTaxRateRequest $request, int $id): JsonResponse
    {
        $rate = TaxRate::findOrFail($id);
        $updated = $this->taxService->updateTaxRate($rate, $request->validated());

        return $this->successResponse($updated, 'Tax rate updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/tax-rates/{id}",
     *     summary="Delete a tax rate",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax rate deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $rate = TaxRate::findOrFail($id);
        $this->taxService->deleteTaxRate($rate);

        return $this->successResponse(null, 'Tax rate deleted successfully.');
    }
}
