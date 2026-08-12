<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\CalculateTaxRequest;
use App\Services\TaxService;
use Illuminate\Http\JsonResponse;

class TaxController extends BaseController
{
    protected TaxService $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
    }

    /**
     * @OA\Post(
     *     path="/api/v1/tax/calculate",
     *     summary="Calculate Tax / GST for line items",
     *     description="Calculates intra-state (CGST+SGST) vs inter-state (IGST) taxes and handles inclusive/exclusive price math.",
     *     tags={"Tax Engine"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"shipping_state_code", "items"},
     *             @OA\Property(property="shipping_state_code", type="string", example="MH"),
     *             @OA\Property(property="origin_state_code", type="string", example="MH"),
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="product_id", type="integer", example=1),
     *                     @OA\Property(property="amount", type="number", format="float", example=1000.00),
     *                     @OA\Property(property="quantity", type="integer", example=1)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Tax breakdown calculated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Tax calculated successfully."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="cgst_amount", type="number", format="float", example=90.00),
     *                 @OA\Property(property="sgst_amount", type="number", format="float", example=90.00),
     *                 @OA\Property(property="igst_amount", type="number", format="float", example=0.00),
     *                 @OA\Property(property="total_tax", type="number", format="float", example=180.00)
     *             )
     *         )
     *     )
     * )
     */
    public function calculate(CalculateTaxRequest $request): JsonResponse
    {
        $result = $this->taxService->calculateTax(
            $request->input('items'),
            $request->input('shipping_state_code'),
            $request->input('origin_state_code')
        );

        return $this->successResponse($result, 'Tax calculated successfully.');
    }
}
