import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    AlertTriangle,
    RotateCcw,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
    const [kpis, setKpis] = useState(null);
    const [salesChart, setSalesChart] = useState(null);
    const [orderStats, setOrderStats] = useState(null);
    const [topPerformers, setTopPerformers] = useState(null);
    const [highlights, setHighlights] = useState(null);
    const [period, setPeriod] = useState('last_30_days');
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [kpisRes, chartRes, statsRes, topRes, highlightsRes] = await Promise.all([
                axios.get('/api/v1/admin/dashboard/kpis'),
                axios.get(`/api/v1/admin/dashboard/sales-chart?period=${period}`),
                axios.get('/api/v1/admin/dashboard/order-stats'),
                axios.get('/api/v1/admin/dashboard/top-performers'),
                axios.get('/api/v1/admin/dashboard/highlights'),
            ]);

            setKpis(kpisRes.data?.data || {});
            setSalesChart(chartRes.data?.data || {});
            setOrderStats(statsRes.data?.data || {});
            setTopPerformers(topRes.data?.data || {});
            setHighlights(highlightsRes.data?.data || {});
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
    };

    // Calculate max value for chart scaling
    const maxChartVal = salesChart?.chart?.length
        ? Math.max(...salesChart.chart.map(c => c.total_sales), 100)
        : 100;

    return (
        <div>
            {/* Page Title & Subtitle */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Executive Dashboard</h2>
                    <p className="page-header-subtitle">Real-time store metrics, sales analytics, and operational alerts</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={fetchDashboardData}>
                        <RotateCcw size={16} />
                        <span>Refresh Data</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="kpis-grid">
                <div className="kpi-card">
                    <div>
                        <div className="kpi-label">Total Revenue</div>
                        <div className="kpi-value">{loading ? '...' : formatCurrency(kpis?.total_revenue)}</div>
                        <div className="kpi-subtext">Lifetime captured sales</div>
                    </div>
                    <div className="kpi-icon-box primary">
                        <DollarSign size={22} />
                    </div>
                </div>

                <div className="kpi-card">
                    <div>
                        <div className="kpi-label">Today's Revenue</div>
                        <div className="kpi-value">{loading ? '...' : formatCurrency(kpis?.today_revenue)}</div>
                        <div className="kpi-subtext">Captured today</div>
                    </div>
                    <div className="kpi-icon-box success">
                        <TrendingUp size={22} />
                    </div>
                </div>

                <div className="kpi-card">
                    <div>
                        <div className="kpi-label">Total Orders</div>
                        <div className="kpi-value">{loading ? '...' : (kpis?.total_orders || 0)}</div>
                        <div className="kpi-subtext">Today: {kpis?.today_orders || 0} orders</div>
                    </div>
                    <div className="kpi-icon-box info">
                        <ShoppingCart size={22} />
                    </div>
                </div>

                <div className="kpi-card">
                    <div>
                        <div className="kpi-label">Low Stock Alerts</div>
                        <div className="kpi-value text-warning" style={{ color: 'var(--admin-warning)' }}>
                            {loading ? '...' : (kpis?.low_stock_count || 0)}
                        </div>
                        <div className="kpi-subtext">Variants under threshold</div>
                    </div>
                    <div className="kpi-icon-box warning">
                        <AlertTriangle size={22} />
                    </div>
                </div>
            </div>

            {/* Secondary KPIs Row */}
            <div className="kpis-grid" style={{ marginBottom: '32px' }}>
                <div className="kpi-card" style={{ padding: '16px 20px' }}>
                    <div>
                        <div className="kpi-label">Total Customers</div>
                        <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{kpis?.total_customers || 0}</div>
                        <div className="kpi-subtext">New (30d): {kpis?.new_customers || 0}</div>
                    </div>
                    <div className="kpi-icon-box primary" style={{ width: '36px', height: '36px' }}>
                        <Users size={18} />
                    </div>
                </div>

                <div className="kpi-card" style={{ padding: '16px 20px' }}>
                    <div>
                        <div className="kpi-label">Delivered Orders</div>
                        <div className="kpi-value text-success" style={{ fontSize: '1.4rem' }}>{kpis?.delivered_orders || 0}</div>
                        <div className="kpi-subtext">Successfully fulfilled</div>
                    </div>
                    <div className="kpi-icon-box success" style={{ width: '36px', height: '36px' }}>
                        <CheckCircle size={18} />
                    </div>
                </div>

                <div className="kpi-card" style={{ padding: '16px 20px' }}>
                    <div>
                        <div className="kpi-label">Pending Returns / Refunds</div>
                        <div className="kpi-value text-danger" style={{ fontSize: '1.4rem' }}>
                            {(kpis?.pending_returns || 0) + (kpis?.pending_refunds || 0)}
                        </div>
                        <div className="kpi-subtext">Awaiting admin review</div>
                    </div>
                    <div className="kpi-icon-box danger" style={{ width: '36px', height: '36px' }}>
                        <RotateCcw size={18} />
                    </div>
                </div>

                <div className="kpi-card" style={{ padding: '16px 20px' }}>
                    <div>
                        <div className="kpi-label">Total Active Products</div>
                        <div className="kpi-value" style={{ fontSize: '1.4rem' }}>{kpis?.total_products || 0}</div>
                        <div className="kpi-subtext">Catalog size</div>
                    </div>
                    <div className="kpi-icon-box info" style={{ width: '36px', height: '36px' }}>
                        <Package size={18} />
                    </div>
                </div>
            </div>

            {/* Charts & Analytics Grid */}
            <div className="dashboard-grid-2">
                {/* Sales Analytics Chart */}
                <div className="dashboard-card">
                    <div className="card-header-flex">
                        <div>
                            <h3 className="card-title">Sales Revenue Analytics</h3>
                            <p className="kpi-subtext">Time-series sales performance breakdown</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} style={{ color: 'var(--admin-muted)' }} />
                            <select
                                className="form-select"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                            >
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last_7_days">Last 7 Days</option>
                                <option value="last_30_days">Last 30 Days</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                            </select>
                        </div>
                    </div>

                    {salesChart?.chart?.length ? (
                        <div className="sales-chart-container">
                            {salesChart.chart.map((point, idx) => {
                                const heightPct = Math.max(10, Math.min(100, (point.total_sales / maxChartVal) * 100));
                                return (
                                    <div key={idx} className="chart-bar-wrapper">
                                        <div
                                            className="chart-bar"
                                            style={{ height: `${heightPct}%` }}
                                            title={`${point.date}: ${formatCurrency(point.total_sales)} (${point.order_count} orders)`}
                                        />
                                        <span className="chart-bar-label">{point.date.slice(-5)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex-center" style={{ height: '220px', color: 'var(--admin-muted)' }}>
                            No sales records available for the selected period.
                        </div>
                    )}
                </div>

                {/* Order Status Distribution */}
                <div className="dashboard-card">
                    <h3 className="card-title" style={{ marginBottom: '16px' }}>Order Status Breakdown</h3>
                    <div className="status-grid">
                        {orderStats && Object.entries(orderStats).map(([statusKey, count]) => (
                            <div key={statusKey} className="status-stat-card">
                                <div className="status-stat-val">{count}</div>
                                <div className="status-stat-lbl">{statusKey.replace('_', ' ')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Performers & Highlights Grid */}
            <div className="dashboard-grid-2">
                {/* Top Selling Products */}
                <div className="dashboard-card">
                    <div className="card-header-flex">
                        <h3 className="card-title">Top Selling Products</h3>
                        <span className="kpi-subtext">By units sold</span>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Product Name</th>
                                    <th>SKU</th>
                                    <th>Units Sold</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPerformers?.top_products?.length ? (
                                    topPerformers.top_products.map((prd, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{prd.product_name}</td>
                                            <td className="text-muted">{prd.sku}</td>
                                            <td style={{ fontWeight: 700 }}>{prd.units_sold}</td>
                                            <td style={{ color: 'var(--admin-success)', fontWeight: 600 }}>
                                                {formatCurrency(prd.total_revenue)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-muted" style={{ textAlign: 'center' }}>
                                            No sales data yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="dashboard-card">
                    <div className="card-header-flex">
                        <h3 className="card-title text-danger">Low Stock Alert Panel</h3>
                        <span className="kpi-subtext">Immediate action required</span>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Available Qty</th>
                                    <th>Threshold</th>
                                </tr>
                            </thead>
                            <tbody>
                                {highlights?.low_stock_items?.length ? (
                                    highlights.low_stock_items.map((item, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{item.sku}</td>
                                            <td>
                                                <span className="badge badge-cancelled">
                                                    {item.available_qty} left
                                                </span>
                                            </td>
                                            <td className="text-muted">{item.low_stock_threshold}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-muted" style={{ textAlign: 'center' }}>
                                            All inventory stock levels are healthy!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
