import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    UserCheck,
    UserX,
    DollarSign,
    Search,
    Filter,
    RotateCcw,
    Eye,
    Shield,
    CheckCircle,
    AlertTriangle,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    X,
    Copy,
    Check
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
    const [notification, setNotification] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Multi-Currency State
    const [displayCurrency, setDisplayCurrency] = useState('INR');
    const [currenciesList, setCurrenciesList] = useState(getCurrencyList());

    // Filters State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('id');
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

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (sortBy) params.append('sort_by', sortBy);
            params.append('page', page);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/customers?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setCustomers(items);
                setPagination({
                    current_page: meta.current_page || 1,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch customer catalog:', err);
            showNotify('Failed to fetch customer catalog.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, statusFilter, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers();
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setSortBy('id');
        setPage(1);
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCopyEmail = (email, id) => {
        navigator.clipboard.writeText(email);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleOpenDetail = (cId) => {
        setSelectedCustomerId(cId);
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
                    <h2 className="page-header-title">Customer Relationship Management</h2>
                    <p className="page-header-subtitle">Monitor customer lifetime spend, account statuses, order histories, and staff internal notes</p>
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Registered</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {stats.total_customers}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStatusFilter(statusFilter === 'active' ? '' : 'active'); setPage(1); }}
                    style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: `1.5px solid ${statusFilter === 'active' ? 'var(--admin-success)' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Active Accounts</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--admin-success)', flexShrink: 0 }}>
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-success)' }}>
                        {stats.active_customers}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStatusFilter(statusFilter === 'suspended' ? '' : 'suspended'); setPage(1); }}
                    style={{
                        padding: '14px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: `1.5px solid ${statusFilter === 'suspended' ? 'var(--admin-danger)' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Suspended Accounts</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--admin-danger)', flexShrink: 0 }}>
                            <UserX size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stats.suspended_customers > 0 ? 'var(--admin-danger)' : 'var(--admin-text)' }}>
                        {stats.suspended_customers}
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
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Lifetime Spend</span>
                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {formatCurrency(stats.total_customer_revenue, displayCurrency, true)}
                    </div>
                </div>
            </div>

            {/* Filters Toolbar Card */}
            <div className="dashboard-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Name, Email, Phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px', paddingRight: search ? '32px' : '12px' }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setPage(1); fetchCustomers(); }}
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
                        <option value="">All Account Statuses</option>
                        <option value="active">Active Accounts</option>
                        <option value="inactive">Inactive Accounts</option>
                        <option value="suspended">Suspended Accounts</option>
                    </select>

                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="id">Sort by Registration Date</option>
                        <option value="orders_count">Sort by Total Orders</option>
                    </select>

                    <button type="submit" className="btn btn-primary">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>

                    {(search || statusFilter || sortBy !== 'id') && (
                        <button type="button" className="btn btn-secondary" onClick={handleResetFilters} title="Reset filters">
                            <RotateCcw size={14} />
                        </button>
                    )}
                </form>
            </div>

            {/* Customer Data Table Card */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="admin-table" style={{ width: '100%', margin: 0 }}>
                        <thead>
                            <tr>
                                <th style={{ paddingLeft: '20px' }}>Customer Account</th>
                                <th>Contact Information</th>
                                <th>Lifetime Orders & Spend</th>
                                <th>Account Status</th>
                                <th>Registration Date</th>
                                <th style={{ textAlign: 'right', paddingRight: '20px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        Loading customer records...
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? (
                                customers.map((c) => {
                                    const fullName = c.full_name || c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Customer';
                                    const isSuspended = c.status === 'suspended';
                                    const isActive = c.status === 'active';

                                    return (
                                        <tr key={c.id}>
                                            <td style={{ paddingLeft: '20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                                        color: 'var(--admin-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.88rem' }}>
                                                            {fullName}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                            ID: #{c.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Mail size={13} style={{ color: 'var(--admin-muted)' }} />
                                                    <span>{c.email}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyEmail(c.email, c.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)', marginLeft: '2px' }}
                                                        title="Copy Email"
                                                    >
                                                        {copiedId === c.id ? <Check size={13} style={{ color: 'var(--admin-success)' }} /> : <Copy size={13} />}
                                                    </button>
                                                </div>
                                                {c.mobile && (
                                                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Phone size={12} />
                                                        <span>{c.mobile}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                                    {formatCurrency(c.total_spent || 0, displayCurrency, true)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    {c.orders_count || 0} orders placed
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${isActive ? 'badge-completed' : (isSuspended ? 'badge-cancelled' : 'badge-pending')}`} style={{ fontSize: '0.72rem' }}>
                                                    {c.status ? c.status.toUpperCase() : 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', whiteSpace: 'nowrap' }}>
                                                {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td style={{ textAlign: 'right', paddingRight: '20px', whiteSpace: 'nowrap' }}>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleOpenDetail(c.id)}
                                                    title="View Customer Profile History"
                                                    style={{ whiteSpace: 'nowrap' }}
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
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        No customer accounts found matching your search filters.
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
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total customers)
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

            {/* Customer Detail Modal */}
            <CustomerDetailPage
                isOpen={isDetailModalOpen}
                customerId={selectedCustomerId}
                onClose={() => setIsDetailModalOpen(false)}
                onStatusChange={() => {
                    fetchStats();
                    fetchCustomers();
                }}
            />
        </div>
    );
}
