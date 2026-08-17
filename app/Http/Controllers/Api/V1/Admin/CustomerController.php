<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class CustomerController extends BaseController
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/stats",
     *     summary="Executive Customer KPI Statistics",
     *     description="Retrieve summary KPIs: total customers, active accounts, suspended accounts, inactive accounts, and lifetime total revenue.",
     *     operationId="adminCustomerStats",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Customer stats retrieved successfully")
     * )
     */
    public function stats(): JsonResponse
    {
        $stats = $this->customerService->getDashboardStats();

        return $this->successResponse($stats, 'Customer statistics retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers",
     *     summary="List Registered Customers",
     *     description="Retrieve paginated list of customers with search (name, email, mobile), status filter, and order counts.",
     *     operationId="adminListCustomers",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"active","inactive","suspended","pending_verification"})),
     *     @OA\Parameter(name="sort_by", in="query", required=false, @OA\Schema(type="string", enum={"id","orders_count"})),
     *     @OA\Parameter(name="sort_order", in="query", required=false, @OA\Schema(type="string", enum={"asc","desc"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Customer list retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'sort_by', 'sort_order']);
        $perPage = (int) $request->input('per_page', 15);

        $customers = $this->customerService->list($filters, $perPage);

        return $this->paginatedResponse($customers, 'Customer list retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}",
     *     summary="Single Customer Profile Details",
     *     description="Retrieve customer profile data with lifetime metrics (total orders, total spent, AOV, last order date).",
     *     operationId="adminShowCustomer",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Customer profile retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $profile = $this->customerService->getProfile($id);

        return $this->successResponse($profile, 'Customer profile retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/orders",
     *     summary="Customer Order History Tab",
     *     description="Retrieve paginated order history for a specific customer.",
     *     operationId="adminCustomerOrders",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Customer orders retrieved successfully")
     * )
     */
    public function orders(int $id, Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $orders = $this->customerService->getTabContent($id, 'orders', $perPage);

        return $this->paginatedResponse($orders, 'Customer orders retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/addresses",
     *     summary="Customer Addresses Tab",
     *     description="Retrieve saved shipping and billing addresses for a customer.",
     *     operationId="adminCustomerAddresses",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Customer addresses retrieved successfully")
     * )
     */
    public function addresses(int $id, Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $addresses = $this->customerService->getTabContent($id, 'addresses', $perPage);

        return $this->paginatedResponse($addresses, 'Customer addresses retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/reviews",
     *     summary="Customer Reviews Tab",
     *     description="Retrieve product reviews submitted by a customer.",
     *     operationId="adminCustomerReviews",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Customer reviews retrieved successfully")
     * )
     */
    public function reviews(int $id, Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $reviews = $this->customerService->getTabContent($id, 'reviews', $perPage);

        return $this->paginatedResponse($reviews, 'Customer reviews retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/returns",
     *     summary="Customer Return Requests Tab",
     *     description="Retrieve return requests submitted by a customer.",
     *     operationId="adminCustomerReturns",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Customer return requests retrieved successfully")
     * )
     */
    public function returns(int $id, Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $returns = $this->customerService->getTabContent($id, 'returns', $perPage);

        return $this->paginatedResponse($returns, 'Customer return requests retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/customers/{id}/refunds",
     *     summary="Customer Refunds Tab",
     *     description="Retrieve refund records associated with customer orders.",
     *     operationId="adminCustomerRefunds",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Customer refunds retrieved successfully")
     * )
     */
    public function refunds(int $id, Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $refunds = $this->customerService->getTabContent($id, 'refunds', $perPage);

        return $this->paginatedResponse($refunds, 'Customer refunds retrieved successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/customers/{id}/status",
     *     summary="Update Customer Account Status",
     *     description="Change customer account status to active, inactive, or suspended.",
     *     operationId="adminUpdateCustomerStatus",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active","inactive","suspended","pending_verification"}, example="suspended")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Customer status updated successfully")
     * )
     */
    public function updateStatus(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:active,inactive,suspended,pending_verification',
        ]);

        $customer = $this->customerService->updateStatus($id, $request->input('status'));

        return $this->successResponse($customer, "Customer account status updated to '{$customer->status}'.");
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/customers/{id}/notes",
     *     summary="Update Admin Internal Notes for Customer",
     *     description="Save staff internal reference notes for a customer account.",
     *     operationId="adminUpdateCustomerNotes",
     *     tags={"Admin Customer Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="notes", type="string", nullable=true, example="VIP buyer. Requested weekend delivery.")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Customer admin notes updated successfully")
     * )
     */
    public function updateNotes(int $id, Request $request): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:2000',
        ]);

        $customer = $this->customerService->updateNotes($id, $request->input('notes'));

        return $this->successResponse($customer, 'Admin internal notes updated successfully.');
    }
}
