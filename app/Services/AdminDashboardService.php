<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Refund;
use App\Models\ReturnRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
    /**
     * Get real-time summary KPI metrics.
     */
    public function getKpis(): array
    {
        $now = Carbon::now();
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $totalRevenue = (float) Order::whereNotIn('status', ['cancelled'])->sum('grand_total');
        $todayRevenue = (float) Order::whereNotIn('status', ['cancelled'])
            ->whereDate('created_at', $today)
            ->sum('grand_total');
        $monthlyRevenue = (float) Order::whereNotIn('status', ['cancelled'])
            ->where('created_at', '>=', $startOfMonth)
            ->sum('grand_total');

        $totalOrders = (int) Order::count();
        $todayOrders = (int) Order::whereDate('created_at', $today)->count();
        $pendingOrders = (int) Order::whereIn('status', ['pending_payment', 'paid', 'confirmed', 'processing'])->count();
        $deliveredOrders = (int) Order::where('status', 'delivered')->count();
        $cancelledOrders = (int) Order::where('status', 'cancelled')->count();

        $totalCustomers = (int) User::count();
        $newCustomers = (int) User::where('created_at', '>=', $now->copy()->subDays(30))->count();

        $totalProducts = (int) Product::count();
        $lowStockCount = (int) Inventory::whereColumn('available_qty', '<=', 'low_stock_threshold')->count();

        $pendingReturns = (int) ReturnRequest::whereIn('status', ['requested', 'under_review'])->count();
        $pendingRefunds = (int) Refund::where('status', 'pending')->count();

        return [
            'total_revenue' => round($totalRevenue, 2),
            'today_revenue' => round($todayRevenue, 2),
            'monthly_revenue' => round($monthlyRevenue, 2),
            'total_orders' => $totalOrders,
            'today_orders' => $todayOrders,
            'pending_orders' => $pendingOrders,
            'delivered_orders' => $deliveredOrders,
            'cancelled_orders' => $cancelledOrders,
            'total_customers' => $totalCustomers,
            'new_customers' => $newCustomers,
            'total_products' => $totalProducts,
            'low_stock_count' => $lowStockCount,
            'pending_returns' => $pendingReturns,
            'pending_refunds' => $pendingRefunds,
        ];
    }

    /**
     * Get sales chart time-series data with period filtering.
     */
    public function getSalesChart(array $filters = []): array
    {
        $period = $filters['period'] ?? 'last_30_days';
        $query = Order::whereNotIn('status', ['cancelled']);

        $startDate = null;
        $endDate = Carbon::now();

        switch ($period) {
            case 'today':
                $startDate = Carbon::today();
                break;
            case 'yesterday':
                $startDate = Carbon::yesterday()->startOfDay();
                $endDate = Carbon::yesterday()->endOfDay();
                break;
            case 'last_7_days':
                $startDate = Carbon::now()->subDays(6)->startOfDay();
                break;
            case 'this_month':
                $startDate = Carbon::now()->startOfMonth();
                break;
            case 'last_month':
                $startDate = Carbon::now()->subMonth()->startOfMonth();
                $endDate = Carbon::now()->subMonth()->endOfMonth();
                break;
            case 'custom':
                if (!empty($filters['start_date'])) {
                    $startDate = Carbon::parse($filters['start_date'])->startOfDay();
                }
                if (!empty($filters['end_date'])) {
                    $endDate = Carbon::parse($filters['end_date'])->endOfDay();
                }
                break;
            case 'last_30_days':
            default:
                $startDate = Carbon::now()->subDays(29)->startOfDay();
                break;
        }

        if ($startDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $records = $query->select(
            DB::raw('DATE(created_at) as date_label'),
            DB::raw('SUM(grand_total) as total_sales'),
            DB::raw('COUNT(id) as order_count')
        )
        ->groupBy('date_label')
        ->orderBy('date_label', 'asc')
        ->get();

        $chartData = [];
        foreach ($records as $rec) {
            $chartData[] = [
                'date' => $rec->date_label,
                'total_sales' => round((float) $rec->total_sales, 2),
                'order_count' => (int) $rec->order_count,
            ];
        }

        return [
            'period' => $period,
            'start_date' => $startDate ? $startDate->toIso8601String() : null,
            'end_date' => $endDate->toIso8601String(),
            'chart' => $chartData,
        ];
    }

    /**
     * Get order count distribution by status.
     */
    public function getOrderStats(): array
    {
        $statuses = [
            'pending_payment',
            'paid',
            'confirmed',
            'processing',
            'packed',
            'shipped',
            'out_for_delivery',
            'delivered',
            'cancelled',
        ];

        $counts = Order::select('status', DB::raw('COUNT(id) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $result = [];
        foreach ($statuses as $status) {
            $result[$status] = (int) ($counts[$status] ?? 0);
        }

        return $result;
    }

    /**
     * Get top performing products and categories.
     */
    public function getTopPerformers(int $limit = 5): array
    {
        $topProducts = OrderItem::select(
            'product_id',
            'product_name',
            'sku',
            DB::raw('SUM(quantity) as units_sold'),
            DB::raw('SUM(total_amount) as total_revenue')
        )
        ->groupBy('product_id', 'product_name', 'sku')
        ->orderBy(DB::raw('SUM(quantity)'), 'desc')
        ->take($limit)
        ->get()
        ->map(fn ($item) => [
            'product_id' => $item->product_id,
            'product_name' => $item->product_name,
            'sku' => $item->sku,
            'units_sold' => (int) $item->units_sold,
            'total_revenue' => round((float) $item->total_revenue, 2),
        ]);

        $topCategories = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('product_categories', 'products.id', '=', 'product_categories.product_id')
            ->join('categories', 'product_categories.category_id', '=', 'categories.id')
            ->select(
                'categories.id as category_id',
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.total_amount) as total_revenue')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderBy(DB::raw('SUM(order_items.total_amount)'), 'desc')
            ->take($limit)
            ->get()
            ->map(fn ($item) => [
                'category_id' => $item->category_id,
                'category_name' => $item->category_name,
                'units_sold' => (int) $item->units_sold,
                'total_revenue' => round((float) $item->total_revenue, 2),
            ]);

        return [
            'top_products' => $topProducts,
            'top_categories' => $topCategories,
        ];
    }

    /**
     * Get dashboard highlights (recent orders and low stock inventory).
     */
    public function getHighlights(int $limit = 5): array
    {
        $recentOrders = Order::with('user:id,name,email')
            ->orderBy('id', 'desc')
            ->take($limit)
            ->get();

        $lowStockItems = Inventory::with(['variant.product:id,name,sku'])
            ->whereColumn('available_qty', '<=', 'low_stock_threshold')
            ->orderBy('available_qty', 'asc')
            ->take($limit)
            ->get();

        return [
            'recent_orders' => $recentOrders,
            'low_stock_items' => $lowStockItems,
        ];
    }
}
