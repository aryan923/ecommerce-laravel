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
        $shipment = Shipment::with(['order', 'warehouse', 'items.orderItem', 'trackingLogs'])->findOrFail($id);

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
     * Bulk update shipment statuses.
     */
    public function bulkStatus(Request $request): JsonResponse
    {
        $request->validate([
            'shipment_ids' => 'required|array|min:1',
            'shipment_ids.*' => 'integer|exists:shipments,id',
            'status' => 'required|string',
        ]);

        $count = $this->shipmentService->bulkUpdateStatus(
            $request->input('shipment_ids'),
            $request->input('status')
        );

        return $this->successResponse(['updated_count' => $count], "Bulk updated {$count} shipments successfully.");
    }

    /**
     * Generate courier pickup manifest for selected shipments.
     */
    public function manifest(Request $request): JsonResponse
    {
        $request->validate([
            'shipment_ids' => 'required|array|min:1',
            'shipment_ids.*' => 'integer|exists:shipments,id',
        ]);

        $manifestData = $this->shipmentService->generatePickupManifest($request->input('shipment_ids'));

        return $this->successResponse($manifestData, 'Courier pickup manifest generated successfully.');
    }

    /**
     * Test postal code/country serviceability against active shipping zones.
     */
    public function checkServiceability(Request $request): JsonResponse
    {
        $request->validate([
            'country_code' => 'required|string|max:10',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $result = $this->shipmentService->checkServiceability(
            $request->input('country_code'),
            $request->input('postal_code')
        );

        return $this->successResponse($result, 'Serviceability check performed successfully.');
    }

    /**
     * Get fulfillment analytics KPI metrics.
     */
    public function analytics(): JsonResponse
    {
        $data = $this->shipmentService->getFulfillmentAnalytics();

        return $this->successResponse($data, 'Fulfillment analytics retrieved successfully.');
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
