<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreShippingMethodRequest;
use App\Http\Requests\Admin\UpdateShippingMethodRequest;
use App\Models\ShippingMethod;
use App\Services\ShippingService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    use ApiResponseTrait;

    protected ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping/methods",
     *     summary="List shipping methods",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="zone_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipping methods retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $methods = $this->shippingService->getAdminMethodsList(
            $request->all(),
            (int) $request->input('per_page', 15)
        );

        return $this->paginatedResponse($methods, 'Shipping methods retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipping/methods",
     *     summary="Create a shipping method",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=201, description="Shipping method created successfully")
     * )
     */
    public function store(StoreShippingMethodRequest $request): JsonResponse
    {
        $method = $this->shippingService->createMethod($request->validated());

        return $this->successResponse($method, 'Shipping method created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipping/methods/{id}",
     *     summary="Get single shipping method",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipping method details retrieved")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $method = ShippingMethod::with(['zone', 'rates'])->findOrFail($id);

        return $this->successResponse($method, 'Shipping method details retrieved.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/shipping/methods/{id}",
     *     summary="Update a shipping method",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipping method updated successfully")
     * )
     */
    public function update(UpdateShippingMethodRequest $request, int $id): JsonResponse
    {
        $method = ShippingMethod::findOrFail($id);
        $updated = $this->shippingService->updateMethod($method, $request->validated());

        return $this->successResponse($updated, 'Shipping method updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/shipping/methods/{id}/status",
     *     summary="Toggle shipping method status",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Status toggled successfully")
     * )
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:active,inactive']);

        $method = ShippingMethod::findOrFail($id);
        $method->update(['status' => $request->input('status')]);

        return $this->successResponse($method->fresh(['zone', 'rates']), 'Shipping method status updated.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/shipping/methods/{id}",
     *     summary="Delete a shipping method",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipping method deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $method = ShippingMethod::findOrFail($id);
        $this->shippingService->deleteMethod($method);

        return $this->successResponse(null, 'Shipping method deleted successfully.');
    }
}
