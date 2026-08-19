<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateTaxSettingsRequest;
use App\Models\TaxAuditLog;
use App\Services\TaxService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin - Tax Management",
 *     description="API Endpoints for Managing Store Tax Mode & Audit Logs"
 * )
 */
class TaxSettingController extends Controller
{
    use ApiResponseTrait;

    protected TaxService $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax/settings",
     *     summary="Get global tax configuration settings",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Tax settings retrieved successfully")
     * )
     */
    public function show(): JsonResponse
    {
        $settings = $this->taxService->getTaxSettings();

        return $this->successResponse($settings->load(['defaultTaxClass', 'shippingTaxClass', 'codFeeTaxClass']), 'Global tax settings retrieved.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/tax/settings",
     *     summary="Update global tax configuration settings",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Tax settings updated successfully")
     * )
     */
    public function update(UpdateTaxSettingsRequest $request): JsonResponse
    {
        $updated = $this->taxService->updateTaxSettings($request->validated());

        return $this->successResponse($updated, 'Global tax settings updated successfully.');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/tax/audit-logs",
     *     summary="List tax configuration audit logs",
     *     tags={"Admin - Tax Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Audit logs retrieved successfully")
     * )
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $logs = TaxAuditLog::with('user')
            ->orderBy('id', 'desc')
            ->paginate((int) $request->input('per_page', 15));

        return $this->paginatedResponse($logs, 'Tax audit logs retrieved successfully.');
    }
}
