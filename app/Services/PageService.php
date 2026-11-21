<?php

namespace App\Services;

use App\Models\Page;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PageService
{
    /**
     * Get published page by slug for storefront.
     */
    public function getPublishedPageBySlug(string $slug): ?Page
    {
        return Page::published()->where('slug', $slug)->first();
    }

    /**
     * List admin pages with filters and pagination.
     */
    public function listAdminPages(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Page::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('seo_title', 'like', "%{$search}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? 'updated_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        return $query->orderBy($sortBy, $sortOrder)->paginate($perPage);
    }

    /**
     * Create page record.
     */
    public function createPage(array $data, ?int $createdBy = null): Page
    {
        if (empty($data['slug']) && !empty($data['title'])) {
            $data['slug'] = Page::generateUniqueSlug($data['title']);
        }

        if (!empty($data['content'])) {
            $data['content'] = $this->sanitizeHtml($data['content']);
        }

        if ($createdBy) {
            $data['created_by'] = $createdBy;
            $data['updated_by'] = $createdBy;
        }

        $page = Page::create($data);

        AuditLogService::log(
            'pages',
            'page.create',
            Page::class,
            $page->id,
            null,
            $page->toArray()
        );

        return $page;
    }

    /**
     * Update page record.
     */
    public function updatePage(Page $page, array $data, ?int $updatedBy = null): Page
    {
        $oldValues = $page->toArray();

        if (!empty($data['content'])) {
            $data['content'] = $this->sanitizeHtml($data['content']);
        }

        if ($updatedBy) {
            $data['updated_by'] = $updatedBy;
        }

        $page->update($data);

        AuditLogService::log(
            'pages',
            'page.update',
            Page::class,
            $page->id,
            $oldValues,
            $page->fresh()->toArray()
        );

        return $page;
    }

    /**
     * Delete page record.
     */
    public function deletePage(Page $page): bool
    {
        $oldValues = $page->toArray();
        $deleted = $page->delete();

        if ($deleted) {
            AuditLogService::log(
                'pages',
                'page.delete',
                Page::class,
                $oldValues['id'],
                $oldValues,
                null
            );
        }

        return $deleted;
    }

    /**
     * Update page publishing status.
     */
    public function updateStatus(Page $page, string $status, ?int $updatedBy = null): Page
    {
        return $this->updatePage($page, ['status' => $status], $updatedBy);
    }

    /**
     * Sanitize HTML content to prevent XSS.
     */
    protected function sanitizeHtml(string $html): string
    {
        // Strip script tags and inline event handlers
        $cleaned = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);
        $cleaned = preg_replace('/on[a-z]+\s*=\s*(["\']).*?\1/i', '', $cleaned);
        $cleaned = preg_replace('/on[a-z]+\s*=\s*[^"\'\s>]+/i', '', $cleaned);
        $cleaned = preg_replace('/javascript:/i', 'java-script:', $cleaned);

        return $cleaned ?? $html;
    }
}
