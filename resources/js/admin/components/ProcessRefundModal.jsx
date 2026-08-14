import React, { useState, useEffect } from 'react';
import {
    X,
    RotateCcw,
    CreditCard,
    Building,
    Wallet,
    Banknote,
    Copy,
    Check,
    AlertCircle,
    CheckCircle2,
    DollarSign,
    Hash
} from 'lucide-react';

export default function ProcessRefundModal({
    isOpen,
    onClose,
    order,
    returnRequest,
    onRefundSuccess
}) {
    const [refundChannel, setRefundChannel] = useState('original_gateway');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
    const [transactionReference, setTransactionReference] = useState('');
    const [copiedField, setCopiedField] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (order) {
            // Calculate max refundable
            const alreadyRefunded = (order.refunds || []).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
            const max = Math.max(0, (parseFloat(order.grand_total) || 0) - alreadyRefunded);
            
            // If returnRequest has item refund_amount calculated
            if (returnRequest && returnRequest.items && returnRequest.items.length > 0) {
                const returnSubtotal = returnRequest.items.reduce((sum, item) => sum + (parseFloat(item.refund_amount) || (parseFloat(item.unit_price) * item.quantity) || 0), 0);
                setAmount(Math.min(returnSubtotal, max).toFixed(2));
            } else {
                setAmount(max.toFixed(2));
            }

            setReason(returnRequest ? `Approved Return #${returnRequest.return_number} Refund` : `Refund for Order #${order.order_number}`);
            
            // If order was COD or return has bank account attached, default to bank_transfer
            if (order.payment_method === 'cod' || (returnRequest && (returnRequest.bank_account_id || returnRequest.bank_details_snapshot))) {
                setRefundChannel('bank_transfer');
                if (returnRequest && returnRequest.bank_account_id) {
                    setSelectedBankAccountId(returnRequest.bank_account_id);
                }
            } else {
                setRefundChannel('original_gateway');
            }
        }
    }, [order, returnRequest]);

    if (!isOpen || !order) return null;

    const alreadyRefunded = (order.refunds || []).reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const maxRefundable = Math.max(0, (parseFloat(order.grand_total) || 0) - alreadyRefunded);
    const customerBankAccounts = (order.user && order.user.bank_accounts) ? order.user.bank_accounts : [];
    const activeBankSnapshot = returnRequest?.bank_details_snapshot || 
        customerBankAccounts.find(a => String(a.id) === String(selectedBankAccountId)) ||
        customerBankAccounts.find(a => a.is_default) ||
        customerBankAccounts[0] || null;

    const handleCopy = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const refundAmt = parseFloat(amount);
        if (isNaN(refundAmt) || refundAmt <= 0) {
            setError('Please enter a valid refund amount greater than 0.');
            return;
        }

        if (refundAmt > maxRefundable) {
            setError(`Refund amount cannot exceed remaining refundable balance of ${order.currency || 'INR'} ${maxRefundable.toFixed(2)}.`);
            return;
        }

        if (!reason.trim()) {
            setError('Please provide a reason for the refund.');
            return;
        }

        if (refundChannel === 'bank_transfer' && !activeBankSnapshot && !selectedBankAccountId) {
            setError('Customer bank account details are required for manual bank transfer payouts.');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('admin_token');
            const payload = {
                order_id: order.id,
                return_id: returnRequest ? returnRequest.id : null,
                amount: refundAmt,
                reason: reason.trim(),
                refund_channel: refundChannel,
                bank_account_id: selectedBankAccountId || (returnRequest?.bank_account_id ?? null),
                bank_details_snapshot: activeBankSnapshot,
                transaction_reference: transactionReference.trim() || null,
                gateway: order.payment_method || 'manual',
            };

            const res = await fetch('/api/v1/admin/refunds/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || data.errors ? Object.values(data.errors).flat().join(', ') : 'Failed to process refund.');
            }

            if (onRefundSuccess) {
                onRefundSuccess(data.data);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'An error occurred while processing refund.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="customer-modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
            <div
                className="customer-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '640px', width: '94vw', maxHeight: '92vh', overflowY: 'auto' }}
            >
                {/* Modal Header */}
                <div className="customer-modal-header" style={{ borderBottom: '1px solid var(--admin-border)', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <RotateCcw size={18} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                Process Financial Refund
                            </h3>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                Order #{order.order_number} {returnRequest ? `• RMA #${returnRequest.return_number}` : ''}
                            </div>
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

                {/* Modal Body */}
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 14px',
                            marginBottom: '16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#ef4444',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Order Financial Balance Card */}
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '10px',
                        padding: '14px',
                        marginBottom: '18px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Order Total</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                {order.currency || 'INR'} {parseFloat(order.grand_total).toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Paid Amount</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>
                                {order.currency || 'INR'} {parseFloat(order.grand_total).toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Max Refundable</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#6366f1' }}>
                                {order.currency || 'INR'} {maxRefundable.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    {/* Refund Channel Selector */}
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '8px' }}>
                            Select Refund Destination / Channel
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '8px'
                        }}>
                            <button
                                type="button"
                                onClick={() => setRefundChannel('original_gateway')}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: refundChannel === 'original_gateway' ? '2px solid #6366f1' : '1px solid var(--admin-border)',
                                    backgroundColor: refundChannel === 'original_gateway' ? 'rgba(99, 102, 241, 0.08)' : 'var(--admin-card-bg)',
                                    color: refundChannel === 'original_gateway' ? '#6366f1' : 'var(--admin-text)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                <CreditCard size={16} />
                                <span>Original Gateway</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRefundChannel('bank_transfer')}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: refundChannel === 'bank_transfer' ? '2px solid #10b981' : '1px solid var(--admin-border)',
                                    backgroundColor: refundChannel === 'bank_transfer' ? 'rgba(16, 185, 129, 0.08)' : 'var(--admin-card-bg)',
                                    color: refundChannel === 'bank_transfer' ? '#10b981' : 'var(--admin-text)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                <Building size={16} />
                                <span>Bank Transfer</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRefundChannel('store_credit')}
                                style={{
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: refundChannel === 'store_credit' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                                    backgroundColor: refundChannel === 'store_credit' ? 'rgba(245, 158, 11, 0.08)' : 'var(--admin-card-bg)',
                                    color: refundChannel === 'store_credit' ? '#f59e0b' : 'var(--admin-text)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            >
                                <Wallet size={16} />
                                <span>Store Credit</span>
                            </button>
                        </div>
                    </div>

                    {/* Bank Transfer Details Section */}
                    {refundChannel === 'bank_transfer' && (
                        <div style={{
                            backgroundColor: 'rgba(16, 185, 129, 0.04)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: '10px',
                            padding: '16px',
                            marginBottom: '18px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Building size={16} />
                                    <span>Customer Payout Bank Details</span>
                                </div>
                                {customerBankAccounts.length > 1 && (
                                    <select
                                        className="form-control"
                                        value={selectedBankAccountId}
                                        onChange={(e) => setSelectedBankAccountId(e.target.value)}
                                        style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto' }}
                                    >
                                        <option value="">Select Saved Account</option>
                                        {customerBankAccounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.bank_name} ({acc.masked_account_number || acc.account_number}) {acc.is_default ? '★' : ''}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {activeBankSnapshot ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem' }}>
                                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Account Holder</div>
                                        <div style={{ fontWeight: 600, color: 'var(--admin-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{activeBankSnapshot.account_holder_name || 'N/A'}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(activeBankSnapshot.account_holder_name, 'holder')}
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                            >
                                                {copiedField === 'holder' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Bank Name & Type</div>
                                        <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>
                                            {activeBankSnapshot.bank_name || 'N/A'} ({activeBankSnapshot.account_type || 'Savings'})
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Account Number</div>
                                        <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{activeBankSnapshot.account_number || 'N/A'}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(activeBankSnapshot.account_number, 'acc')}
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                            >
                                                {copiedField === 'acc' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border)' }}>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>IFSC Code</div>
                                        <div style={{ fontWeight: 700, color: '#6366f1', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>{activeBankSnapshot.ifsc_code || 'N/A'}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(activeBankSnapshot.ifsc_code, 'ifsc')}
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                            >
                                                {copiedField === 'ifsc' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                            </button>
                                        </div>
                                    </div>

                                    {activeBankSnapshot.upi_id && (
                                        <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--admin-border)', gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>UPI ID</div>
                                            <div style={{ fontWeight: 600, color: 'var(--admin-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{activeBankSnapshot.upi_id}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(activeBankSnapshot.upi_id, 'upi')}
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                                >
                                                    {copiedField === 'upi' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ fontSize: '0.85rem', color: '#f59e0b', padding: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px' }}>
                                    ⚠️ No saved bank account found for this customer. Please confirm bank details manually with the customer before processing payout.
                                </div>
                            )}

                            {/* UTR Reference Input */}
                            <div style={{ marginTop: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                    Bank Transaction Reference / UTR Number (Optional but Recommended)
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Hash size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--admin-muted)' }} />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. UTR1234567890 / IMPS Reference Number"
                                        value={transactionReference}
                                        onChange={(e) => setTransactionReference(e.target.value)}
                                        style={{ paddingLeft: '32px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Refund Amount & Reason Inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginBottom: '18px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text)', margin: 0 }}>
                                    Refund Amount ({order.currency || 'INR'})
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setAmount(maxRefundable.toFixed(2))}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                                >
                                    Full Refund ({maxRefundable.toFixed(2)})
                                </button>
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                max={maxRefundable}
                                className="form-control"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '6px' }}>
                                Reason / Remarks for Audit Trail
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="e.g. Approved customer return refund"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                            style={{
                                backgroundColor: '#10b981',
                                borderColor: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            {submitting ? (
                                <span>Processing...</span>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    <span>Confirm & Issue Refund</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
