import React, { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Shield,
    Lock,
    Search,
    Plus,
    Edit2,
    Trash2,
    Key,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    X,
    UserCheck,
    UserX,
    Mail,
    Phone,
    ShieldAlert,
    Clock,
    Filter,
    RotateCcw,
    Check
} from 'lucide-react';

export default function StaffPage() {
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'roles' | 'matrix'
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Data States
    const [staffUsers, setStaffUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [groupedPermissions, setGroupedPermissions] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    // Filters State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);

    // Staff Modals State
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [staffForm, setStaffForm] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        status: 'active',
        role_ids: []
    });

    // Reset Access Modal State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetTargetStaff, setResetTargetStaff] = useState(null);
    const [resetPassword, setResetPassword] = useState('');

    // Role Modal State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        name: '',
        description: '',
        permission_ids: []
    });

    useEffect(() => {
        fetchRolesAndPermissions();
    }, []);

    const fetchRolesAndPermissions = async () => {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };

            const [rolesRes, permsRes] = await Promise.all([
                fetch('/api/v1/admin/roles', { headers }),
                fetch('/api/v1/admin/permissions', { headers })
            ]);

            const rolesData = await rolesRes.json();
            const permsData = await permsRes.json();

            if (rolesData.success && rolesData.data) {
                setRoles(rolesData.data);
            }

            if (permsData.success && permsData.data) {
                setGroupedPermissions(permsData.data);
            }
        } catch (err) {
            console.error('Failed to load roles/permissions:', err);
        }
    };

    const fetchStaffUsers = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (roleFilter) params.append('role_id', roleFilter);
            params.append('page', targetPage);
            params.append('per_page', 15);

            const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });

            const result = await res.json();
            if (res.ok && result.success) {
                const rawData = result.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = result.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});

                setStaffUsers(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length
                });
            }
        } catch (err) {
            console.error('Failed to fetch staff members:', err);
            setMessage({ type: 'error', text: 'Error fetching staff members.' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, statusFilter, roleFilter, page]);

    useEffect(() => {
        fetchStaffUsers(page);
    }, [page, statusFilter, roleFilter, fetchStaffUsers]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchRolesAndPermissions();
        fetchStaffUsers(page);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchStaffUsers(1);
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setRoleFilter('');
        setPage(1);
    };

    // Staff Save/Update Handler
    const handleSaveStaff = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const isEdit = !!editingStaff;
            const url = isEdit ? `/api/v1/admin/users/${editingStaff.id}` : '/api/v1/admin/users';
            const method = isEdit ? 'PUT' : 'POST';

            const payload = { ...staffForm };
            if (isEdit && !payload.password) delete payload.password;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: `Staff user ${isEdit ? 'updated' : 'created'} successfully!` });
                setIsStaffModalOpen(false);
                setEditingStaff(null);
                fetchStaffUsers(page);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to save staff user.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error while saving staff account.' });
        } finally {
            setSaving(false);
        }
    };

    // Toggle Staff Status
    const handleToggleStatus = async (user, newStatus) => {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/users/${user.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: `Staff account status changed to [${newStatus.toUpperCase()}].` });
                fetchStaffUsers(page);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to change staff status.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error changing status.' });
        }
    };

    // Handle Reset Password Access
    const handleResetAccessSubmit = async (e) => {
        e.preventDefault();
        if (!resetTargetStaff) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/users/${resetTargetStaff.id}/reset-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: resetPassword })
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: `Password & session tokens reset for ${resetTargetStaff.name}.` });
                setIsResetModalOpen(false);
                setResetTargetStaff(null);
                setResetPassword('');
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to reset staff access.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error resetting staff access.' });
        } finally {
            setSaving(false);
        }
    };

    // Delete Staff User
    const handleDeleteStaff = async (user) => {
        if (!confirm(`Are you sure you want to delete staff member "${user.name}"?`)) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: 'Staff account deleted successfully.' });
                fetchStaffUsers(page);
            } else {
                setMessage({ type: 'error', text: result.message || 'Cannot delete staff user.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error deleting staff account.' });
        }
    };

    // Role Save/Update Handler
    const handleSaveRole = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const isEdit = !!editingRole;
            const url = isEdit ? `/api/v1/admin/roles/${editingRole.id}` : '/api/v1/admin/roles';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(roleForm)
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: `Role ${isEdit ? 'updated' : 'created'} successfully!` });
                setIsRoleModalOpen(false);
                setEditingRole(null);
                fetchRolesAndPermissions();
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to save role.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Server error while saving role.' });
        } finally {
            setSaving(false);
        }
    };

    // Delete Custom Role
    const handleDeleteRole = async (role) => {
        if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/roles/${role.id}`, {
                method: 'DELETE',
                headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: 'Custom role deleted successfully.' });
                fetchRolesAndPermissions();
            } else {
                setMessage({ type: 'error', text: result.message || 'Cannot delete role.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error deleting role.' });
        }
    };

    // Modals Helpers
    const openAddStaffModal = () => {
        setEditingStaff(null);
        setStaffForm({
            name: '',
            email: '',
            mobile: '',
            password: '',
            status: 'active',
            role_ids: roles.length > 0 ? [roles[0].id] : []
        });
        setIsStaffModalOpen(true);
    };

    const openEditStaffModal = (user) => {
        setEditingStaff(user);
        setStaffForm({
            name: user.name,
            email: user.email,
            mobile: user.mobile || '',
            password: '',
            status: user.status || 'active',
            role_ids: user.roles ? user.roles.map(r => r.id) : []
        });
        setIsStaffModalOpen(true);
    };

    const openResetAccessModal = (user) => {
        setResetTargetStaff(user);
        setResetPassword('');
        setIsResetModalOpen(true);
    };

    const openAddRoleModal = () => {
        setEditingRole(null);
        setRoleForm({
            name: '',
            description: '',
            permission_ids: []
        });
        setIsRoleModalOpen(true);
    };

    const openEditRoleModal = (role) => {
        setEditingRole(role);
        setRoleForm({
            name: role.name,
            description: role.description || '',
            permission_ids: role.permissions ? role.permissions.map(p => p.id) : []
        });
        setIsRoleModalOpen(true);
    };

    const activeStaffCount = staffUsers.filter(u => u.status === 'active').length;
    const disabledStaffCount = staffUsers.filter(u => u.status === 'disabled' || u.status === 'inactive').length;
    const totalPermissionNodes = groupedPermissions.reduce((acc, g) => acc + (g.permissions?.length || 0), 0);

    return (
        <div className="staff-page-container">
            {/* Page Header Row */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Admin Staff, Roles & Permissions</h2>
                    <p className="page-header-subtitle">
                        Manage administrative staff accounts, configure custom RBAC roles, assign module permissions, and audit access security
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Reload staff records and roles"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={openAddRoleModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <Shield size={14} />
                        <span>+ Create Role</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={openAddStaffModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                    >
                        <Plus size={14} />
                        <span>Add Staff Member</span>
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {message.text && (
                <div
                    style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: message.type === 'error' ? 'var(--admin-danger-light)' : 'var(--admin-success-light)',
                        border: `1px solid ${message.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)'}`,
                        color: message.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                        fontSize: '0.82rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        {message.type === 'error' ? <ShieldAlert size={15} /> : <CheckCircle2 size={15} />}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Executive KPI Cards Grid (Standard 4 Cards Per Row) */}
            <div className="stat-cards-grid-4">
                {/* 1. Total Staff Users */}
                <div
                    onClick={() => { setActiveTab('staff'); setStatusFilter(''); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'staff' && !statusFilter ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Staff Accounts
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {pagination.total || staffUsers.length} Staff
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            {activeStaffCount} active • {disabledStaffCount} disabled
                        </div>
                    </div>
                </div>

                {/* 2. System Roles */}
                <div
                    onClick={() => setActiveTab('roles')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'roles' ? '2px solid #10b981' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Configured Roles
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {roles.length} Roles
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Super Admin + Custom Roles
                        </div>
                    </div>
                </div>

                {/* 3. Permission Nodes */}
                <div
                    onClick={() => setActiveTab('matrix')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'matrix' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Permission Matrix
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                            {totalPermissionNodes} Permissions
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Across {groupedPermissions.length} modules
                        </div>
                    </div>
                </div>

                {/* 4. Active Access Status */}
                <div
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Access Control Status
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Key size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6' }}>
                            SECURE (RBAC)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Sanctum Token Protection
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Dashboard Card Enclosing Tabs & Search Toolbar */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Segmented Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflowX: 'auto',
                    padding: '12px 16px 8px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)',
                    scrollbarWidth: 'none'
                }}>
                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                        onClick={() => setActiveTab('staff')}
                    >
                        <Users size={13} />
                        <span>Staff Members</span>
                        <span className="order-tab-badge">{pagination.total || staffUsers.length}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('roles')}
                    >
                        <Shield size={13} />
                        <span>Roles & Permissions</span>
                        <span className="order-tab-badge">{roles.length}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
                        onClick={() => setActiveTab('matrix')}
                    >
                        <Lock size={13} />
                        <span>Permission Matrix Overview</span>
                    </button>
                </div>

                {/* Search & Filter Toolbar for Staff Tab */}
                {activeTab === 'staff' && (
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--admin-border)',
                        backgroundColor: 'var(--admin-card-bg)'
                    }}>
                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search Staff Name, Email, Mobile..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ paddingLeft: '36px', height: '36px', borderRadius: '8px', fontSize: '0.82rem' }}
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => { setSearch(''); setPage(1); fetchStaffUsers(1); }}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <select
                                className="form-select"
                                style={{ width: 'auto', minWidth: '150px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                                <option value="disabled">Disabled Only</option>
                            </select>

                            <select
                                className="form-select"
                                style={{ width: 'auto', minWidth: '160px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                                value={roleFilter}
                                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                            >
                                <option value="">All Roles</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>

                            <button type="submit" className="btn btn-secondary" style={{ height: '36px', padding: '0 14px', borderRadius: '8px', fontWeight: 600 }}>
                                <Filter size={14} />
                                <span>Filter</span>
                            </button>

                            {(search || statusFilter || roleFilter) && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleResetFilters}
                                    style={{ height: '36px', padding: '0 10px', borderRadius: '8px' }}
                                >
                                    <RotateCcw size={13} />
                                    <span>Reset</span>
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* TAB 1: STAFF MEMBERS DATA TABLE */}
                {activeTab === 'staff' && (
                    <div className="table-responsive" style={{ margin: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>STAFF MEMBER</th>
                                    <th>CONTACT</th>
                                    <th>ASSIGNED ROLES</th>
                                    <th>STATUS</th>
                                    <th>LAST LOGIN</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            Loading staff members...
                                        </td>
                                    </tr>
                                ) : staffUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            No staff accounts found matching filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    staffUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'var(--admin-primary-light)',
                                                        color: 'var(--admin-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 800,
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, color: 'var(--admin-text)' }}>{user.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>ID: #{user.id}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Mail size={12} style={{ color: 'var(--admin-muted)' }} />
                                                        <span>{user.email}</span>
                                                    </div>
                                                    {user.mobile && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--admin-muted)', fontSize: '0.75rem' }}>
                                                            <Phone size={11} />
                                                            <span>{user.mobile}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map(r => (
                                                            <span
                                                                key={r.id}
                                                                style={{
                                                                    padding: '3px 8px',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: r.slug === 'super_admin' ? 'rgba(99, 102, 241, 0.15)' : 'var(--admin-bg)',
                                                                    color: r.slug === 'super_admin' ? 'var(--admin-primary)' : 'var(--admin-text)',
                                                                    fontSize: '0.74rem',
                                                                    fontWeight: 700,
                                                                    border: '1px solid var(--admin-border)'
                                                                }}
                                                            >
                                                                {r.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>No role</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td>
                                                <span className={`badge ${user.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                                                    {user.status === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                                    {user.status ? user.status.toUpperCase() : 'ACTIVE'}
                                                </span>
                                            </td>

                                            <td>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}
                                                </div>
                                            </td>

                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => openEditStaffModal(user)}
                                                        title="Edit Staff Member"
                                                        style={{ padding: '5px 8px' }}
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => openResetAccessModal(user)}
                                                        title="Reset Password & Access"
                                                        style={{ padding: '5px 8px' }}
                                                    >
                                                        <Key size={13} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`btn ${user.status === 'active' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                                                        onClick={() => handleToggleStatus(user, user.status === 'active' ? 'disabled' : 'active')}
                                                        title={user.status === 'active' ? 'Disable Account' : 'Enable Account'}
                                                        style={{ padding: '5px 8px' }}
                                                    >
                                                        {user.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteStaff(user)}
                                                        title="Delete Staff Account"
                                                        style={{ padding: '5px 8px' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 2: ROLES & PERMISSIONS CARDS */}
                {activeTab === 'roles' && (
                    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                        {roles.map(role => (
                            <div
                                key={role.id}
                                className="form-section-box"
                                style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                            >
                                <div className="form-section-header">
                                    <div className="form-section-title">
                                        <Shield size={16} style={{ color: role.slug === 'super_admin' ? 'var(--admin-primary)' : '#10b981' }} />
                                        <span>{role.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--admin-bg)', color: 'var(--admin-muted)' }}>
                                        {role.admin_users_count || 0} Staff
                                    </span>
                                </div>

                                <div className="form-section-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                        {role.description || 'Custom administrative access role.'}
                                    </p>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--admin-border)', paddingTop: '10px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                            {role.slug === 'super_admin' ? 'All Permissions (*)' : `${role.permissions_count || 0} Assigned Permissions`}
                                        </span>

                                        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => openEditRoleModal(role)}
                                                style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                                            >
                                                <Edit2 size={12} />
                                                <span>Edit Permissions</span>
                                            </button>

                                            {!role.is_system && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDeleteRole(role)}
                                                    style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TAB 3: PERMISSION MATRIX OVERVIEW */}
                {activeTab === 'matrix' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {groupedPermissions.map(group => (
                            <div key={group.module} className="form-section-box" style={{ margin: 0 }}>
                                <div className="form-section-header">
                                    <div className="form-section-title">
                                        <Lock size={15} style={{ color: 'var(--admin-primary)' }} />
                                        <span style={{ textTransform: 'capitalize' }}>Module: {group.module}</span>
                                    </div>
                                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)' }}>
                                        {group.permissions?.length || 0} Action Nodes
                                    </span>
                                </div>
                                <div className="form-section-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                                        {group.permissions?.map(perm => (
                                            <div
                                                key={perm.id}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    backgroundColor: 'var(--admin-bg)',
                                                    border: '1px solid var(--admin-border)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'monospace' }}>{perm.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>{perm.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE / EDIT STAFF MODAL */}
            {isStaffModalOpen && (
                <div className="modal-overlay" onClick={() => setIsStaffModalOpen(false)}>
                    <div className="modal-card" style={{ width: '680px', maxWidth: '92vw', maxHeight: '86vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 20px 45px -10px rgba(0,0,0,0.3)', backgroundColor: 'var(--admin-card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                                        {editingStaff ? `Edit Staff Member: ${editingStaff.name}` : 'Add New Staff Member'}
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                        Configure account credentials, status, and role-based permission access
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsStaffModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', padding: '4px', borderRadius: '6px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveStaff} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                            <div className="modal-body" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* 2-Column Grid for Primary Details */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>Full Staff Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={staffForm.name}
                                            onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                            placeholder="e.g. Jane Smith"
                                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            required
                                            value={staffForm.email}
                                            onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                                            placeholder="jane.smith@acme.com"
                                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>Mobile Phone Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={staffForm.mobile}
                                            onChange={e => setStaffForm({ ...staffForm, mobile: e.target.value })}
                                            placeholder="+1-800-555-0199"
                                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>Account Status</label>
                                        <select
                                            className="form-select"
                                            value={staffForm.status}
                                            onChange={e => setStaffForm({ ...staffForm, status: e.target.value })}
                                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                        >
                                            <option value="active">Active (Access Allowed)</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="disabled">Disabled (Tokens Revoked)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>
                                        {editingStaff ? 'New Password (Leave blank to keep existing)' : 'Password *'}
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required={!editingStaff}
                                        value={staffForm.password}
                                        onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                                        placeholder="••••••••••••"
                                        style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>

                                {/* Structured Roles Selection Cards */}
                                <div className="form-group">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <label style={{ margin: 0, fontWeight: 700, fontSize: '0.84rem' }}>Assign Roles *</label>
                                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-primary)', backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '3px 10px', borderRadius: '20px' }}>
                                            {staffForm.role_ids.length} selected
                                        </span>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                                        {roles.map(r => {
                                            const isSelected = staffForm.role_ids.includes(r.id);
                                            return (
                                                <div
                                                    key={r.id}
                                                    onClick={() => {
                                                        const current = [...staffForm.role_ids];
                                                        if (isSelected) {
                                                            const idx = current.indexOf(r.id);
                                                            if (idx !== -1) current.splice(idx, 1);
                                                        } else {
                                                            current.push(r.id);
                                                        }
                                                        setStaffForm({ ...staffForm, role_ids: current });
                                                    }}
                                                    style={{
                                                        padding: '12px 14px',
                                                        borderRadius: '10px',
                                                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.06)' : 'var(--admin-bg)',
                                                        border: isSelected ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s ease',
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '10px'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {}} // Controlled by div click
                                                        style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--admin-primary)', cursor: 'pointer' }}
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? 'var(--admin-primary)' : 'var(--admin-text)' }}>
                                                            {r.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginTop: '2px', lineHeight: 1.35 }}>
                                                            {r.description || 'System access role.'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Clean Right-Aligned Modal Action Footer with Generous Bottom Spacing */}
                            <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', borderTop: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-hover)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsStaffModalOpen(false)}
                                    style={{ height: '36px', padding: '0 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 10px rgba(99, 102, 241, 0.3)' }}
                                >
                                    <Check size={14} />
                                    <span>{saving ? 'Saving...' : 'Save Staff'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* RESET ACCESS MODAL */}
            {isResetModalOpen && resetTargetStaff && (
                <div className="modal-overlay" onClick={() => setIsResetModalOpen(false)}>
                    <div className="modal-card" style={{ width: '480px', maxWidth: '90vw', maxHeight: '86vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 20px 45px -10px rgba(0,0,0,0.3)', backgroundColor: 'var(--admin-card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--admin-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Key size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                                        Reset Access: {resetTargetStaff.name}
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                        Purge API tokens and assign a new password
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsResetModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', padding: '4px', borderRadius: '6px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleResetAccessSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                            <div className="modal-body" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    backgroundColor: 'var(--admin-danger-light)',
                                    border: '1px solid var(--admin-danger)',
                                    color: 'var(--admin-danger)',
                                    fontSize: '0.8rem',
                                    lineHeight: 1.45
                                }}>
                                    <strong>Security Notice:</strong> Submitting this reset will immediately revoke all active session tokens for <strong>{resetTargetStaff.email}</strong>, requiring them to re-log in with the new password.
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>New Staff Password *</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        required
                                        value={resetPassword}
                                        onChange={e => setResetPassword(e.target.value)}
                                        placeholder="NewSecretPassword123!"
                                        style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', borderTop: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-hover)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsResetModalOpen(false)}
                                    style={{ height: '36px', padding: '0 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-danger"
                                    disabled={saving}
                                    style={{ height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 10px rgba(239, 68, 68, 0.3)' }}
                                >
                                    <Key size={14} />
                                    <span>{saving ? 'Resetting...' : 'Reset Access'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE / EDIT ROLE MODAL */}
            {isRoleModalOpen && (
                <div className="modal-overlay" onClick={() => setIsRoleModalOpen(false)}>
                    <div className="modal-card" style={{ width: '780px', maxWidth: '94vw', maxHeight: '86vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: '16px', boxShadow: '0 20px 45px -10px rgba(0,0,0,0.3)', backgroundColor: 'var(--admin-card-bg)' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={18} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                                        {editingRole ? `Edit Role: ${editingRole.name}` : 'Create Custom Role'}
                                    </h3>
                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                        Define role name, description, and module action permissions
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRoleModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', padding: '4px', borderRadius: '6px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                            <div className="modal-body" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>Role Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            required
                                            value={roleForm.name}
                                            onChange={e => setRoleForm({ ...roleForm, name: e.target.value })}
                                            placeholder="Order Operations Manager"
                                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 700, fontSize: '0.82rem' }}>Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={roleForm.description}
                                            onChange={e => setRoleForm({ ...roleForm, description: e.target.value })}
                                            placeholder="Manages order fulfillment, shipping, and returns."
                                            style={{ height: '38px', borderRadius: '8px', fontSize: '0.85rem' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <label style={{ margin: 0, fontWeight: 700, fontSize: '0.84rem' }}>Module Permissions Matrix</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                    const allIds = groupedPermissions.flatMap(g => (g.permissions || []).map(p => p.id));
                                                    setRoleForm({ ...roleForm, permission_ids: allIds });
                                                }}
                                                style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}
                                            >
                                                Select All
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => setRoleForm({ ...roleForm, permission_ids: [] })}
                                                style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {groupedPermissions.map(group => {
                                            const groupPermIds = (group.permissions || []).map(p => p.id);
                                            const allGroupSelected = groupPermIds.every(id => roleForm.permission_ids.includes(id));

                                            return (
                                                <div
                                                    key={group.module}
                                                    style={{
                                                        padding: '14px',
                                                        borderRadius: '12px',
                                                        backgroundColor: 'var(--admin-bg)',
                                                        border: '1px solid var(--admin-border)'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--admin-border)' }}>
                                                        <div style={{ fontSize: '0.84rem', fontWeight: 800, textTransform: 'capitalize', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Lock size={14} />
                                                            <span>Module: {group.module}</span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                let current = [...roleForm.permission_ids];
                                                                if (allGroupSelected) {
                                                                    current = current.filter(id => !groupPermIds.includes(id));
                                                                } else {
                                                                    groupPermIds.forEach(id => {
                                                                        if (!current.includes(id)) current.push(id);
                                                                    });
                                                                }
                                                                setRoleForm({ ...roleForm, permission_ids: current });
                                                            }}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-primary)', fontSize: '0.75rem', fontWeight: 700 }}
                                                        >
                                                            {allGroupSelected ? 'Deselect Module' : 'Select All Module'}
                                                        </button>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                                                        {group.permissions?.map(perm => {
                                                            const isChecked = roleForm.permission_ids.includes(perm.id);
                                                            return (
                                                                <label
                                                                    key={perm.id}
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        padding: '7px 12px',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'var(--admin-card-bg)',
                                                                        border: isChecked ? '1px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.8rem'
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={e => {
                                                                            const current = [...roleForm.permission_ids];
                                                                            if (e.target.checked) current.push(perm.id);
                                                                            else {
                                                                                const idx = current.indexOf(perm.id);
                                                                                if (idx !== -1) current.splice(idx, 1);
                                                                            }
                                                                            setRoleForm({ ...roleForm, permission_ids: current });
                                                                        }}
                                                                        style={{ width: '15px', height: '15px', accentColor: 'var(--admin-primary)' }}
                                                                    />
                                                                    <span style={{ fontFamily: 'monospace', fontWeight: isChecked ? 700 : 500 }}>{perm.name}</span>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ padding: '16px 24px 20px 24px', borderTop: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-hover)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsRoleModalOpen(false)}
                                    style={{ height: '36px', padding: '0 16px', borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                    style={{ height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 3px 10px rgba(99, 102, 241, 0.3)' }}
                                >
                                    <Check size={14} />
                                    <span>{saving ? 'Saving...' : 'Save Role'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
