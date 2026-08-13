<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Return\CreateReturnRequest;
use App\Services\ReturnService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReturnController extends BaseController
{
    protected ReturnService $returnService;

    public function __construct(ReturnService $returnService)
    {
        $this->returnService = $returnService;
    }

    /**
     * @OA\Post(
     *     path="/api/v1/customer/returns",
     *     summary="Submit return request for delivered order",
     *     tags={"Customer Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"order_id", "reason", "items"},
     *             @OA\Property(property="order_id", type="integer", example=1),
     *             @OA\Property(property="reason", type="string", example="defective"),
     *             @OA\Property(property="description", type="string", example="Item screen flickering"),
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     required={"order_item_id", "quantity"},
     *                     @OA\Property(property="order_item_id", type="integer", example=1),
     *                     @OA\Property(property="quantity", type="integer", example=1)
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Return request created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Return request submitted successfully."),
     *             @OA\Property(property="data", type="object")
     *         )
     *     ),
     *     @OA\Response(response=422, description="Validation error or return window expired")
     * )
     */
    public function store(CreateReturnRequest $request): JsonResponse
    {
        $user = $request->user();
        $returnRequest = $this->returnService->createReturnRequest($user, $request->validated());

        return $this->successResponse($returnRequest, 'Return request submitted successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/returns",
     *     summary="List authenticated customer return requests",
     *     tags={"Customer Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Paginated return requests list")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = (int) $request->input('per_page', 15);

        $returns = $this->returnService->getCustomerReturns($user, $perPage);

        return $this->successResponse($returns, 'Customer return requests retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/returns/{return_number}",
     *     summary="Fetch customer return request details",
     *     tags={"Customer Returns"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="return_number", in="path", required=true, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Return request details retrieved successfully"),
     *     @OA\Response(response=404, description="Return request not found or unauthorized")
     * )
     */
    public function show(string $returnNumber, Request $request): JsonResponse
    {
        $user = $request->user();
        $returnRequest = $this->returnService->getReturnDetail($user, $returnNumber);

        return $this->successResponse($returnRequest, 'Return request details retrieved successfully.');
    }
}
