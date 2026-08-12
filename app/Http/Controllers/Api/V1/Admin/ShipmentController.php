<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreShipmentRequest;
use App\Models\Shipment;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShipmentController extends BaseController
{
    protected ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipments",
     *     summary="List shipments",
     *     tags={"Admin - Shipment Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Shipments listed successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Shipment::with('trackingLogs');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = (int) $request->input('per_page', 15);
        $shipments = $query->orderBy('id', 'desc')->paginate($perPage);

        return $this->paginatedResponse($shipments, 'Shipments retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipments",
     *     summary="Create shipment & generate AWB",
     *     tags={"Admin - Shipment Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"courier_name"},
     *             @OA\Property(property="courier_name", type="string", example="Delhivery"),
     *             @OA\Property(property="awb_number", type="string", example="DL123456789"),
     *             @OA\Property(property="tracking_number", type="string", example="TRK987654")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Shipment created successfully")
     * )
     */
    public function store(StoreShipmentRequest $request): JsonResponse
    {
        $shipment = $this->shippingService->createShipment($request->validated());
        return $this->successResponse($shipment, 'Shipment created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/shipments/{id}",
     *     summary="Get single shipment details",
     *     tags={"Admin - Shipment Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Shipment details retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $shipment = Shipment::with('trackingLogs')->findOrFail($id);
        return $this->successResponse($shipment, 'Shipment details retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/shipments/{id}/tracking",
     *     summary="Add tracking log event to shipment",
     *     tags={"Admin - Shipment Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", example="in_transit"),
     *             @OA\Property(property="location", type="string", example="Mumbai Hub"),
     *             @OA\Property(property="description", type="string", example="Dispatched from sorting facility")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Tracking log added successfully")
     * )
     */
    public function addTracking(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $shipment = Shipment::findOrFail($id);
        $log = $this->shippingService->addTrackingLog($shipment, $request->only(['status', 'location', 'description']));

        return $this->successResponse($log, 'Tracking log added successfully.');
    }
}
