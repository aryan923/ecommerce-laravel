import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    MapPin,
    Star,
    RotateCcw,
    CreditCard,
    FileText,
    Shield,
    CheckCircle,
    AlertTriangle,
    Save,
    Copy,
    Check,
    Clock,
    Package
} from 'lucide-react';
import axios from 'axios';
import { loadCurrenciesFromApi, formatCurrency } from '../utils/currency';

export default function CustomerDetailPage({
    isOpen,
    customerId,
    onClose,
    onStatusChange
}) {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    const [tabData, setTabData] = useState([]);
    const [tabLoading, setTabLoading] = useState(false);
    const [tabPagination, setTabPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [page, setPage] = useState(1);

    // Status & Notes state
    const [status, setStatus] = useState('active');
    const [adminNotes, setAdminNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);
    const [notification, setNotification] = useState(null);
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        if (isOpen && customerId) {
            loadCurrenciesFromApi();
            fetchProfile();
            setActiveTab('orders');
            setPage(1);
        }
    }, [isOpen, customerId]);

    useEffect(() => {
        if (isOpen && customerId && activeTab) {
            fetchTabContent();
        }
    }, [isOpen, customerId, activeTab, page]);

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

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/admin/customers/${customerId}`);
            if (res.data?.success) {
                const data = res.data.data;
                setProfileData(data);
                setStatus(data.customer?.status || 'active');
                setAdminNotes(data.customer?.admin_notes || '');
            }
        } catch (err) {
            console.error('Failed to fetch customer profile:', err);
            showNotify('Failed to fetch customer profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTabContent = async () => {
        setTabLoading(true);
        try {
            const res = await axios.get(`/api/v1/admin/customers/${customerId}/${activeTab}?page=${page}&per_page=8`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setTabData(items);
                setTabPagination({
                    current_page: meta.current_page || 1,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error(`Failed to fetch tab ${activeTab}:`, err);
        } finally {
            setTabLoading(false);
        }
    };

    const handleSaveStatus = async (newStatus) => {
        setSavingStatus(true);
        try {
            const res = await axios.patch(`/api/v1/admin/customers/${customerId}/status`, { status: newStatus });
            if (res.data?.success) {
                setStatus(newStatus);
                showNotify(`Customer account status updated to ${newStatus.toUpperCase()}.`);
                if (onStatusChange) onStatusChange();
            }
        } catch (err) {
            console.error('Status save error:', err);
            showNotify('Failed to update status.', 'error');
        } finally {
            setSavingStatus(false);
        }
    };

    const handleSaveNotes = async (e) => {
        e.preventDefault();
        setSavingNotes(true);
        try {
            const res = await axios.patch(`/api/v1/admin/customers/${customerId}/notes`, { notes: adminNotes });
            if (res.data?.success) {
                showNotify('Admin staff notes saved successfully.');
            }
        } catch (err) {
            console.error('Notes save error:', err);
            showNotify('Failed to save admin notes.', 'error');
        } finally {
            setSavingNotes(false);
        }
    };

    if (!isOpen) return null;

    const customer = profileData?.customer || {};
    const metrics = profileData?.metrics || {};
    const fullName = customer.full_name || customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer';

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

            <div className="customer-modal-container">
                {/* Header Banner */}
                <div className="customer-modal-header" style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.04) 100%)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, var(--admin-primary), #a855f7)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.25rem',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            {fullName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', letterSpacing: '-0.01em' }}>
                                    {fullName}
                                </h3>
                                <span className={`badge ${status === 'active' ? 'badge-completed' : (status === 'suspended' ? 'badge-cancelled' : 'badge-pending')}`} style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '20px' }}>
                                    {status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                    <Mail size={13} />
                                    <span style={{ wordBreak: 'break-all' }}>{customer.email}</span>
                                    <button type="button" onClick={() => handleCopy(customer.email, 'email')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }} title="Copy Email">
                                        {copiedField === 'email' ? <Check size={13} style={{ color: 'var(--admin-success)' }} /> : <Copy size={13} />}
                                    </button>
                                </div>

                                {customer.mobile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                        <Phone size={13} />
                                        <span>{customer.mobile}</span>
                                        <button type="button" onClick={() => handleCopy(customer.mobile, 'mobile')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }} title="Copy Mobile">
                                            {copiedField === 'mobile' ? <Check size={13} style={{ color: 'var(--admin-success)' }} /> : <Copy size={13} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="customer-modal-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>Account Status</span>
                            <select
                                className="form-select"
                                style={{ fontSize: '0.82rem', padding: '4px 12px', borderRadius: '8px', fontWeight: 600, width: 'auto' }}
                                value={status}
                                disabled={savingStatus}
                                onChange={(e) => handleSaveStatus(e.target.value)}
                            >
                                <option value="active">Active Account</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended / Blocked</option>
                            </select>
                        </div>

                        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '8px', borderRadius: '8px', marginLeft: '6px' }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Profile Analytics Summary Bar */}
                <div className="customer-modal-stats-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    padding: '16px 24px',
                    backgroundColor: 'var(--admin-bg)',
                    borderBottom: '1px solid var(--admin-border)'
                }}>
                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Lifetime Customer Spend</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '2px' }}>
                            {formatCurrency(metrics.total_spent || 0, 'INR', true)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Orders Placed</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '2px' }}>
                            {metrics.total_orders || 0} orders
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Avg Order Value (AOV)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '2px' }}>
                            {formatCurrency(metrics.average_order_value || 0, 'INR', true)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Registration Date</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text)', marginTop: '4px' }}>
                            {metrics.registration_date ? new Date(metrics.registration_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation Toolbar */}
                <div className="customer-modal-tabs" style={{
                    display: 'flex',
                    gap: '6px',
                    padding: '8px 24px 0 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {[
                        { id: 'orders', label: 'Order History', icon: ShoppingBag },
                        { id: 'addresses', label: 'Addresses', icon: MapPin },
                        { id: 'reviews', label: 'Reviews', icon: Star },
                        { id: 'returns', label: 'Returns', icon: RotateCcw },
                        { id: 'refunds', label: 'Refunds', icon: CreditCard },
                        { id: 'notes', label: 'Admin Notes', icon: FileText },
                    ].map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className="customer-modal-tab-btn"
                                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                                style={{
                                    padding: '12px 18px',
                                    border: 'none',
                                    borderBottom: `3px solid ${isActive ? 'var(--admin-primary)' : 'transparent'}`,
                                    backgroundColor: 'transparent',
                                    color: isActive ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                    fontWeight: isActive ? 700 : 600,
                                    fontSize: '0.88rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <IconComponent size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Body */}
                <div className="customer-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--admin-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
                            <span>Loading customer profile data...</span>
                        </div>
                    ) : activeTab === 'notes' ? (
                        <form onSubmit={handleSaveNotes} style={{ maxWidth: '720px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: 'var(--admin-text)' }}>
                                    Internal Staff Reference Notes
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="6"
                                    placeholder="Enter internal staff references, preferences, VIP flags, or delivery instructions for this customer..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    style={{ fontSize: '0.9rem', lineHeight: '1.6', borderRadius: '10px' }}
                                />
                                <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginTop: '6px', display: 'block' }}>
                                    * Internal notes are only visible to store administrators and support staff.
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <button type="submit" className="btn btn-primary" disabled={savingNotes}>
                                    <Save size={16} />
                                    <span>{savingNotes ? 'Saving Notes...' : 'Save Staff Notes'}</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div>
                            {activeTab === 'addresses' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                    {tabLoading ? (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>Loading saved addresses...</div>
                                    ) : tabData.length > 0 ? (
                                        tabData.map((addr) => (
                                            <div key={addr.id} style={{
                                                backgroundColor: 'var(--admin-bg)',
                                                borderRadius: '12px',
                                                border: '1px solid var(--admin-border)',
                                                padding: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                                            {addr.name || `${addr.first_name || ''} ${addr.last_name || ''}`.trim() || 'Address'}
                                                        </span>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            {addr.is_default_shipping && <span className="badge badge-completed" style={{ fontSize: '0.68rem' }}>Default Shipping</span>}
                                                            {addr.is_default_billing && <span className="badge badge-pending" style={{ fontSize: '0.68rem' }}>Default Billing</span>}
                                                        </div>
                                                    </div>

                                                    <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', lineHeight: '1.5' }}>
                                                        <div>{addr.line_1 || addr.address_line_1 || ''}</div>
                                                        {(addr.line_2 || addr.address_line_2) && <div>{addr.line_2 || addr.address_line_2}</div>}
                                                        <div>{addr.city}, {addr.state} — {addr.postal_code}</div>
                                                        <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--admin-text)' }}>{addr.country || 'India'}</div>
                                                    </div>
                                                </div>

                                                {addr.mobile && (
                                                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--admin-border)', fontSize: '0.8rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Phone size={13} />
                                                        <span>{addr.mobile}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 24px', backgroundColor: 'var(--admin-bg)', borderRadius: '12px', border: '1px dashed var(--admin-border)' }}>
                                            <MapPin size={32} style={{ color: 'var(--admin-muted)', marginBottom: '8px' }} />
                                            <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>No Saved Addresses</div>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', marginTop: '4px' }}>This customer has not saved any shipping or billing addresses yet.</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab !== 'addresses' && (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        {activeTab === 'orders' && (
                                            <>
                                                <thead>
                                                    <tr>
                                                        <th>Order #</th>
                                                        <th>Date</th>
                                                        <th>Items</th>
                                                        <th>Payment</th>
                                                        <th>Order Status</th>
                                                        <th style={{ textAlign: 'right' }}>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tabLoading ? (
                                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading orders...</td></tr>
                                                    ) : tabData.length > 0 ? (
                                                        tabData.map((ord) => (
                                                            <tr key={ord.id}>
                                                                <td style={{ fontWeight: 700, color: 'var(--admin-primary)' }}>{ord.order_number}</td>
                                                                <td style={{ fontSize: '0.8rem' }}>{new Date(ord.created_at).toLocaleDateString()}</td>
                                                                <td>{ord.items_count ?? ord.order_items_count ?? 'N/A'}</td>
                                                                <td>
                                                                    <span className={`badge ${ord.payment_status === 'paid' ? 'badge-completed' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                                                                        {ord.payment_status || 'COD'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge badge-shipped" style={{ fontSize: '0.7rem' }}>
                                                                        {ord.status}
                                                                    </span>
                                                                </td>
                                                                <td style={{ fontWeight: 800, textAlign: 'right' }}>{formatCurrency(ord.grand_total ?? ord.total_amount ?? 0, 'INR', true)}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>No order history found for this customer.</td></tr>
                                                    )}
                                                </tbody>
                                            </>
                                        )}

                                        {activeTab === 'reviews' && (
                                            <>
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Rating</th>
                                                        <th>Review Comment</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tabLoading ? (
                                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading reviews...</td></tr>
                                                    ) : tabData.length > 0 ? (
                                                        tabData.map((rev) => (
                                                            <tr key={rev.id}>
                                                                <td style={{ fontWeight: 600 }}>{rev.product?.name || 'Product'}</td>
                                                                <td>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                                                                        <Star size={14} fill="#f59e0b" />
                                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{rev.rating}</span>
                                                                    </div>
                                                                </td>
                                                                <td style={{ fontSize: '0.82rem' }}>{rev.comment}</td>
                                                                <td><span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>{rev.status}</span></td>
                                                                <td style={{ fontSize: '0.8rem' }}>{new Date(rev.created_at).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>No product reviews submitted by this customer.</td></tr>
                                                    )}
                                                </tbody>
                                            </>
                                        )}

                                        {(activeTab === 'returns' || activeTab === 'refunds') && (
                                            <>
                                                <thead>
                                                    <tr>
                                                        <th>Reference #</th>
                                                        <th>Order</th>
                                                        <th>Amount / Reason</th>
                                                        <th>Status</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {tabLoading ? (
                                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading data...</td></tr>
                                                    ) : tabData.length > 0 ? (
                                                        tabData.map((item) => (
                                                            <tr key={item.id}>
                                                                <td style={{ fontWeight: 700 }}>#{item.id}</td>
                                                                <td>{item.order?.order_number || 'N/A'}</td>
                                                                <td>{item.amount ? formatCurrency(item.amount, 'INR', true) : (item.reason || 'N/A')}</td>
                                                                <td><span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>{item.status}</span></td>
                                                                <td style={{ fontSize: '0.8rem' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>No records found for this customer.</td></tr>
                                                    )}
                                                </tbody>
                                            </>
                                        )}
                                    </table>
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {tabPagination.last_page > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                        Page {tabPagination.current_page} of {tabPagination.last_page} ({tabPagination.total} total items)
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-secondary btn-sm" disabled={tabPagination.current_page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                                        <button className="btn btn-secondary btn-sm" disabled={tabPagination.current_page === tabPagination.last_page} onClick={() => setPage(page + 1)}>Next</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--admin-card-bg)' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close Profile</button>
                </div>
            </div>
        </div>
    );
}
