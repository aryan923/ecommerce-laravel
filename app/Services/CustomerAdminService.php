<?php

namespace App\Services;

use App\Models\Address;
use App\Models\CustomerNote;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Password;

class CustomerAdminService
{
    /**
     * Get executive customer summary KPI metrics.
     */
    public function getStats(): array
    {
        $baseQuery = User::query()->where(function ($q) {
            $q->where('role', 'customer')->orWhereNull('role');
        });

        $totalCustomers = (clone $baseQuery)->count();
        $activeCustomers = (clone $baseQuery)->where('status', 'active')->count();
        $suspendedCustomers = (clone $baseQuery)->whereIn('status', ['suspended', 'disabled', 'inactive'])->count();
        $newCustomersThisMonth = (clone $baseQuery)->where('created_at', '>=', Carbon::now()->startOfMonth())->count();

        $totalRevenue = (float) Order::query()
            ->whereNotIn('status', ['cancelled', 'failed'])
            ->sum('grand_total');

        return [
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'suspended_customers' => $suspendedCustomers,
            'new_customers_this_month' => $newCustomersThisMonth,
            'total_revenue' => round($totalRevenue, 2),
        ];
    }

    /**
     * Fetch paginated customer listing with search, filtering, and aggregate counts.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::query()
            ->where(function ($q) {
                $q->where('role', 'customer')->orWhereNull('role');
            })
            ->withCount('orders')
            ->withSum(['orders' => function (Builder $q) {
                $q->whereNotIn('status', ['cancelled', 'failed']);
            }], 'grand_total');

        // Multi-field Search (Name, Email, Mobile)
        if (!empty($filters['search'])) {
            $searchTerm = trim($filters['search']);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('first_name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('last_name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('mobile', 'LIKE', "%{$searchTerm}%");
            });
        }

        // Status Filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Date Range Filters
        if (!empty($filters['registered_from'])) {
            $query->whereDate('created_at', '>=', $filters['registered_from']);
        }

        if (!empty($filters['registered_to'])) {
            $query->whereDate('created_at', '<=', $filters['registered_to']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'latest';
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'name_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'total_orders':
                $query->orderBy('orders_count', 'desc');
                break;
            case 'total_spent':
                $query->orderBy('orders_sum_grand_total', 'desc');
                break;
            case 'latest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($perPage);
    }

    /**
     * Fetch single customer profile with lifetime spending metrics.
     */
    public function getProfile(int $id): User
    {
        $customer = User::query()
            ->where('id', $id)
            ->with(['addresses', 'defaultShippingAddress', 'defaultBillingAddress'])
            ->firstOrFail();

        $validOrders = Order::query()
            ->where('user_id', $id)
            ->whereNotIn('status', ['cancelled', 'failed']);

        $totalOrdersCount = (clone $validOrders)->count();
        $totalSpent = (float) (clone $validOrders)->sum('grand_total');
        $avgOrderValue = $totalOrdersCount > 0 ? ($totalSpent / $totalOrdersCount) : 0;

        $lastOrder = Order::query()
            ->where('user_id', $id)
            ->latest('created_at')
            ->first();

        $customer->setAttribute('total_orders', $totalOrdersCount);
        $customer->setAttribute('total_spent', round($totalSpent, 2));
        $customer->setAttribute('avg_order_value', round($avgOrderValue, 2));
        $customer->setAttribute('last_order_at', $lastOrder?->created_at?->toIso8601String());
        $customer->setAttribute('registration_date', $customer->created_at?->toIso8601String());

        return $customer;
    }

    /**
     * Update customer basic details.
     */
    public function update(int $id, array $data): User
    {
        $customer = User::findOrFail($id);

        if (isset($data['first_name']) || isset($data['last_name'])) {
            $firstName = $data['first_name'] ?? $customer->first_name;
            $lastName = $data['last_name'] ?? $customer->last_name;
            $data['name'] = trim("{$firstName} {$lastName}");
        } elseif (isset($data['name'])) {
            $parts = explode(' ', trim($data['name']), 2);
            $data['first_name'] = $parts[0] ?? '';
            $data['last_name'] = $parts[1] ?? '';
        }

        $customer->update($data);

        return $customer;
    }

    /**
     * Change customer account status (active/suspended/disabled).
     */
    public function updateStatus(int $id, string $status, ?string $reason = null): User
    {
        $customer = User::findOrFail($id);
        $customer->status = $status;
        $customer->save();

        return $customer;
    }

    /**
     * Fetch customer order history.
     */
    public function getOrders(int $id, int $perPage = 10): LengthAwarePaginator
    {
        return Order::query()
            ->where('user_id', $id)
            ->with(['items.variant.product'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Fetch customer saved addresses.
     */
    public function getAddresses(int $id)
    {
        return Address::query()
            ->where('user_id', $id)
            ->latest()
            ->get();
    }

    /**
     * Fetch customer product reviews.
     */
    public function getReviews(int $id, int $perPage = 10): LengthAwarePaginator
    {
        return Review::query()
            ->where('user_id', $id)
            ->with(['product'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Fetch customer return requests.
     */
    public function getReturns(int $id, int $perPage = 10): LengthAwarePaginator
    {
        return ReturnRequest::query()
            ->where('user_id', $id)
            ->with(['order', 'items'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Fetch customer internal staff notes.
     */
    public function getNotes(int $id)
    {
        return CustomerNote::query()
            ->where('user_id', $id)
            ->with(['adminUser:id,name,email'])
            ->latest()
            ->get();
    }

    /**
     * Add an internal staff note for customer.
     */
    public function addNote(int $customerId, string $noteText, int $adminUserId): CustomerNote
    {
        return CustomerNote::create([
            'user_id' => $customerId,
            'admin_user_id' => $adminUserId,
            'note' => $noteText,
        ]);
    }

    /**
     * Trigger secure password reset notification dispatch.
     */
    public function resetPassword(int $id): array
    {
        $customer = User::findOrFail($id);
        $token = Password::createToken($customer);

        return [
            'message' => 'Password reset notification token generated successfully.',
            'reset_token' => $token,
            'email' => $customer->email,
        ];
    }

    /**
     * Export customer records to CSV format.
     */
    public function exportCsv(array $filters = []): string
    {
        $customers = $this->list(array_merge($filters, ['sort_by' => 'latest']), 1000)->items();

        $output = fopen('php://temp', 'r+');
        fputcsv($output, ['ID', 'Name', 'Email', 'Mobile', 'Status', 'Total Orders', 'Total Spent ($)', 'Registered Date']);

        foreach ($customers as $c) {
            $totalSpent = $c->orders_sum_grand_total ?? 0;
            fputcsv($output, [
                $c->id,
                $c->full_name ?: $c->name,
                $c->email,
                $c->mobile ?? 'N/A',
                strtoupper($c->status ?? 'active'),
                $c->orders_count ?? 0,
                number_format($totalSpent, 2, '.', ''),
                $c->created_at ? $c->created_at->format('Y-m-d H:i:s') : 'N/A',
            ]);
        }

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }
}
