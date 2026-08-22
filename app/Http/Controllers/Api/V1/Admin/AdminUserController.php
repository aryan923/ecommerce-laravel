<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreAdminUserRequest;
use App\Http\Requests\Admin\UpdateAdminUserRequest;
use App\Models\AdminUser;
use App\Services\AdminUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class AdminUserController extends BaseController
{
    public function __construct(
        protected AdminUserService $adminUserService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/users",
     *     summary="List Admin Staff Users",
     *     description="Retrieve paginated list of admin staff members with search, status filter, and role filters.",
     *     operationId="listAdminUsers",
     *     tags={"Admin Staff Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="page", in="query", required=false, @OA\Schema(type="integer", default=1)),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"active","inactive","disabled"})),
     *     @OA\Parameter(name="role_id", in="query", required=false, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paginated list of admin staff users"),
     *     @OA\Response(response=401, description="Unauthenticated"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'role_id']);
        $perPage = (int) $request->input('per_page', 15);

        $users = $this->adminUserService->list($filters, $perPage);

        return $this->paginatedResponse($users, 'Admin staff users retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/users",
     *     summary="Create Admin Staff User",
     *     description="Create a new admin staff account and assign roles.",
     *     operationId="createAdminUser",
     *     tags={"Admin Staff Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","role_ids"},
     *             @OA\Property(property="name", type="string", example="Jane Staff"),
     *             @OA\Property(property="email", type="string", format="email", example="jane.staff@example.com"),
     *             @OA\Property(property="mobile", type="string", example="+1234567891"),
     *             @OA\Property(property="password", type="string", format="password", example="SecretPassword123!"),
     *             @OA\Property(property="status", type="string", example="active"),
     *             @OA\Property(property="role_ids", type="array", @OA\Items(type="integer", example=2))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Admin user created successfully"),
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreAdminUserRequest $request): JsonResponse
    {
        $user = $this->adminUserService->create($request->validated());

        return $this->successResponse($user, 'Admin staff user created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/users/{id}",
     *     summary="View Admin Staff Details",
     *     description="Retrieve details of a single admin staff member with assigned roles.",
     *     operationId="showAdminUser",
     *     tags={"Admin Staff Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Admin user details retrieved successfully"),
     *     @OA\Response(response=404, description="Admin user not found")
     * )
     */
    public function show(AdminUser $user): JsonResponse
    {
        return $this->successResponse($user->load('roles'), 'Admin staff user retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/users/{id}",
     *     summary="Update Admin Staff User",
     *     description="Update details and assigned roles for an admin staff user.",
     *     operationId="updateAdminUser",
     *     tags={"Admin Staff Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Jane Staff Updated"),
     *             @OA\Property(property="email", type="string", format="email", example="jane.updated@example.com"),
     *             @OA\Property(property="mobile", type="string", example="+1234567891"),
     *             @OA\Property(property="role_ids", type="array", @OA\Items(type="integer", example=2))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Admin user updated successfully"),
     *     @OA\Response(response=404, description="Admin user not found")
     * )
     */
    public function update(UpdateAdminUserRequest $request, AdminUser $user): JsonResponse
    {
        $updatedUser = $this->adminUserService->update($user, $request->validated());

        return $this->successResponse($updatedUser, 'Admin staff user updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/users/{id}/status",
     *     summary="Toggle Admin Staff Account Status",
     *     description="Enable or disable an admin staff user account.",
     *     operationId="toggleAdminUserStatus",
     *     tags={"Admin Staff Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active","inactive","disabled"}, example="disabled")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Status updated successfully"),
     *     @OA\Response(response=422, description="Cannot disable self")
     * )
     */
    public function toggleStatus(Request $request, AdminUser $user): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,inactive,disabled'],
        ]);

        /** @var AdminUser $currentAdmin */
        $currentAdmin = $request->user();

        $updatedUser = $this->adminUserService->toggleStatus(
            $user,
            $request->input('status'),
            $currentAdmin
        );

        return $this->successResponse($updatedUser, 'Admin staff user status updated successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/users/{id}/reset-access",
     *     summary="Reset Admin Staff Access / Password",
     *     description="Reset password and purge active API tokens for an admin staff user.",
     *     operationId="resetAdminUserAccess",
     *     tags={"Admin Staff Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="password", type="string", format="password", example="NewSecretPassword123!")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Staff access reset successfully")
     * )
     */
    public function resetAccess(Request $request, AdminUser $user): JsonResponse
    {
        $request->validate([
            'password' => ['nullable', 'string', 'min:8', 'max:100'],
        ]);

        $updatedUser = $this->adminUserService->resetAccess($user, $request->input('password'));

        return $this->successResponse($updatedUser, 'Admin staff user access reset successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/users/{id}",
     *     summary="Delete Admin Staff User",
     *     description="Delete an admin staff account. Self-deletion of active user is prevented.",
     *     operationId="deleteAdminUser",
     *     tags={"Admin Staff Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Admin user deleted successfully"),
     *     @OA\Response(response=422, description="Cannot delete self")
     * )
     */
    public function destroy(Request $request, AdminUser $user): JsonResponse
    {
        /** @var AdminUser $currentAdmin */
        $currentAdmin = $request->user();

        $this->adminUserService->delete($user, $currentAdmin);

        return $this->successResponse(null, 'Admin staff user deleted successfully.');
    }
}
