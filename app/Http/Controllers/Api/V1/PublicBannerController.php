<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\BannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicBannerController extends BaseController
{
    public function __construct(
        protected BannerService $bannerService
    ) {}

    /**
     * Get active banners for storefront.
     */
    public function index(Request $request): JsonResponse
    {
        $placement = $request->query('placement');
        $banners = $this->bannerService->getActiveStorefrontBanners($placement);

        return $this->successResponse($banners, 'Banners retrieved successfully.');
    }
}
