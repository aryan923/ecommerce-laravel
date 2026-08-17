<?php

namespace App\Services;

use App\Models\Address;
use App\Models\Order;
use App\Models\Refund;
use App\Models\ReturnRequest;
use App\Models\Review;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CustomerService
{
    /**
     * Get executive customer dashboard KPIs.
     */
    public function getDashboardStats(): array
    {
        $baseQuery = User::where('role', 'customer');

        $totalCustomers = (clone $baseQuery)->count();
        $activeCustomers = (clone $baseQuery)->where('status', 'active')->count();
        $suspendedCustomers = (clone $baseQuery)->where('status', 'suspended')->count();
        $inactiveCustomers = (clone $baseQuery)->where('status', 'inactive')->count();

        $totalCustomerRevenue = (float) Order::whereNotIn('status', ['cancelled', 'failed'])
            ->sum('grand_total');

        return [
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'suspended_customers' => $suspendedCustomers,
            'inactive_customers' => $inactiveCustomers,
            'total_customer_revenue' => $totalCustomerRevenue,
        ];
    }

    /**
     * List paginated customers with search, status filters, and lifetime metrics.
     */
    public function list(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::where('role', 'customer')
            ->withCount(['orders', 'addresses', 'reviews']);

        // Search filter
        if (!empty($filters['search']) && is_string($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile', 'like', "%{$search}%");
            });
        }

        // Status filter
        if (!empty($filters['status']) && is_string($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'id';
        $sortOrder = strtolower($filters['sort_order'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'orders_count') {
            $query->orderBy('orders_count', $sortOrder);
        } else {
            $query->orderBy('id', $sortOrder);
        }

        $paginated = $query->paginate($perPage);

        // Attach lifetime spent metric to each customer in collection
        $paginated->getCollection()->transform(function ($user) {
            $user->total_spent = (float) $user->orders()
                ->whereNotIn('status', ['cancelled', 'failed'])
                ->sum('grand_total');
            return $user;
        });

        return $paginated;
    }

    /**
     * Get single customer profile with 360-degree analytics.
     */
    public function getProfile(int $customerId): array
    {
        $customer = User::where('role', 'customer')
            ->with(['defaultShippingAddress', 'defaultBillingAddress'])
            ->findOrFail($customerId);

        $totalOrders = $customer->orders()->count();
        $totalSpent = (float) $customer->orders()
            ->whereNotIn('status', ['cancelled', 'failed'])
            ->sum('grand_total');

        $avgOrderValue = $totalOrders > 0 ? round($totalSpent / $totalOrders, 2) : 0.00;
        $lastOrder = $customer->orders()->latest()->first();

        return [
            'customer' => $customer,
            'metrics' => [
                'total_orders' => $totalOrders,
                'total_spent' => $totalSpent,
                'average_order_value' => $avgOrderValue,
                'last_order_date' => $lastOrder?->created_at?->toIso8601String(),
                'last_order_number' => $lastOrder?->order_number,
                'registration_date' => $customer->created_at?->toIso8601String(),
            ],
        ];
    }

    /**
     * Get paginated customer detail tab data (orders, addresses, reviews, returns, refunds).
     */
    public function getTabContent(int $customerId, string $tab, int $perPage = 15): LengthAwarePaginator
    {
        $customer = User::where('role', 'customer')->findOrFail($customerId);

        return match ($tab) {
            'orders' => $customer->orders()->latest()->paginate($perPage),
            'addresses' => $customer->addresses()->latest()->paginate($perPage),
            'reviews' => $customer->reviews()->with('product')->latest()->paginate($perPage),
            'returns' => $customer->returnRequests()->with('order')->latest()->paginate($perPage),
            'refunds' => Refund::whereHas('order', function ($q) use ($customerId) {
                $q->where('user_id', $customerId);
            })->with('order')->latest()->paginate($perPage),
            default => $customer->orders()->latest()->paginate($perPage),
        };
    }

    /**
     * Update customer account status.
     */
    public function updateStatus(int $customerId, string $status): User
    {
        if (!in_array($status, ['active', 'inactive', 'suspended', 'pending_verification'])) {
            throw new \InvalidArgumentException("Invalid customer status '{$status}'.");
        }

        $customer = User::where('role', 'customer')->findOrFail($customerId);
        $customer->update(['status' => $status]);

        return $customer;
    }

    /**
     * Update admin internal notes for customer.
     */
    public function updateNotes(int $customerId, ?string $notes): User
    {
        $customer = User::where('role', 'customer')->findOrFail($customerId);
        $customer->update(['admin_notes' => $notes]);

        return $customer;
    }
}
