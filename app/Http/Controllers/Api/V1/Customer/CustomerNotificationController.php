<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerNotificationController extends BaseController
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/customer/notifications",
     *     summary="List authenticated customer in-app notifications",
     *     tags={"Customer Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="In-app notifications list")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = (int) $request->input('per_page', 15);

        $notifications = $this->notificationService->getCustomerInAppNotifications($user, $perPage);

        return $this->successResponse($notifications, 'In-app notifications retrieved successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/customer/notifications/{id}/read",
     *     summary="Mark customer in-app notification as read",
     *     tags={"Customer Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Notification marked as read")
     * )
     */
    public function markAsRead(int $id, Request $request): JsonResponse
    {
        $user = $request->user();
        $notification = $this->notificationService->markAsRead($user, $id);

        return $this->successResponse($notification, 'Notification marked as read successfully.');
    }
}
