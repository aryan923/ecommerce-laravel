<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\HsnCode;
use App\Services\TaxService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HsnCodeController extends Controller
{
    use ApiResponseTrait;

    protected TaxService $taxService;

    public function __construct(TaxService $taxService)
    {
        $this->taxService = $taxService;
    }

    public function index(Request $request): JsonResponse
    {
        $hsnCodes = $this->taxService->getHsnCodes($request->only(['search', 'type']), $request->get('per_page', 15));
        return $this->successResponse($hsnCodes, 'HSN codes retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:hsn_codes,code',
            'description' => 'nullable|string',
            'type' => 'nullable|in:hsn,sac',
            'tax_class_id' => 'nullable|exists:tax_classes,id',
            'status' => 'nullable|in:active,inactive',
        ]);

        $hsnCode = $this->taxService->createHsnCode($validated);
        return $this->successResponse($hsnCode, 'HSN code created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $hsnCode = HsnCode::findOrFail($id);

        $validated = $request->validate([
            'code' => 'sometimes|required|string|max:20|unique:hsn_codes,code,' . $id,
            'description' => 'nullable|string',
            'type' => 'nullable|in:hsn,sac',
            'tax_class_id' => 'nullable|exists:tax_classes,id',
            'status' => 'nullable|in:active,inactive',
        ]);

        $updated = $this->taxService->updateHsnCode($hsnCode, $validated);
        return $this->successResponse($updated, 'HSN code updated successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        $hsnCode = HsnCode::findOrFail($id);
        $this->taxService->deleteHsnCode($hsnCode);
        return $this->successResponse(null, 'HSN code deleted successfully.');
    }
}
