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
    CheckCircle,
    Copy,
    Check,
    Send,
    ExternalLink
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

    // Print Packing Slip Modal View
    const [isPrintMode, setIsPrintMode] = useState(false);

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
        setSavingStatus(true);
        try {
            const res = await axios.post(`/api/v1/admin/orders/${orderId}/status`, {
                status: newStatus,
                comment: statusComment || null
            });
            if (res.data?.success) {
                setStatus(newStatus);
                setStatusComment('');
                showNotify(`Order status updated to ${newStatus.toUpperCase()}.`);
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
    const billingAddr = order.billing_address || {};
    const payment = (order.payments && order.payments.length > 0) ? order.payments[0] : null;
    const shipment = (order.shipments && order.shipments.length > 0) ? order.shipments[0] : null;
    const histories = order.histories || [];

    const customerName = order.guest_name || customer.name || `${shippingAddr.name || 'Customer'}`;
    const customerEmail = order.guest_email || customer.email || 'N/A';
    const customerPhone = customer.mobile || shippingAddr.phone || shippingAddr.mobile || 'N/A';

    return (
        <div className="customer-modal-backdrop">
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
                    {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            <div className="customer-modal-container" style={{ maxWidth: isPrintMode ? '800px' : '980px' }}>
                {/* Header Banner */}
                <div className="customer-modal-header" style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--admin-primary), #a855f7)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.1rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            <ShoppingBag size={20} />
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-text)', letterSpacing: '-0.01em' }}>
                                    Order #{order.order_number || 'ORD-0000'}
                                </h3>
                                <span className={`badge ${status === 'delivered' ? 'badge-completed' : (status === 'cancelled' ? 'badge-cancelled' : 'badge-pending')}`} style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '20px' }}>
                                    {status ? status.toUpperCase() : 'PENDING'}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                Placed on {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="customer-modal-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => window.print()}
                            title="Print Packing Slip & Invoice"
                            style={{ borderRadius: '8px' }}
                        >
                            <Printer size={15} />
                            <span>Print Packing Slip</span>
                        </button>

                        {!showShipmentForm && (
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => setShowShipmentForm(true)}
                                style={{ borderRadius: '8px' }}
                            >
                                <Truck size={15} />
                                <span>Create Shipment</span>
                            </button>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <select
                                className="form-select"
                                style={{ fontSize: '0.82rem', padding: '4px 12px', borderRadius: '8px', fontWeight: 700, width: 'auto' }}
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

                        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '8px', borderRadius: '8px', marginLeft: '4px' }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="customer-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--admin-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                            <span>Loading order details...</span>
                        </div>
                    ) : (
                        <div>
                            {/* Shipment Creation Drawer */}
                            {showShipmentForm && (
                                <form onSubmit={handleCreateShipment} style={{
                                    backgroundColor: 'var(--admin-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--admin-primary)',
                                    padding: '16px 20px',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Truck size={16} style={{ color: 'var(--admin-primary)' }} />
                                            <span>Attach Courier Shipment & Tracking Info</span>
                                        </div>
                                        <button type="button" onClick={() => setShowShipmentForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '4px' }}>Courier Partner *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. BlueDart, FedEx, Delhivery"
                                                value={courierName}
                                                onChange={(e) => setCourierName(e.target.value)}
                                                required
                                                style={{ fontSize: '0.85rem' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '4px' }}>AWB Number</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. AWB-987654321"
                                                value={awbNumber}
                                                onChange={(e) => setAwbNumber(e.target.value)}
                                                style={{ fontSize: '0.85rem' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '4px' }}>Tracking Reference #</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Auto-generated if empty"
                                                value={trackingNumber}
                                                onChange={(e) => setTrackingNumber(e.target.value)}
                                                style={{ fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowShipmentForm(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={savingShipment}>
                                            <Send size={14} />
                                            <span>{savingShipment ? 'Saving Shipment...' : 'Save & Mark Shipped'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Customer & Address Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                                {/* Customer Card */}
                                <div style={{ backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '16px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <User size={14} />
                                        <span>Customer Account Details</span>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                        {customerName}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Mail size={13} />
                                        <span>{customerEmail}</span>
                                        <button type="button" onClick={() => handleCopy(customerEmail, 'c_email')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}>
                                            {copiedField === 'c_email' ? <Check size={12} style={{ color: 'var(--admin-success)' }} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                    {customerPhone !== 'N/A' && (
                                        <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Phone size={13} />
                                            <span>{customerPhone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Shipping Address Card */}
                                <div style={{ backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '16px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <MapPin size={14} />
                                        <span>Shipping Delivery Address</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)', lineHeight: '1.5' }}>
                                        <div style={{ fontWeight: 700 }}>{shippingAddr.name || customerName}</div>
                                        <div>{shippingAddr.address_line1 || shippingAddr.line_1 || 'Address Line 1'}</div>
                                        {(shippingAddr.address_line2 || shippingAddr.line_2) && <div>{shippingAddr.address_line2 || shippingAddr.line_2}</div>}
                                        <div>{shippingAddr.city}, {shippingAddr.state_code || shippingAddr.state} — {shippingAddr.postal_code}</div>
                                        <div style={{ fontWeight: 600, color: 'var(--admin-muted)', marginTop: '2px' }}>{shippingAddr.country_code || shippingAddr.country || 'India'}</div>
                                    </div>
                                </div>

                                {/* Payment & Shipment Card */}
                                <div style={{ backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '16px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CreditCard size={14} />
                                        <span>Payment & Tracking Summary</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ color: 'var(--admin-muted)' }}>Payment Method:</span>
                                            <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>{order.payment_method || 'COD'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ color: 'var(--admin-muted)' }}>Gateway Transaction:</span>
                                            <span style={{ fontWeight: 600 }}>{payment?.transaction_id || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--admin-muted)' }}>Shipment Courier:</span>
                                            <span style={{ fontWeight: 700, color: shipment ? 'var(--admin-primary)' : 'var(--admin-muted)' }}>
                                                {shipment ? `${shipment.courier_name} (${shipment.tracking_number})` : 'Not Shipped Yet'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Order Products Table */}
                            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
                                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--admin-border)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--admin-text)' }}>
                                    Order Items & Frozen Price Snapshots
                                </div>
                                <div className="table-responsive">
                                    <table className="admin-table" style={{ width: '100%', margin: 0 }}>
                                        <thead>
                                            <tr>
                                                <th style={{ paddingLeft: '18px' }}>Product & SKU</th>
                                                <th>Unit Price</th>
                                                <th>Qty</th>
                                                <th>Tax</th>
                                                <th style={{ textAlign: 'right', paddingRight: '18px' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.length > 0 ? (
                                                items.map((item) => {
                                                    const pName = item.snapshot_data?.name || item.product_name || item.product?.name || 'Product Item';
                                                    const sku = item.snapshot_data?.sku || item.sku || 'N/A';
                                                    const imgUrl = item.snapshot_data?.image || item.product?.featured_image || null;

                                                    return (
                                                        <tr key={item.id}>
                                                            <td style={{ paddingLeft: '18px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    {imgUrl ? (
                                                                        <img src={imgUrl} alt={pName} style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--admin-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-muted)', fontWeight: 700, fontSize: '0.8rem' }}>
                                                                            SKU
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.88rem' }}>
                                                                            {pName}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                                            SKU: {sku}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ fontWeight: 600 }}>{formatCurrency(item.unit_price || 0, order.currency || 'INR', true)}</td>
                                                            <td style={{ fontWeight: 700 }}>x{item.quantity}</td>
                                                            <td style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>{formatCurrency(item.tax_amount || 0, order.currency || 'INR', true)}</td>
                                                            <td style={{ fontWeight: 800, textAlign: 'right', paddingRight: '18px' }}>{formatCurrency(item.total_amount || 0, order.currency || 'INR', true)}</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No items recorded.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Order Pricing Totals */}
                                <div style={{ padding: '16px 20px', backgroundColor: 'var(--admin-bg)', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <div style={{ minWidth: '240px', fontSize: '0.88rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--admin-muted)' }}>
                                            <span>Subtotal:</span>
                                            <span>{formatCurrency(order.subtotal || 0, order.currency || 'INR', true)}</span>
                                        </div>
                                        {Number(order.discount_total) > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--admin-success)' }}>
                                                <span>Coupon Discount:</span>
                                                <span>-{formatCurrency(order.discount_total || 0, order.currency || 'INR', true)}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--admin-muted)' }}>
                                            <span>Taxes & GST:</span>
                                            <span>{formatCurrency(order.tax_total || 0, order.currency || 'INR', true)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--admin-muted)' }}>
                                            <span>Shipping Fee:</span>
                                            <span>{formatCurrency(order.shipping_total || 0, order.currency || 'INR', true)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--admin-border)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                            <span>Grand Total:</span>
                                            <span style={{ color: 'var(--admin-primary)' }}>{formatCurrency(order.grand_total || 0, order.currency || 'INR', true)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Audit Timeline & Notes Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                                {/* Timeline */}
                                <div style={{ backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '16px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} />
                                        <span>Order Audit Timeline</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                                        {histories.length > 0 ? (
                                            histories.map((h) => (
                                                <div key={h.id} style={{ display: 'flex', gap: '10px', fontSize: '0.82rem' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--admin-primary)', marginTop: '5px', flexShrink: 0 }} />
                                                    <div>
                                                        <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                            {h.status ? h.status.toUpperCase() : 'EVENT'}
                                                        </div>
                                                        <div style={{ color: 'var(--admin-muted)', fontSize: '0.78rem' }}>{h.comment}</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-subtle)', marginTop: '2px' }}>
                                                            {h.created_at ? new Date(h.created_at).toLocaleString() : ''} {h.user?.name ? `by ${h.user.name}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>No audit history recorded.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Internal Staff Notes */}
                                <form onSubmit={handleSaveNotes} style={{ backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FileText size={14} />
                                            <span>Internal Staff Reference Notes</span>
                                        </div>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            placeholder="Add staff reference notes, packaging instructions, or customer call logs..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            style={{ fontSize: '0.85rem', borderRadius: '8px' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={savingNotes} style={{ borderRadius: '8px' }}>
                                            <Save size={14} />
                                            <span>{savingNotes ? 'Saving...' : 'Save Staff Notes'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--admin-card-bg)' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close Order</button>
                </div>
            </div>
        </div>
    );
}
