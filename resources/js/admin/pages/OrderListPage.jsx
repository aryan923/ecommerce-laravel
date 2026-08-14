import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ShoppingBag,
    Clock,
    CheckCircle,
    Package,
    Truck,
    CheckSquare,
    XSquare,
    DollarSign,
    Search,
    Filter,
    RotateCcw,
    Eye,
    Calendar,
    Mail,
    Phone,
    X,
    CreditCard,
    AlertTriangle
} from 'lucide-react';
import OrderDetailModal from '../components/OrderDetailModal';
import { loadCurrenciesFromApi, getCurrencyList, formatCurrency } from '../utils/currency';

export default function OrderListPage() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        total_orders: 0,
        pending_orders: 0,
        confirmed_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        total_revenue: 0,
    });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Multi-Currency State
    const [displayCurrency, setDisplayCurrency] = useState('INR');
    const [currenciesList, setCurrenciesList] = useState(getCurrencyList());

    // Filters State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [page, setPage] = useState(1);

    // Order Detail Modal State
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        const initCurrencies = async () => {
            await loadCurrenciesFromApi();
            setCurrenciesList(getCurrencyList());
        };
        initCurrencies();
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/v1/admin/orders/stats');
            if (res.data?.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch order stats:', err);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (paymentMethodFilter) params.append('payment_method', paymentMethodFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);
            if (minAmount) params.append('min_amount', minAmount);
            if (maxAmount) params.append('max_amount', maxAmount);
            if (sortBy) params.append('sort_by', sortBy);
            params.append('page', page);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/orders?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setOrders(items);
                setPagination({
                    current_page: meta.current_page || 1,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch order catalog:', err);
            showNotify('Failed to fetch order catalog.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter, paymentMethodFilter, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchOrders();
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setPaymentMethodFilter('');
        setDateFrom('');
        setDateTo('');
        setMinAmount('');
        setMaxAmount('');
        setSortBy('created_at');
        setPage(1);
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenDetail = (oId) => {
        setSelectedOrderId(oId);
        setIsDetailModalOpen(true);
    };

    return (
        <div>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1100,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                }}>
                    {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            {/* Page Header Row */}
            <div className="page-header-row" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <h2 className="page-header-title">Storefront Order Processing & Fulfillment</h2>
                    <p className="page-header-subtitle">Monitor customer orders, status transitions, courier shipments, and order timeline logs</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Currency Switcher */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '4px 10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted)' }}>Currency:</span>
                        <select
                            className="form-select"
                            style={{ padding: '2px 24px 2px 8px', fontSize: '0.82rem', border: 'none', backgroundColor: 'transparent', fontWeight: 700 }}
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                        >
                            {currenciesList.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} ({c.symbol})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Executive KPI Micro Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                marginBottom: '20px'
            }}>
                <div className="kpi-card" style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Orders</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <ShoppingBag size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {stats.total_orders}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStatusFilter(statusFilter === 'pending_payment' ? '' : 'pending_payment'); setPage(1); }}
                    style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: `1.5px solid ${statusFilter === 'pending_payment' ? 'var(--admin-warning)' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Pending / Unpaid</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--admin-warning)', flexShrink: 0 }}>
                            <Clock size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-warning)' }}>
                        {stats.pending_orders}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStatusFilter(statusFilter === 'processing' ? '' : 'processing'); setPage(1); }}
                    style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: `1.5px solid ${statusFilter === 'processing' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Processing</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <Package size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-primary)' }}>
                        {stats.processing_orders}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStatusFilter(statusFilter === 'shipped' ? '' : 'shipped'); setPage(1); }}
                    style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: `1.5px solid ${statusFilter === 'shipped' ? 'var(--admin-info)' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Shipped Orders</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--admin-info)', flexShrink: 0 }}>
                            <Truck size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-info)' }}>
                        {stats.shipped_orders}
                    </div>
                </div>

                <div className="kpi-card" style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Store Revenue</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--admin-success)', flexShrink: 0 }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-success)' }}>
                        {formatCurrency(stats.total_revenue, displayCurrency, true)}
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="dashboard-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Order #, Customer, Email, SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px', paddingRight: search ? '32px' : '12px' }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setPage(1); fetchOrders(); }}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Order Statuses</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="paid">Paid</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="failed">Failed</option>
                    </select>

                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={paymentMethodFilter}
                        onChange={(e) => {
                            setPaymentMethodFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Payment Modes</option>
                        <option value="cod">Cash on Delivery (COD)</option>
                        <option value="razorpay">Razorpay Gateway</option>
                        <option value="stripe">Stripe Gateway</option>
                    </select>

                    <button type="submit" className="btn btn-primary">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>

                    {(search || statusFilter || paymentMethodFilter || dateFrom || dateTo || minAmount || maxAmount) && (
                        <button type="button" className="btn btn-secondary" onClick={handleResetFilters} title="Reset filters">
                            <RotateCcw size={14} />
                        </button>
                    )}
                </form>
            </div>

            {/* Orders Data Table */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="admin-table" style={{ width: '100%', margin: 0 }}>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '20px' }}>Order # & Date</th>
                                <th>Customer Information</th>
                                <th>Items</th>
                                <th>Payment Mode</th>
                                <th>Order Status</th>
                                <th>Grand Total</th>
                                <th style={{ textAlign: 'right', paddingRight: '20px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        Loading storefront orders...
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? (
                                orders.map((ord) => {
                                    const cName = ord.guest_name || ord.user?.name || (ord.shipping_address?.name) || 'Customer';
                                    const cEmail = ord.guest_email || ord.user?.email || 'N/A';
                                    const itemCount = ord.items ? ord.items.length : 0;
                                    const isDelivered = ord.status === 'delivered';
                                    const isCancelled = ord.status === 'cancelled';
                                    const isShipped = ord.status === 'shipped';

                                    return (
                                        <tr key={ord.id}>
                                            <td style={{ paddingLeft: '20px' }}>
                                                <div style={{ fontWeight: 800, color: 'var(--admin-primary)', fontSize: '0.9rem' }}>
                                                    {ord.order_number}
                                                </div>
                                                <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                    {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.88rem' }}>
                                                    {cName}
                                                </div>
                                                <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                    {cEmail}
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-text)' }}>
                                                    {ord.payment_method || 'COD'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${isDelivered ? 'badge-completed' : (isCancelled ? 'badge-cancelled' : (isShipped ? 'badge-shipped' : 'badge-pending'))}`} style={{ fontSize: '0.72rem' }}>
                                                    {ord.status ? ord.status.toUpperCase() : 'PENDING'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                                {formatCurrency(ord.grand_total || 0, displayCurrency, true)}
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleOpenDetail(ord.id)}
                                                    title="Inspect 360 Order Details"
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    <Eye size={14} />
                                                    <span>View Order</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        No storefront orders found matching your search filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--admin-border)' }}>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total orders)
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                orderId={selectedOrderId}
                onClose={() => setIsDetailModalOpen(false)}
                onStatusChange={() => {
                    fetchStats();
                    fetchOrders();
                }}
            />
        </div>
    );
}
