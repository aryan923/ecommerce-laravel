<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreShippingMethodRequest;
use App\Models\ShippingMethod;
use Illuminate\Http\JsonResponse;

class ShippingMethodController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping-methods",
     *     summary="List shipping methods",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipping methods retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $methods = ShippingMethod::with('rates.zone')->get();
        return $this->successResponse($methods, 'Shipping methods retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipping-methods",
     *     summary="Create shipping method",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "type"},
     *             @OA\Property(property="name", type="string", example="Standard Delivery"),
     *             @OA\Property(property="type", type="string", enum={"standard", "express", "same_day", "pickup"}, example="standard"),
     *             @OA\Property(property="estimated_days", type="string", example="3-5 business days")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Shipping method created successfully")
     * )
     */
    public function store(StoreShippingMethodRequest $request): JsonResponse
    {
        $method = ShippingMethod::create($request->validated());
        return $this->successResponse($method, 'Shipping method created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping-methods/{id}",
     *     summary="Get single shipping method",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping method details retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $method = ShippingMethod::with('rates.zone')->findOrFail($id);
        return $this->successResponse($method, 'Shipping method details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/shipping-methods/{id}",
     *     summary="Update shipping method",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping method updated successfully")
     * )
     */
    public function update(StoreShippingMethodRequest $request, int $id): JsonResponse
    {
        $method = ShippingMethod::findOrFail($id);
        $method->update($request->validated());
        return $this->successResponse($method, 'Shipping method updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/shipping-methods/{id}",
     *     summary="Delete shipping method",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping method deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $method = ShippingMethod::findOrFail($id);
        $method->delete();
        return $this->successResponse(null, 'Shipping method deleted successfully.');
    }
}
