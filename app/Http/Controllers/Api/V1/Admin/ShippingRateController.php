<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreShippingRateRequest;
use App\Models\ShippingRate;
use Illuminate\Http\JsonResponse;

class ShippingRateController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping-rates",
     *     summary="List shipping rates",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipping rates retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $rates = ShippingRate::with(['zone', 'method'])->get();
        return $this->successResponse($rates, 'Shipping rates retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipping-rates",
     *     summary="Create shipping rate",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"zone_id", "method_id", "rate_type", "rate_value"},
     *             @OA\Property(property="zone_id", type="integer", example=1),
     *             @OA\Property(property="method_id", type="integer", example=1),
     *             @OA\Property(property="rate_type", type="string", enum={"flat_rate", "weight_based", "order_value_based", "free_shipping"}, example="flat_rate"),
     *             @OA\Property(property="rate_value", type="number", format="float", example=50.00),
     *             @OA\Property(property="free_threshold", type="number", format="float", example=999.00)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Shipping rate created successfully")
     * )
     */
    public function store(StoreShippingRateRequest $request): JsonResponse
    {
        $rate = ShippingRate::create($request->validated());
        return $this->successResponse($rate, 'Shipping rate created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping-rates/{id}",
     *     summary="Get single shipping rate",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping rate details retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $rate = ShippingRate::with(['zone', 'method'])->findOrFail($id);
        return $this->successResponse($rate, 'Shipping rate details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/shipping-rates/{id}",
     *     summary="Update shipping rate",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping rate updated successfully")
     * )
     */
    public function update(StoreShippingRateRequest $request, int $id): JsonResponse
    {
        $rate = ShippingRate::findOrFail($id);
        $rate->update($request->validated());
        return $this->successResponse($rate, 'Shipping rate updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/shipping-rates/{id}",
     *     summary="Delete shipping rate",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping rate deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $rate = ShippingRate::findOrFail($id);
        $rate->delete();
        return $this->successResponse(null, 'Shipping rate deleted successfully.');
    }
}
