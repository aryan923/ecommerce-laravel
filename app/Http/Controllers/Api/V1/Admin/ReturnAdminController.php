<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Return\UpdateReturnStatusRequest;
use App\Models\ReturnRequest;
use App\Services\ReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnAdminController extends BaseController
{
    protected ReturnService $returnService;

    public function __construct(ReturnService $returnService)
    {
        $this->returnService = $returnService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/returns",
     *     summary="Admin list return requests with pagination & filters",
     *     tags={"Admin Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Paginated return requests list")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search']);
        $perPage = (int) $request->input('per_page', 15);

        $returns = $this->returnService->listAdminReturns($filters, $perPage);

        return $this->successResponse($returns, 'Return requests list retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/returns/{id}",
     *     summary="Fetch admin return detail record",
     *     tags={"Admin Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Return detail record")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $returnRequest = ReturnRequest::with(['order', 'user', 'items.variant.product', 'refunds'])->findOrFail($id);

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
     *             @OA\Property(property="notes", type="string", example="Approved for pickup")
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
     *     summary="Restock returned variant items into inventory",
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
