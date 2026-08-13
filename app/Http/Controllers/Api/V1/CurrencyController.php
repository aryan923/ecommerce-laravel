<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/currencies",
     *     summary="List Active Store Currencies",
     *     description="Retrieve all active store currencies with symbols and exchange rates relative to INR base.",
     *     operationId="getPublicCurrencies",
     *     tags={"Storefront Catalog & Currency"},
     *     @OA\Response(response=200, description="List of active currencies retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $currencies = Currency::active()->orderBy('is_default', 'desc')->get();

        return $this->successResponse($currencies, 'Active currencies retrieved successfully.');
    }
}
