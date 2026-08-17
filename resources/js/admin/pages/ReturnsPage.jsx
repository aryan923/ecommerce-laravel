import React, { useState, useEffect, useCallback } from 'react';
import {
    RotateCcw,
    DollarSign,
    Search,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    Truck,
    Package,
    Building,
    CreditCard,
    AlertCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    X
} from 'lucide-react';
import ReturnDetailModal from '../components/ReturnDetailModal';
import ProcessRefundModal from '../components/ProcessRefundModal';

export default function ReturnsPage() {
    const [activeTab, setActiveTab] = useState('returns'); // 'returns' | 'refunds'
    const [stats, setStats] = useState(null);
    const [returnsList, setReturnsList] = useState([]);
    const [refundsList, setRefundsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Modal state
    const [selectedReturnId, setSelectedReturnId] = useState(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/returns/stats', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const fetchReturns = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const params = new URLSearchParams({
                page,
                per_page: 15,
            });
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const res = await fetch(`/api/v1/admin/returns?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setReturnsList(data.data.data || []);
                setPagination({
                    current_page: data.data.current_page || 1,
                    last_page: data.data.last_page || 1,
                    total: data.data.total || 0,
                });
            }
        } catch (err) {
            console.error('Failed to load returns list:', err);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, dateFrom, dateTo]);

    const fetchRefunds = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const params = new URLSearchParams({
                page,
                per_page: 15,
            });
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (channelFilter) params.append('refund_channel', channelFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const res = await fetch(`/api/v1/admin/refunds?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.success) {
                setRefundsList(data.data.data || []);
                setPagination({
                    current_page: data.data.current_page || 1,
                    last_page: data.data.last_page || 1,
                    total: data.data.total || 0,
                });
            }
        } catch (err) {
            console.error('Failed to load refunds list:', err);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, channelFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'returns') {
            fetchReturns(1);
        } else {
            fetchRefunds(1);
        }
    }, [activeTab, fetchReturns, fetchRefunds]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'returns') {
            fetchReturns(1);
        } else {
            fetchRefunds(1);
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setChannelFilter('');
        setDateFrom('');
        setDateTo('');
    };

    const getReturnStatusBadge = (status) => {
        const styles = {
            requested: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
            under_review: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
            approved: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
            pickup_scheduled: { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' },
            picked_up: { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' },
            received: { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' },
            quality_check: { bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: 'rgba(139, 92, 246, 0.25)' },
            approved_for_refund: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
            refunded: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' },
            rejected: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' },
            closed: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: 'rgba(100, 116, 139, 0.25)' },
        };
        const s = styles[status] || styles.requested;
        return (
            <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                backgroundColor: s.bg,
                color: s.color,
                border: `1px solid ${s.border}`
            }}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <div>
            {/* Top Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Return & Refund Management</h2>
                    <p className="page-header-subtitle">Customer return requests, warehouse quality checks, and dual-channel refunds</p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        type="button"
                        className={`btn ${activeTab === 'returns' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setActiveTab('returns')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                    >
                        <RotateCcw size={14} />
                        <span>Return Requests</span>
                    </button>
                    <button
                        type="button"
                        className={`btn ${activeTab === 'refunds' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        onClick={() => setActiveTab('refunds')}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                    >
                        <DollarSign size={14} />
                        <span>Refund History</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid (Standard 4 Cards Per Row) */}
            <div className="stat-cards-grid-4">
                {/* Total Returns */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Returns
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RotateCcw size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {stats?.total_returns ?? '0'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            All recorded requests
                        </div>
                    </div>
                </div>

                {/* Pending Review */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Pending Review
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                            {stats?.pending_review_returns ?? '0'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Awaiting approval
                        </div>
                    </div>
                </div>

                {/* Logistics & QC */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            In Logistics / QC
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Truck size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6' }}>
                            {(stats?.pickup_scheduled_returns || 0) + (stats?.received_returns || 0) + (stats?.quality_check_returns || 0)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Pickup & warehouse inspection
                        </div>
                    </div>
                </div>

                {/* Total Refund Volume */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Refund Volume
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            ₹ {stats?.total_refunded_amount ? parseFloat(stats.total_refunded_amount).toFixed(2) : '0.00'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Processed payouts & credit
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Table Card with Toolbar */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Filter Toolbar Header */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)'
                }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder={activeTab === 'returns' ? "Search Return #, Order #, Customer..." : "Search Refund #, Gateway Ref, Order #..."}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px', height: '36px', borderRadius: '8px' }}
                            />
                        </div>

                        {activeTab === 'returns' ? (
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: 'auto', minWidth: '150px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                            >
                                <option value="">All Return Statuses</option>
                                <option value="requested">Requested</option>
                                <option value="under_review">Under Review</option>
                                <option value="approved">Approved</option>
                                <option value="pickup_scheduled">Pickup Scheduled</option>
                                <option value="received">Received</option>
                                <option value="quality_check">Quality Check</option>
                                <option value="approved_for_refund">Approved for Refund</option>
                                <option value="refunded">Refunded</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        ) : (
                            <select
                                className="form-select"
                                value={channelFilter}
                                onChange={(e) => setChannelFilter(e.target.value)}
                                style={{ width: 'auto', minWidth: '150px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                            >
                                <option value="">All Refund Channels</option>
                                <option value="original_gateway">Original Gateway</option>
                                <option value="bank_transfer">Bank Transfer (IMPS/NEFT)</option>
                                <option value="store_credit">Store Credit</option>
                                <option value="manual_cash">Manual / Cash</option>
                            </select>
                        )}

                        <input
                            type="date"
                            className="form-control"
                            placeholder="From Date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            style={{ width: 'auto', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                        />

                        <input
                            type="date"
                            className="form-control"
                            placeholder="To Date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            style={{ width: 'auto', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                        />

                        <button type="submit" className="btn btn-secondary" style={{ height: '36px', padding: '0 14px', borderRadius: '8px', fontWeight: 600 }}>
                            <Filter size={14} />
                            <span>Filter</span>
                        </button>

                        {(search || statusFilter || channelFilter || dateFrom || dateTo) && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleResetFilters}
                                title="Reset all filters"
                                style={{ height: '36px', padding: '0 10px', borderRadius: '8px' }}
                            >
                                <X size={13} />
                                <span>Reset</span>
                            </button>
                        )}
                    </form>
                </div>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                        Loading data records...
                    </div>
                ) : activeTab === 'returns' ? (
                    /* Returns Data Grid */
                    returnsList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                            No return requests found matching your filter criteria.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--admin-table-header)', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-muted)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px' }}>Return # & Date</th>
                                        <th style={{ padding: '12px 16px' }}>Order Details</th>
                                        <th style={{ padding: '12px 16px' }}>Customer</th>
                                        <th style={{ padding: '12px 16px' }}>Reason</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Items</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {returnsList.map((ret) => (
                                        <tr key={ret.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                    {ret.return_number}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    {new Date(ret.created_at).toLocaleDateString()}
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                                                    #{ret.order?.order_number || 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    {ret.order?.currency || 'INR'} {parseFloat(ret.order?.grand_total || 0).toFixed(2)} • {ret.order?.payment_method?.toUpperCase() || 'COD'}
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                                                    {ret.user?.name || 'Customer'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    {ret.user?.email || 'N/A'}
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {ret.reason}
                                                </div>
                                                {ret.bank_details_snapshot && (
                                                    <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <Building size={11} />
                                                        <span>Bank Attached</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>
                                                {ret.items?.length || 0}
                                            </td>

                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                {getReturnStatusBadge(ret.status)}
                                            </td>

                                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        setSelectedReturnId(ret.id);
                                                        setIsReturnModalOpen(true);
                                                    }}
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Eye size={14} />
                                                    <span>View 360 RMA</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    /* Refunds Data Grid */
                    refundsList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                            No refund transaction logs found.
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--admin-table-header)', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-muted)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 16px' }}>Refund # & Date</th>
                                        <th style={{ padding: '12px 16px' }}>Order Details</th>
                                        <th style={{ padding: '12px 16px' }}>Channel / Gateway</th>
                                        <th style={{ padding: '12px 16px' }}>Transaction Ref / UTR</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refundsList.map((ref) => (
                                        <tr key={ref.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                    {ref.refund_number}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    {new Date(ref.created_at).toLocaleString()}
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                                                    #{ref.order?.order_number || 'N/A'}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    Order Total: {ref.order?.currency || 'INR'} {parseFloat(ref.order?.grand_total || 0).toFixed(2)}
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 600, textTransform: 'uppercase', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {ref.refund_channel === 'bank_transfer' ? <Building size={14} color="#10b981" /> : <CreditCard size={14} color="#6366f1" />}
                                                    <span>{ref.refund_channel ? ref.refund_channel.replace(/_/g, ' ') : ref.gateway}</span>
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                                    Gateway: {ref.gateway}
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--admin-text)' }}>
                                                {ref.transaction_reference || ref.gateway_refund_id || 'N/A'}
                                            </td>

                                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                                                {ref.order?.currency || 'INR'} {parseFloat(ref.amount).toFixed(2)}
                                            </td>

                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    textTransform: 'uppercase',
                                                    backgroundColor: ref.status === 'completed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                    color: ref.status === 'completed' ? '#10b981' : '#ef4444',
                                                    border: `1px solid ${ref.status === 'completed' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                                                }}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderTop: '1px solid var(--admin-border)',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ color: 'var(--admin-muted)' }}>
                            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total records)
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page <= 1}
                                onClick={() => activeTab === 'returns' ? fetchReturns(pagination.current_page - 1) : fetchRefunds(pagination.current_page - 1)}
                            >
                                <ChevronLeft size={14} />
                                <span>Prev</span>
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => activeTab === 'returns' ? fetchReturns(pagination.current_page + 1) : fetchRefunds(pagination.current_page + 1)}
                            >
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Return Detail 360 Inspection Modal */}
            {isReturnModalOpen && selectedReturnId && (
                <ReturnDetailModal
                    returnId={selectedReturnId}
                    isOpen={isReturnModalOpen}
                    onClose={() => {
                        setIsReturnModalOpen(false);
                        setSelectedReturnId(null);
                    }}
                    onStatusUpdated={() => {
                        fetchStats();
                        fetchReturns(pagination.current_page);
                    }}
                />
            )}
        </div>
    );
}
