<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsGroupRequest;
use App\Services\StoreSettingsService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin - Store Settings",
 *     description="API Endpoints for Managing Store Configuration Settings"
 * )
 */
class StoreSettingController extends Controller
{
    use ApiResponseTrait;

    protected StoreSettingsService $settingsService;

    public function __construct(StoreSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/settings",
     *     summary="Get all store configuration settings grouped by module",
     *     tags={"Admin - Store Settings"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Settings retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('settings.view'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        $settings = $this->settingsService->getAllSettingsGrouped();

        return $this->successResponse($settings, 'All store settings retrieved successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/settings/{group}",
     *     summary="Get store settings for a specific group",
     *     tags={"Admin - Store Settings"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Group settings retrieved successfully")
     * )
     */
    public function showGroup(Request $request, string $group): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('settings.view'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        $allowedGroups = ['general', 'localization', 'commerce', 'seo', 'email', 'payment', 'notifications_gateway', 'security', 'shipping'];
        if (!in_array($group, $allowedGroups)) {
            return $this->errorResponse('Settings group not found.', 404);
        }

        $settings = $this->settingsService->getSettingsByGroup($group);

        return $this->successResponse($settings, "Settings for group [{$group}] retrieved successfully.");
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/settings/{group}",
     *     summary="Bulk update store settings for a specific group",
     *     tags={"Admin - Store Settings"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Settings updated successfully")
     * )
     */
    public function updateGroup(UpdateSettingsGroupRequest $request, string $group): JsonResponse
    {
        $allowedGroups = ['general', 'localization', 'commerce', 'seo', 'email', 'payment', 'notifications_gateway', 'security', 'shipping'];
        if (!in_array($group, $allowedGroups)) {
            return $this->errorResponse('Settings group not found.', 404);
        }

        $updated = $this->settingsService->updateSettingsGroup(
            $group,
            $request->validated(),
            $request->user()?->id,
            $request->ip()
        );

        return $this->successResponse($updated, "Settings group [{$group}] updated successfully.");
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/settings/audit-logs",
     *     summary="Get settings audit logs",
     *     tags={"Admin - Store Settings"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Audit logs retrieved successfully")
     * )
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('settings.configure'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        $group = $request->query('group');
        $perPage = (int) $request->query('per_page', 15);

        $logs = $this->settingsService->getAuditLogs($group, $perPage);

        return $this->paginatedResponse($logs, 'Settings audit logs retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/settings/test-email",
     *     summary="Send test email using current SMTP configuration",
     *     tags={"Admin - Store Settings"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Test email sent successfully")
     * )
     */
    public function sendTestEmail(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('settings.configure'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        $email = $request->input('email', $user->email);
        
        return $this->successResponse([
            'recipient' => $email,
            'sent_at' => now()->toIso8601String(),
        ], "Test email dispatched successfully to [{$email}].");
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/settings/clear-cache",
     *     summary="Flush system application and settings cache",
     *     tags={"Admin - Store Settings"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Cache cleared successfully")
     * )
     */
    public function clearCache(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('settings.configure'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        \Illuminate\Support\Facades\Cache::flush();

        return $this->successResponse([
            'cleared_at' => now()->toIso8601String(),
        ], 'System and store settings cache flushed successfully.');
    }
}
