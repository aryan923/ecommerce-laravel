import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    ShoppingBag,
    Clock,
    CheckCircle2,
    Package,
    Truck,
    CheckSquare,
    XCircle,
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
    AlertTriangle,
    MapPin,
    Copy,
    Check,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    SlidersHorizontal,
    ArrowUpDown
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
    const [refreshing, setRefreshing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

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
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

    const fetchOrders = useCallback(async (targetPage = page) => {
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
            if (sortOrder) params.append('sort_order', sortOrder);
            params.append('page', targetPage);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/orders?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setOrders(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch order catalog:', err);
            showNotify('Failed to fetch order catalog.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, statusFilter, paymentMethodFilter, dateFrom, dateTo, minAmount, maxAmount, sortBy, sortOrder, page]);

    useEffect(() => {
        fetchOrders(page);
    }, [page, statusFilter, paymentMethodFilter, sortBy, sortOrder, fetchOrders]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
        fetchOrders(page);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchOrders(1);
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
        setSortOrder('desc');
        setPage(1);
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCopy = (text, id) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleOpenDetail = (oId) => {
        setSelectedOrderId(oId);
        setIsDetailModalOpen(true);
    };

    // Helper for Status Badge Styling
    const getStatusConfig = (status) => {
        switch (status) {
            case 'delivered':
                return { label: 'Delivered', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', dotColor: '#10b981', border: 'rgba(16, 185, 129, 0.3)', pulse: true };
            case 'shipped':
                return { label: 'In Transit / Shipped', bg: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', dotColor: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)', pulse: true };
            case 'processing':
                return { label: 'Processing', bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', dotColor: '#6366f1', border: 'rgba(99, 102, 241, 0.3)', pulse: false };
            case 'confirmed':
            case 'paid':
                return { label: status.toUpperCase(), bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', dotColor: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)', pulse: false };
            case 'pending_payment':
            case 'pending':
                return { label: 'Pending Payment', bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', dotColor: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', pulse: false };
            case 'cancelled':
            case 'failed':
                return { label: status.toUpperCase(), bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', dotColor: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', pulse: false };
            default:
                return { label: status?.toUpperCase() || 'UNKNOWN', bg: 'rgba(100, 116, 139, 0.12)', color: '#94a3b8', dotColor: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)', pulse: false };
        }
    };

    // Helper for Payment Method Icon/Badge
    const getPaymentBadge = (method) => {
        const m = (method || 'cod').toLowerCase();
        if (m === 'razorpay') {
            return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700, color: '#6366f1' }}>
                    <CreditCard size={13} />
                    <span>Razorpay</span>
                </span>
            );
        }
        if (m === 'stripe') {
            return (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700, color: '#6366f1' }}>
                    <CreditCard size={13} />
                    <span>Stripe</span>
                </span>
            );
        }
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                <DollarSign size={13} style={{ color: '#10b981' }} />
                <span>Cash on Delivery</span>
            </span>
        );
    };

    const hasActiveFilters = Boolean(search || statusFilter || paymentMethodFilter || dateFrom || dateTo || minAmount || maxAmount);

    return (
        <div>
            {/* Notification Alert Banner */}
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
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    animation: 'slideInRight 0.2s ease-out'
                }}>
                    {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            {/* Top Header Row */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Orders & Fulfillment</h2>
                    <p className="page-header-subtitle">Manage customer purchases, shipment tracking, payment status, and order milestones</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Currency Switcher */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                        padding: '4px 10px'
                    }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)' }}>Currency:</span>
                        <select
                            className="form-select"
                            style={{
                                padding: '2px 14px 2px 2px',
                                fontSize: '0.78rem',
                                border: 'none',
                                backgroundColor: 'transparent',
                                fontWeight: 800,
                                color: 'var(--admin-text)',
                                cursor: 'pointer'
                            }}
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

                    {/* Refresh Button */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Reload order list and metrics"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Micro Cards (Standard 4 Cards Per Row) */}
            <div className="stat-cards-grid-4">
                {/* Total Orders Card */}
                <div
                    onClick={() => { setStatusFilter(''); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === '' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Orders
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {stats.total_orders.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            All store orders placed
                        </div>
                    </div>
                </div>

                {/* Pending / Unpaid Card */}
                <div
                    onClick={() => { setStatusFilter(statusFilter === 'pending_payment' ? '' : 'pending_payment'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === 'pending_payment' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Pending / Unpaid
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                            {stats.pending_orders.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Awaiting payment confirmation
                        </div>
                    </div>
                </div>

                {/* Processing Card */}
                <div
                    onClick={() => { setStatusFilter(statusFilter === 'processing' ? '' : 'processing'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === 'processing' ? '2px solid #6366f1' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Processing Pipeline
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1' }}>
                            {stats.processing_orders.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Ready to pack & dispatch
                        </div>
                    </div>
                </div>

                {/* Total Revenue Card */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Gross Store Sales
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {formatCurrency(stats.total_revenue, displayCurrency, true)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Lifetime total volume
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Orders Table Card with Tabs & Toolbar */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Quick Status Navigation Tabs Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflowX: 'auto',
                    padding: '12px 16px 8px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)',
                    scrollbarWidth: 'none'
                }}>
                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === '' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter(''); setPage(1); }}
                    >
                        <span>All Orders</span>
                        <span className="order-tab-badge">{stats.total_orders}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'pending_payment' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('pending_payment'); setPage(1); }}
                    >
                        <Clock size={13} />
                        <span>Pending</span>
                        <span className="order-tab-badge">{stats.pending_orders}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'processing' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('processing'); setPage(1); }}
                    >
                        <Package size={13} />
                        <span>Processing</span>
                        <span className="order-tab-badge">{stats.processing_orders}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'shipped' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('shipped'); setPage(1); }}
                    >
                        <Truck size={13} />
                        <span>Shipped</span>
                        <span className="order-tab-badge">{stats.shipped_orders}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('delivered'); setPage(1); }}
                    >
                        <CheckCircle2 size={13} />
                        <span>Delivered</span>
                        <span className="order-tab-badge">{stats.delivered_orders}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('cancelled'); setPage(1); }}
                    >
                        <XCircle size={13} />
                        <span>Cancelled</span>
                        <span className="order-tab-badge">{stats.cancelled_orders}</span>
                    </button>
                </div>

                {/* Search & Filter Controls Row */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)'
                }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Order #, Customer, Email, City..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px', paddingRight: search ? '30px' : '10px', height: '36px', borderRadius: '8px' }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setPage(1); fetchOrders(1); }}
                                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Payment Mode Selector */}
                        <select
                            className="form-select"
                            style={{ width: 'auto', minWidth: '140px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
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

                        {/* Sort Order Selector */}
                        <select
                            className="form-select"
                            style={{ width: 'auto', minWidth: '130px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                            value={`${sortBy}:${sortOrder}`}
                            onChange={(e) => {
                                const [by, ord] = e.target.value.split(':');
                                setSortBy(by);
                                setSortOrder(ord);
                                setPage(1);
                            }}
                        >
                            <option value="created_at:desc">Newest First</option>
                            <option value="created_at:asc">Oldest First</option>
                            <option value="grand_total:desc">Amount: High to Low</option>
                            <option value="grand_total:asc">Amount: Low to High</option>
                        </select>

                        {/* Date Range Toggle / Advanced Filter Button */}
                        <button
                            type="button"
                            className={`btn ${showAdvancedFilters ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            style={{ height: '36px', padding: '0 12px', borderRadius: '8px' }}
                        >
                            <SlidersHorizontal size={14} />
                            <span>Filters</span>
                        </button>

                        <button type="submit" className="btn btn-secondary" style={{ height: '36px', padding: '0 14px', borderRadius: '8px', fontWeight: 600 }}>
                            <Filter size={14} />
                            <span>Apply</span>
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleResetFilters}
                                title="Reset all filters"
                                style={{ height: '36px', padding: '0 10px', borderRadius: '8px' }}
                            >
                                <RotateCcw size={13} />
                                <span>Reset</span>
                            </button>
                        )}
                    </form>

                    {/* Expandable Advanced Filters (Date Range & Price Range) */}
                    {showAdvancedFilters && (
                        <div style={{
                            marginTop: '10px',
                            paddingTop: '10px',
                            borderTop: '1px solid var(--admin-border)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                            gap: '10px'
                        }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '2px' }}>
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateFrom}
                                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                                    style={{ height: '34px', fontSize: '0.8rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '2px' }}>
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={dateTo}
                                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                                    style={{ height: '34px', fontSize: '0.8rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '2px' }}>
                                    Min ({displayCurrency})
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="form-control"
                                    value={minAmount}
                                    onChange={(e) => { setMinAmount(e.target.value); setPage(1); }}
                                    style={{ height: '34px', fontSize: '0.8rem' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '2px' }}>
                                    Max ({displayCurrency})
                                </label>
                                <input
                                    type="number"
                                    placeholder="e.g. 50000"
                                    className="form-control"
                                    value={maxAmount}
                                    onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }}
                                    style={{ height: '34px', fontSize: '0.8rem' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Active Filter Chips */}
                    {hasActiveFilters && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontWeight: 600 }}>Active:</span>

                            {search && (
                                <span className="order-filter-chip">
                                    <span>Search: "{search}"</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setSearch(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {statusFilter && (
                                <span className="order-filter-chip">
                                    <span>Status: {statusFilter.replace(/_/g, ' ').toUpperCase()}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setStatusFilter(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {paymentMethodFilter && (
                                <span className="order-filter-chip">
                                    <span>Payment: {paymentMethodFilter.toUpperCase()}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setPaymentMethodFilter(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {(dateFrom || dateTo) && (
                                <span className="order-filter-chip">
                                    <span>Date: {dateFrom || 'Any'} → {dateTo || 'Today'}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {(minAmount || maxAmount) && (
                                <span className="order-filter-chip">
                                    <span>Amount: {minAmount || 0} - {maxAmount || '∞'}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setMinAmount(''); setMaxAmount(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={handleResetFilters}
                                style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', marginLeft: '4px' }}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr style={{
                                backgroundColor: 'var(--admin-card-hover)',
                                borderBottom: '1px solid var(--admin-border)',
                                color: 'var(--admin-muted)',
                                textAlign: 'left',
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                <th style={{ padding: '14px 20px' }}>Order # & Date</th>
                                <th style={{ padding: '14px 16px' }}>Customer Info</th>
                                <th style={{ padding: '14px 16px' }}>Destination</th>
                                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Items</th>
                                <th style={{ padding: '14px 16px' }}>Payment Mode</th>
                                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Order Status</th>
                                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Grand Total</th>
                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                            <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--admin-primary)' }} />
                                            <span>Loading storefront orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length > 0 ? (
                                orders.map((ord) => {
                                    const cName = ord.guest_name || ord.user?.name || (ord.shipping_address?.name) || 'Customer';
                                    const cEmail = ord.guest_email || ord.user?.email || 'N/A';
                                    const cPhone = ord.user?.mobile || ord.shipping_address?.phone || ord.shipping_address?.mobile || null;
                                    const itemCount = ord.items ? ord.items.length : 0;
                                    const statusCfg = getStatusConfig(ord.status);
                                    const initial = cName.charAt(0).toUpperCase();

                                    const shipCity = ord.shipping_address?.city || null;
                                    const shipState = ord.shipping_address?.state_code || ord.shipping_address?.state || null;

                                    return (
                                        <tr
                                            key={ord.id}
                                            style={{
                                                borderBottom: '1px solid var(--admin-border)',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                            className="admin-table-row"
                                        >
                                            {/* Order # & Date */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontWeight: 800, color: 'var(--admin-primary)', fontSize: '0.92rem', fontFamily: 'monospace' }}>
                                                        {ord.order_number}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(ord.order_number, ord.id)}
                                                        title="Copy Order #"
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                                    >
                                                        {copiedId === ord.id ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} />
                                                    <span>{ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </td>

                                            {/* Customer Info */}
                                            <td style={{ padding: '16px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                                                        color: 'var(--admin-primary)',
                                                        fontWeight: 800,
                                                        fontSize: '0.85rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.88rem' }}>
                                                            {cName}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                            {cEmail}
                                                        </div>
                                                        {cPhone && (
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <Phone size={10} />
                                                                <span>{cPhone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Destination */}
                                            <td style={{ padding: '16px 16px' }}>
                                                {shipCity ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--admin-text)', fontWeight: 600 }}>
                                                        <MapPin size={13} style={{ color: 'var(--admin-muted)', flexShrink: 0 }} />
                                                        <span>{shipCity}{shipState ? `, ${shipState}` : ''}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>Standard Shipping</span>
                                                )}
                                            </td>

                                            {/* Items Count */}
                                            <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '3px 9px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    backgroundColor: 'var(--admin-card-hover)',
                                                    border: '1px solid var(--admin-border)',
                                                    color: 'var(--admin-text)'
                                                }}>
                                                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                                </span>
                                            </td>

                                            {/* Payment Mode */}
                                            <td style={{ padding: '16px 16px' }}>
                                                {getPaymentBadge(ord.payment_method)}
                                            </td>

                                            {/* Status Badge */}
                                            <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                                                <span
                                                    className="order-status-badge"
                                                    style={{
                                                        backgroundColor: statusCfg.bg,
                                                        color: statusCfg.color,
                                                        border: `1px solid ${statusCfg.border}`
                                                    }}
                                                >
                                                    <span
                                                        className={`order-status-dot ${statusCfg.pulse ? 'pulse' : ''}`}
                                                        style={{ backgroundColor: statusCfg.dotColor }}
                                                    />
                                                    <span>{statusCfg.label}</span>
                                                </span>
                                            </td>

                                            {/* Grand Total */}
                                            <td style={{ padding: '16px 16px', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                                {formatCurrency(ord.grand_total || 0, displayCurrency, true)}
                                            </td>

                                            {/* Action Button */}
                                            <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleOpenDetail(ord.id)}
                                                    title="Inspect 360 Order Details"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
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
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            No storefront orders found
                                        </div>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            Try adjusting your search criteria or resetting active filters.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        padding: '14px 20px',
                        borderTop: '1px solid var(--admin-border)',
                        backgroundColor: 'var(--admin-card-bg)',
                        fontSize: '0.85rem'
                    }}>
                        <span style={{ color: 'var(--admin-muted)' }}>
                            Showing page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total orders)
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page <= 1}
                                onClick={() => setPage(pagination.current_page - 1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <ChevronLeft size={14} />
                                <span>Previous</span>
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => setPage(pagination.current_page + 1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail 360 Inspection Modal */}
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                orderId={selectedOrderId}
                onClose={() => setIsDetailModalOpen(false)}
                onStatusChange={() => {
                    fetchStats();
                    fetchOrders(page);
                }}
            />
        </div>
    );
}
