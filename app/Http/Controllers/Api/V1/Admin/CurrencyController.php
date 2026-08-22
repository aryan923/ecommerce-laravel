<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCurrencyRequest;
use App\Http\Requests\Admin\UpdateCurrencyRequest;
use App\Models\Currency;
use App\Services\StoreSettingsService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin - Currencies",
 *     description="API Endpoints for Managing Store Currencies and Exchange Rates"
 * )
 */
class CurrencyController extends Controller
{
    use ApiResponseTrait;

    protected StoreSettingsService $settingsService;

    public function __construct(StoreSettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/currencies",
     *     summary="List all store currencies",
     *     tags={"Admin - Currencies"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Currencies retrieved successfully")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('currency.view'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        $query = Currency::query();

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $currencies = $query->orderBy('is_default', 'desc')
            ->orderBy('code', 'asc')
            ->paginate((int) $request->query('per_page', 15));

        return $this->paginatedResponse($currencies, 'Currencies retrieved successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/currencies",
     *     summary="Create a new store currency",
     *     tags={"Admin - Currencies"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=201, description="Currency created successfully")
     * )
     */
    public function store(StoreCurrencyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $currency = Currency::create($data);

        if (!empty($data['is_default'])) {
            $currency = $this->settingsService->setDefaultCurrency(
                $currency,
                $request->user()?->id,
                $request->ip()
            );
        }

        return $this->successResponse($currency, 'Currency created successfully.', 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/admin/currencies/{id}",
     *     summary="Get details of a specific currency",
     *     tags={"Admin - Currencies"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Currency retrieved successfully")
     * )
     */
    public function show(Request $request, Currency $currency): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('currency.view'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        return $this->successResponse($currency, 'Currency details retrieved successfully.');
    }

    /**
     * @OA\Put(
     *     path="/api/v1/admin/currencies/{id}",
     *     summary="Update details or exchange rate of a currency",
     *     tags={"Admin - Currencies"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Currency updated successfully")
     * )
     */
    public function update(UpdateCurrencyRequest $request, Currency $currency): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['is_default']) && $data['is_default']) {
            $currency = $this->settingsService->setDefaultCurrency(
                $currency,
                $request->user()?->id,
                $request->ip()
            );
            unset($data['is_default']);
        }

        $currency->update($data);

        return $this->successResponse($currency->fresh(), 'Currency updated successfully.');
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/admin/currencies/{id}",
     *     summary="Delete a currency record",
     *     tags={"Admin - Currencies"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Currency deleted successfully")
     * )
     */
    public function destroy(Request $request, Currency $currency): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('currency.manage'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        if ($currency->is_default) {
            return $this->errorResponse('Cannot delete the store default currency.', 422);
        }

        $currency->delete();

        return $this->successResponse(null, 'Currency deleted successfully.');
    }

    /**
     * @OA\Post(
     *     path="/api/v1/admin/currencies/{id}/set-default",
     *     summary="Set a currency as default store currency",
     *     tags={"Admin - Currencies"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Default currency updated successfully")
     * )
     */
    public function setDefault(Request $request, Currency $currency): JsonResponse
    {
        $user = $request->user();
        if (!$user || !($user->isSuperAdmin() || $user->hasPermission('currency.manage'))) {
            return $this->errorResponse('You do not have permission to perform this action.', 403);
        }

        $updated = $this->settingsService->setDefaultCurrency(
            $currency,
            $request->user()?->id,
            $request->ip()
        );

        return $this->successResponse($updated, "Currency [{$currency->code}] set as store default.");
    }
}
