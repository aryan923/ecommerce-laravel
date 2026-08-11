<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Models\AdminUser;
use App\Services\AdminAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class AdminAuthController extends BaseController
{
    public function __construct(
        protected AdminAuthService $adminAuthService
    ) {}

    /**
     * @OA\Post(
     *     path="/api/v1/admin/auth/login",
     *     summary="Admin Panel Login",
     *     description="Authenticate administrator or staff user and return a Sanctum Bearer token with roles and permissions.",
     *     operationId="adminLogin",
     *     tags={"Admin Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"login","password"},
     *             @OA\Property(property="login", type="string", example="admin@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="SecretAdmin123!")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Admin login successful",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Admin login successful."),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Invalid admin credentials"),
     *     @OA\Response(response=403, description="Admin account disabled or inactive")
     * )
     */
    public function login(AdminLoginRequest $request): JsonResponse
    {
        $result = $this->adminAuthService->login(
            $request->input('login'),
            $request->input('password'),
            $request->ip()
        );

        return $this->successResponse($result, 'Admin login successful.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/auth/me",
     *     summary="Get Authenticated Admin Profile & Permissions",
     *     description="Retrieve current administrator details, assigned roles, and granted permissions list.",
     *     operationId="getAdminProfile",
     *     tags={"Admin Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Admin profile retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Admin profile retrieved successfully."),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated admin")
     * )
     */
    public function me(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin || !($admin instanceof AdminUser)) {
            return $this->errorResponse('Unauthenticated admin access.', 401);
        }

        return $this->successResponse([
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'mobile' => $admin->mobile,
                'status' => $admin->status,
                'last_login_at' => $admin->last_login_at,
                'roles' => $admin->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'slug' => $role->slug,
                ]),
                'permissions' => $admin->getAllPermissions(),
            ],
        ], 'Admin profile retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/auth/logout",
     *     summary="Admin Logout",
     *     description="Revoke active admin Sanctum token.",
     *     operationId="adminLogout",
     *     tags={"Admin Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="logout_all", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Admin logged out successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Admin logged out successfully."),
     *             @OA\Property(property="data", type="null"),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     ),
     *     @OA\Response(response=401, description="Unauthenticated admin")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $admin = $request->user();

        if (!$admin || !($admin instanceof AdminUser)) {
            return $this->errorResponse('Unauthenticated admin access.', 401);
        }

        $this->adminAuthService->logout(
            $admin,
            (bool) $request->input('logout_all', false)
        );

        return $this->successResponse(null, 'Admin logged out successfully.');
    }
}
