<?php

namespace App\Services;

use App\Models\Banner;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BannerService
{
    /**
     * Get active banners for public storefront.
     */
    public function getActiveStorefrontBanners(?string $placement = null): Collection
    {
        $query = Banner::active();

        if ($placement) {
            $query->forPlacement($placement);
        }

        return $query->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Paginated admin banner listing.
     */
    public function listAdminBanners(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Banner::query();

        if (!empty($filters['placement'])) {
            $query->where('placement', $filters['placement']);
        }

        if (isset($filters['status'])) {
            if ($filters['status'] === 'active') {
                $query->where('is_active', true);
            } elseif ($filters['status'] === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('button_text', 'like', "%{$search}%")
                    ->orWhere('link_url', 'like', "%{$search}%");
            });
        }

        $sortBy = $filters['sort_by'] ?? 'sort_order';
        $sortOrder = $filters['sort_order'] ?? 'asc';

        return $query->orderBy($sortBy, $sortOrder)
            ->orderBy('id', 'asc')
            ->paginate($perPage);
    }

    /**
     * Create banner record.
     */
    public function createBanner(array $data, ?int $createdBy = null): Banner
    {
        if ($createdBy) {
            $data['created_by'] = $createdBy;
        }

        $banner = Banner::create($data);

        AuditLogService::log(
            'banners',
            'banner.create',
            Banner::class,
            $banner->id,
            null,
            $banner->toArray()
        );

        return $banner;
    }

    /**
     * Update banner record.
     */
    public function updateBanner(Banner $banner, array $data): Banner
    {
        $oldValues = $banner->toArray();
        $banner->update($data);

        AuditLogService::log(
            'banners',
            'banner.update',
            Banner::class,
            $banner->id,
            $oldValues,
            $banner->fresh()->toArray()
        );

        return $banner;
    }

    /**
     * Delete banner record.
     */
    public function deleteBanner(Banner $banner): bool
    {
        $oldValues = $banner->toArray();
        $deleted = $banner->delete();

        if ($deleted) {
            AuditLogService::log(
                'banners',
                'banner.delete',
                Banner::class,
                $oldValues['id'],
                $oldValues,
                null
            );
        }

        return $deleted;
    }

    /**
     * Update status toggle.
     */
    public function updateStatus(Banner $banner, bool $isActive): Banner
    {
        return $this->updateBanner($banner, ['is_active' => $isActive]);
    }

    /**
     * Reorder banners display order.
     */
    public function reorderBanners(array $orders): void
    {
        DB::transaction(function () use ($orders) {
            foreach ($orders as $item) {
                if (isset($item['id'], $item['sort_order'])) {
                    Banner::where('id', $item['id'])->update(['sort_order' => (int)$item['sort_order']]);
                }
            }
        });

        AuditLogService::log(
            'banners',
            'banner.reorder',
            Banner::class,
            null,
            null,
            ['orders' => $orders]
        );
    }
}
