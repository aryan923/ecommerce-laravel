<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class HealthController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/health",
     *     summary="API System Health Check",
     *     description="Returns system operational status, timestamp, and environment details.",
     *     operationId="getHealthStatus",
     *     tags={"System"},
     *     @OA\Response(
     *         response=200,
     *         description="System is operational",
     *         @OA\JsonContent(
     *             type="object",
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="E-Commerce API is healthy and operational"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="status", type="string", example="up"),
     *                 @OA\Property(property="timestamp", type="string", example="2026-08-11T12:00:00+00:00"),
     *                 @OA\Property(property="environment", type="string", example="local"),
     *                 @OA\Property(property="framework", type="string", example="Laravel 10.50.2"),
     *                 @OA\Property(property="php_version", type="string", example="8.2.33"),
     *                 @OA\Property(property="version", type="string", example="1.0.0")
     *             ),
     *             @OA\Property(property="errors", type="null")
     *         )
     *     )
     * )
     *
     * System health check endpoint.
     *
     * @return JsonResponse
     */
    public function check(): JsonResponse
    {
        return $this->successResponse([
            'status' => 'up',
            'timestamp' => now()->toIso8601String(),
            'environment' => config('app.env'),
            'framework' => 'Laravel ' . app()->version(),
            'php_version' => PHP_VERSION,
            'version' => '1.0.0',
        ], 'E-Commerce API is healthy and operational');
    }
}
