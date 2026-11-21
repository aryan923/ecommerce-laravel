<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\PageService;
use Illuminate\Http\JsonResponse;

class PublicPageController extends BaseController
{
    public function __construct(
        protected PageService $pageService
    ) {}

    /**
     * Get published page details by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $page = $this->pageService->getPublishedPageBySlug($slug);

        if (!$page) {
            return $this->errorResponse('Page not found.', 404);
        }

        return $this->successResponse($page, 'Page retrieved successfully.');
    }
}
