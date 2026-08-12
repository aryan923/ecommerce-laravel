<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreShippingZoneRequest;
use App\Models\ShippingZone;
use Illuminate\Http\JsonResponse;

class ShippingZoneController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping-zones",
     *     summary="List shipping zones",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipping zones retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $zones = ShippingZone::with('rates.method')->get();
        return $this->successResponse($zones, 'Shipping zones retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipping-zones",
     *     summary="Create shipping zone",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Local MH Zone"),
     *             @OA\Property(property="states", type="array", @OA\Items(type="string"), example={"MH"}),
     *             @OA\Property(property="postal_codes", type="array", @OA\Items(type="string"), example={"400001", "400002"})
     *         )
     *     ),
     *     @OA\Response(response=201, description="Shipping zone created successfully")
     * )
     */
    public function store(StoreShippingZoneRequest $request): JsonResponse
    {
        $zone = ShippingZone::create($request->validated());
        return $this->successResponse($zone, 'Shipping zone created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping-zones/{id}",
     *     summary="Get single shipping zone",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping zone details retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $zone = ShippingZone::with('rates.method')->findOrFail($id);
        return $this->successResponse($zone, 'Shipping zone details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/shipping-zones/{id}",
     *     summary="Update shipping zone",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping zone updated successfully")
     * )
     */
    public function update(StoreShippingZoneRequest $request, int $id): JsonResponse
    {
        $zone = ShippingZone::findOrFail($id);
        $zone->update($request->validated());
        return $this->successResponse($zone, 'Shipping zone updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/shipping-zones/{id}",
     *     summary="Delete shipping zone",
     *     tags={"Admin - Shipping Engine"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping zone deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $zone = ShippingZone::findOrFail($id);
        $zone->delete();
        return $this->successResponse(null, 'Shipping zone deleted successfully.');
    }
}
