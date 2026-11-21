<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Models\Page;
use App\Services\PageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminPageController extends BaseController
{
    public function __construct(
        protected PageService $pageService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search', 'sort_by', 'sort_order']);
        $perPage = (int) $request->input('per_page', 15);

        $pages = $this->pageService->listAdminPages($filters, $perPage);

        return $this->paginatedResponse($pages, 'Pages retrieved successfully.');
    }

    public function store(StorePageRequest $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        $page = $this->pageService->createPage($request->validated(), $user?->id);

        return $this->successResponse($page, 'Page created successfully.', 201);
    }

    public function show(Page $page): JsonResponse
    {
        return $this->successResponse($page, 'Page details retrieved successfully.');
    }

    public function update(UpdatePageRequest $request, Page $page): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        $updated = $this->pageService->updatePage($page, $request->validated(), $user?->id);

        return $this->successResponse($updated, 'Page updated successfully.');
    }

    public function destroy(Page $page): JsonResponse
    {
        $this->pageService->deletePage($page);

        return $this->successResponse(null, 'Page deleted successfully.');
    }

    public function updateStatus(Request $request, Page $page): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:published,draft,archived'],
        ]);

        $user = Auth::guard('sanctum')->user();
        $updated = $this->pageService->updateStatus($page, $request->input('status'), $user?->id);

        return $this->successResponse($updated, 'Page status updated successfully.');
    }
}
