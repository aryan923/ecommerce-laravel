import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Clock,
    MapPin,
    Star,
    RotateCcw,
    FileText,
    ShieldCheck,
    ShieldOff,
    Edit2,
    Key,
    Plus,
    AlertCircle,
    CheckCircle,
    Send
} from 'lucide-react';
import axios from 'axios';

export default function CustomerDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');

    // Tab data
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [returns, setReturns] = useState([]);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [tabLoading, setTabLoading] = useState(false);

    // Toast
    const [notification, setNotification] = useState(null);

    const showToast = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchCustomerProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/v1/admin/customers/${id}`);
            if (res.data?.success) {
                setCustomer(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load profile', err);
            showToast('Customer profile not found', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchTabData = async () => {
        setTabLoading(true);
        try {
            if (activeTab === 'orders') {
                const res = await axios.get(`/api/v1/admin/customers/${id}/orders`);
                if (res.data?.success) setOrders(res.data.data || []);
            } else if (activeTab === 'addresses') {
                const res = await axios.get(`/api/v1/admin/customers/${id}/addresses`);
                if (res.data?.success) setAddresses(res.data.data || []);
            } else if (activeTab === 'reviews') {
                const res = await axios.get(`/api/v1/admin/customers/${id}/reviews`);
                if (res.data?.success) setReviews(res.data.data || []);
            } else if (activeTab === 'returns') {
                const res = await axios.get(`/api/v1/admin/customers/${id}/returns`);
                if (res.data?.success) setReturns(res.data.data || []);
            } else if (activeTab === 'notes') {
                const res = await axios.get(`/api/v1/admin/customers/${id}/notes`);
                if (res.data?.success) setNotes(res.data.data || []);
            }
        } catch (err) {
            console.error(`Failed to load ${activeTab} data`, err);
        } finally {
            setTabLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerProfile();
    }, [id]);

    useEffect(() => {
        if (id) fetchTabData();
    }, [id, activeTab]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        try {
            const res = await axios.post(`/api/v1/admin/customers/${id}/notes`, { note: newNote });
            if (res.data?.success) {
                showToast('Internal note added successfully');
                setNewNote('');
                fetchTabData();
            }
        } catch (err) {
            console.error('Failed to add note', err);
            showToast('Failed to add note', 'error');
        }
    };

    const handleResetPassword = async () => {
        try {
            const res = await axios.post(`/api/v1/admin/customers/${id}/reset-password`);
            if (res.data?.success) {
                showToast('Password reset link generated successfully');
            }
        } catch (err) {
            console.error('Failed to generate reset link', err);
            showToast('Failed to generate reset link', 'error');
        }
    };

    const handleToggleStatus = async () => {
        if (!customer) return;
        const newStatus = customer.status === 'active' ? 'suspended' : 'active';
        try {
            const res = await axios.patch(`/api/v1/admin/customers/${id}/status`, { status: newStatus });
            if (res.data?.success) {
                showToast(`Customer account status updated to ${newStatus}`);
                fetchCustomerProfile();
            }
        } catch (err) {
            console.error('Failed to toggle status', err);
            showToast('Failed to update status', 'error');
        }
    };

    if (loading) {
        return (
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--admin-muted)' }}>
                Loading customer profile...
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="dashboard-card" style={{ textAlign: 'center', padding: '48px' }}>
                <h3>Customer Not Found</h3>
                <button className="btn btn-secondary" onClick={() => navigate('/customers')} style={{ marginTop: '16px' }}>
                    <ArrowLeft size={16} />
                    <span>Back to Customers List</span>
                </button>
            </div>
        );
    }

    const displayName = customer.full_name || customer.name || 'Unnamed Customer';
    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';
    const isSuspended = customer.status === 'suspended' || customer.status === 'disabled';

    return (
        <div>
            {/* Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.msg}</span>
                </div>
            )}

            {/* Back Button Header */}
            <div style={{ marginBottom: '20px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={16} />
                    <span>Back to Customers</span>
                </button>
            </div>

            {/* Profile Overview Card */}
            <div className="dashboard-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--admin-primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.4rem',
                            flexShrink: 0
                        }}>
                            {initials}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{displayName}</h2>
                                {isSuspended ? (
                                    <span className="badge badge-cancelled">Suspended</span>
                                ) : (
                                    <span className="badge badge-completed">Active</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '6px', fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail size={14} /> {customer.email}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Phone size={14} /> {customer.mobile || 'No phone'}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Calendar size={14} /> Joined {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={handleResetPassword} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Key size={14} />
                            <span>Reset Password</span>
                        </button>
                        {isSuspended ? (
                            <button className="btn btn-secondary btn-sm" onClick={handleToggleStatus} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--admin-success)' }}>
                                <ShieldCheck size={14} />
                                <span>Re-activate Account</span>
                            </button>
                        ) : (
                            <button className="btn btn-secondary btn-sm" onClick={handleToggleStatus} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--admin-danger)' }}>
                                <ShieldOff size={14} />
                                <span>Suspend Account</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lifetime Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div className="dashboard-card" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Orders</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {customer.total_orders ?? 0} orders
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Lifetime Spent</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-primary)' }}>
                        ${customer.total_spent?.toLocaleString()}
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Order Value (AOV)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        ${customer.avg_order_value?.toLocaleString()}
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Last Order Date</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)', marginTop: '4px' }}>
                        {customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString() : 'No orders yet'}
                    </div>
                </div>
            </div>

            {/* History & Details Tabbed Container */}
            <div className="dashboard-card">
                {/* Tab Header Navigation */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--admin-border)',
                    padding: '0 20px',
                    gap: '24px',
                    overflowX: 'auto'
                }}>
                    {[
                        { id: 'orders', label: 'Order History', icon: ShoppingBag },
                        { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
                        { id: 'reviews', label: 'Product Reviews', icon: Star },
                        { id: 'returns', label: 'Return Requests', icon: RotateCcw },
                        { id: 'notes', label: 'Internal Staff Notes', icon: FileText },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '14px 4px',
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '0.9rem',
                                    fontWeight: active ? 700 : 500,
                                    color: active ? 'var(--admin-primary)' : 'var(--admin-muted)',
                                    borderBottom: active ? '2px solid var(--admin-primary)' : '2px solid transparent',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Body */}
                <div style={{ padding: '20px' }}>
                    {tabLoading ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                            Loading tab content...
                        </div>
                    ) : (
                        <>
                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Order Number</th>
                                                <th>Date</th>
                                                <th>Items</th>
                                                <th>Total Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length > 0 ? (
                                                orders.map((ord) => (
                                                    <tr key={ord.id}>
                                                        <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                            {ord.order_number || `#${ord.id}`}
                                                        </td>
                                                        <td style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
                                                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                        <td>
                                                            {ord.items?.length || 0} item(s)
                                                        </td>
                                                        <td style={{ fontWeight: 800, color: 'var(--admin-primary)' }}>
                                                            ${parseFloat(ord.grand_total || ord.total_amount || 0).toFixed(2)}
                                                        </td>
                                                        <td>
                                                            <span className={`badge badge-${(ord.status || ord.order_status) === 'completed' || (ord.status || ord.order_status) === 'delivered' || (ord.status || ord.order_status) === 'paid' ? 'completed' : ((ord.status || ord.order_status) === 'cancelled' || (ord.status || ord.order_status) === 'failed' ? 'cancelled' : 'pending')}`}>
                                                                {ord.status || ord.order_status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                                                        No orders placed by this customer yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ADDRESSES TAB */}
                            {activeTab === 'addresses' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                    {addresses.length > 0 ? (
                                        addresses.map((addr) => (
                                            <div key={addr.id} style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{addr.full_name || addr.address_type || 'Address'}</span>
                                                    {addr.is_default_shipping && <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>Default Shipping</span>}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', lineHeight: '1.4' }}>
                                                    <div>{addr.line_1 || addr.address_line1}</div>
                                                    {(addr.line_2 || addr.address_line2) && <div>{addr.line_2 || addr.address_line2}</div>}
                                                    <div>{addr.city}, {addr.state} {addr.postal_code}</div>
                                                    <div>{addr.country}</div>
                                                    {(addr.mobile || addr.phone) && <div style={{ marginTop: '4px', fontWeight: 600 }}>Phone: {addr.mobile || addr.phone}</div>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ color: 'var(--admin-muted)', textAlign: 'center', padding: '24px' }}>
                                            No saved addresses for this customer.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* REVIEWS TAB */}
                            {activeTab === 'reviews' && (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Rating</th>
                                                <th>Comment</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reviews.length > 0 ? (
                                                reviews.map((rev) => (
                                                    <tr key={rev.id}>
                                                        <td style={{ fontWeight: 600 }}>
                                                            {rev.product?.name || `Product #${rev.product_id}`}
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontWeight: 700 }}>
                                                                <Star size={14} fill="#f59e0b" />
                                                                <span>{rev.rating} / 5</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                                                            {rev.comment || rev.review || 'No written comment'}
                                                        </td>
                                                        <td style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                                                        No product reviews submitted by this customer.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* RETURNS TAB */}
                            {activeTab === 'returns' && (
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Return ID</th>
                                                <th>Order Number</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {returns.length > 0 ? (
                                                returns.map((ret) => (
                                                    <tr key={ret.id}>
                                                        <td style={{ fontWeight: 700 }}>#{ret.id}</td>
                                                        <td>{ret.order?.order_number || `#${ret.order_id}`}</td>
                                                        <td style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>{ret.reason}</td>
                                                        <td>
                                                            <span className={`badge badge-${ret.status === 'approved' ? 'completed' : (ret.status === 'rejected' ? 'cancelled' : 'pending')}`}>
                                                                {ret.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                                            {ret.created_at ? new Date(ret.created_at).toLocaleDateString() : 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--admin-muted)' }}>
                                                        No return requests submitted by this customer.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* INTERNAL STAFF NOTES TAB */}
                            {activeTab === 'notes' && (
                                <div>
                                    <form onSubmit={handleAddNote} style={{ marginBottom: '24px', display: 'flex', gap: '10px' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Write internal note regarding customer support, phone call, or refund request..."
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                        />
                                        <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                            <Send size={14} />
                                            <span>Post Note</span>
                                        </button>
                                    </form>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {notes.length > 0 ? (
                                            notes.map((noteItem) => (
                                                <div key={noteItem.id} style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                                            Staff: {noteItem.admin_user?.name || 'Store Admin'}
                                                        </span>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                            {noteItem.created_at ? new Date(noteItem.created_at).toLocaleString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '0.88rem', color: 'var(--admin-text)' }}>
                                                        {noteItem.note}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ color: 'var(--admin-muted)', textAlign: 'center', padding: '24px' }}>
                                                No internal notes posted for this customer yet.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
