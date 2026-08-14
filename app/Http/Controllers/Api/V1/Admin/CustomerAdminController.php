<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AddCustomerNoteRequest;
use App\Http\Requests\Admin\UpdateCustomerRequest;
use App\Http\Requests\Admin\UpdateCustomerStatusRequest;
use App\Services\CustomerAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin Customer Management",
 *     description="API Endpoints for Admin Customer management, metrics, status control, profile views, history tabs, and CSV exports"
 * )
 */
class CustomerAdminController extends Controller
{
    protected CustomerAdminService $customerService;

    public function __construct(CustomerAdminService $customerService)
    {
        $this->customerService = $customerService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/stats",
     *     summary="Get Executive Customer KPI Metrics",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Customer stats summary fetched successfully"
     *     )
     * )
     */
    public function stats(): JsonResponse
    {
        $stats = $this->customerService->getStats();

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers",
     *     summary="Get Paginated Customer Listing",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"active","suspended","disabled"})),
     *     @OA\Parameter(name="registered_from", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="registered_to", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"latest","oldest","name_asc","total_orders","total_spent"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(
     *         response=200,
     *         description="Customer list retrieved successfully"
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $customers = $this->customerService->list($request->all(), $perPage);

        return response()->json([
            'success' => true,
            'data' => $customers->items(),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}",
     *     summary="Get Single Customer Profile with Aggregated Metrics",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Customer profile retrieved successfully"
     *     )
     * )
     */
    public function show(int $id): JsonResponse
    {
        $customer = $this->customerService->getProfile($id);

        return response()->json([
            'success' => true,
            'data' => $customer,
        ]);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/customers/{id}",
     *     summary="Update Customer Basic Information",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string"),
     *             @OA\Property(property="mobile", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Customer profile updated successfully"
     *     )
     * )
     */
    public function update(UpdateCustomerRequest $request, int $id): JsonResponse
    {
        $customer = $this->customerService->update($id, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Customer profile updated successfully.',
            'data' => $customer,
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/customers/{id}/status",
     *     summary="Toggle Customer Account Status",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active","suspended","disabled"}),
     *             @OA\Property(property="reason", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Customer status updated successfully"
     *     )
     * )
     */
    public function updateStatus(UpdateCustomerStatusRequest $request, int $id): JsonResponse
    {
        $status = $request->input('status');
        $reason = $request->input('reason');
        $customer = $this->customerService->updateStatus($id, $status, $reason);

        return response()->json([
            'success' => true,
            'message' => "Customer account status updated to {$status}.",
            'data' => $customer,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/orders",
     *     summary="Fetch Customer Purchase Order History",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Customer orders fetched successfully"
     *     )
     * )
     */
    public function orders(Request $request, int $id): JsonResponse
    {
        $orders = $this->customerService->getOrders($id, (int) $request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/addresses",
     *     summary="Fetch Customer Saved Addresses",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Customer addresses fetched successfully"
     *     )
     * )
     */
    public function addresses(int $id): JsonResponse
    {
        $addresses = $this->customerService->getAddresses($id);

        return response()->json([
            'success' => true,
            'data' => $addresses,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/reviews",
     *     summary="Fetch Customer Product Reviews",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Customer reviews fetched successfully"
     *     )
     * )
     */
    public function reviews(Request $request, int $id): JsonResponse
    {
        $reviews = $this->customerService->getReviews($id, (int) $request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/returns",
     *     summary="Fetch Customer Return Requests",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Customer return requests fetched successfully"
     *     )
     * )
     */
    public function returns(Request $request, int $id): JsonResponse
    {
        $returns = $this->customerService->getReturns($id, (int) $request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $returns->items(),
            'meta' => [
                'current_page' => $returns->currentPage(),
                'last_page' => $returns->lastPage(),
                'per_page' => $returns->perPage(),
                'total' => $returns->total(),
            ],
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/notes",
     *     summary="Fetch Internal Staff Notes for Customer",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Customer internal notes fetched successfully"
     *     )
     * )
     */
    public function getNotes(int $id): JsonResponse
    {
        $notes = $this->customerService->getNotes($id);

        return response()->json([
            'success' => true,
            'data' => $notes,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/customers/{id}/notes",
     *     summary="Add Internal Staff Note to Customer Profile",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"note"},
     *             @OA\Property(property="note", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Internal note created successfully"
     *     )
     * )
     */
    public function addNote(AddCustomerNoteRequest $request, int $id): JsonResponse
    {
        $adminId = (int) ($request->user()->id ?? 1);
        $note = $this->customerService->addNote($id, $request->input('note'), $adminId);

        return response()->json([
            'success' => true,
            'message' => 'Internal staff note recorded successfully.',
            'data' => $note->load('adminUser:id,name,email'),
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/customers/{id}/reset-password",
     *     summary="Trigger Password Reset Notification Link",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Password reset notification dispatched"
     *     )
     * )
     */
    public function resetPassword(int $id): JsonResponse
    {
        $result = $this->customerService->resetPassword($id);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'data' => $result,
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/export",
     *     summary="Export Customers List as CSV",
     *     tags={"Admin Customer Management"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="CSV content stream"
     *     )
     * )
     */
    public function export(Request $request)
    {
        $csvData = $this->customerService->exportCsv($request->all());

        return response($csvData, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="customers-export-' . date('Y-m-d') . '.csv"',
        ]);
    }
}
