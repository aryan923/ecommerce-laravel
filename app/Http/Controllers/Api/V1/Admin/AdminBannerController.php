<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StoreBannerRequest;
use App\Http\Requests\Admin\UpdateBannerRequest;
use App\Models\Banner;
use App\Services\BannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminBannerController extends BaseController
{
    public function __construct(
        protected BannerService $bannerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['placement', 'status', 'search', 'sort_by', 'sort_order']);
        $perPage = (int) $request->input('per_page', 15);

        $banners = $this->bannerService->listAdminBanners($filters, $perPage);

        return $this->paginatedResponse($banners, 'Banners retrieved successfully.');
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        $banner = $this->bannerService->createBanner($request->validated(), $user?->id);

        return $this->successResponse($banner, 'Banner created successfully.', 201);
    }

    public function show(Banner $banner): JsonResponse
    {
        return $this->successResponse($banner, 'Banner details retrieved successfully.');
    }

    public function update(UpdateBannerRequest $request, Banner $banner): JsonResponse
    {
        $updated = $this->bannerService->updateBanner($banner, $request->validated());

        return $this->successResponse($updated, 'Banner updated successfully.');
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $this->bannerService->deleteBanner($banner);

        return $this->successResponse(null, 'Banner deleted successfully.');
    }

    public function updateStatus(Request $request, Banner $banner): JsonResponse
    {
        $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $updated = $this->bannerService->updateStatus($banner, (bool) $request->input('is_active'));

        return $this->successResponse($updated, 'Banner status updated successfully.');
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'exists:banners,id'],
            'orders.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        $this->bannerService->reorderBanners($request->input('orders'));

        return $this->successResponse(null, 'Banners reordered successfully.');
    }
}
