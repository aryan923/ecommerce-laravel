<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreTaxClassRequest;
use App\Models\TaxClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxClassController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-classes",
     *     summary="List tax classes",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Tax classes retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $taxClasses = TaxClass::with('rates')->get();
        return $this->successResponse($taxClasses, 'Tax classes retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/tax-classes",
     *     summary="Create tax class",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Standard GST 18%"),
     *             @OA\Property(property="description", type="string", example="Standard rate for electronics")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Tax class created successfully")
     * )
     */
    public function store(StoreTaxClassRequest $request): JsonResponse
    {
        $taxClass = TaxClass::create($request->validated());
        return $this->successResponse($taxClass, 'Tax class created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax-classes/{id}",
     *     summary="Get single tax class",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax class details retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $taxClass = TaxClass::with('rates')->findOrFail($id);
        return $this->successResponse($taxClass, 'Tax class details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/tax-classes/{id}",
     *     summary="Update tax class",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax class updated successfully")
     * )
     */
    public function update(StoreTaxClassRequest $request, int $id): JsonResponse
    {
        $taxClass = TaxClass::findOrFail($id);
        $taxClass->update($request->validated());
        return $this->successResponse($taxClass, 'Tax class updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/tax-classes/{id}",
     *     summary="Delete tax class",
     *     tags={"Admin - Tax Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Tax class deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $taxClass = TaxClass::findOrFail($id);
        $taxClass->delete();
        return $this->successResponse(null, 'Tax class deleted successfully.');
    }
}
