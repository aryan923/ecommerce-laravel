<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Notification\CreateTemplateRequest;
use App\Http\Requests\Notification\TestDispatchRequest;
use App\Http\Requests\Notification\UpdateTemplateRequest;
use App\Models\NotificationTemplate;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationAdminController extends BaseController
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/notifications/templates",
     *     summary="Admin list notification templates",
     *     tags={"Admin Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="event", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="channel", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Notification templates list")
     * )
     */
    public function indexTemplates(Request $request): JsonResponse
    {
        $filters = $request->only(['event', 'channel']);
        $perPage = (int) $request->input('per_page', 15);

        $templates = $this->notificationService->listTemplates($filters, $perPage);

        return $this->successResponse($templates, 'Notification templates retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/notifications/templates",
     *     summary="Create notification template",
     *     tags={"Admin Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event", "channel", "body"},
     *             @OA\Property(property="event", type="string", example="order_placed"),
     *             @OA\Property(property="channel", type="string", enum={"email", "sms", "push", "in_app"}, example="email"),
     *             @OA\Property(property="subject", type="string", example="Order Confirmation {{order_number}}"),
     *             @OA\Property(property="body", type="string", example="Hello {{customer_name}}, your order total is {{order_total}}."),
     *             @OA\Property(property="variables", type="array", @OA\Items(type="string", example="customer_name"))
     *         )
     *     ),
     *     @OA\Response(response=201, description="Notification template created successfully")
     * )
     */
    public function storeTemplate(CreateTemplateRequest $request): JsonResponse
    {
        $template = $this->notificationService->createTemplate($request->validated());

        return $this->successResponse($template, 'Notification template created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/notifications/templates/{id}",
     *     summary="Fetch notification template detail",
     *     tags={"Admin Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Template details")
     * )
     */
    public function showTemplate(int $id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);

        return $this->successResponse($template, 'Notification template retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/notifications/templates/{id}",
     *     summary="Update notification template",
     *     tags={"Admin Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="subject", type="string"),
     *             @OA\Property(property="body", type="string"),
     *             @OA\Property(property="status", type="boolean")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Template updated successfully")
     * )
     */
    public function updateTemplate(int $id, UpdateTemplateRequest $request): JsonResponse
    {
        $template = $this->notificationService->updateTemplate($id, $request->validated());

        return $this->successResponse($template, 'Notification template updated successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/notifications/logs",
     *     summary="Admin list notification delivery audit logs",
     *     tags={"Admin Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="channel", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Response(response=200, description="Delivery logs retrieved successfully")
     * )
     */
    public function indexLogs(Request $request): JsonResponse
    {
        $filters = $request->only(['channel', 'status', 'search']);
        $perPage = (int) $request->input('per_page', 15);

        $logs = $this->notificationService->listLogs($filters, $perPage);

        return $this->successResponse($logs, 'Notification delivery logs retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/notifications/test-dispatch",
     *     summary="Test dispatch notification for an event",
     *     tags={"Admin Notifications"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"event", "recipient", "data", "channels"},
     *             @OA\Property(property="event", type="string", example="order_placed"),
     *             @OA\Property(property="recipient", type="string", example="test@example.com"),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="channels", type="array", @OA\Items(type="string", example="email"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Notification test dispatch triggered")
     * )
     */
    public function testDispatch(TestDispatchRequest $request): JsonResponse
    {
        $logs = $this->notificationService->dispatch(
            $request->input('event'),
            $request->input('recipient'),
            $request->input('data'),
            null,
            $request->input('channels')
        );

        return $this->successResponse($logs, 'Test notification dispatched successfully.');
    }
}
