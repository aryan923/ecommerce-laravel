<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreAttributeValueRequest;
use App\Http\Requests\Admin\UpdateAttributeValueRequest;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Services\AttributeService;
use Illuminate\Http\JsonResponse;
use OpenApi\Annotations as OA;

class AttributeValueController extends BaseController
{
    public function __construct(
        protected AttributeService $attributeService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/attributes/{attribute_id}/values",
     *     summary="List Attribute Values",
     *     description="Retrieve all values belonging to a specific attribute.",
     *     operationId="adminListAttributeValues",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="attribute_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Attribute values retrieved successfully")
     * )
     */
    public function index(Attribute $attribute): JsonResponse
    {
        $values = $this->attributeService->listValues($attribute);

        return $this->successResponse($values, 'Attribute values retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/attributes/{attribute_id}/values",
     *     summary="Create Attribute Value",
     *     description="Add a new value to a specific attribute.",
     *     operationId="adminCreateAttributeValue",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="attribute_id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"value"},
     *             @OA\Property(property="value", type="string", example="Red"),
     *             @OA\Property(property="color_code", type="string", example="#FF0000"),
     *             @OA\Property(property="sort_order", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Attribute value created successfully")
     * )
     */
    public function store(StoreAttributeValueRequest $request, Attribute $attribute): JsonResponse
    {
        $value = $this->attributeService->createValue($attribute, $request->validated());

        return $this->successResponse($value, 'Attribute value created successfully.', 201);
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/attribute-values/{id}",
     *     summary="Update Attribute Value",
     *     description="Update an existing attribute value.",
     *     operationId="adminUpdateAttributeValue",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="value", type="string", example="Crimson Red"),
     *             @OA\Property(property="color_code", type="string", example="#DC143C")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Attribute value updated successfully")
     * )
     */
    public function update(UpdateAttributeValueRequest $request, AttributeValue $value): JsonResponse
    {
        $updatedValue = $this->attributeService->updateValue($value, $request->validated());

        return $this->successResponse($updatedValue, 'Attribute value updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/attribute-values/{id}",
     *     summary="Delete Attribute Value",
     *     description="Delete an attribute value.",
     *     operationId="adminDeleteAttributeValue",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Attribute value deleted successfully")
     * )
     */
    public function destroy(AttributeValue $value): JsonResponse
    {
        $this->attributeService->deleteValue($value);

        return $this->successResponse(null, 'Attribute value deleted successfully.');
    }
}
