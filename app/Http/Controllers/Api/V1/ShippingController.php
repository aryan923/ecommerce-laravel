<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CalculateShippingRequest;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;

class ShippingController extends BaseController
{
    protected ShippingService $shippingService;

    public function __construct(ShippingService $shippingService)
    {
        $this->shippingService = $shippingService;
    }

    /**
     * @OA\Post(
     *     path="/api/v1/shipping/calculate",
     *     summary="Calculate shipping options and costs",
     *     description="Evaluates destination state/postal code against shipping zones and returns available shipping methods and fees.",
     *     tags={"Shipping Engine"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"state_code"},
     *             @OA\Property(property="state_code", type="string", example="MH"),
     *             @OA\Property(property="postal_code", type="string", example="400001"),
     *             @OA\Property(property="subtotal", type="number", format="float", example=1200.00),
     *             @OA\Property(property="total_weight", type="number", format="float", example=1.5)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Shipping options calculated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Shipping options calculated successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="is_deliverable", type="boolean", example=true),
     *                 @OA\Property(
     *                     property="available_methods",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="method_id", type="integer", example=1),
     *                         @OA\Property(property="method_name", type="string", example="Standard Delivery"),
     *                         @OA\Property(property="fee", type="number", format="float", example=50.00),
     *                         @OA\Property(property="is_free", type="boolean", example=false)
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function calculate(CalculateShippingRequest $request): JsonResponse
    {
        $result = $this->shippingService->calculateShippingOptions(
            $request->input('state_code'),
            $request->input('postal_code'),
            (float) $request->input('subtotal', 0.0),
            (float) $request->input('total_weight', 0.0),
            (array) $request->input('items', []),
            $request->input('combination_strategy', 'highest_item_first')
        );

        return $this->successResponse($result, 'Shipping options calculated successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/shipments/track/{tracking_number}",
     *     summary="Track shipment progress",
     *     description="Retrieve public tracking details and timeline log for a shipment.",
     *     tags={"Shipping Engine"},
     *     @OA\Parameter(name="tracking_number", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Shipment tracking details retrieved successfully"),
     *     @OA\Response(response=422, description="Shipment tracking number not found")
     * )
     */
    public function track(string $trackingNumber): JsonResponse
    {
        $shipment = $this->shippingService->trackShipment($trackingNumber);
        return $this->successResponse($shipment, 'Shipment tracking details retrieved successfully.');
    }
}
