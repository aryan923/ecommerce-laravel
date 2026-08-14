import React, { useState, useEffect } from 'react';
import { X, Building2, Plus, Edit2, Check, Trash2, Shield, AlertTriangle } from 'lucide-react';
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
        <div className="modal-backdrop" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div className="modal-container" style={{
                backgroundColor: 'var(--admin-card-bg)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '780px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--admin-border)',
                overflow: 'hidden',
                animation: 'modalSlideIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--admin-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)' }}>Warehouse Locations Management</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>Configure fulfillment hubs, physical warehouses, and storefront locations</span>
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

                {/* Body Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--admin-danger)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px'
                        }}>
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isFormOpen ? (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                                    Active Warehouses ({warehouses.length})
                                </span>
                                <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
                                    <Plus size={16} />
                                    <span>Add New Warehouse</span>
                                </button>
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                    Loading warehouse locations...
                                </div>
                            ) : warehouses.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                                    {warehouses.map((wh) => (
                                        <div key={wh.id} style={{
                                            padding: '16px',
                                            borderRadius: '10px',
                                            backgroundColor: 'var(--admin-bg)',
                                            border: `1.5px solid ${wh.is_default ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            gap: '12px'
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--admin-text)' }}>
                                                        {wh.name}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        {wh.is_default && (
                                                            <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>Default Primary</span>
                                                        )}
                                                        <span className={`badge ${wh.is_active ? 'badge-completed' : 'badge-cancelled'}`} style={{ fontSize: '0.7rem' }}>
                                                            {wh.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginBottom: '4px' }}>
                                                    Code: <strong>{wh.code}</strong> | SKUs Stored: <strong>{wh.inventories_count ?? 0}</strong>
                                                </div>

                                                {wh.city && (
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                        Location: {wh.city}, {wh.state || wh.country}
                                                    </div>
                                                )}
                                                {wh.contact_phone && (
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                        Contact: {wh.contact_name ? `${wh.contact_name} (${wh.contact_phone})` : wh.contact_phone}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--admin-border)' }}>
                                                <div>
                                                    {!wh.is_default && (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleSetDefault(wh.id)}
                                                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                                                        >
                                                            Set as Default
                                                        </button>
                                                    )}
                                                </div>

                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(wh)} style={{ padding: '4px 8px' }}>
                                                        <Edit2 size={14} />
                                                        <span>Edit</span>
                                                    </button>
                                                    {!wh.is_default && (
                                                        <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(wh)} style={{ padding: '4px 8px', color: 'var(--admin-danger)' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                    No warehouse locations found. Click "Add New Warehouse" to create one.
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, color: 'var(--admin-text)' }}>
                                    {editingWarehouse ? `Edit Warehouse: ${editingWarehouse.name}` : 'Create New Warehouse'}
                                </h4>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsFormOpen(false)}>
                                    Back to List
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                        Warehouse Name <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Regional Fulfillment Center"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                        Warehouse Code <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. WH-EAST-01"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                    Street Address
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Plot # / Building / Street details..."
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>City</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>State</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>Postal Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>Contact Person</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.contact_name}
                                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>Contact Phone</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    <span>Active Status</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    />
                                    <span>Set as Default Primary Warehouse</span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)} disabled={submitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving Warehouse...' : (editingWarehouse ? 'Update Warehouse' : 'Create Warehouse')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
