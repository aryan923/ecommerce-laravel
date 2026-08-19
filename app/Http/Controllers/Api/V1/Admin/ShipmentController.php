<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateShipmentRequest;
use App\Http\Requests\Admin\UpdateShipmentStatusRequest;
use App\Models\Shipment;
use App\Services\ShipmentService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    use ApiResponseTrait;

    protected ShipmentService $shipmentService;

    public function __construct(ShipmentService $shipmentService)
    {
        $this->shipmentService = $shipmentService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipments",
     *     summary="List all order shipments",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Shipments retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $shipments = $this->shipmentService->getAdminShipmentsList(
            $request->all(),
            (int) $request->input('per_page', 15)
        );

        return $this->paginatedResponse($shipments, 'Order shipments retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipments",
     *     summary="Dispatch items and create shipment for order",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=201, description="Shipment created & items dispatched")
     * )
     */
    public function store(CreateShipmentRequest $request): JsonResponse
    {
        $shipment = $this->shipmentService->createOrderShipment($request->validated());

        return $this->successResponse($shipment, 'Order shipment created & items dispatched.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipments/{id}",
     *     summary="Get single shipment details and tracking timeline",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipment details retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $shipment = Shipment::with(['order', 'items.orderItem', 'trackingLogs'])->findOrFail($id);

        return $this->successResponse($shipment, 'Shipment details retrieved successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/shipments/{id}/status",
     *     summary="Update shipment status and add tracking timeline event",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Shipment status updated successfully")
     * )
     */
    public function updateStatus(UpdateShipmentStatusRequest $request, int $id): JsonResponse
    {
        $shipment = Shipment::findOrFail($id);
        $updated = $this->shipmentService->updateShipmentStatus($shipment, $request->validated());

        return $this->successResponse($updated, 'Shipment status updated successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipments/{id}/label",
     *     summary="Get packing slip and shipping label payload",
     *     tags={"Admin - Shipping Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Label payload generated successfully")
     * )
     */
    public function label(int $id): JsonResponse
    {
        $shipment = Shipment::findOrFail($id);
        $labelData = $this->shipmentService->generatePackingSlipLabel($shipment);

        return $this->successResponse($labelData, 'Shipping label & packing slip generated.');
    }
}
