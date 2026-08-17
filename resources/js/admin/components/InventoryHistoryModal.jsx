import React, { useState, useEffect } from 'react';
import {
    X,
    History,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Calendar,
    User,
    Building2,
    ArrowRight,
    Filter,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Boxes
} from 'lucide-react';
import axios from 'axios';

export default function InventoryHistoryModal({
    isOpen,
    warehouses = [],
    onClose
}) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [page, setPage] = useState(1);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (warehouseId) params.append('warehouse_id', warehouseId);
            if (transactionType) params.append('transaction_type', transactionType);
            params.append('page', page);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/inventory/transactions?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setTransactions(items);
                setPagination({
                    current_page: meta.current_page || 1,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch inventory transaction audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            fetchHistory();
        }
    }, [isOpen, page, warehouseId, transactionType]);

    if (!isOpen) return null;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchHistory();
    };

    const handleResetFilters = () => {
        setSearch('');
        setWarehouseId('');
        setTransactionType('');
        setPage(1);
    };

    const formatTransactionTypeLabel = (typeStr) => {
        if (!typeStr) return 'Adjustment';
        return typeStr.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const getTypeBadgeStyle = (t) => {
        switch (t) {
            case 'manual_addition':
            case 'purchase_order':
            case 'return':
                return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
            case 'manual_deduction':
            case 'damage':
            case 'theft':
                return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
            case 'order_reservation':
            case 'order_shipment':
                return { bg: 'rgba(14, 165, 233, 0.12)', color: '#0ea5e9', border: 'rgba(14, 165, 233, 0.3)' };
            case 'transfer_out':
            case 'transfer_in':
            case 'transfer':
                return { bg: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', border: 'rgba(99, 102, 241, 0.3)' };
            default:
                return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
        }
    };

    return (
        <div className="modal-overlay">
            <div
                className="modal-card"
                style={{
                    maxWidth: '1040px',
                    width: '96%',
                    maxHeight: '90vh',
                }}
            >
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                color: 'var(--admin-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <History size={20} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                    Inventory Audit Trails & Transaction Logs
                                </h3>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                    color: 'var(--admin-primary)',
                                    border: '1px solid rgba(99, 102, 241, 0.25)'
                                }}>
                                    {pagination.total} Records
                                </span>
                            </div>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--admin-muted)' }}>
                                Historical telemetry of adjustments, order deductions, restocking, and warehouse transfers
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ borderRadius: '8px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-hover)' }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by SKU or Product Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
                            />
                        </div>

                        <select
                            className="form-select"
                            style={{ width: 'auto', fontSize: '0.8rem' }}
                            value={warehouseId}
                            onChange={(e) => {
                                setWarehouseId(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                            ))}
                        </select>

                        <select
                            className="form-select"
                            style={{ width: 'auto', fontSize: '0.8rem' }}
                            value={transactionType}
                            onChange={(e) => {
                                setTransactionType(e.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">All Transaction Types</option>
                            <option value="manual_addition">Manual Addition</option>
                            <option value="manual_deduction">Manual Deduction</option>
                            <option value="adjustment">Set Adjustment</option>
                            <option value="order_reservation">Order Reservation</option>
                            <option value="order_shipment">Order Shipment</option>
                            <option value="damage">Damage Write-Off</option>
                            <option value="return">Customer Return</option>
                            <option value="transfer">Warehouse Transfer</option>
                        </select>

                        <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px' }}>
                            <Filter size={13} />
                            <span>Filter</span>
                        </button>

                        {(search || warehouseId || transactionType) && (
                            <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetFilters} style={{ padding: '6px 10px' }}>
                                <RotateCcw size={13} />
                            </button>
                        )}
                    </form>
                </div>

                {/* Table Content Area */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div className="table-responsive">
                        <table className="admin-table" style={{ fontSize: '0.8rem' }}>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>SKU & Product</th>
                                    <th>Warehouse / Hub</th>
                                    <th style={{ textAlign: 'center' }}>Type</th>
                                    <th style={{ textAlign: 'right' }}>Before</th>
                                    <th style={{ textAlign: 'center' }}>Change</th>
                                    <th style={{ textAlign: 'right' }}>After</th>
                                    <th>Auditor & Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <RefreshCw size={16} className="animate-spin" />
                                                <span>Loading inventory audit trail...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx) => {
                                        const isPositive = tx.quantity_change > 0;
                                        const isNegative = tx.quantity_change < 0;
                                        const authorName = tx.admin?.name || 'System Admin';
                                        const warehouseName = tx.warehouse?.name || 'Main Warehouse';
                                        const destName = tx.destination_warehouse?.name;
                                        const badgeStyle = getTypeBadgeStyle(tx.transaction_type || tx.type);

                                        return (
                                            <tr key={tx.id}>
                                                <td style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', color: 'var(--admin-muted)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <Calendar size={12} />
                                                        <span>{new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text)' }}>
                                                        {tx.variant?.product?.name || tx.product_name || 'SKU Product'}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                                        SKU: <strong>{tx.sku || tx.variant?.sku}</strong>
                                                    </div>
                                                </td>

                                                <td>
                                                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Building2 size={12} style={{ color: 'var(--admin-primary)' }} />
                                                        <span>{warehouseName}</span>
                                                        {destName && (
                                                            <>
                                                                <ArrowRight size={11} style={{ color: 'var(--admin-muted)' }} />
                                                                <span style={{ color: '#10b981' }}>{destName}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        fontWeight: 800,
                                                        padding: '2px 7px',
                                                        borderRadius: '6px',
                                                        textTransform: 'uppercase',
                                                        backgroundColor: badgeStyle.bg,
                                                        color: badgeStyle.color,
                                                        border: `1px solid ${badgeStyle.border}`
                                                    }}>
                                                        {formatTransactionTypeLabel(tx.transaction_type || tx.type)}
                                                    </span>
                                                </td>

                                                <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--admin-muted)' }}>
                                                    {tx.previous_quantity ?? '-'}
                                                </td>

                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        fontWeight: 800,
                                                        fontSize: '0.82rem',
                                                        color: isPositive ? '#10b981' : (isNegative ? '#ef4444' : 'var(--admin-muted)')
                                                    }}>
                                                        {isPositive ? `+${tx.quantity_change}` : tx.quantity_change}
                                                    </span>
                                                </td>

                                                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--admin-text)' }}>
                                                    {tx.new_quantity ?? '-'}
                                                </td>

                                                <td>
                                                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                                                        {authorName}
                                                    </div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {tx.remarks || tx.reason || 'Routine inventory event'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                            No audit transaction logs found matching current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Pagination */}
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)' }}>
                        Page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total log entries)
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={pagination.current_page <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
                        >
                            <ChevronLeft size={14} />
                            <span>Prev</span>
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={pagination.current_page >= pagination.last_page || loading}
                            onClick={() => setPage((p) => p + 1)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px' }}
                        >
                            <span>Next</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
