<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class PermissionController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/permissions",
     *     summary="List Permissions Grouped by Module",
     *     description="Retrieve all registered permissions grouped by module area for role assignment forms.",
     *     operationId="listPermissions",
     *     tags={"Role & Permission Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Permissions grouped by module retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $permissions = Permission::all()
            ->groupBy('module')
            ->map(function ($items, $module) {
                return [
                    'module' => $module,
                    'permissions' => $items->values(),
                ];
            })
            ->values();

        return $this->successResponse($permissions, 'Permissions retrieved successfully.');
    }
}
