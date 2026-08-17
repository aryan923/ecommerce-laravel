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
    CheckCircle2,
    AlertTriangle,
    Save,
    Copy,
    Check,
    Clock,
    Package,
    Building,
    RefreshCw,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Award
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
        if (isOpen && customerId && activeTab && activeTab !== 'notes' && activeTab !== 'bank_accounts') {
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
        if (newStatus === status) return;
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
    const bankAccounts = customer?.bank_accounts || [];
    const fullName = customer.full_name || customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer';

    const tabs = [
        { id: 'orders', label: 'Order History', icon: ShoppingBag, count: metrics.total_orders },
        { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
        { id: 'bank_accounts', label: 'Saved Bank Accounts', icon: Building, count: bankAccounts.length },
        { id: 'reviews', label: 'Product Reviews', icon: Star },
        { id: 'returns', label: 'Returns', icon: RotateCcw },
        { id: 'refunds', label: 'Refunds', icon: CreditCard },
        { id: 'notes', label: 'Staff Notes', icon: FileText },
    ];

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
                            width: '46px',
                            height: '46px',
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
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', letterSpacing: '-0.02em' }}>
                                    {fullName}
                                </h3>
                                <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '3px 9px',
                                    borderRadius: '12px',
                                    textTransform: 'uppercase',
                                    backgroundColor: status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                    color: status === 'active' ? '#10b981' : '#ef4444',
                                    border: `1px solid ${status === 'active' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                                }}>
                                    {status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                    <Mail size={13} />
                                    <span>{customer.email || 'N/A'}</span>
                                    {customer.email && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(customer.email, 'email')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                            title="Copy Email"
                                        >
                                            {copiedField === 'email' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                        </button>
                                    )}
                                </div>

                                {customer.mobile && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                        <Phone size={13} />
                                        <span>{customer.mobile}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(customer.mobile, 'mobile')}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                            title="Copy Mobile"
                                        >
                                            {copiedField === 'mobile' ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                                Account Status
                            </span>
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

                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={onClose}
                            style={{ padding: '6px', borderRadius: '8px', marginLeft: '6px' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Profile Analytics Summary Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    padding: '14px 24px',
                    backgroundColor: 'var(--admin-card-hover)',
                    borderBottom: '1px solid var(--admin-border)',
                    flexShrink: 0
                }}>
                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Lifetime Spend
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                            {formatCurrency(metrics.total_spent || 0, 'INR', true)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Orders Placed
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '2px' }}>
                            {metrics.total_orders || 0} orders
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Average Order Value (AOV)
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-primary)', marginTop: '2px' }}>
                            {formatCurrency(metrics.average_order_value || 0, 'INR', true)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--admin-card-bg)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Member Registration
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-text)', marginTop: '4px' }}>
                            {metrics.registration_date ? new Date(metrics.registration_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation Toolbar */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    padding: '6px 24px 0 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    flexShrink: 0
                }}>
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className="customer-modal-tab-btn"
                                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                                style={{
                                    padding: '10px 16px',
                                    border: 'none',
                                    borderBottom: `3px solid ${isActive ? 'var(--admin-primary)' : 'transparent'}`,
                                    backgroundColor: 'transparent',
                                    color: isActive ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                    fontWeight: isActive ? 700 : 600,
                                    fontSize: '0.86rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <IconComponent size={15} />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && (
                                    <span style={{
                                        fontSize: '0.7rem',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--admin-card-hover)',
                                        color: isActive ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                        fontWeight: 700
                                    }}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Body */}
                <div className="customer-modal-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '24px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--admin-muted)' }}>
                            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--admin-primary)' }} />
                            <div>Loading customer profile records...</div>
                        </div>
                    ) : activeTab === 'notes' ? (
                        /* Staff Notes Tab */
                        <form onSubmit={handleSaveNotes} style={{ maxWidth: '720px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: 'var(--admin-text)' }}>
                                    Internal Staff Reference Notes
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="6"
                                    placeholder="Enter internal staff references, customer preferences, VIP tags, or special support instructions..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    style={{ fontSize: '0.9rem', lineHeight: '1.6', borderRadius: '10px' }}
                                />
                                <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginTop: '6px', display: 'block' }}>
                                    * Internal notes are strictly confidential and only visible to store administrators.
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <button type="submit" className="btn btn-primary" disabled={savingNotes} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={16} />
                                    <span>{savingNotes ? 'Saving Notes...' : 'Save Staff Notes'}</span>
                                </button>
                            </div>
                        </form>
                    ) : activeTab === 'bank_accounts' ? (
                        /* Saved Bank Accounts Tab */
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Building size={18} style={{ color: '#10b981' }} />
                                <span>Customer Saved Bank Accounts for Payouts & Refunds</span>
                            </div>

                            {bankAccounts.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                    {bankAccounts.map((acc) => (
                                        <div
                                            key={acc.id}
                                            style={{
                                                backgroundColor: 'var(--admin-card-bg)',
                                                borderRadius: '12px',
                                                border: acc.is_default ? '2px solid #10b981' : '1px solid var(--admin-border)',
                                                padding: '16px',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                                    {acc.bank_name}
                                                </span>
                                                {acc.is_default && (
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ fontSize: '0.84rem', color: 'var(--admin-muted)', marginBottom: '6px' }}>
                                                Holder: <strong style={{ color: 'var(--admin-text)' }}>{acc.account_holder_name}</strong>
                                            </div>

                                            <div style={{ fontSize: '0.84rem', color: 'var(--admin-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <span>A/C: <strong style={{ fontFamily: 'monospace', color: 'var(--admin-text)' }}>{acc.masked_account_number || acc.account_number}</strong></span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(acc.account_number, `acc_${acc.id}`)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                                    title="Copy Account Number"
                                                >
                                                    {copiedField === `acc_${acc.id}` ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                                </button>
                                            </div>

                                            <div style={{ fontSize: '0.84rem', color: 'var(--admin-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>IFSC: <strong style={{ fontFamily: 'monospace', color: '#6366f1' }}>{acc.ifsc_code}</strong></span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(acc.ifsc_code, `ifsc_${acc.id}`)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                                    title="Copy IFSC"
                                                >
                                                    {copiedField === `ifsc_${acc.id}` ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                                </button>
                                            </div>

                                            {acc.upi_id && (
                                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--admin-border)', fontSize: '0.82rem', color: 'var(--admin-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>UPI: {acc.upi_id}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(acc.upi_id, `upi_${acc.id}`)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--admin-muted)' }}
                                                        title="Copy UPI ID"
                                                    >
                                                        {copiedField === `upi_${acc.id}` ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 24px', backgroundColor: 'var(--admin-card-hover)', borderRadius: '12px', border: '1px dashed var(--admin-border)' }}>
                                    <Building size={32} style={{ color: 'var(--admin-muted)', marginBottom: '8px' }} />
                                    <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>No Saved Bank Accounts</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', marginTop: '4px' }}>
                                        This customer has not registered any saved bank accounts for return payouts.
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'addresses' ? (
                        /* Addresses Grid */
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            {tabLoading ? (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                    Loading saved addresses...
                                </div>
                            ) : tabData.length > 0 ? (
                                tabData.map((addr) => (
                                    <div
                                        key={addr.id}
                                        style={{
                                            backgroundColor: 'var(--admin-card-bg)',
                                            borderRadius: '12px',
                                            border: '1px solid var(--admin-border)',
                                            padding: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                                    {addr.name || `${addr.first_name || ''} ${addr.last_name || ''}`.trim() || 'Delivery Address'}
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
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 24px', backgroundColor: 'var(--admin-card-hover)', borderRadius: '12px', border: '1px dashed var(--admin-border)' }}>
                                    <MapPin size={32} style={{ color: 'var(--admin-muted)', marginBottom: '8px' }} />
                                    <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>No Saved Addresses</div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', marginTop: '4px' }}>
                                        This customer has not registered any saved delivery addresses.
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* General Tables (Orders, Reviews, Returns, Refunds) */
                        <div style={{
                            backgroundColor: 'var(--admin-card-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--admin-border)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                                    {activeTab === 'orders' && (
                                        <>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-card-hover)', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-muted)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                    <th style={{ padding: '12px 16px' }}>Order #</th>
                                                    <th style={{ padding: '12px 16px' }}>Placed Date</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Items</th>
                                                    <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Order Status</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tabLoading ? (
                                                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>Loading order records...</td></tr>
                                                ) : tabData.length > 0 ? (
                                                    tabData.map((ord) => (
                                                        <tr key={ord.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                            <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--admin-primary)', fontFamily: 'monospace' }}>
                                                                {ord.order_number}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                                                {new Date(ord.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>
                                                                {ord.items_count ?? ord.order_items_count ?? 'N/A'}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontWeight: 600 }}>
                                                                {ord.payment_method || 'COD'}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                <span className="badge badge-shipped" style={{ fontSize: '0.72rem' }}>
                                                                    {ord.status?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--admin-text)' }}>
                                                                {formatCurrency(ord.grand_total ?? ord.total_amount ?? 0, 'INR', true)}
                                                            </td>
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
                                                <tr style={{ backgroundColor: 'var(--admin-card-hover)', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-muted)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                    <th style={{ padding: '12px 16px' }}>Product</th>
                                                    <th style={{ padding: '12px 16px' }}>Rating</th>
                                                    <th style={{ padding: '12px 16px' }}>Review Content</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                                    <th style={{ padding: '12px 16px' }}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tabLoading ? (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading reviews...</td></tr>
                                                ) : tabData.length > 0 ? (
                                                    tabData.map((rev) => (
                                                        <tr key={rev.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{rev.product?.name || 'Product'}</td>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 700 }}>
                                                                    <Star size={14} fill="#f59e0b" />
                                                                    <span>{rev.rating}/5</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', fontSize: '0.84rem' }}>{rev.comment}</td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>{rev.status}</span>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                                                {new Date(rev.created_at).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>No product reviews submitted.</td></tr>
                                                )}
                                            </tbody>
                                        </>
                                    )}

                                    {(activeTab === 'returns' || activeTab === 'refunds') && (
                                        <>
                                            <thead>
                                                <tr style={{ backgroundColor: 'var(--admin-card-hover)', borderBottom: '1px solid var(--admin-border)', color: 'var(--admin-muted)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                                    <th style={{ padding: '12px 16px' }}>Reference #</th>
                                                    <th style={{ padding: '12px 16px' }}>Order Details</th>
                                                    <th style={{ padding: '12px 16px' }}>Reason / Channel</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tabLoading ? (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>Loading records...</td></tr>
                                                ) : tabData.length > 0 ? (
                                                    tabData.map((item) => (
                                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                            <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--admin-primary)' }}>
                                                                #{item.return_number || item.refund_number || item.id}
                                                            </td>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                #{item.order?.order_number || 'N/A'}
                                                            </td>
                                                            <td style={{ padding: '12px 16px' }}>
                                                                {item.reason || item.refund_channel || 'N/A'}
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                                <span className="badge badge-pending" style={{ fontSize: '0.72rem' }}>
                                                                    {item.status?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                                                                {item.amount ? formatCurrency(item.amount, 'INR', true) : '—'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>No records found.</td></tr>
                                                )}
                                            </tbody>
                                        </>
                                    )}
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {tabPagination.last_page > 1 && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    borderTop: '1px solid var(--admin-border)',
                                    fontSize: '0.82rem'
                                }}>
                                    <span style={{ color: 'var(--admin-muted)' }}>
                                        Page {tabPagination.current_page} of {tabPagination.last_page} ({tabPagination.total} total items)
                                    </span>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            disabled={tabPagination.current_page <= 1}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            <ChevronLeft size={14} />
                                            <span>Prev</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            disabled={tabPagination.current_page >= tabPagination.last_page}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            <span>Next</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
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
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
