import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    UserCheck,
    UserX,
    UserPlus,
    DollarSign,
    Search,
    Filter,
    Download,
    Eye,
    Edit2,
    ShieldOff,
    ShieldCheck,
    RotateCcw,
    AlertCircle,
    CheckCircle,
    X,
    ChevronLeft,
    ChevronRight,
    Key
} from 'lucide-react';
import axios from 'axios';

export default function CustomersPage() {
    const navigate = useNavigate();

    // State management
    const [stats, setStats] = useState({
        total_customers: 0,
        active_customers: 0,
        suspended_customers: 0,
        new_customers_this_month: 0,
        total_revenue: 0,
    });
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCustomersCount, setTotalCustomersCount] = useState(0);

    // Modals
    const [statusModal, setStatusModal] = useState({ open: false, customer: null, newStatus: '', reason: '' });
    const [editModal, setEditModal] = useState({ open: false, customer: null, name: '', email: '', mobile: '' });
    const [notification, setNotification] = useState(null);

    const showToast = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/v1/admin/customers/stats');
            if (res.data?.success) {
                setStats(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch customer stats', err);
        }
    };

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: 12,
            };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (sortBy && sortBy !== 'latest') params.sort_by = sortBy;

            const res = await axios.get('/api/v1/admin/customers', { params });
            if (res.data?.success) {
                setCustomers(res.data.data || []);
                setTotalPages(res.data.meta?.last_page || 1);
                setTotalCustomersCount(res.data.meta?.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch customers', err);
            const msg = err.response?.data?.message || 'Failed to load customer list';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchCustomers();
    }, [page, statusFilter, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers();
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setSortBy('latest');
        setPage(1);
    };

    const handleOpenStatusModal = (cust, targetStatus) => {
        setStatusModal({
            open: true,
            customer: cust,
            newStatus: targetStatus,
            reason: '',
        });
    };

    const handleSaveStatus = async () => {
        if (!statusModal.customer) return;
        try {
            const res = await axios.patch(`/api/v1/admin/customers/${statusModal.customer.id}/status`, {
                status: statusModal.newStatus,
                reason: statusModal.reason,
            });
            if (res.data?.success) {
                showToast(`Customer status updated to ${statusModal.newStatus}`);
                setStatusModal({ open: false, customer: null, newStatus: '', reason: '' });
                fetchCustomers();
                fetchStats();
            }
        } catch (err) {
            console.error('Failed to update status', err);
            showToast('Failed to update status', 'error');
        }
    };

    const handleOpenEditModal = (cust) => {
        setEditModal({
            open: true,
            customer: cust,
            name: cust.name || cust.full_name || '',
            first_name: cust.first_name || '',
            last_name: cust.last_name || '',
            email: cust.email || '',
            mobile: cust.mobile || '',
            date_of_birth: cust.date_of_birth ? cust.date_of_birth.substring(0, 10) : '',
            gender: cust.gender || '',
            status: cust.status || 'active',
        });
    };

    const handleSaveEdit = async () => {
        if (!editModal.customer) return;
        try {
            const res = await axios.put(`/api/v1/admin/customers/${editModal.customer.id}`, {
                name: editModal.name,
                first_name: editModal.first_name,
                last_name: editModal.last_name,
                email: editModal.email,
                mobile: editModal.mobile,
                date_of_birth: editModal.date_of_birth || null,
                gender: editModal.gender || null,
                status: editModal.status,
            });
            if (res.data?.success) {
                showToast('Customer profile updated successfully');
                setEditModal({ open: false, customer: null, name: '', first_name: '', last_name: '', email: '', mobile: '', date_of_birth: '', gender: '', status: 'active' });
                fetchCustomers();
                fetchStats();
            }
        } catch (err) {
            console.error('Failed to update profile', err);
            const msg = err.response?.data?.message || 'Failed to update profile';
            showToast(msg, 'error');
        }
    };

    const handleExportCsv = async () => {
        try {
            const response = await axios.get('/api/v1/admin/customers/export', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `customers-export-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast('Customers CSV exported successfully');
        } catch (error) {
            console.error('Failed to export CSV', error);
            showToast('Failed to export CSV', 'error');
        }
    };

    return (
        <div>
            {/* Toast Notification */}
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

            {/* Page Header */}
            <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <h2 className="page-header-title" style={{ margin: 0, fontSize: '1.4rem' }}>Customer Management</h2>
                    <p className="page-header-subtitle" style={{ margin: '2px 0 0 0', fontSize: '0.82rem' }}>Inspect customer profiles, order history, lifetime spend, status controls, and staff notes</p>
                </div>

                <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleExportCsv} style={{ height: '34px', padding: '0 14px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
            }}>
                <div className="dashboard-card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Customers</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)' }}>
                            <Users size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {stats.total_customers.toLocaleString()}
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Active Accounts</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--admin-success)' }}>
                            <UserCheck size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-success)' }}>
                        {stats.active_customers.toLocaleString()}
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Suspended</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--admin-danger)' }}>
                            <UserX size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stats.suspended_customers > 0 ? 'var(--admin-danger)' : 'var(--admin-text)' }}>
                        {stats.suspended_customers.toLocaleString()}
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>New This Month</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <UserPlus size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}>
                        {stats.new_customers_this_month.toLocaleString()}
                    </div>
                </div>

                <div className="dashboard-card" style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Lifetime Revenue</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--admin-warning)' }}>
                            <DollarSign size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        ${stats.total_revenue?.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="dashboard-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Customer Name, Email, Phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>

                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Account Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended / Disabled</option>
                    </select>

                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="latest">Sort: Registered Date (Latest)</option>
                        <option value="oldest">Sort: Registered Date (Oldest)</option>
                        <option value="name_asc">Sort: Customer Name (A-Z)</option>
                        <option value="total_orders">Sort: Total Orders (High to Low)</option>
                        <option value="total_spent">Sort: Total Spent (High to Low)</option>
                    </select>

                    <button type="submit" className="btn btn-primary">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>

                    {(search || statusFilter || sortBy !== 'latest') && (
                        <button type="button" className="btn btn-secondary" onClick={handleResetFilters} title="Reset filters">
                            <RotateCcw size={14} />
                        </button>
                    )}
                </form>
            </div>

            {/* Customers Data Table */}
            <div className="dashboard-card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email / Contact</th>
                                <th>Status</th>
                                <th>Total Orders</th>
                                <th>Lifetime Spend</th>
                                <th>Registered Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        Loading customer accounts...
                                    </td>
                                </tr>
                            ) : customers.length > 0 ? (
                                customers.map((c) => {
                                    const displayName = c.full_name || c.name || 'Unnamed Customer';
                                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';
                                    const isSuspended = c.status === 'suspended' || c.status === 'disabled';
                                    const totalSpent = c.orders_sum_grand_total ?? c.orders_sum_total_amount ?? 0;

                                    return (
                                        <tr key={c.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--admin-primary)',
                                                        color: '#fff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 700,
                                                        fontSize: '0.85rem',
                                                        flexShrink: 0
                                                    }}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div
                                                            style={{ fontWeight: 700, color: 'var(--admin-text)', cursor: 'pointer' }}
                                                            onClick={() => navigate(`/customers/${c.id}`)}
                                                        >
                                                            {displayName}
                                                        </div>
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                            Customer ID: #{c.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{c.email}</div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                    {c.mobile || 'No phone recorded'}
                                                </div>
                                            </td>
                                            <td>
                                                {isSuspended ? (
                                                    <span className="badge badge-cancelled">Suspended</span>
                                                ) : (
                                                    <span className="badge badge-completed">Active</span>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                {c.orders_count ?? 0} orders
                                            </td>
                                            <td style={{ fontWeight: 800, color: 'var(--admin-primary)', whiteSpace: 'nowrap' }}>
                                                ${parseFloat(totalSpent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => navigate(`/customers/${c.id}`)}
                                                        title="View Customer Profile"
                                                        style={{ padding: '6px 10px' }}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleOpenEditModal(c)}
                                                        title="Edit Customer Details"
                                                        style={{ padding: '6px 10px' }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    {isSuspended ? (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleOpenStatusModal(c, 'active')}
                                                            title="Re-activate Account"
                                                            style={{ padding: '6px 10px', color: 'var(--admin-success)' }}
                                                        >
                                                            <ShieldCheck size={14} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleOpenStatusModal(c, 'suspended')}
                                                            title="Suspend Account"
                                                            style={{ padding: '6px 10px', color: 'var(--admin-danger)' }}
                                                        >
                                                            <ShieldOff size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        No customer accounts found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--admin-border)' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCustomersCount} total customers)
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Change Modal */}
            {statusModal.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999
                }}>
                    <div className="dashboard-card" style={{ width: '100%', maxWidth: '450px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                                {statusModal.newStatus === 'suspended' ? 'Suspend Account' : 'Reactivate Account'}
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setStatusModal({ open: false, customer: null, newStatus: '', reason: '' })}>
                                <X size={16} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', marginBottom: '16px' }}>
                            Are you sure you want to set account status to <strong>{statusModal.newStatus}</strong> for customer <strong>{statusModal.customer?.name}</strong>?
                        </p>
                        <div style={{ marginBottom: '20px' }}>
                            <label className="form-label">Internal Reason (Optional)</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="E.g., Requested by user or security policy update..."
                                value={statusModal.reason}
                                onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn btn-secondary" onClick={() => setStatusModal({ open: false, customer: null, newStatus: '', reason: '' })}>
                                Cancel
                            </button>
                            <button
                                className={`btn ${statusModal.newStatus === 'suspended' ? 'btn-danger' : 'btn-primary'}`}
                                onClick={handleSaveStatus}
                            >
                                Confirm {statusModal.newStatus === 'suspended' ? 'Suspension' : 'Activation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Profile Modal */}
            {editModal.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 999
                }}>
                    <div className="dashboard-card" style={{ width: '100%', maxWidth: '540px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Edit Customer Profile</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditModal({ open: false, customer: null, name: '', first_name: '', last_name: '', email: '', mobile: '', date_of_birth: '', gender: '', status: 'active' })}>
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editModal.first_name}
                                        onChange={(e) => {
                                            const fn = e.target.value;
                                            setEditModal({
                                                ...editModal,
                                                first_name: fn,
                                                name: `${fn} ${editModal.last_name}`.trim()
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editModal.last_name}
                                        onChange={(e) => {
                                            const ln = e.target.value;
                                            setEditModal({
                                                ...editModal,
                                                last_name: ln,
                                                name: `${editModal.first_name} ${ln}`.trim()
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={editModal.email}
                                    onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editModal.mobile}
                                        onChange={(e) => setEditModal({ ...editModal, mobile: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={editModal.date_of_birth}
                                        onChange={(e) => setEditModal({ ...editModal, date_of_birth: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label className="form-label">Gender</label>
                                    <select
                                        className="form-select"
                                        value={editModal.gender}
                                        onChange={(e) => setEditModal({ ...editModal, gender: e.target.value })}
                                    >
                                        <option value="">Unspecified</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Account Status</label>
                                    <select
                                        className="form-select"
                                        value={editModal.status}
                                        onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="disabled">Disabled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditModal({ open: false, customer: null, name: '', first_name: '', last_name: '', email: '', mobile: '', date_of_birth: '', gender: '', status: 'active' })}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveEdit}>
                                Save Profile Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
