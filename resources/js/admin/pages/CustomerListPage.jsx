import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Users,
    UserCheck,
    UserX,
    UserMinus,
    DollarSign,
    Search,
    Filter,
    RotateCcw,
    Eye,
    Shield,
    CheckCircle2,
    AlertTriangle,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    X,
    Copy,
    Check,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Award,
    TrendingUp
} from 'lucide-react';
import CustomerDetailPage from './CustomerDetailPage';
import { loadCurrenciesFromApi, getCurrencyList, formatCurrency } from '../utils/currency';

export default function CustomerListPage() {
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState({
        total_customers: 0,
        active_customers: 0,
        suspended_customers: 0,
        inactive_customers: 0,
        total_customer_revenue: 0,
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
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(1);

    // Customer Detail Modal State
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
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
            const res = await axios.get('/api/v1/admin/customers/stats');
            if (res.data?.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch customer stats:', err);
        }
    };

    const fetchCustomers = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (sortBy) params.append('sort_by', sortBy);
            if (sortOrder) params.append('sort_order', sortOrder);
            params.append('page', targetPage);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/customers?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setCustomers(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch customer catalog:', err);
            showNotify('Failed to fetch customer catalog.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, statusFilter, sortBy, sortOrder, page]);

    useEffect(() => {
        fetchCustomers(page);
    }, [page, statusFilter, sortBy, sortOrder, fetchCustomers]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
        fetchCustomers(page);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers(1);
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setSortBy('id');
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

    const handleOpenDetail = (cId) => {
        setSelectedCustomerId(cId);
        setIsDetailModalOpen(true);
    };

    const getStatusConfig = (st) => {
        switch (st) {
            case 'active':
                return { label: 'Active Account', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)', dotColor: '#10b981', pulse: true };
            case 'suspended':
                return { label: 'Suspended', bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', dotColor: '#ef4444', pulse: false };
            case 'inactive':
            default:
                return { label: 'Inactive', bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', dotColor: '#f59e0b', pulse: false };
        }
    };

    const hasActiveFilters = Boolean(search || statusFilter || sortBy !== 'id');

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
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
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

            {/* Page Top Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Customer Management</h2>
                    <p className="page-header-subtitle">Monitor customer profiles, lifetime purchasing history, saved payout bank accounts, and internal staff notes</p>
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
                        title="Reload customer metrics and records"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Cards Grid (Standard 4 Cards Per Row) */}
            <div className="stat-cards-grid-4">
                {/* Total Registered Customers */}
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
                            Total Registered
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {stats.total_customers.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Store customer accounts
                        </div>
                    </div>
                </div>

                {/* Active Accounts */}
                <div
                    onClick={() => { setStatusFilter(statusFilter === 'active' ? '' : 'active'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === 'active' ? '2px solid #10b981' : '1px solid var(--admin-border)',
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
                            Active Accounts
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {stats.active_customers.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Healthy active buyers
                        </div>
                    </div>
                </div>

                {/* Suspended Accounts */}
                <div
                    onClick={() => { setStatusFilter(statusFilter === 'suspended' ? '' : 'suspended'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === 'suspended' ? '2px solid #ef4444' : '1px solid var(--admin-border)',
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
                            Suspended Accounts
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserX size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.suspended_customers > 0 ? '#ef4444' : 'var(--admin-text)' }}>
                            {stats.suspended_customers.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Restricted or flagged
                        </div>
                    </div>
                </div>

                {/* Total Customer Revenue */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Lifetime Spend Volume
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {formatCurrency(stats.total_customer_revenue, displayCurrency, true)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Total revenue from customers
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Table Card with Tabs & Toolbar */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Quick Segmented Status Tabs */}
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
                        <span>All Customers</span>
                        <span className="order-tab-badge">{stats.total_customers}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('active'); setPage(1); }}
                    >
                        <UserCheck size={13} />
                        <span>Active</span>
                        <span className="order-tab-badge">{stats.active_customers}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'suspended' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('suspended'); setPage(1); }}
                    >
                        <UserX size={13} />
                        <span>Suspended</span>
                        <span className="order-tab-badge">{stats.suspended_customers}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('inactive'); setPage(1); }}
                    >
                        <UserMinus size={13} />
                        <span>Inactive</span>
                        <span className="order-tab-badge">{stats.inactive_customers}</span>
                    </button>
                </div>

                {/* Search & Filter Toolbar Controls */}
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
                                placeholder="Search Name, Email, Mobile..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px', paddingRight: search ? '30px' : '10px', height: '36px', borderRadius: '8px' }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setPage(1); fetchCustomers(1); }}
                                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <select
                            className="form-select"
                            style={{ width: 'auto', minWidth: '160px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                            value={`${sortBy}:${sortOrder}`}
                            onChange={(e) => {
                                const [by, ord] = e.target.value.split(':');
                                setSortBy(by);
                                setSortOrder(ord || 'desc');
                                setPage(1);
                            }}
                        >
                            <option value="id:desc">Newest Registered</option>
                            <option value="id:asc">Oldest Registered</option>
                            <option value="orders_count:desc">Most Orders Placed</option>
                            <option value="total_spent:desc">Highest Lifetime Spend</option>
                        </select>

                        <button type="submit" className="btn btn-secondary" style={{ height: '36px', padding: '0 14px', borderRadius: '8px', fontWeight: 600 }}>
                            <Filter size={14} />
                            <span>Filter</span>
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
                                    <span>Status: {statusFilter.toUpperCase()}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setStatusFilter(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {sortBy !== 'id' && (
                                <span className="order-filter-chip">
                                    <span>Sorted by: {sortBy.replace(/_/g, ' ')}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setSortBy('id'); setPage(1); }}>
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
                                <th style={{ padding: '14px 20px' }}>Customer Profile</th>
                                <th style={{ padding: '14px 16px' }}>Contact Information</th>
                                <th style={{ padding: '14px 16px' }}>Orders & Lifetime Spend</th>
                                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Account Status</th>
                                <th style={{ padding: '14px 16px' }}>Member Since</th>
                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                            <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--admin-primary)' }} />
                                            <span>Loading customer directory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? (
                                customers.map((c) => {
                                    const fullName = c.full_name || c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Customer';
                                    const statusCfg = getStatusConfig(c.status);
                                    const initial = fullName.charAt(0).toUpperCase();
                                    const isVip = (parseFloat(c.total_spent) || 0) > 10000 || (c.orders_count || 0) > 5;

                                    return (
                                        <tr
                                            key={c.id}
                                            style={{
                                                borderBottom: '1px solid var(--admin-border)',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                            className="admin-table-row"
                                        >
                                            {/* Profile Info */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '10px',
                                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                                                        color: 'var(--admin-primary)',
                                                        fontWeight: 800,
                                                        fontSize: '0.95rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.9rem' }}>
                                                                {fullName}
                                                            </span>
                                                            {isVip && (
                                                                <span style={{
                                                                    fontSize: '0.68rem',
                                                                    fontWeight: 800,
                                                                    padding: '1px 6px',
                                                                    borderRadius: '4px',
                                                                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                                                    color: '#f59e0b',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '2px'
                                                                }}>
                                                                    <Award size={10} />
                                                                    VIP
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                                            ID: #{c.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Details */}
                                            <td style={{ padding: '16px 16px' }}>
                                                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Mail size={13} style={{ color: 'var(--admin-muted)' }} />
                                                    <span>{c.email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(c.email, `email_${c.id}`)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                                        title="Copy Email"
                                                    >
                                                        {copiedId === `email_${c.id}` ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                                {c.mobile && (
                                                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Phone size={11} />
                                                        <span>{c.mobile}</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Orders & Spend */}
                                            <td style={{ padding: '16px 16px' }}>
                                                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                                    {formatCurrency(c.total_spent || 0, displayCurrency, true)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                    <ShoppingBag size={11} />
                                                    <span>{c.orders_count || 0} {c.orders_count === 1 ? 'order' : 'orders'} placed</span>
                                                </div>
                                            </td>

                                            {/* Status */}
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

                                            {/* Registration Date */}
                                            <td style={{ padding: '16px 16px', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={12} />
                                                    <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </td>

                                            {/* Action Button */}
                                            <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleOpenDetail(c.id)}
                                                    title="View Full Customer 360 Profile"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
                                                >
                                                    <Eye size={14} />
                                                    <span>View Profile</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            No customer accounts found
                                        </div>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            Try modifying your search keywords or resetting status filters.
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
                            Showing page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total customers)
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

            {/* Customer 360 Profile Modal */}
            <CustomerDetailPage
                isOpen={isDetailModalOpen}
                customerId={selectedCustomerId}
                onClose={() => setIsDetailModalOpen(false)}
                onStatusChange={() => {
                    fetchStats();
                    fetchCustomers(page);
                }}
            />
        </div>
    );
}
