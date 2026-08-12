<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreTaxRateRequest;
use App\Models\TaxRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxRateController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-rates",
     *     summary="List tax rates",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Tax rates retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $taxRates = TaxRate::with('taxClass')->get();
        return $this->successResponse($taxRates, 'Tax rates retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/tax-rates",
     *     summary="Create tax rate",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"tax_class_id", "name", "type", "rate"},
     *             @OA\Property(property="tax_class_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="CGST 9%"),
     *             @OA\Property(property="type", type="string", enum={"cgst", "sgst", "igst", "flat", "standard"}, example="cgst"),
     *             @OA\Property(property="rate", type="number", format="float", example=9.00),
     *             @OA\Property(property="state_code", type="string", example="MH")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tax rate created successfully")
     * )
     */
    public function store(StoreTaxRateRequest $request): JsonResponse
    {
        $taxRate = TaxRate::create($request->validated());
        return $this->successResponse($taxRate, 'Tax rate created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-rates/{id}",
     *     summary="Get single tax rate",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax rate details retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $taxRate = TaxRate::with('taxClass')->findOrFail($id);
        return $this->successResponse($taxRate, 'Tax rate details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/tax-rates/{id}",
     *     summary="Update tax rate",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax rate updated successfully")
     * )
     */
    public function update(StoreTaxRateRequest $request, int $id): JsonResponse
    {
        $taxRate = TaxRate::findOrFail($id);
        $taxRate->update($request->validated());
        return $this->successResponse($taxRate, 'Tax rate updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/tax-rates/{id}",
     *     summary="Delete tax rate",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax rate deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $taxRate = TaxRate::findOrFail($id);
        $taxRate->delete();
        return $this->successResponse(null, 'Tax rate deleted successfully.');
    }
}
