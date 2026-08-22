import React, { useState, useEffect } from 'react';
import {
    Activity,
    Calendar,
    Users,
    ShieldAlert,
    Search,
    Filter,
    Download,
    RefreshCw,
    Eye,
    X,
    FileText,
    ArrowRight,
    CheckCircle,
    Clock,
    Globe,
    Monitor
} from 'lucide-react';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        total_logs: 0,
        today_events: 0,
        active_actors: 0,
        security_actions: 0
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });

    // Filter Metadata Dropdowns
    const [metaModules, setMetaModules] = useState([]);
    const [metaActions, setMetaActions] = useState([]);
    const [metaActors, setMetaActors] = useState([]);

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        module: '',
        action: '',
        actor_id: '',
        date_from: '',
        date_to: ''
    });

    // Modal State
    const [selectedLog, setSelectedLog] = useState(null);
    const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
    const [showFullUserAgent, setShowFullUserAgent] = useState(false);

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        fetchLogs(1);
    }, [filters.module, filters.action, filters.actor_id, filters.date_from, filters.date_to]);

    const fetchMetadata = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/audit-logs/modules', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                setMetaModules(data.data.modules || []);
                setMetaActions(data.data.actions || []);
                setMetaActors(data.data.actors || []);
            }
        } catch (err) {
            console.error('Error fetching audit log metadata:', err);
        }
    };

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const query = new URLSearchParams({
                page: page,
                per_page: pagination.per_page,
                ...(filters.search && { search: filters.search }),
                ...(filters.module && { module: filters.module }),
                ...(filters.action && { action: filters.action }),
                ...(filters.actor_id && { actor_id: filters.actor_id }),
                ...(filters.date_from && { date_from: filters.date_from }),
                ...(filters.date_to && { date_to: filters.date_to })
            });

            const res = await fetch(`/api/v1/admin/audit-logs?${query.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                setLogs(data.data.logs || []);
                setPagination(data.data.pagination || {});
                setMetrics(data.data.metrics || {});
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchLogs(1);
    };

    const handleResetFilters = () => {
        setFilters({
            search: '',
            module: '',
            action: '',
            actor_id: '',
            date_from: '',
            date_to: ''
        });
        setTimeout(() => fetchLogs(1), 50);
    };

    const handleExportCsv = () => {
        const token = localStorage.getItem('admin_token');
        const query = new URLSearchParams({
            ...(filters.search && { search: filters.search }),
            ...(filters.module && { module: filters.module }),
            ...(filters.action && { action: filters.action }),
            ...(filters.actor_id && { actor_id: filters.actor_id }),
            ...(filters.date_from && { date_from: filters.date_from }),
            ...(filters.date_to && { date_to: filters.date_to })
        });

        window.open(`/api/v1/admin/audit-logs/export?${query.toString()}&token=${token}`, '_blank');
    };

    const getModuleBadgeColor = (mod) => {
        switch (mod?.toLowerCase()) {
            case 'staff':
            case 'roles':
                return { bg: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', border: 'rgba(99, 102, 241, 0.3)' };
            case 'settings':
                return { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
            case 'taxes':
                return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
            case 'products':
            case 'inventory':
                return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
            case 'orders':
            case 'refunds':
                return { bg: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' };
            default:
                return { bg: 'var(--admin-bg)', color: 'var(--admin-muted)', border: 'var(--admin-border)' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Admin Audit Logs</h1>
                    <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                        Tamper-evident audit trail & system activity inspection across administrative operations
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => fetchLogs(pagination.current_page)}
                        disabled={loading}
                        style={{ height: '38px', padding: '0 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem' }}
                    >
                        <RefreshCw size={15} className={loading ? 'spin' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleExportCsv}
                        style={{ height: '38px', padding: '0 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Logs</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>{metrics.total_logs?.toLocaleString()}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logged Today</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>{metrics.today_events?.toLocaleString()}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Admin Actors</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>{metrics.active_actors?.toLocaleString()}</div>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldAlert size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Security Events</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>{metrics.security_actions?.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="card" style={{ padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    {/* Search Input */}
                    <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search actor, email, action, entity..."
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                            style={{ paddingLeft: '36px', height: '38px', borderRadius: '8px', fontSize: '0.84rem' }}
                        />
                    </div>

                    {/* Module Filter Dropdown */}
                    <div style={{ minWidth: '150px' }}>
                        <select
                            className="form-select"
                            value={filters.module}
                            onChange={e => setFilters({ ...filters, module: e.target.value })}
                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.84rem' }}
                        >
                            <option value="">All Modules</option>
                            {metaModules.map(m => (
                                <option key={m} value={m}>{m.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Admin Actor Dropdown */}
                    <div style={{ minWidth: '160px' }}>
                        <select
                            className="form-select"
                            value={filters.actor_id}
                            onChange={e => setFilters({ ...filters, actor_id: e.target.value })}
                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.84rem' }}
                        >
                            <option value="">All Actors</option>
                            {metaActors.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                            ))}
                        </select>
                    </div>

                    {/* Date From */}
                    <div style={{ minWidth: '140px' }}>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.date_from}
                            onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                            placeholder="From Date"
                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.84rem' }}
                        />
                    </div>

                    {/* Date To */}
                    <div style={{ minWidth: '140px' }}>
                        <input
                            type="date"
                            className="form-control"
                            value={filters.date_to}
                            onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                            placeholder="To Date"
                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.84rem' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-secondary"
                        style={{ height: '38px', padding: '0 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem' }}
                    >
                        Filter
                    </button>

                    {(filters.search || filters.module || filters.action || filters.actor_id || filters.date_from || filters.date_to) && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleResetFilters}
                            style={{ height: '38px', padding: '0 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.84rem', color: 'var(--admin-muted)' }}
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {/* Audit Logs Data Table */}
            <div className="card" style={{ borderRadius: '14px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--admin-card-hover)', borderBottom: '1px solid var(--admin-border)' }}>
                                <th style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--admin-muted)', width: '190px' }}>TIMESTAMP</th>
                                <th style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--admin-muted)' }}>ACTOR</th>
                                <th style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--admin-muted)' }}>MODULE / ACTION</th>
                                <th style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--admin-muted)' }}>TARGET ENTITY</th>
                                <th style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--admin-muted)', width: '130px' }}>CLIENT IP</th>
                                <th style={{ padding: '14px 20px', fontWeight: 800, color: 'var(--admin-muted)', textAlign: 'right', width: '130px' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                        <RefreshCw size={22} className="spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                                        <span>Loading audit trail data...</span>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                        <FileText size={28} style={{ margin: '0 auto 10px auto', display: 'block', opacity: 0.5 }} />
                                        <span>No audit log records found matching your filters.</span>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const badge = getModuleBadgeColor(log.module);
                                    return (
                                        <tr key={log.id} style={{ borderBottom: '1px solid var(--admin-border)', transition: 'background-color 0.15s ease' }}>
                                            <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{formatDate(log.created_at)}</div>
                                            </td>

                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', fontWeight: 800, fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {log.actor_name ? log.actor_name.charAt(0).toUpperCase() : 'S'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{log.actor_name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>{log.actor_email}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        padding: '3px 9px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        backgroundColor: badge.bg,
                                                        color: badge.color,
                                                        border: `1px solid ${badge.border}`
                                                    }}>
                                                        {log.module}
                                                    </span>
                                                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.83rem', color: 'var(--admin-text)' }}>
                                                        {log.action}
                                                    </span>
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 20px' }}>
                                                {log.entity_type || log.entity_id ? (
                                                    <div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                                            {log.entity_type ? log.entity_type.split('\\').pop() : 'Entity'}
                                                        </span>
                                                        {log.entity_id && (
                                                            <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                                                #{log.entity_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--admin-muted)', fontSize: '0.78rem' }}>—</span>
                                                )}
                                            </td>

                                            <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                {log.ip_address || '127.0.0.1'}
                                            </td>

                                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => {
                                                        setSelectedLog(log);
                                                        setShowFullUserAgent(false);
                                                        setIsDiffModalOpen(true);
                                                    }}
                                                    style={{ height: '32px', padding: '0 12px', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                                >
                                                    <Eye size={14} />
                                                    <span>View Diff</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.total > 0 && (
                    <div style={{ padding: '14px 20px', borderTop: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--admin-card-hover)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                            Showing page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total logs)
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page <= 1 || loading}
                                onClick={() => fetchLogs(pagination.current_page - 1)}
                                style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page >= pagination.last_page || loading}
                                onClick={() => fetchLogs(pagination.current_page + 1)}
                                style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* AUDIT LOG PAYLOAD DIFF MODAL */}
            {isDiffModalOpen && selectedLog && (
                <div className="modal-overlay" onClick={() => setIsDiffModalOpen(false)}>
                    <div className="modal-card" style={{ width: '760px', maxWidth: '94vw', maxHeight: '86vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 20px 45px -10px rgba(0,0,0,0.3)', backgroundColor: 'var(--admin-card-bg)' }} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                                        Audit Detail: {selectedLog.action}
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                        Event ID #{selectedLog.id} • {formatDate(selectedLog.created_at)}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDiffModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', padding: '4px', borderRadius: '6px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Refined Executive Metadata Grid (Strict 50/50 Equal Columns) */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', width: '100%' }}>
                                {/* Box 1: Actor Details */}
                                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <Users size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>ACTOR DETAILS</div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '2px', color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedLog.actor_name || 'System'}</div>
                                        <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedLog.actor_email || 'system@internal'}</div>
                                    </div>
                                </div>

                                {/* Box 2: Target Entity */}
                                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <FileText size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>TARGET ENTITY</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', minWidth: 0 }}>
                                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {selectedLog.entity_type ? selectedLog.entity_type.split('\\').pop() : 'N/A'}
                                            </span>
                                            {selectedLog.entity_id && (
                                                <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', fontFamily: 'monospace', fontSize: '0.74rem', fontWeight: 800, flexShrink: 0 }}>
                                                    ID: #{selectedLog.entity_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Box 3: Action & Module */}
                                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <Activity size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>MODULE & ACTION</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', minWidth: 0 }}>
                                            <span style={{
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                backgroundColor: getModuleBadgeColor(selectedLog.module).bg,
                                                color: getModuleBadgeColor(selectedLog.module).color,
                                                border: `1px solid ${getModuleBadgeColor(selectedLog.module).border}`,
                                                flexShrink: 0
                                            }}>
                                                {selectedLog.module}
                                            </span>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.84rem', color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {selectedLog.action}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Box 4: Network & Client */}
                                <div style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'flex-start', gap: '12px', minWidth: 0 }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <Globe size={18} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>CLIENT NETWORK</div>
                                            {selectedLog.user_agent && (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowFullUserAgent(!showFullUserAgent)}
                                                    style={{ background: 'none', border: 'none', padding: 0, color: 'var(--admin-primary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    {showFullUserAgent ? 'Show Less' : 'Expand Full'}
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.86rem', fontWeight: 800, fontFamily: 'monospace', marginTop: '2px', color: 'var(--admin-text)' }}>
                                            {selectedLog.ip_address || '127.0.0.1'}
                                        </div>
                                        {showFullUserAgent ? (
                                            <div style={{
                                                marginTop: '6px',
                                                padding: '8px 10px',
                                                borderRadius: '8px',
                                                backgroundColor: 'var(--admin-card-bg)',
                                                border: '1px solid var(--admin-border)',
                                                fontSize: '0.72rem',
                                                fontFamily: 'monospace',
                                                color: 'var(--admin-text)',
                                                wordBreak: 'break-all',
                                                whiteSpace: 'pre-wrap',
                                                maxHeight: '110px',
                                                overflowY: 'auto'
                                            }}>
                                                {selectedLog.user_agent}
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setShowFullUserAgent(true)}
                                                style={{ fontSize: '0.73rem', color: 'var(--admin-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px', width: '100%', display: 'block', cursor: 'pointer' }}
                                                title="Click to view full client agent string"
                                            >
                                                {selectedLog.user_agent || 'Unknown Client Agent'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Side-by-Side Payload Diff Inspector */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                {/* Old Values */}
                                <div style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderBottom: '1px solid var(--admin-border)', fontSize: '0.8rem', fontWeight: 800, color: 'var(--admin-danger)' }}>
                                        OLD VALUES (PREVIOUS STATE)
                                    </div>
                                    <pre style={{ padding: '14px', margin: 0, fontSize: '0.78rem', fontFamily: 'monospace', backgroundColor: 'var(--admin-card-bg)', overflowX: 'auto', maxHeight: '280px', color: 'var(--admin-text)' }}>
                                        {selectedLog.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : 'null'}
                                    </pre>
                                </div>

                                {/* New Values */}
                                <div style={{ border: '1px solid var(--admin-border)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderBottom: '1px solid var(--admin-border)', fontSize: '0.8rem', fontWeight: 800, color: '#10b981' }}>
                                        NEW VALUES (UPDATED STATE)
                                    </div>
                                    <pre style={{ padding: '14px', margin: 0, fontSize: '0.78rem', fontFamily: 'monospace', backgroundColor: 'var(--admin-card-bg)', overflowX: 'auto', maxHeight: '280px', color: 'var(--admin-text)' }}>
                                        {selectedLog.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : 'null'}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', borderTop: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-hover)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setIsDiffModalOpen(false)}
                                style={{ height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 600, fontSize: '0.83rem' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
