<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreShippingZoneRequest;
use App\Http\Requests\Admin\UpdateShippingZoneRequest;
use App\Models\ShippingZone;
use App\Services\ShippingService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin - Shipping Management",
 *     description="API Endpoints for Managing Shipping Zones, Delivery Methods, and Rates"
 * )
 */
class ShippingZoneController extends Controller
{
    use ApiResponseTrait;

    protected ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping/zones",
     *     summary="List all shipping zones",
     *     description="Retrieve paginated list of geographical shipping zones.",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="is_active", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Shipping zones retrieved successfully"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $zones = $this->shippingService->getAdminZonesList(
            $request->all(),
            (int) $request->input('per_page', 15)
        );

        return $this->paginatedResponse($zones, 'Shipping zones retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipping/zones",
     *     summary="Create a shipping zone",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Domestic Zone"),
     *             @OA\Property(property="description", type="string", example="Mainland shipping"),
     *             @OA\Property(property="countries", type="array", @OA\Items(type="string", example="US")),
     *             @OA\Property(property="is_global", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Shipping zone created successfully")
     * )
     */
    public function store(StoreShippingZoneRequest $request): JsonResponse
    {
        $zone = $this->shippingService->createZone($request->validated());

        return $this->successResponse($zone, 'Shipping zone created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping/zones/{id}",
     *     summary="Get single shipping zone details",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Zone details retrieved successfully"),
     *     @OA\Response(response=404, description="Zone not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $zone = ShippingZone::with(['methods', 'rates'])->findOrFail($id);

        return $this->successResponse($zone, 'Shipping zone details retrieved.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/shipping/zones/{id}",
     *     summary="Update a shipping zone",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping zone updated successfully")
     * )
     */
    public function update(UpdateShippingZoneRequest $request, int $id): JsonResponse
    {
        $zone = ShippingZone::findOrFail($id);
        $updated = $this->shippingService->updateZone($zone, $request->validated());

        return $this->successResponse($updated, 'Shipping zone updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/shipping/zones/{id}",
     *     summary="Delete a shipping zone",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping zone deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $zone = ShippingZone::findOrFail($id);
        $this->shippingService->deleteZone($zone);

        return $this->successResponse(null, 'Shipping zone deleted successfully.');
    }
}
