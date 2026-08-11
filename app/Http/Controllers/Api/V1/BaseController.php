<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponseTrait;
use OpenApi\Annotations as OA;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="E-Commerce REST API Platform",
 *     description="Comprehensive REST API documentation for Customer Frontend, Admin Panel, Mobile Apps, and Integrations.",
 *     @OA\Contact(
 *         name="API Support Team",
 *         email="support@example.com"
 *     )
 * )
 *
 * @OA\Server(
 *     url="http://localhost:8002",
 *     description="Local API Server"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Enter Sanctum Bearer token in format: Bearer {token}"
 * )
 */
abstract class BaseController extends Controller
{
    use ApiResponseTrait;
}
