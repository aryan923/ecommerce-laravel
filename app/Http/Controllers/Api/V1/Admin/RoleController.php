<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\Role;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class RoleController extends BaseController
{
    public function __construct(
        protected RoleService $roleService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/roles",
     *     summary="List All Roles",
     *     description="Retrieve list of roles with permission count and staff count.",
     *     operationId="listRoles",
     *     tags={"Role & Permission Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Roles list retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $roles = $this->roleService->list();

        return $this->successResponse($roles, 'Roles retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/roles",
     *     summary="Create Custom Role",
     *     description="Create a new custom role with assigned permissions.",
     *     operationId="createRole",
     *     tags={"Role & Permission Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","permission_ids"},
     *             @OA\Property(property="name", type="string", example="Catalog Manager"),
     *             @OA\Property(property="description", type="string", example="Manages products and categories."),
     *             @OA\Property(property="permission_ids", type="array", @OA\Items(type="integer", example=1))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Role created successfully")
     * )
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return $this->successResponse($role, 'Role created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/roles/{id}",
     *     summary="View Role Details",
     *     description="Retrieve single role details with associated permissions.",
     *     operationId="showRole",
     *     tags={"Role & Permission Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Role details retrieved successfully")
     * )
     */
    public function show(Role $role): JsonResponse
    {
        return $this->successResponse($role->load(['permissions', 'adminUsers']), 'Role retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/roles/{id}",
     *     summary="Update Role & Permissions",
     *     description="Update role name, description, and assigned permissions.",
     *     operationId="updateRole",
     *     tags={"Role & Permission Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Catalog Manager Updated"),
     *             @OA\Property(property="description", type="string", example="Updated description"),
     *             @OA\Property(property="permission_ids", type="array", @OA\Items(type="integer", example=1))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Role updated successfully")
     * )
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $updatedRole = $this->roleService->update($role, $request->validated());

        return $this->successResponse($updatedRole, 'Role updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/roles/{id}",
     *     summary="Delete Custom Role",
     *     description="Delete a custom role. System roles and roles currently assigned to staff cannot be deleted.",
     *     operationId="deleteRole",
     *     tags={"Role & Permission Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Role deleted successfully"),
     *     @OA\Response(response=422, description="Cannot delete system role or assigned role")
     * )
     */
    public function destroy(Role $role): JsonResponse
    {
        $this->roleService->delete($role);

        return $this->successResponse(null, 'Role deleted successfully.');
    }
}
