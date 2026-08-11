<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreAttributeRequest;
use App\Http\Requests\Admin\UpdateAttributeRequest;
use App\Models\Attribute;
use App\Services\AttributeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class AttributeController extends BaseController
{
    public function __construct(
        protected AttributeService $attributeService
    ) {}

    /**
     * @OA\Get(
     *     path="/api/v1/admin/attributes",
     *     summary="List Attributes (Admin)",
     *     description="Retrieve paginated list of attributes with values count, search, type, and status filters.",
     *     operationId="adminListAttributes",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"select","radio","color_picker","button"})),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"active","inactive"})),
     *     @OA\Parameter(name="per_page", in="query", required=false, @OA\Schema(type="integer", default=15)),
     *     @OA\Response(response=200, description="Attributes retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'type', 'status']);
        $perPage = (int) $request->input('per_page', 15);

        $attributes = $this->attributeService->list($filters, $perPage);

        return $this->paginatedResponse($attributes, 'Attributes retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/attributes",
     *     summary="Create Attribute",
     *     description="Create a new attribute definition.",
     *     operationId="adminCreateAttribute",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name"},
     *             @OA\Property(property="name", type="string", example="Color"),
     *             @OA\Property(property="code", type="string", example="color"),
     *             @OA\Property(property="type", type="string", enum={"select","radio","color_picker","button"}, example="color_picker"),
     *             @OA\Property(property="is_filterable", type="boolean", example=true),
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="active"),
     *             @OA\Property(property="sort_order", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Attribute created successfully")
     * )
     */
    public function store(StoreAttributeRequest $request): JsonResponse
    {
        $attribute = $this->attributeService->create($request->validated());

        return $this->successResponse($attribute, 'Attribute created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/attributes/{id}",
     *     summary="View Attribute Details",
     *     description="Retrieve single attribute details with associated values.",
     *     operationId="adminShowAttribute",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Attribute details retrieved successfully")
     * )
     */
    public function show(Attribute $attribute): JsonResponse
    {
        return $this->successResponse($attribute->load('values'), 'Attribute details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/attributes/{id}",
     *     summary="Update Attribute",
     *     description="Update attribute properties.",
     *     operationId="adminUpdateAttribute",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Color Choice"),
     *             @OA\Property(property="is_filterable", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Attribute updated successfully")
     * )
     */
    public function update(UpdateAttributeRequest $request, Attribute $attribute): JsonResponse
    {
        $updatedAttribute = $this->attributeService->update($attribute, $request->validated());

        return $this->successResponse($updatedAttribute, 'Attribute updated successfully.');
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/admin/attributes/{id}/status",
     *     summary="Toggle Attribute Status",
     *     description="Toggle attribute status to active or inactive.",
     *     operationId="adminToggleAttributeStatus",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"active","inactive"}, example="inactive")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Attribute status updated successfully")
     * )
     */
    public function toggleStatus(Request $request, Attribute $attribute): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,inactive'],
        ]);

        $updatedAttribute = $this->attributeService->toggleStatus($attribute, $request->input('status'));

        return $this->successResponse($updatedAttribute, 'Attribute status updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/attributes/{id}",
     *     summary="Delete Attribute",
     *     description="Delete an attribute. Associated attribute values will be cascade deleted.",
     *     operationId="adminDeleteAttribute",
     *     tags={"Admin Attribute Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Attribute deleted successfully")
     * )
     */
    public function destroy(Attribute $attribute): JsonResponse
    {
        $this->attributeService->delete($attribute);

        return $this->successResponse(null, 'Attribute deleted successfully.');
    }
}
