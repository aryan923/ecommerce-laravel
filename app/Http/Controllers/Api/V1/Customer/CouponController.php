<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Customer\ValidateCouponRequest;
use App\Services\CouponService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class CouponController extends BaseController
{
    use ApiResponseTrait;

    protected CouponService $couponService;

    public function __construct(CouponService $couponService)
    {
        $this->couponService = $couponService;
    }

    /**
     * @OA\Post(
     *     path="/api/v1/coupons/validate",
     *     summary="Validate promo coupon code",
     *     description="Validates a promo coupon code against active rules, date ranges, usage limits, minimum order subtotal, and calculates the resulting discount.",
     *     tags={"Coupons"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"code"},
     *             @OA\Property(property="code", type="string", example="WELCOME10"),
     *             @OA\Property(property="subtotal", type="number", format="float", example=1500.00),
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="product_id", type="integer", example=1),
     *                     @OA\Property(property="total", type="number", format="float", example=1500.00)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Coupon is valid and discount calculated",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Coupon code is valid."),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="is_valid", type="boolean", example=true),
     *                 @OA\Property(property="eligible_subtotal", type="number", format="float", example=1500.00),
     *                 @OA\Property(property="discount_amount", type="number", format="float", example=150.00),
     *                 @OA\Property(property="free_shipping", type="boolean", example=false)
     *             )
     *         )
     *     ),
     *     @OA\Response(response=422, description="Invalid or expired coupon code")
     * )
     */
    public function validateCode(ValidateCouponRequest $request): JsonResponse
    {
        $userId = auth('sanctum')->id();
        $subtotal = (float) $request->input('subtotal', 0.0);
        $items = $request->input('items', []);

        $result = $this->couponService->validateAndCalculate(
            $request->input('code'),
            $subtotal,
            $items,
            $userId
        );

        return $this->successResponse($result, 'Coupon code is valid.');
    }
}
