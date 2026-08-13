<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\AdminDashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends BaseController
{
    protected AdminDashboardService $dashboardService;

    public function __construct(AdminDashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/dashboard/kpis",
     *     summary="Fetch executive real-time summary KPI metrics",
     *     tags={"Admin Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="KPI summary metrics retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Dashboard KPIs retrieved successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function kpis(): JsonResponse
    {
        $kpis = $this->dashboardService->getKpis();

        return $this->successResponse($kpis, 'Dashboard KPIs retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/dashboard/sales-chart",
     *     summary="Fetch sales chart analytics time-series data with period filtering",
     *     tags={"Admin Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="period", in="query", required=false, @OA\Schema(type="string", enum={"today", "yesterday", "last_7_days", "last_30_days", "this_month", "last_month", "custom"}, default="last_30_days")),
     *     @OA\Parameter(name="start_date", in="query", required=false, description="Start date (YYYY-MM-DD)", @OA\Schema(type="string")),
     *     @OA\Parameter(name="end_date", in="query", required=false, description="End date (YYYY-MM-DD)", @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Sales chart data retrieved successfully")
     * )
     */
    public function salesChart(Request $request): JsonResponse
    {
        $filters = $request->only(['period', 'start_date', 'end_date']);
        $chartData = $this->dashboardService->getSalesChart($filters);

        return $this->successResponse($chartData, 'Sales chart analytics retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/dashboard/order-stats",
     *     summary="Fetch order count distribution across lifecycle statuses",
     *     tags={"Admin Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Order statistics retrieved successfully")
     * )
     */
    public function orderStats(): JsonResponse
    {
        $orderStats = $this->dashboardService->getOrderStats();

        return $this->successResponse($orderStats, 'Order statistics retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/dashboard/top-performers",
     *     summary="Fetch top performing products and categories",
     *     tags={"Admin Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="limit", in="query", required=false, @OA\Schema(type="integer", default=5)),
     *     @OA\Response(response=200, description="Top performers retrieved successfully")
     * )
     */
    public function topPerformers(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 5);
        $topPerformers = $this->dashboardService->getTopPerformers($limit);

        return $this->successResponse($topPerformers, 'Top performers retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/dashboard/highlights",
     *     summary="Fetch recent orders and low-stock highlights",
     *     tags={"Admin Dashboard"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="limit", in="query", required=false, @OA\Schema(type="integer", default=5)),
     *     @OA\Response(response=200, description="Dashboard highlights retrieved successfully")
     * )
     */
    public function highlights(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 5);
        $highlights = $this->dashboardService->getHighlights($limit);

        return $this->successResponse($highlights, 'Dashboard highlights retrieved successfully.');
    }
}
