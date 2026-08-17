<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreCouponRequest;
use App\Http\Requests\Admin\UpdateCouponRequest;
use App\Models\Coupon;
use App\Services\CouponService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends BaseController
{
    use ApiResponseTrait;

    protected CouponService $couponService;

    public function __construct(CouponService $couponService)
    {
        $this->couponService = $couponService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/coupons",
     *     summary="List coupons",
     *     description="Retrieve paginated list of coupons with optional search, type, and status filtering.",
     *     tags={"Admin - Coupons"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"percentage", "fixed_amount", "free_shipping"})),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"active", "inactive", "archived"})),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", default="id")),
     *     @OA\Parameter(name="sort_order", in="query", required=false, @OA\Schema(type="string", enum={"asc", "desc"}, default="desc")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Coupons listed successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $coupons = $this->couponService->getAdminCouponsList(
            $request->all(),
            (int) $request->input('per_page', 15)
        );

        return $this->paginatedResponse($coupons, 'Coupons retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/coupons",
     *     summary="Create a new coupon",
     *     description="Create a promo coupon with rules, date validity, limits, and product/category/brand/customer restrictions.",
     *     tags={"Admin - Coupons"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"code", "name", "type", "value"},
     *             @OA\Property(property="code", type="string", example="WELCOME20"),
     *             @OA\Property(property="name", type="string", example="Welcome 20% Discount"),
     *             @OA\Property(property="type", type="string", enum={"percentage", "fixed_amount", "free_shipping"}, example="percentage"),
     *             @OA\Property(property="value", type="number", format="float", example=20.00),
     *             @OA\Property(property="max_discount", type="number", format="float", example=500.00),
     *             @OA\Property(property="min_order_value", type="number", format="float", example=1000.00)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Coupon created successfully")
     * )
     */
    public function store(StoreCouponRequest $request): JsonResponse
    {
        $coupon = $this->couponService->createCoupon($request->validated());
        return $this->successResponse($coupon, 'Coupon created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/coupons/{id}",
     *     summary="Get single coupon details",
     *     tags={"Admin - Coupons"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Coupon details retrieved successfully"),
     *     @OA\Response(response=404, description="Coupon not found")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $coupon = Coupon::with(['products', 'categories', 'brands', 'customers', 'usages'])->findOrFail($id);
        return $this->successResponse($coupon, 'Coupon details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/coupons/{id}",
     *     summary="Update coupon",
     *     tags={"Admin - Coupons"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Coupon updated successfully")
     * )
     */
    public function update(UpdateCouponRequest $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $updatedCoupon = $this->couponService->updateCoupon($coupon, $request->validated());
        return $this->successResponse($updatedCoupon, 'Coupon updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/coupons/{id}",
     *     summary="Archive / delete coupon",
     *     tags={"Admin - Coupons"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Coupon archived successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $this->couponService->deleteCoupon($coupon);
        return $this->successResponse(null, 'Coupon archived successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/coupons/{id}/status",
     *     summary="Toggle coupon status",
     *     tags={"Admin - Coupons"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active", "inactive", "archived"}, example="inactive")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Coupon status updated successfully")
     * )
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:active,inactive,archived'],
        ]);

        $coupon = Coupon::findOrFail($id);
        $updatedCoupon = $this->couponService->toggleStatus($coupon, $request->input('status'));

        return $this->successResponse($updatedCoupon, 'Coupon status updated successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/coupons/{id}/reports",
     *     summary="Get coupon performance and usage report",
     *     tags={"Admin - Coupons"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Coupon usage report generated successfully")
     * )
     */
    public function report(int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $reportData = $this->couponService->getReport($coupon);

        return $this->successResponse($reportData, 'Coupon usage report generated successfully.');
    }
}
