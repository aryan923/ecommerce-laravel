import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    X,
    ShoppingBag,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Truck,
    Clock,
    FileText,
    Printer,
    Save,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Check,
    Send,
    ExternalLink,
    Package,
    Boxes,
    Calendar,
    DollarSign,
    RefreshCw,
    XCircle,
    ChevronRight,
    Tag
} from 'lucide-react';
import { loadCurrenciesFromApi, formatCurrency } from '../utils/currency';

export default function OrderDetailModal({
    isOpen,
    orderId,
    onClose,
    onStatusChange
}) {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending_payment');
    const [statusComment, setStatusComment] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);

    // Shipment Form State
    const [showShipmentForm, setShowShipmentForm] = useState(false);
    const [courierName, setCourierName] = useState('');
    const [awbNumber, setAwbNumber] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [savingShipment, setSavingShipment] = useState(false);

    const [notification, setNotification] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        if (isOpen && orderId) {
            loadCurrenciesFromApi();
            fetchOrderDetails();
        }
    }, [isOpen, orderId]);

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    const handleCopy = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/admin/orders/${orderId}`);
            if (res.data?.success) {
                const data = res.data.data;
                setOrderData(data);
                setStatus(data.status || 'pending_payment');
                setAdminNotes(data.admin_notes || '');
            }
        } catch (err) {
            console.error('Failed to fetch order details:', err);
            showNotify('Failed to fetch order details.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStatus = async (newStatus) => {
        if (newStatus === status) return;
        setSavingStatus(true);
        try {
            const res = await axios.post(`/api/v1/admin/orders/${orderId}/status`, {
                status: newStatus,
                comment: statusComment || `Order status updated to ${newStatus}`
            });
            if (res.data?.success) {
                setStatus(newStatus);
                setStatusComment('');
                showNotify(`Order status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()}.`);
                fetchOrderDetails();
                if (onStatusChange) onStatusChange();
            }
        } catch (err) {
            console.error('Status save error:', err);
            showNotify(err.response?.data?.message || 'Failed to update order status.', 'error');
        } finally {
            setSavingStatus(false);
        }
    };

    const handleCreateShipment = async (e) => {
        e.preventDefault();
        if (!courierName.trim()) {
            showNotify('Please enter a courier provider name.', 'error');
            return;
        }
        setSavingShipment(true);
        try {
            const res = await axios.post(`/api/v1/admin/orders/${orderId}/shipment`, {
                courier_name: courierName,
                awb_number: awbNumber || null,
                tracking_number: trackingNumber || null
            });
            if (res.data?.success) {
                showNotify('Shipment created and tracking attached.');
                setShowShipmentForm(false);
                setCourierName('');
                setAwbNumber('');
                setTrackingNumber('');
                fetchOrderDetails();
                if (onStatusChange) onStatusChange();
            }
        } catch (err) {
            console.error('Shipment creation error:', err);
            showNotify('Failed to create shipment.', 'error');
        } finally {
            setSavingShipment(false);
        }
    };

    const handleSaveNotes = async (e) => {
        e.preventDefault();
        setSavingNotes(true);
        try {
            const res = await axios.post(`/api/v1/admin/orders/${orderId}/notes`, {
                notes: adminNotes
            });
            if (res.data?.success) {
                showNotify('Internal staff notes saved successfully.');
            }
        } catch (err) {
            console.error('Notes save error:', err);
            showNotify('Failed to save staff notes.', 'error');
        } finally {
            setSavingNotes(false);
        }
    };

    if (!isOpen) return null;

    const order = orderData || {};
    const items = order.items || [];
    const customer = order.user || {};
    const shippingAddr = order.shipping_address || {};
    const payment = (order.payments && order.payments.length > 0) ? order.payments[0] : null;
    const shipment = (order.shipments && order.shipments.length > 0) ? order.shipments[0] : null;
    const histories = order.histories || [];

    const customerName = order.guest_name || customer.name || `${shippingAddr.name || 'Customer'}`;
    const customerEmail = order.guest_email || customer.email || 'N/A';
    const customerPhone = customer.mobile || shippingAddr.phone || shippingAddr.mobile || 'N/A';

    // Milestone Steps Definition
    const milestones = [
        { key: 'placed', label: 'Order Placed' },
        { key: 'paid', label: 'Payment Confirmed' },
        { key: 'processing', label: 'Processing / Packaged' },
        { key: 'shipped', label: 'Shipped / In Transit' },
        { key: 'delivered', label: 'Delivered' }
    ];

    const getMilestoneIndex = (st) => {
        switch (st) {
            case 'pending_payment': return 0;
            case 'paid':
            case 'confirmed': return 1;
            case 'processing': return 2;
            case 'shipped': return 3;
            case 'delivered': return 4;
            case 'cancelled':
            case 'failed': return -1;
            default: return 0;
        }
    };

    const currentStepIdx = getMilestoneIndex(order.status);
    const isCancelled = order.status === 'cancelled' || order.status === 'failed';

    return (
        <div className="customer-modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
            {/* Toast Notification */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 1200,
                    padding: '12px 20px',
                    borderRadius: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'slideInRight 0.2s ease-out'
                }}>
                    {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            <div
                className="customer-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '1040px', width: '96vw', height: '88vh', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            >
                {/* Header Banner */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    backgroundColor: 'var(--admin-card-bg)',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--admin-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            flexShrink: 0
                        }}>
                            <ShoppingBag size={22} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', letterSpacing: '-0.02em' }}>
                                    Order #{order.order_number || 'ORD-0000'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(order.order_number, 'order_num')}
                                    title="Copy Order #"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                >
                                    {copiedField === 'order_num' ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Calendar size={12} />
                                <span>Placed on {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</span>
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Print Packing Slip */}
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => window.print()}
                            title="Print Customer Packing Slip & Invoice"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                        >
                            <Printer size={15} />
                            <span>Print Slip</span>
                        </button>

                        {/* Attach Shipment Button */}
                        {!showShipmentForm && order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowShipmentForm(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                            >
                                <Truck size={15} />
                                <span>Create Shipment</span>
                            </button>
                        )}

                        {/* Status Transition Select */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <select
                                className="form-select"
                                style={{ fontSize: '0.82rem', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, width: 'auto' }}
                                value={status}
                                disabled={savingStatus}
                                onChange={(e) => handleSaveStatus(e.target.value)}
                            >
                                <option value="pending_payment">Pending Payment</option>
                                <option value="paid">Paid</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Close Modal Button */}
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onClose}
                            style={{ padding: '6px', borderRadius: '8px' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Modal Body Content */}
                <div className="customer-modal-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--admin-muted)' }}>
                            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--admin-primary)' }} />
                            <div>Loading complete 360 order details...</div>
                        </div>
                    ) : (
                        <div>
                            {/* Order Milestone Progress Tracker */}
                            {!isCancelled ? (
                                <div style={{
                                    backgroundColor: 'var(--admin-card-hover)',
                                    border: '1px solid var(--admin-border)',
                                    borderRadius: '12px',
                                    padding: '18px 20px',
                                    marginBottom: '24px'
                                }}>
                                    <div className="order-milestone-track">
                                        <div className="order-milestone-line">
                                            <div
                                                className="order-milestone-line-progress"
                                                style={{ width: `${(currentStepIdx / (milestones.length - 1)) * 100}%` }}
                                            />
                                        </div>

                                        {milestones.map((m, idx) => {
                                            const isDone = idx < currentStepIdx;
                                            const isCurr = idx === currentStepIdx;

                                            return (
                                                <div key={m.key} className="order-milestone-step">
                                                    <div className={`order-milestone-circle ${isDone ? 'completed' : (isCurr ? 'current' : '')}`}>
                                                        {isDone ? <Check size={16} /> : (idx + 1)}
                                                    </div>
                                                    <div className={`order-milestone-label ${isCurr || isDone ? 'active' : ''}`}>
                                                        {m.label}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    borderRadius: '12px',
                                    padding: '14px 18px',
                                    marginBottom: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    color: '#ef4444'
                                }}>
                                    <XCircle size={20} />
                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                        This order has been {order.status?.toUpperCase()}. No further fulfillment actions are pending.
                                    </span>
                                </div>
                            )}

                            {/* Shipment Creation Drawer Form */}
                            {showShipmentForm && (
                                <form onSubmit={handleCreateShipment} style={{
                                    backgroundColor: 'rgba(99, 102, 241, 0.06)',
                                    borderRadius: '12px',
                                    border: '1.5px solid var(--admin-primary)',
                                    padding: '18px 20px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Truck size={18} style={{ color: 'var(--admin-primary)' }} />
                                            <span>Attach Courier Shipment & Generate Tracking</span>
                                        </div>
                                        <button type="button" onClick={() => setShowShipmentForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '6px' }}>
                                                Courier Partner Name *
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. BlueDart, FedEx, Delhivery, DTDC"
                                                value={courierName}
                                                onChange={(e) => setCourierName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '6px' }}>
                                                AWB Airway Bill #
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. AWB-987654321"
                                                value={awbNumber}
                                                onChange={(e) => setAwbNumber(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '6px' }}>
                                                Tracking Reference Number
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Auto-generated if left empty"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowShipmentForm(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={savingShipment}>
                                            <Send size={14} />
                                            <span>{savingShipment ? 'Saving Shipment...' : 'Save & Mark Shipped'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* 3-Column Info Cards Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                {/* Customer Account Card */}
                                <div style={{
                                    backgroundColor: 'var(--admin-card-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--admin-border)',
                                    padding: '18px'
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <User size={14} />
                                        <span>Customer Information</span>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--admin-text)', marginBottom: '6px' }}>
                                        {customerName}
                                    </div>
                                    <div style={{ fontSize: '0.84rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Mail size={13} />
                                            <span>{customerEmail}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(customerEmail, 'cust_email')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                        >
                                            {copiedField === 'cust_email' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                    {customerPhone !== 'N/A' && (
                                        <div style={{ fontSize: '0.84rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={13} />
                                            <span>{customerPhone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Address Card */}
                                <div style={{
                                    backgroundColor: 'var(--admin-card-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--admin-border)',
                                    padding: '18px'
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} />
                                        <span>Shipping Delivery Address</span>
                                    </div>
                                    <div style={{ fontSize: '0.86rem', color: 'var(--admin-text)', lineHeight: '1.5' }}>
                                        <div style={{ fontWeight: 700, marginBottom: '2px' }}>{shippingAddr.name || customerName}</div>
                                        <div>{shippingAddr.address_line1 || shippingAddr.line_1 || 'Address Line 1'}</div>
                                        {(shippingAddr.address_line2 || shippingAddr.line_2) && <div>{shippingAddr.address_line2 || shippingAddr.line_2}</div>}
                                        <div>{shippingAddr.city}, {shippingAddr.state_code || shippingAddr.state} — {shippingAddr.postal_code}</div>
                                        <div style={{ fontWeight: 600, color: 'var(--admin-muted)', marginTop: '2px' }}>{shippingAddr.country_code || shippingAddr.country || 'India'}</div>
                                    </div>
                                </div>

                                {/* Payment & Fulfillment Summary */}
                                <div style={{
                                    backgroundColor: 'var(--admin-card-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--admin-border)',
                                    padding: '18px'
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CreditCard size={14} />
                                        <span>Payment & Courier Tracking</span>
                                    </div>
                                    <div style={{ fontSize: '0.86rem', color: 'var(--admin-text)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: 'var(--admin-muted)' }}>Payment Mode:</span>
                                            <span style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--admin-text)' }}>
                                                {order.payment_method || 'COD'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: 'var(--admin-muted)' }}>Gateway Transaction:</span>
                                            <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                                                {payment?.transaction_id || payment?.payment_id || 'N/A'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--admin-muted)' }}>Courier Tracking:</span>
                                            <span style={{ fontWeight: 700, color: shipment ? 'var(--admin-primary)' : 'var(--admin-muted)' }}>
                                                {shipment ? `${shipment.courier_name} (${shipment.tracking_number || shipment.awb_number})` : 'Awaiting Shipment'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Order Products Table */}
                            <div style={{
                                backgroundColor: 'var(--admin-card-bg)',
                                borderRadius: '12px',
                                border: '1px solid var(--admin-border)',
                                overflow: 'hidden',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    padding: '16px 20px',
                                    borderBottom: '1px solid var(--admin-border)',
                                    fontWeight: 800,
                                    fontSize: '0.92rem',
                                    color: 'var(--admin-text)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <Package size={16} />
                                    <span>Purchased Products & Frozen Price Snapshots</span>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                                        <thead>
                                            <tr style={{
                                                backgroundColor: 'var(--admin-card-hover)',
                                                borderBottom: '1px solid var(--admin-border)',
                                                color: 'var(--admin-muted)',
                                                textAlign: 'left',
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase'
                                            }}>
                                                <th style={{ padding: '12px 20px' }}>Product Description</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Unit Price</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Quantity</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Tax / GST</th>
                                                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Line Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.length > 0 ? (
                                                items.map((item) => {
                                                    const pName = item.snapshot_data?.name || item.product_name || item.product?.name || 'Product Item';
                                                    const sku = item.snapshot_data?.sku || item.sku || 'N/A';
                                                    const imgUrl = item.snapshot_data?.image || item.product?.featured_image || null;

                                                    return (
                                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                            <td style={{ padding: '14px 20px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                    {imgUrl ? (
                                                                        <img
                                                                            src={imgUrl}
                                                                            alt={pName}
                                                                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--admin-border)' }}
                                                                        />
                                                                    ) : (
                                                                        <div style={{
                                                                            width: '40px',
                                                                            height: '40px',
                                                                            borderRadius: '8px',
                                                                            backgroundColor: 'var(--admin-card-hover)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: 'var(--admin-muted)',
                                                                            fontWeight: 800,
                                                                            fontSize: '0.75rem',
                                                                            border: '1px solid var(--admin-border)'
                                                                        }}>
                                                                            SKU
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.9rem' }}>
                                                                            {pName}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                                                            SKU: {sku}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>
                                                                {formatCurrency(item.unit_price || 0, order.currency || 'INR', true)}
                                                            </td>
                                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                                <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--admin-card-hover)', fontWeight: 800 }}>
                                                                    x{item.quantity}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                                                {formatCurrency(item.tax_amount || 0, order.currency || 'INR', true)}
                                                            </td>
                                                            <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 800, color: 'var(--admin-text)' }}>
                                                                {formatCurrency(item.total_amount || 0, order.currency || 'INR', true)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                                        No itemized records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Order Pricing Totals Breakdown */}
                                <div style={{
                                    padding: '18px 24px',
                                    backgroundColor: 'var(--admin-card-hover)',
                                    borderTop: '1px solid var(--admin-border)',
                                    display: 'flex',
                                    justifyContent: 'flex-end'
                                }}>
                                    <div style={{ minWidth: '280px', fontSize: '0.88rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--admin-muted)' }}>
                                            <span>Items Subtotal:</span>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(order.subtotal || 0, order.currency || 'INR', true)}</span>
                                        </div>

                                        {Number(order.discount_total) > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#10b981' }}>
                                                <span>Coupon Discount:</span>
                                                <span style={{ fontWeight: 700 }}>-{formatCurrency(order.discount_total || 0, order.currency || 'INR', true)}</span>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--admin-muted)' }}>
                                            <span>Taxes & GST:</span>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(order.tax_total || 0, order.currency || 'INR', true)}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--admin-muted)' }}>
                                            <span>Shipping Charges:</span>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(order.shipping_total || 0, order.currency || 'INR', true)}</span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            paddingTop: '10px',
                                            borderTop: '1.5px solid var(--admin-border)',
                                            fontSize: '1.15rem',
                                            fontWeight: 800,
                                            color: 'var(--admin-text)'
                                        }}>
                                            <span>Grand Total:</span>
                                            <span style={{ color: 'var(--admin-primary)' }}>{formatCurrency(order.grand_total || 0, order.currency || 'INR', true)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Timeline & Notes Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                                {/* Timeline History */}
                                <div style={{
                                    backgroundColor: 'var(--admin-card-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--admin-border)',
                                    padding: '18px'
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} />
                                        <span>Order Audit Timeline & Logs</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {histories.length > 0 ? (
                                            histories.map((h) => (
                                                <div key={h.id} style={{ display: 'flex', gap: '10px', fontSize: '0.84rem' }}>
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--admin-primary)',
                                                        marginTop: '6px',
                                                        flexShrink: 0
                                                    }} />
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                            {h.status ? h.status.replace(/_/g, ' ').toUpperCase() : 'EVENT'}
                                                        </div>
                                                        <div style={{ color: 'var(--admin-muted)', fontSize: '0.78rem' }}>{h.comment}</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-subtle)', marginTop: '2px' }}>
                                                            {h.created_at ? new Date(h.created_at).toLocaleString() : ''} {h.user?.name ? `• by ${h.user.name}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>No audit events recorded yet.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Internal Staff Reference Notes */}
                                <form
                                    onSubmit={handleSaveNotes}
                                    style={{
                                        backgroundColor: 'var(--admin-card-bg)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--admin-border)',
                                        padding: '18px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FileText size={14} />
                                            <span>Internal Staff Reference Notes</span>
                                        </div>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            placeholder="Add private warehouse notes, packaging instructions, or customer call logs..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            style={{ fontSize: '0.85rem', borderRadius: '8px', resize: 'vertical' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-sm"
                                            disabled={savingNotes}
                                            style={{ borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Save size={14} />
                                            <span>{savingNotes ? 'Saving...' : 'Save Staff Notes'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div style={{
                    padding: '14px 24px',
                    borderTop: '1px solid var(--admin-border)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    backgroundColor: 'var(--admin-card-bg)',
                    flexShrink: 0
                }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
