import React, { useState, useEffect } from 'react';
import {
    X,
    RotateCcw,
    Calendar,
    User,
    Package,
    Building,
    CheckCircle2,
    XCircle,
    Truck,
    CheckSquare,
    DollarSign,
    Copy,
    Check,
    Printer,
    Boxes,
    AlertCircle,
    Image as ImageIcon,
    Clock,
    FileText,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import ProcessRefundModal from './ProcessRefundModal';

export default function ReturnDetailModal({
    returnId,
    isOpen,
    onClose,
    onStatusUpdated
}) {
    const [returnRecord, setReturnRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [activeImagePreview, setActiveImagePreview] = useState(null);

    const fetchDetail = async () => {
        if (!returnId) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/returns/${returnId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to fetch return details.');
            }
            setReturnRecord(data.data);
            setAdminRemarks(data.data.admin_notes || '');
        } catch (err) {
            setError(err.message || 'Error loading return details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && returnId) {
            fetchDetail();
        }
    }, [isOpen, returnId]);

    if (!isOpen) return null;

    const handleCopy = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleStatusTransition = async (newStatus) => {
        setActionLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/returns/${returnId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: adminRemarks.trim() || undefined,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to update status.');
            }

            setReturnRecord(data.data);
            setSuccessMsg(`Return status updated to ${newStatus.toUpperCase()}`);
            if (onStatusUpdated) onStatusUpdated();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRestock = async () => {
        if (!window.confirm('Are you sure you want to restock these returned items into warehouse inventory?')) {
            return;
        }

        setActionLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/returns/${returnId}/restock`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to restock items.');
            }

            setReturnRecord(data.data);
            setSuccessMsg('Returned items restocked successfully into inventory!');
            if (onStatusUpdated) onStatusUpdated();
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePrintRMA = () => {
        window.print();
    };

    const getStatusBadgeStyle = (status) => {
        switch (status) {
            case 'approved':
            case 'approved_for_refund':
            case 'refunded':
                return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
            case 'rejected':
            case 'closed':
                return { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' };
            case 'pickup_scheduled':
            case 'picked_up':
            case 'received':
            case 'quality_check':
                return { bg: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: 'rgba(99, 102, 241, 0.25)' };
            case 'under_review':
            case 'requested':
            default:
                return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' };
        }
    };

    const bankDetails = returnRecord?.bank_details_snapshot || 
        returnRecord?.bank_account || 
        (returnRecord?.user?.bank_accounts && returnRecord?.user?.bank_accounts[0]) || null;

    return (
        <div className="customer-modal-backdrop" onClick={onClose} style={{ zIndex: 900 }}>
            <div
                className="customer-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '960px', width: '96vw', maxHeight: '94vh', overflowY: 'auto' }}
            >
                {/* Header Banner */}
                <div className="customer-modal-header" style={{ borderBottom: '1px solid var(--admin-border)', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            color: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <RotateCcw size={20} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                    Return #{returnRecord?.return_number || `RMA-${returnId}`}
                                </h3>
                                {returnRecord && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        textTransform: 'uppercase',
                                        backgroundColor: getStatusBadgeStyle(returnRecord.status).bg,
                                        color: getStatusBadgeStyle(returnRecord.status).color,
                                        border: `1px solid ${getStatusBadgeStyle(returnRecord.status).border}`,
                                    }}>
                                        {returnRecord.status.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                Requested on {returnRecord?.created_at ? new Date(returnRecord.created_at).toLocaleString() : 'N/A'} • Order #{returnRecord?.order?.order_number || 'N/A'}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handlePrintRMA}
                            title="Print RMA Warehouse Receiving Slip"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Printer size={15} />
                            <span className="header-btn-label">Print RMA Slip</span>
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onClose}
                            style={{ padding: '6px' }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div style={{ padding: '20px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                            Loading full 360 return records...
                        </div>
                    ) : error ? (
                        <div style={{
                            padding: '16px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    ) : returnRecord ? (
                        <>
                            {successMsg && (
                                <div style={{
                                    padding: '12px 14px',
                                    marginBottom: '16px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    color: '#10b981',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <CheckCircle2 size={16} />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            {/* Milestone Workflow Action Bar */}
                            <div style={{
                                backgroundColor: 'var(--admin-card-bg)',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '10px',
                                padding: '14px 18px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Return Milestone Transition
                                    </div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                        Current: <span style={{ color: getStatusBadgeStyle(returnRecord.status).color }}>{returnRecord.status.replace(/_/g, ' ').toUpperCase()}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {returnRecord.status === 'requested' && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleStatusTransition('approved')}
                                                disabled={actionLoading}
                                                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                            >
                                                Approve Return
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleStatusTransition('rejected')}
                                                disabled={actionLoading}
                                                style={{ color: '#ef4444' }}
                                            >
                                                Reject Return
                                            </button>
                                        </>
                                    )}

                                    {returnRecord.status === 'approved' && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStatusTransition('pickup_scheduled')}
                                            disabled={actionLoading}
                                        >
                                            <Truck size={14} style={{ marginRight: '4px' }} />
                                            Schedule Pickup
                                        </button>
                                    )}

                                    {returnRecord.status === 'pickup_scheduled' && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStatusTransition('received')}
                                            disabled={actionLoading}
                                        >
                                            <Package size={14} style={{ marginRight: '4px' }} />
                                            Mark Received at Warehouse
                                        </button>
                                    )}

                                    {returnRecord.status === 'received' && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStatusTransition('quality_check')}
                                            disabled={actionLoading}
                                        >
                                            <CheckSquare size={14} style={{ marginRight: '4px' }} />
                                            Start Quality Check (QC)
                                        </button>
                                    )}

                                    {returnRecord.status === 'quality_check' && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStatusTransition('approved_for_refund')}
                                            disabled={actionLoading}
                                            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                                        >
                                            <CheckCircle2 size={14} style={{ marginRight: '4px' }} />
                                            Pass QC & Approve Refund
                                        </button>
                                    )}

                                    {/* Inventory Restock Button */}
                                    {!returnRecord.restocked_at ? (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleRestock}
                                            disabled={actionLoading}
                                            style={{ color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.3)' }}
                                        >
                                            <Boxes size={14} style={{ marginRight: '4px' }} />
                                            Restock to Inventory
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}>
                                            <CheckCircle2 size={14} />
                                            Restocked
                                        </span>
                                    )}

                                    {/* Process Refund Button */}
                                    {returnRecord.status !== 'refunded' && (
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setIsRefundModalOpen(true)}
                                            style={{ backgroundColor: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <DollarSign size={14} />
                                            Issue Refund
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* 3-Column Info Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                {/* Order Context Card */}
                                <div style={{
                                    backgroundColor: 'var(--admin-card-bg)',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '10px',
                                    padding: '16px'
                                }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Package size={14} />
                                        <span>Original Order Snapshot</span>
                                    </div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                        Order #{returnRecord.order?.order_number || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', marginBottom: '8px' }}>
                                        Grand Total: <strong>{returnRecord.order?.currency || 'INR'} {parseFloat(returnRecord.order?.grand_total || 0).toFixed(2)}</strong>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                        Payment Method: <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--admin-text)' }}>{returnRecord.order?.payment_method || 'COD'}</span>
                                    </div>
                                </div>

                                {/* Customer Context Card */}
                                <div style={{
                                    backgroundColor: 'var(--admin-card-bg)',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '10px',
                                    padding: '16px'
                                }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <User size={14} />
                                        <span>Customer Account Details</span>
                                    </div>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                        {returnRecord.user?.name || 'Customer Account'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', marginBottom: '4px' }}>
                                        Email: {returnRecord.user?.email || 'N/A'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                                        Mobile: {returnRecord.user?.mobile || 'N/A'}
                                    </div>
                                </div>

                                {/* Bank Account Payout Card (for COD / Manual Transfers) */}
                                <div style={{
                                    backgroundColor: 'rgba(16, 185, 129, 0.04)',
                                    border: '1px solid rgba(16, 185, 129, 0.25)',
                                    borderRadius: '10px',
                                    padding: '16px'
                                }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Building size={14} />
                                        <span>Selected Bank Account For Payout</span>
                                    </div>

                                    {bankDetails ? (
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                                {bankDetails.account_holder_name} • {bankDetails.bank_name}
                                            </div>
                                            <div style={{ fontFamily: 'monospace', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span>A/C: <strong>{bankDetails.account_number}</strong></span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(bankDetails.account_number, 'acc')}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                                >
                                                    {copiedField === 'acc' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                            <div style={{ fontFamily: 'monospace', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span>IFSC: <strong>{bankDetails.ifsc_code}</strong></span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(bankDetails.ifsc_code, 'ifsc')}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                                >
                                                    {copiedField === 'ifsc' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                            {bankDetails.upi_id && (
                                                <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--admin-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>UPI: {bankDetails.upi_id}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(bankDetails.upi_id, 'upi')}
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                                    >
                                                        {copiedField === 'upi' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                            No bank account saved. Original payment gateway refund will be used.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Return Items Table */}
                            <div style={{
                                backgroundColor: 'var(--admin-card-bg)',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                marginBottom: '20px'
                            }}>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--admin-border)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                    Returned Line Items & Refund Subtotal
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: 'var(--admin-table-header)', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-muted)', textAlign: 'left' }}>
                                                <th style={{ padding: '10px 14px' }}>Product & SKU</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Return Qty</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Unit Price</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Refund Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(returnRecord.items || []).map((item) => (
                                                <tr key={item.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                    <td style={{ padding: '12px 14px' }}>
                                                        <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                                                            {item.order_item?.product_name || `Item #${item.order_item_id}`}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                                            SKU: {item.order_item?.sku || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                                                        {item.quantity}
                                                    </td>
                                                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                                                        {returnRecord.order?.currency || 'INR'} {parseFloat(item.unit_price).toFixed(2)}
                                                    </td>
                                                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                                                        {returnRecord.order?.currency || 'INR'} {parseFloat(item.refund_amount || (item.unit_price * item.quantity)).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Customer Reason & Photo Evidence */}
                            <div style={{
                                backgroundColor: 'var(--admin-card-bg)',
                                border: '1px solid var(--admin-border)',
                                borderRadius: '10px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '8px' }}>
                                    Customer Reason for Return
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6366f1', marginBottom: '6px' }}>
                                    {returnRecord.reason}
                                </div>
                                {returnRecord.description && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)', backgroundColor: 'var(--admin-bg)', padding: '10px 12px', borderRadius: '6px', marginBottom: '14px' }}>
                                        "{returnRecord.description}"
                                    </div>
                                )}

                                {/* Uploaded Photo Evidence Lightbox */}
                                {returnRecord.images && returnRecord.images.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ImageIcon size={14} />
                                            <span>Customer Uploaded Photo Evidence ({returnRecord.images.length})</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {returnRecord.images.map((imgUrl, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => setActiveImagePreview(imgUrl)}
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        border: '1px solid var(--admin-border)',
                                                        cursor: 'pointer',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <img
                                                        src={imgUrl}
                                                        alt={`Evidence ${idx + 1}`}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Refund Transaction History if any */}
                            {returnRecord.refunds && returnRecord.refunds.length > 0 && (
                                <div style={{
                                    backgroundColor: 'var(--admin-card-bg)',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '10px',
                                    padding: '16px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle2 size={16} color="#10b981" />
                                        <span>Issued Refund Transaction Records</span>
                                    </div>
                                    {returnRecord.refunds.map((ref) => (
                                        <div
                                            key={ref.id}
                                            style={{
                                                padding: '10px 12px',
                                                borderRadius: '6px',
                                                backgroundColor: 'var(--admin-bg)',
                                                border: '1px solid var(--admin-border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '8px',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                    Refund #{ref.refund_number} • {returnRecord.order?.currency || 'INR'} {parseFloat(ref.amount).toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    Channel: <strong style={{ textTransform: 'uppercase' }}>{ref.refund_channel || 'GATEWAY'}</strong> • Gateway ID / UTR: {ref.transaction_reference || ref.gateway_refund_id || 'N/A'}
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                padding: '2px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981'
                                            }}>
                                                COMPLETED
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                {/* Footer Controls */}
                <div style={{ borderTop: '1px solid var(--admin-border)', padding: '14px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Lightbox Image Preview Modal */}
            {activeImagePreview && (
                <div
                    onClick={() => setActiveImagePreview(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 1100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
                        <button
                            type="button"
                            onClick={() => setActiveImagePreview(null)}
                            style={{
                                position: 'absolute',
                                right: '-12px',
                                top: '-12px',
                                backgroundColor: '#fff',
                                color: '#000',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={16} />
                        </button>
                        <img
                            src={activeImagePreview}
                            alt="Evidence Preview"
                            style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain' }}
                        />
                    </div>
                </div>
            )}

            {/* Process Refund Modal Dialog */}
            {isRefundModalOpen && returnRecord && (
                <ProcessRefundModal
                    isOpen={isRefundModalOpen}
                    onClose={() => setIsRefundModalOpen(false)}
                    order={returnRecord.order}
                    returnRequest={returnRecord}
                    onRefundSuccess={() => {
                        fetchDetail();
                        if (onStatusUpdated) onStatusUpdated();
                    }}
                />
            )}
        </div>
    );
}
