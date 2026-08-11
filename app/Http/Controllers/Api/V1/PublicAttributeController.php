<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\AttributeService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class PublicAttributeController extends BaseController
{
    public function __construct(
        protected AttributeService $attributeService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/attributes",
     *     summary="Get Active Filterable Attributes (Public)",
     *     description="Retrieve list of active, filterable attributes with values for storefront product filtering.",
     *     operationId="getPublicAttributesList",
     *     tags={"Storefront Catalog"},
     *     @OA\Response(response=200, description="Active filterable attributes retrieved successfully")
     * )
     */
    public function index(): JsonResponse
    {
        $attributes = $this->attributeService->getPublicList();

        return $this->successResponse($attributes, 'Filterable attributes retrieved successfully.');
    }
}
