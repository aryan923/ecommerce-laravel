import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    Package,
    Users,
    Boxes,
    Percent,
    Download,
    RefreshCw,
    Calendar,
    Filter,
    DollarSign,
    RotateCcw,
    CheckCircle2,
    AlertTriangle,
    X,
    FileSpreadsheet,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('sales'); // sales, orders, products, customers, inventory, tax
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notification, setNotification] = useState(null);

    // Date Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Report Data States
    const [salesData, setSalesData] = useState({ summary: {}, breakdown: [] });
    const [ordersData, setOrdersData] = useState({ total_orders: 0, total_revenue: 0, status_breakdown: [] });
    const [productsData, setProductsData] = useState({ data: [], meta: {} });
    const [customersData, setCustomersData] = useState({ total_customers: 0, new_customers: 0, returning_customers: 0, average_order_value: 0, top_customers: [] });
    const [inventoryData, setInventoryData] = useState({ total_skus: 0, total_quantity: 0, stock_valuation: 0, low_stock_count: 0, out_of_stock_count: 0, recent_movements: [] });
    const [taxData, setTaxData] = useState({ taxable_amount: 0, cgst: 0, sgst: 0, igst: 0, total_tax: 0 });

    // Export Modal State
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportFormat, setExportFormat] = useState('csv');
    const [exporting, setExporting] = useState(false);

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchActiveReport = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (searchQuery) params.append('search', searchQuery);

            const endpoint = `/api/v1/admin/reports/${activeTab}?${params.toString()}`;
            const res = await axios.get(endpoint);

            if (res.data?.success && res.data?.data) {
                const d = res.data.data;
                switch (activeTab) {
                    case 'sales':
                        setSalesData(d);
                        break;
                    case 'orders':
                        setOrdersData(d);
                        break;
                    case 'products':
                        setProductsData(d);
                        break;
                    case 'customers':
                        setCustomersData(d);
                        break;
                    case 'inventory':
                        setInventoryData(d);
                        break;
                    case 'tax':
                        setTaxData(d);
                        break;
                    default:
                        break;
                }
            }
        } catch (err) {
            console.error('Failed to fetch report data:', err);
            showNotify('Failed to load report analytics data.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, startDate, endDate, searchQuery]);

    useEffect(() => {
        fetchActiveReport();
    }, [fetchActiveReport]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchActiveReport();
    };

    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
    };

    const handleTriggerExport = async (e) => {
        e.preventDefault();
        setExporting(true);
        try {
            const params = new URLSearchParams();
            params.append('report_type', activeTab);
            params.append('format', exportFormat);
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            // Open download link directly
            window.open(`/api/v1/admin/reports/export?${params.toString()}`, '_blank');
            showNotify(`Generating ${activeTab.toUpperCase()} report export in ${exportFormat.toUpperCase()} format...`);
            setIsExportModalOpen(false);
        } catch (err) {
            console.error('Export failed:', err);
            showNotify('Report export failed.', 'error');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 1200,
                    padding: '12px 20px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger, #ef4444)' : 'var(--admin-success, #10b981)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    animation: 'slideInRight 0.2s ease-out'
                }}>
                    {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <h2 className="page-header-title">Executive Reports & Analytics</h2>
                    <p className="page-header-subtitle">Comprehensive store reporting panel covering sales, order statuses, product performance, customer metrics, inventory valuation, and GST tax breakdowns</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsExportModalOpen(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                        <Download size={14} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Main Container */}
            <div className="card" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                {/* 6 Report Domain Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '4px',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)'
                }}>
                    {[
                        { id: 'sales', label: 'Sales Report', icon: <TrendingUp size={13} /> },
                        { id: 'orders', label: 'Order Status', icon: <ShoppingBag size={13} /> },
                        { id: 'products', label: 'Product Performance', icon: <Package size={13} /> },
                        { id: 'customers', label: 'Customer Analytics', icon: <Users size={13} /> },
                        { id: 'inventory', label: 'Inventory Movements', icon: <Boxes size={13} /> },
                        { id: 'tax', label: 'Tax Breakdown', icon: <Percent size={13} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '18px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                whiteSpace: 'nowrap',
                                backgroundColor: activeTab === tab.id ? 'var(--admin-primary, #6366f1)' : 'transparent',
                                color: activeTab === tab.id ? '#ffffff' : 'var(--admin-muted, #64748b)'
                            }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Filter Toolbar */}
                <div style={{
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-bg-secondary)'
                }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                        {/* Start Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)' }}>From:</span>
                            <input
                                type="date"
                                className="form-control"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ height: '36px', fontSize: '0.82rem', borderRadius: '8px', width: '145px' }}
                            />
                        </div>

                        {/* End Date */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)' }}>To:</span>
                            <input
                                type="date"
                                className="form-control"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ height: '36px', fontSize: '0.82rem', borderRadius: '8px', width: '145px' }}
                            />
                        </div>

                        {activeTab === 'products' && (
                            <div style={{ position: 'relative', width: '100%', maxWidth: '220px' }}>
                                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search product SKU..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '34px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                                />
                            </div>
                        )}

                        {(startDate || endDate || searchQuery) && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={handleResetFilters}
                                style={{ height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                                <RotateCcw size={13} /> Reset Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Report Content Body */}
                <div style={{ padding: '20px' }}>
                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                            <div>Compiling report metrics...</div>
                        </div>
                    ) : (
                        <>
                            {/* 1. SALES REPORT VIEW */}
                            {activeTab === 'sales' && (
                                <div>
                                    <div className="stat-cards-grid-4" style={{ marginBottom: '20px' }}>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Gross Sales</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '4px' }}>${salesData.summary?.gross_sales ?? '0.00'}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Discounts & Coupons</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>-${salesData.summary?.discounts ?? '0.00'}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Refunded Amount</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>-${salesData.summary?.refunds ?? '0.00'}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Net Total Sales</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>${salesData.summary?.net_sales ?? '0.00'}</div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>Daily Sales Aggregation Breakdown</h4>
                                    <div className="table-responsive">
                                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Date</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Orders</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Gross Sales</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Discounts</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Tax Collected</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Shipping Fees</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Total Sales</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {salesData.breakdown?.length === 0 ? (
                                                    <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>No sales transactions found in date range.</td></tr>
                                                ) : (
                                                    salesData.breakdown?.map((row, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                            <td style={{ padding: '10px 14px', fontWeight: 700 }}>{row.date}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>{row.orders_count}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>${parseFloat(row.gross_sales).toFixed(2)}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#ef4444' }}>-${parseFloat(row.discounts).toFixed(2)}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>${parseFloat(row.tax).toFixed(2)}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>${parseFloat(row.shipping).toFixed(2)}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>${parseFloat(row.total_sales).toFixed(2)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 2. ORDER STATUS REPORT VIEW */}
                            {activeTab === 'orders' && (
                                <div>
                                    <div className="stat-cards-grid-4" style={{ marginBottom: '20px' }}>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Orders</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '4px' }}>{ordersData.total_orders}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Revenue Value</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>${ordersData.total_revenue}</div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>Order Status Breakdown & Distribution</h4>
                                    <div className="table-responsive">
                                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Status</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Order Count</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Total Monetary Value</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Share Percentage</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ordersData.status_breakdown?.map((st, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                        <td style={{ padding: '10px 14px', fontWeight: 700, textTransform: 'uppercase' }}>{st.status}</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800 }}>{st.count}</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>${st.value.toFixed(2)}</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--admin-primary)' }}>{st.percentage}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 3. PRODUCT PERFORMANCE REPORT VIEW */}
                            {activeTab === 'products' && (
                                <div>
                                    <div className="table-responsive">
                                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Product Name</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>SKU</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Price</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Current Stock</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Units Sold</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Total Revenue</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Rating</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productsData.data?.length === 0 ? (
                                                    <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>No products found.</td></tr>
                                                ) : (
                                                    productsData.data?.map((p) => (
                                                        <tr key={p.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                            <td style={{ padding: '10px 14px', fontWeight: 800 }}>{p.name}</td>
                                                            <td style={{ padding: '10px 14px', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>{p.sku}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>${p.price.toFixed(2)}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>{p.stock}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#10b981' }}>{p.units_sold}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800 }}>${p.revenue.toFixed(2)}</td>
                                                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#f59e0b' }}>★ {p.avg_rating}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 4. CUSTOMER ANALYTICS REPORT VIEW */}
                            {activeTab === 'customers' && (
                                <div>
                                    <div className="stat-cards-grid-4" style={{ marginBottom: '20px' }}>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Registered Customers</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '4px' }}>{customersData.total_customers}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>New Customers</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>{customersData.new_customers}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Returning Customers</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{customersData.returning_customers}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Average Order Value (AOV)</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>${customersData.average_order_value}</div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>Top Lifetime Spend Customers</h4>
                                    <div className="table-responsive">
                                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Customer Name</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Email Address</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Total Orders</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Lifetime Spend</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customersData.top_customers?.map((c) => (
                                                    <tr key={c.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                        <td style={{ padding: '10px 14px', fontWeight: 800 }}>{c.name}</td>
                                                        <td style={{ padding: '10px 14px', color: 'var(--admin-muted)' }}>{c.email}</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700 }}>{c.orders_count}</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>${c.total_spent.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 5. INVENTORY MOVEMENTS REPORT VIEW */}
                            {activeTab === 'inventory' && (
                                <div>
                                    <div className="stat-cards-grid-4" style={{ marginBottom: '20px' }}>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total SKUs</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '4px' }}>{inventoryData.total_skus}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Stock Quantity</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>{inventoryData.total_quantity} units</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Stock Valuation</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>${inventoryData.stock_valuation}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Low / Out of Stock</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>{inventoryData.low_stock_count + inventoryData.out_of_stock_count} SKUs</div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>Recent Stock Movements Audit Log</h4>
                                    <div className="table-responsive">
                                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Product</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>SKU</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Movement Type</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Qty Change</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Timestamp</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventoryData.recent_movements?.map((m) => (
                                                    <tr key={m.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                        <td style={{ padding: '10px 14px', fontWeight: 800 }}>{m.product_name}</td>
                                                        <td style={{ padding: '10px 14px', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>{m.sku}</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{m.type}</td>
                                                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: m.quantity_changed >= 0 ? '#10b981' : '#ef4444' }}>
                                                            {m.quantity_changed >= 0 ? `+${m.quantity_changed}` : m.quantity_changed}
                                                        </td>
                                                        <td style={{ padding: '10px 14px', color: 'var(--admin-muted)', fontSize: '0.78rem' }}>{m.created_at}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 6. TAX BREAKDOWN REPORT VIEW */}
                            {activeTab === 'tax' && (
                                <div>
                                    <div className="stat-cards-grid-4" style={{ marginBottom: '20px' }}>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Taxable Sales Amount</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '4px' }}>${taxData.taxable_amount}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>CGST Collected</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>${taxData.cgst}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>SGST Collected</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>${taxData.sgst}</div>
                                        </div>
                                        <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-primary)', textTransform: 'uppercase' }}>Total Tax Collected</span>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-primary)', marginTop: '4px' }}>${taxData.total_tax}</div>
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>GST Tax Structure Breakdown Summary</h4>
                                    <div className="table-responsive">
                                        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Tax Category</th>
                                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: '0.74rem', color: 'var(--admin-muted)' }}>Tax Collected Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Central GST (CGST 50% Intra-State)</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800 }}>${taxData.cgst}</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>State GST (SGST 50% Intra-State)</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800 }}>${taxData.sgst}</td>
                                                </tr>
                                                <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>Integrated GST (IGST Inter-State)</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800 }}>${taxData.igst}</td>
                                                </tr>
                                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)' }}>
                                                    <td style={{ padding: '10px 14px', fontWeight: 800 }}>Total Cumulative Tax Collected</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: 'var(--admin-primary)' }}>${taxData.total_tax}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Export Modal */}
            {isExportModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--admin-border)'
                    }}>
                        <form onSubmit={handleTriggerExport}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Download size={18} color="var(--admin-primary)" />
                                    Export {activeTab.toUpperCase()} Report
                                </h3>
                                <button type="button" onClick={() => setIsExportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '6px' }}>
                                        File Format Selection
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div
                                            onClick={() => setExportFormat('csv')}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: exportFormat === 'csv' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                backgroundColor: 'var(--admin-bg-secondary)'
                                            }}
                                        >
                                            <FileText size={18} color="var(--admin-primary)" />
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>CSV File</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>Standard comma-separated</div>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setExportFormat('xlsx')}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: exportFormat === 'xlsx' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                backgroundColor: 'var(--admin-bg-secondary)'
                                            }}
                                        >
                                            <FileSpreadsheet size={18} color="#10b981" />
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>XLSX Excel</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>Formatted spreadsheet</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', backgroundColor: 'var(--admin-bg-secondary)', padding: '10px 12px', borderRadius: '8px' }}>
                                    Active date range parameters ({startDate || 'Beginning'} to {endDate || 'Today'}) will be applied to the export.
                                </div>
                            </div>

                            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsExportModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={exporting} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Download size={13} />
                                    <span>{exporting ? 'Generating Export...' : 'Download Export File'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
