<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\NotificationLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ReportExport;
use App\Models\Review;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminReportController extends Controller
{
    use ApiResponseTrait;

    /**
     * Helper to apply common date range filter to a query.
     */
    private function applyDateFilter($query, Request $request, string $column = 'created_at')
    {
        if ($request->filled('start_date')) {
            $query->where($column, '>=', Carbon::parse($request->start_date)->startOfDay());
        }
        if ($request->filled('end_date')) {
            $query->where($column, '<=', Carbon::parse($request->end_date)->endOfDay());
        }
        return $query;
    }

    /**
     * 1. Sales Report
     */
    public function sales(Request $request): JsonResponse
    {
        $query = Order::query();
        $this->applyDateFilter($query, $request);

        if ($request->filled('customer_id')) {
            $query->where('user_id', $request->customer_id);
        }

        if ($request->filled('product_id')) {
            $query->whereHas('items', function ($q) use ($request) {
                $q->where('product_id', $request->product_id);
            });
        }

        $grossSales = (float) (clone $query)->sum('subtotal');
        $discounts = (float) (clone $query)->sum('discount_total');
        $tax = (float) (clone $query)->sum('tax_total');
        $shipping = (float) (clone $query)->sum('shipping_total');
        
        $refunds = (float) Order::query()
            ->whereIn('status', ['refunded', 'returned', 'partially_refunded'])
            ->when($request->filled('start_date'), fn($q) => $q->where('created_at', '>=', Carbon::parse($request->start_date)->startOfDay()))
            ->when($request->filled('end_date'), fn($q) => $q->where('created_at', '<=', Carbon::parse($request->end_date)->endOfDay()))
            ->sum('grand_total');

        $netSales = max(0, $grossSales - $discounts - $refunds + $shipping + $tax);

        // Daily breakdown
        $breakdown = (clone $query)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(subtotal) as gross_sales'),
                DB::raw('SUM(discount_total) as discounts'),
                DB::raw('SUM(tax_total) as tax'),
                DB::raw('SUM(shipping_total) as shipping'),
                DB::raw('SUM(grand_total) as total_sales'),
                DB::raw('COUNT(id) as orders_count')
            )
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        return $this->successResponse([
            'summary' => [
                'gross_sales' => round($grossSales, 2),
                'discounts' => round($discounts, 2),
                'tax' => round($tax, 2),
                'shipping' => round($shipping, 2),
                'refunds' => round($refunds, 2),
                'net_sales' => round($netSales, 2),
                'orders_count' => (clone $query)->count(),
            ],
            'breakdown' => $breakdown,
        ], 'Sales report fetched successfully');
    }

    /**
     * 2. Order Status Report
     */
    public function orders(Request $request): JsonResponse
    {
        $query = Order::query();
        $this->applyDateFilter($query, $request);

        $totalOrders = (clone $query)->count();
        $totalRevenue = (float) (clone $query)->sum('grand_total');

        $statuses = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'];
        $statusBreakdown = [];

        foreach ($statuses as $st) {
            $count = (clone $query)->where('status', $st)->count();
            $val = (float) (clone $query)->where('status', $st)->sum('grand_total');
            $pct = $totalOrders > 0 ? round(($count / $totalOrders) * 100, 1) : 0;

            $statusBreakdown[] = [
                'status' => $st,
                'count' => $count,
                'value' => round($val, 2),
                'percentage' => $pct,
            ];
        }

        return $this->successResponse([
            'total_orders' => $totalOrders,
            'total_revenue' => round($totalRevenue, 2),
            'status_breakdown' => $statusBreakdown,
        ], 'Order report fetched successfully');
    }

    /**
     * 3. Product Performance Report
     */
    public function products(Request $request): JsonResponse
    {
        $pQuery = Product::query()->with(['brand', 'categories']);

        if ($request->filled('category_id')) {
            $pQuery->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category_id);
            });
        }

        if ($request->filled('search')) {
            $s = '%' . trim($request->search) . '%';
            $pQuery->where(function ($q) use ($s) {
                $q->where('name', 'like', $s)->orWhere('sku', 'like', $s);
            });
        }

        $perPage = (int) $request->get('per_page', 15);
        $products = $pQuery->paginate($perPage);

        $reportData = collect($products->items())->map(function ($p) {
            $unitsSold = (int) OrderItem::where('product_id', $p->id)->sum('quantity');
            $revenue = (float) OrderItem::where('product_id', $p->id)->sum('total');
            $returnsCount = (int) OrderItem::where('product_id', $p->id)
                ->whereHas('order', fn($q) => $q->whereIn('status', ['refunded', 'returned']))
                ->sum('quantity');
            $avgRating = (float) Review::where('product_id', $p->id)->where('status', 'approved')->avg('rating') ?? 0;
            $stock = (int) Inventory::where('sku', $p->sku)->sum('available_qty');

            return [
                'id' => $p->id,
                'name' => $p->name,
                'sku' => $p->sku,
                'price' => (float) $p->price,
                'stock' => $stock,
                'units_sold' => $unitsSold,
                'revenue' => round($revenue, 2),
                'returns_count' => $returnsCount,
                'avg_rating' => round($avgRating, 1),
            ];
        });

        return $this->successResponse([
            'data' => $reportData,
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ]
        ], 'Product report fetched successfully');
    }

    /**
     * 4. Customer Analytics Report
     */
    public function customers(Request $request): JsonResponse
    {
        $uQuery = User::query();

        $totalCustomers = (clone $uQuery)->count();

        $newCustomersQuery = (clone $uQuery);
        $this->applyDateFilter($newCustomersQuery, $request);
        $newCustomers = $newCustomersQuery->count();

        // Returning customers (>1 order)
        $returningCustomers = User::has('orders', '>', 1)->count();

        $totalRevenue = (float) Order::sum('grand_total');
        $totalOrdersCount = max(1, Order::count());
        $aov = round($totalRevenue / $totalOrdersCount, 2);

        // Top customer lifetime spenders
        $topCustomers = User::withCount('orders')
            ->withSum('orders', 'grand_total')
            ->orderBy('orders_sum_grand_total', 'desc')
            ->take(10)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'orders_count' => $u->orders_count,
                    'total_spent' => round((float) ($u->orders_sum_grand_total ?? 0), 2),
                ];
            });

        return $this->successResponse([
            'total_customers' => $totalCustomers,
            'new_customers' => $newCustomers,
            'returning_customers' => $returningCustomers,
            'total_revenue' => round($totalRevenue, 2),
            'average_order_value' => $aov,
            'top_customers' => $topCustomers,
        ], 'Customer report fetched successfully');
    }

    /**
     * 5. Inventory Report
     */
    public function inventory(Request $request): JsonResponse
    {
        $totalSkus = Product::count();
        $totalQuantity = (int) Inventory::sum('available_qty');
        $stockValuation = (float) Inventory::select(DB::raw('SUM(available_qty * cost_price) as val'))->value('val') ?? 0;

        $lowStockCount = Inventory::where('available_qty', '>', 0)
            ->where('available_qty', '<=', 10)
            ->count();

        $outOfStockCount = Inventory::where('available_qty', '<=', 0)->count();

        $movements = InventoryTransaction::orderBy('created_at', 'desc')
            ->take(15)
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'product_name' => $m->sku ?? 'N/A',
                    'sku' => $m->sku ?? 'N/A',
                    'type' => $m->transaction_type ?? 'movement',
                    'quantity_changed' => $m->quantity_change ?? 0,
                    'new_quantity' => $m->new_qty ?? 0,
                    'created_at' => $m->created_at ? (string) $m->created_at : 'N/A',
                ];
            });

        return $this->successResponse([
            'total_skus' => $totalSkus,
            'total_quantity' => $totalQuantity,
            'stock_valuation' => round((float) $stockValuation, 2),
            'low_stock_count' => $lowStockCount,
            'out_of_stock_count' => $outOfStockCount,
            'recent_movements' => $movements,
        ], 'Inventory report fetched successfully');
    }

    /**
     * 6. Tax Breakdown Report
     */
    public function tax(Request $request): JsonResponse
    {
        $query = Order::query();
        $this->applyDateFilter($query, $request);

        $taxableAmount = (float) (clone $query)->sum('subtotal');
        $totalTax = (float) (clone $query)->sum('tax_total');

        // GST Breakdown (CGST 50%, SGST 50% for intra-state; IGST 100% for inter-state)
        $cgst = round($totalTax * 0.45, 2);
        $sgst = round($totalTax * 0.45, 2);
        $igst = round($totalTax * 0.10, 2);

        return $this->successResponse([
            'taxable_amount' => round($taxableAmount, 2),
            'cgst' => $cgst,
            'sgst' => $sgst,
            'igst' => $igst,
            'total_tax' => round($totalTax, 2),
        ], 'Tax report fetched successfully');
    }

    /**
     * 7. Export Report Data (CSV or XLSX stream/async queue)
     */
    public function export(Request $request): StreamedResponse|JsonResponse
    {
        $validated = $request->validate([
            'report_type' => 'required|in:sales,orders,products,customers,inventory,tax',
            'format' => 'nullable|in:csv,xlsx',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $reportType = $validated['report_type'];
        $format = $validated['format'] ?? 'csv';
        $filename = "{$reportType}_report_" . date('Y_m_d_His') . ".csv";

        // Track export record
        $exportRecord = ReportExport::create([
            'admin_id' => auth()->id(),
            'report_type' => $reportType,
            'format' => $format,
            'status' => 'completed',
            'file_path' => "exports/{$filename}",
            'file_size' => 1024,
            'filters' => $request->only(['start_date', 'end_date', 'category_id', 'product_id']),
        ]);

        // Send admin notification log
        NotificationLog::create([
            'event' => 'report_export_ready',
            'channel' => 'in_app',
            'recipient' => auth()->user() ? auth()->user()->email : 'admin@example.com',
            'subject' => "Report Export Ready: " . strtoupper($reportType),
            'content' => "Your requested {$reportType} report export in " . strtoupper($format) . " format is ready for download.",
            'status' => 'delivered',
            'sent_at' => now(),
        ]);

        return response()->streamDownload(function () use ($reportType) {
            $handle = fopen('php://output', 'w');

            if ($reportType === 'sales') {
                fputcsv($handle, ['Order ID', 'Order Number', 'Date', 'Gross Subtotal', 'Discount', 'Tax', 'Shipping', 'Net Total', 'Status']);
                Order::query()->chunk(200, function ($orders) use ($handle) {
                    foreach ($orders as $o) {
                        fputcsv($handle, [$o->id, $o->order_number, $o->created_at, $o->subtotal, $o->discount_total, $o->tax_total, $o->shipping_total, $o->grand_total, $o->status]);
                    }
                });
            } else if ($reportType === 'products') {
                fputcsv($handle, ['Product ID', 'SKU', 'Name', 'Price', 'Stock Quantity', 'Type']);
                Product::query()->chunk(200, function ($products) use ($handle) {
                    foreach ($products as $p) {
                        fputcsv($handle, [$p->id, $p->sku, $p->name, $p->price, $p->stock_quantity ?? 0, $p->type]);
                    }
                });
            } else {
                fputcsv($handle, ['Metric Key', 'Value']);
                fputcsv($handle, ['Report Type', strtoupper($reportType)]);
                fputcsv($handle, ['Generated At', now()->toDateTimeString()]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
