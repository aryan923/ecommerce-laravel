<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Return\UpdateReturnStatusRequest;
use App\Models\ReturnRequest;
use App\Services\ReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class ReturnAdminController extends BaseController
{
    protected ReturnService $returnService;

    public function __construct(ReturnService $returnService)
    {
        $this->returnService = $returnService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/returns/stats",
     *     summary="Executive Return & Refund Dashboard KPIs",
     *     tags={"Admin Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Returns dashboard statistics",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="data", type="object")
     *         )
     *     )
     * )
     */
    public function stats(): JsonResponse
    {
        $stats = $this->returnService->getDashboardStats();
        return $this->successResponse($stats, 'Return and refund dashboard stats retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/returns",
     *     summary="Admin list return requests with pagination & filters",
     *     tags={"Admin Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="date_from", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="date_to", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated return requests list")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search', 'date_from', 'date_to', 'sort_by', 'sort_order']);
        $perPage = (int) $request->input('per_page', 15);

        $returns = $this->returnService->listAdminReturns($filters, $perPage);

        return $this->successResponse($returns, 'Return requests list retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/returns/{id}",
     *     summary="Fetch 360-degree admin return detail record",
     *     tags={"Admin Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Return detail record with frozen snapshot data")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $returnRequest = $this->returnService->getAdminReturnDetail($id);

        return $this->successResponse($returnRequest, 'Return request details retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/returns/{id}/status",
     *     summary="Update return status milestone by Admin",
     *     tags={"Admin Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", example="approved"),
     *             @OA\Property(property="notes", type="string", example="Approved for courier pickup")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Return status updated")
     * )
     */
    public function updateStatus(int $id, UpdateReturnStatusRequest $request): JsonResponse
    {
        $admin = $request->user();
        $updatedReturn = $this->returnService->updateReturnStatus(
            $id,
            $request->input('status'),
            $request->input('notes'),
            $admin
        );

        return $this->successResponse($updatedReturn, 'Return status updated successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/returns/{id}/restock",
     *     summary="Restock returned variant items into inventory with double-restock protection",
     *     tags={"Admin Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Items restocked into inventory")
     * )
     */
    public function restock(int $id, Request $request): JsonResponse
    {
        $admin = $request->user();
        $restockedReturn = $this->returnService->restockReturnedItems($id, $admin);

        return $this->successResponse($restockedReturn, 'Returned items restocked successfully into inventory.');
    }
}
