<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

class WarehouseController extends BaseController
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/warehouses",
     *     summary="List Warehouse Locations",
     *     description="Retrieve all fulfillment warehouses with active filter and stock count.",
     *     operationId="adminListWarehouses",
     *     tags={"Admin Warehouse Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="active", in="query", required=false, @OA\Schema(type="boolean")),
     *     @OA\Response(response=200, description="Warehouses retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Warehouse::withCount('inventories');

        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->input('active'), FILTER_VALIDATE_BOOLEAN));
        }

        $warehouses = $query->orderBy('is_default', 'desc')
            ->orderBy('name', 'asc')
            ->get();

        return $this->successResponse($warehouses, 'Warehouses retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/warehouses",
     *     summary="Create Warehouse Location",
     *     description="Create a new fulfillment warehouse location.",
     *     operationId="adminCreateWarehouse",
     *     tags={"Admin Warehouse Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","code"},
     *             @OA\Property(property="name", type="string", example="Regional East Hub"),
     *             @OA\Property(property="code", type="string", example="WH-EAST"),
     *             @OA\Property(property="city", type="string", example="Kolkata"),
     *             @OA\Property(property="state", type="string", example="West Bengal"),
     *             @OA\Property(property="country", type="string", example="India"),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="is_default", type="boolean", example=false)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Warehouse created successfully")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:warehouses,code',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'contact_name' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:100',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            Warehouse::query()->update(['is_default' => false]);
        }

        $warehouse = Warehouse::create($validated);

        return $this->successResponse($warehouse, 'Warehouse created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/warehouses/{id}",
     *     summary="Single Warehouse Detail",
     *     description="Get details of a specific warehouse with its stock inventory records.",
     *     operationId="adminShowWarehouse",
     *     tags={"Admin Warehouse Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Warehouse retrieved successfully")
     * )
     */
    public function show(int $id): JsonResponse
    {
        $warehouse = Warehouse::with(['inventories.variant.product'])->findOrFail($id);

        return $this->successResponse($warehouse, 'Warehouse retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/warehouses/{id}",
     *     summary="Update Warehouse Details",
     *     description="Update warehouse properties.",
     *     operationId="adminUpdateWarehouse",
     *     tags={"Admin Warehouse Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Warehouse updated successfully")
     * )
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('warehouses', 'code')->ignore($warehouse->id)],
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'contact_name' => 'nullable|string|max:100',
            'contact_phone' => 'nullable|string|max:50',
            'contact_email' => 'nullable|email|max:100',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            Warehouse::where('id', '!=', $warehouse->id)->update(['is_default' => false]);
        }

        $warehouse->update($validated);

        return $this->successResponse($warehouse, 'Warehouse updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/warehouses/{id}",
     *     summary="Delete Warehouse Location",
     *     description="Delete a non-default warehouse location with no active stock.",
     *     operationId="adminDeleteWarehouse",
     *     tags={"Admin Warehouse Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Warehouse deleted successfully")
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);

        if ($warehouse->is_default) {
            return $this->errorResponse('Cannot delete the default primary warehouse.', 422);
        }

        $stockCount = $warehouse->inventories()->where('available_qty', '>', 0)->count();
        if ($stockCount > 0) {
            return $this->errorResponse("Cannot delete warehouse containing {$stockCount} active stock items. Transfer or clear stock first.", 422);
        }

        $warehouse->delete();

        return $this->successResponse(null, 'Warehouse deleted successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/warehouses/{id}/default",
     *     summary="Set Primary Default Warehouse",
     *     description="Set the default primary fulfillment warehouse.",
     *     operationId="adminSetDefaultWarehouse",
     *     tags={"Admin Warehouse Management"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Default warehouse updated successfully")
     * )
     */
    public function setDefault(int $id): JsonResponse
    {
        $warehouse = Warehouse::findOrFail($id);

        Warehouse::query()->update(['is_default' => false]);
        $warehouse->update(['is_default' => true, 'is_active' => true]);

        return $this->successResponse($warehouse, 'Default warehouse updated successfully.');
    }
}
