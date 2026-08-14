import React, { useState, useEffect } from 'react';
import { X, History, Search, ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, User } from 'lucide-react';
import axios from 'axios';

export default function InventoryHistoryModal({
    isOpen,
    initialSku = '',
    onClose
}) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(initialSku || '');
    const [transactionType, setTransactionType] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [page, setPage] = useState(1);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (transactionType) params.append('transaction_type', transactionType);
            params.append('page', page);
            params.append('per_page', 10);

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
            console.error('Failed to fetch inventory transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setSearch(initialSku || '');
            setPage(1);
            fetchHistory();
        }
    }, [isOpen, initialSku, page, transactionType]);

    if (!isOpen) return null;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchHistory();
    };

    const formatTransactionTypeLabel = (typeStr) => {
        if (!typeStr) return 'Adjustment';
        return typeStr.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div className="modal-backdrop" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div className="modal-container" style={{
                backgroundColor: 'var(--admin-card-bg)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--admin-border)',
                overflow: 'hidden',
                animation: 'modalSlideIn 0.2s ease-out'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--admin-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <History size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)' }}>Inventory Transaction Audit Log</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>Historical record of manual adjustments, purchases, & order reservations</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ padding: '6px' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Filter by SKU or Product..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>

                        <select
                            className="form-select"
                            style={{ width: 'auto' }}
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
                            <option value="purchase">Purchase</option>
                            <option value="order_reservation">Order Reservation</option>
                            <option value="return">Return</option>
                        </select>

                        <button type="submit" className="btn btn-primary btn-sm">
                            <span>Search</span>
                        </button>
                    </form>
                </div>

                {/* Table Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>SKU & Product</th>
                                    <th>Type</th>
                                    <th>Prev Qty</th>
                                    <th>Change</th>
                                    <th>New Qty</th>
                                    <th>Author / Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                            Loading audit logs...
                                        </td>
                                    </tr>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx) => {
                                        const isPositive = tx.quantity_change > 0;
                                        const isNegative = tx.quantity_change < 0;
                                        const authorName = tx.admin?.name || 'System Admin';

                                        return (
                                            <tr key={tx.id}>
                                                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: 'var(--admin-muted)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Calendar size={14} />
                                                        <span>{new Date(tx.created_at).toLocaleString()}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text)' }}>{tx.variant?.product?.name || 'SKU Item'}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>SKU: <strong>{tx.sku}</strong></div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-shipped" style={{ fontSize: '0.75rem' }}>
                                                        {formatTransactionTypeLabel(tx.transaction_type)}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{tx.previous_qty}</td>
                                                <td>
                                                    <div style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontWeight: 700,
                                                        color: isPositive ? 'var(--admin-success)' : (isNegative ? 'var(--admin-danger)' : 'var(--admin-muted)')
                                                    }}>
                                                        {isPositive ? <ArrowUpRight size={14} /> : (isNegative ? <ArrowDownRight size={14} /> : <RefreshCw size={12} />)}
                                                        <span>{isPositive ? `+${tx.quantity_change}` : tx.quantity_change}</span>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{tx.new_qty}</td>
                                                <td style={{ fontSize: '0.8rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--admin-text)' }}>
                                                        <User size={12} />
                                                        <span>{authorName}</span>
                                                    </div>
                                                    {tx.remarks && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                            {tx.remarks}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                            No transaction records found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Pagination */}
                {pagination.last_page > 1 && (
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid var(--admin-border)',
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                            Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total logs)
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
        </div>
    );
}
