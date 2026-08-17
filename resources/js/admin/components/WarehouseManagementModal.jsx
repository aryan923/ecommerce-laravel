import React, { useState, useEffect } from 'react';
import {
    X,
    Building2,
    Plus,
    Edit2,
    Check,
    Trash2,
    Shield,
    AlertTriangle,
    MapPin,
    Phone,
    Mail,
    Boxes,
    Star,
    ArrowLeft
} from 'lucide-react';
import axios from 'axios';

export default function WarehouseManagementModal({
    isOpen,
    onClose,
    onSuccess,
}) {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        is_active: true,
        is_default: false,
    });

    const fetchWarehouses = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/admin/warehouses');
            if (res.data?.success) {
                setWarehouses(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch warehouses:', err);
            setError('Failed to fetch warehouse locations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchWarehouses();
            setIsFormOpen(false);
            setEditingWarehouse(null);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOpenCreate = () => {
        setEditingWarehouse(null);
        setFormData({
            name: '',
            code: '',
            address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            contact_name: '',
            contact_phone: '',
            contact_email: '',
            is_active: true,
            is_default: false,
        });
        setError('');
        setIsFormOpen(true);
    };

    const handleOpenEdit = (wh) => {
        setEditingWarehouse(wh);
        setFormData({
            name: wh.name || '',
            code: wh.code || '',
            address: wh.address || '',
            city: wh.city || '',
            state: wh.state || '',
            postal_code: wh.postal_code || '',
            country: wh.country || 'India',
            contact_name: wh.contact_name || '',
            contact_phone: wh.contact_phone || '',
            contact_email: wh.contact_email || '',
            is_active: wh.is_active ?? true,
            is_default: wh.is_default ?? false,
        });
        setError('');
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (editingWarehouse) {
                const res = await axios.put(`/api/v1/admin/warehouses/${editingWarehouse.id}`, formData);
                if (res.data?.success) {
                    setIsFormOpen(false);
                    fetchWarehouses();
                    if (onSuccess) onSuccess('Warehouse updated successfully.');
                }
            } else {
                const res = await axios.post('/api/v1/admin/warehouses', formData);
                if (res.data?.success) {
                    setIsFormOpen(false);
                    fetchWarehouses();
                    if (onSuccess) onSuccess('Warehouse created successfully.');
                }
            }
        } catch (err) {
            console.error('Warehouse save error:', err);
            setError(err.response?.data?.message || 'Failed to save warehouse location.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (whId) => {
        try {
            const res = await axios.post(`/api/v1/admin/warehouses/${whId}/default`);
            if (res.data?.success) {
                fetchWarehouses();
                if (onSuccess) onSuccess('Default warehouse updated.');
            }
        } catch (err) {
            console.error('Set default error:', err);
            setError('Failed to update default warehouse.');
        }
    };

    const handleDelete = async (wh) => {
        if (wh.is_default) {
            setError('Cannot delete default warehouse location.');
            return;
        }
        if (!window.confirm(`Are you sure you want to delete warehouse "${wh.name}"?`)) return;

        try {
            const res = await axios.delete(`/api/v1/admin/warehouses/${wh.id}`);
            if (res.data?.success) {
                fetchWarehouses();
                if (onSuccess) onSuccess('Warehouse deleted successfully.');
            }
        } catch (err) {
            console.error('Delete warehouse error:', err);
            setError(err.response?.data?.message || 'Failed to delete warehouse.');
        }
    };

    return (
        <div className="modal-overlay">
            <div
                className="modal-card"
                style={{
                    maxWidth: '840px',
                    width: '96%',
                    maxHeight: '90vh',
                }}
            >
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                color: 'var(--admin-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Building2 size={20} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                    Warehouse Locations & Fulfillment Hubs
                                </h3>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                    color: 'var(--admin-primary)',
                                    border: '1px solid rgba(99, 102, 241, 0.25)'
                                }}>
                                    {warehouses.length} Active Hubs
                                </span>
                            </div>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--admin-muted)' }}>
                                Configure multi-location inventory hubs, storefront stock points, and shipping origin addresses
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ borderRadius: '8px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="modal-body">
                    {error && (
                        <div
                            style={{
                                padding: '10px 14px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                marginBottom: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 600
                            }}
                        >
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isFormOpen ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                                    Registered Warehouse Locations ({warehouses.length})
                                </span>
                                <button className="btn btn-primary btn-sm" onClick={handleOpenCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                                    <Plus size={14} />
                                    <span>Add New Hub</span>
                                </button>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                    Loading warehouse locations...
                                </div>
                            ) : warehouses.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '10px' }}>
                                    {warehouses.map((wh) => (
                                        <div
                                            key={wh.id}
                                            style={{
                                                padding: '14px 16px',
                                                borderRadius: '12px',
                                                backgroundColor: 'var(--admin-card-bg)',
                                                border: `1.5px solid ${wh.is_default ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                                boxShadow: 'var(--shadow-sm)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                gap: '10px'
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--admin-text)' }}>
                                                            {wh.name}
                                                        </span>
                                                        <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--admin-card-hover)', border: '1px solid var(--admin-border)', color: 'var(--admin-muted)' }}>
                                                            {wh.code}
                                                        </span>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {wh.is_default && (
                                                            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--admin-primary)', border: '1px solid rgba(99, 102, 241, 0.25)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                <Star size={10} fill="currentColor" />
                                                                <span>Default Hub</span>
                                                            </span>
                                                        )}
                                                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: wh.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: wh.is_active ? '#10b981' : '#ef4444', border: `1px solid ${wh.is_active ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}` }}>
                                                            {wh.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Boxes size={12} />
                                                    <span>Unique SKUs Stocked: <strong style={{ color: 'var(--admin-text)' }}>{wh.inventories_count ?? 0}</strong></span>
                                                </div>

                                                {wh.city && (
                                                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                                                        <MapPin size={12} />
                                                        <span>{wh.address ? `${wh.address}, ` : ''}{wh.city}, {wh.state || wh.country} {wh.postal_code || ''}</span>
                                                    </div>
                                                )}

                                                {wh.contact_phone && (
                                                    <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Phone size={12} />
                                                        <span>{wh.contact_name ? `${wh.contact_name} • ` : ''}{wh.contact_phone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--admin-border)' }}>
                                                <div>
                                                    {!wh.is_default && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleSetDefault(wh.id)}
                                                            style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <Star size={11} />
                                                            <span>Set Default</span>
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(wh)} style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Edit2 size={12} />
                                                        <span>Edit</span>
                                                    </button>
                                                    {!wh.is_default && (
                                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDelete(wh)} style={{ padding: '3px 8px', color: '#ef4444' }} title="Delete Warehouse">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                    No warehouse locations configured yet. Click "Add New Hub" to create one.
                                </div>
                            )}
                        </div>
                    ) : (
                        <form id="warehouseForm" onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                    {editingWarehouse ? `Edit Hub: ${editingWarehouse.name}` : 'Register New Fulfillment Warehouse'}
                                </h4>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsFormOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <ArrowLeft size={13} />
                                    <span>Back to List</span>
                                </button>
                            </div>

                            <div className="form-section-box">
                                <div className="form-section-header">
                                    <h4 className="form-section-title">
                                        <Building2 size={15} style={{ color: 'var(--admin-primary)' }} />
                                        <span>Hub Name & Unique Identifier</span>
                                    </h4>
                                </div>

                                <div className="form-section-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Warehouse Name *
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Central Warehouse Mumbai"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                style={{ fontWeight: 700 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Warehouse Code *
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. WH-BOM-01"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                required
                                                style={{ fontFamily: 'monospace', fontWeight: 700 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section-box">
                                <div className="form-section-header">
                                    <h4 className="form-section-title">
                                        <MapPin size={15} style={{ color: '#0ea5e9' }} />
                                        <span>Physical Address & Origin Coordinates</span>
                                    </h4>
                                </div>

                                <div className="form-section-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Street Address
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Plot # / Building / Industrial Area..."
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>City</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Mumbai"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>State</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Maharashtra"
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>PIN / Postal Code</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="400001"
                                                value={formData.postal_code}
                                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section-box">
                                <div className="form-section-header">
                                    <h4 className="form-section-title">
                                        <Phone size={15} style={{ color: '#10b981' }} />
                                        <span>Dispatch Contact & Status</span>
                                    </h4>
                                </div>

                                <div className="form-section-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>Contact Manager</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Rajesh Kumar"
                                                value={formData.contact_name}
                                                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>Contact Phone</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="+91 98765 43210"
                                                value={formData.contact_phone}
                                                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '4px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                />
                                                <span style={{ fontWeight: 600 }}>Active Warehouse Status</span>
                                            </label>

                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_default}
                                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                                />
                                                <span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>Set as Primary Default Hub</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                        {isFormOpen ? 'Cancel' : 'Close'}
                    </button>
                    {isFormOpen && (
                        <button
                            type="submit"
                            form="warehouseForm"
                            className="btn btn-primary btn-sm"
                            disabled={submitting}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '7px 18px' }}
                        >
                            <Check size={15} />
                            <span>{submitting ? 'Saving Warehouse...' : (editingWarehouse ? 'Update Hub' : 'Create Hub')}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
