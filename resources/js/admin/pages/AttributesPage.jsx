import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sliders, Plus, X, Check, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AttributesPage() {
    const [attributes, setAttributes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
    const [attrName, setAttrName] = useState('');

    const [isValueModalOpen, setIsValueModalOpen] = useState(false);
    const [selectedAttr, setSelectedAttr] = useState(null);
    const [valueName, setValueName] = useState('');

    const [notification, setNotification] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchAttributes = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/v1/admin/attributes?include_values=1');
            if (res.data?.success) {
                setAttributes(res.data.data?.data || res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch attributes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
    }, []);

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCreateAttribute = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.post('/api/v1/admin/attributes', { name: attrName });
            if (res.data?.success) {
                showNotify(`Attribute "${attrName}" created successfully!`);
                setAttrName('');
                setIsAttrModalOpen(false);
                fetchAttributes();
            }
        } catch (err) {
            showNotify(err.response?.data?.message || 'Failed to create attribute.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateValue = async (e) => {
        e.preventDefault();
        if (!selectedAttr) return;
        setSubmitting(true);
        try {
            const res = await axios.post(`/api/v1/admin/attributes/${selectedAttr.id}/values`, {
                value: valueName
            });
            if (res.data?.success) {
                showNotify(`Value "${valueName}" added to ${selectedAttr.name}!`);
                setValueName('');
                setIsValueModalOpen(false);
                fetchAttributes();
            }
        } catch (err) {
            showNotify(err.response?.data?.message || 'Failed to add attribute value.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAttribute = async (attrId) => {
        if (!window.confirm('Are you sure you want to delete this attribute?')) return;
        try {
            await axios.delete(`/api/v1/admin/attributes/${attrId}`);
            showNotify('Attribute deleted successfully.');
            fetchAttributes();
        } catch (err) {
            showNotify('Failed to delete attribute.', 'error');
        }
    };

    return (
        <div>
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 100,
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

            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Attribute & Variant Management</h2>
                    <p className="page-header-subtitle">Configure product variant attributes (Size, Color, Material) and value options</p>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={() => setIsAttrModalOpen(true)}>
                        <Plus size={16} />
                        <span>Create Attribute</span>
                    </button>
                </div>
            </div>

            {/* Attributes Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div className="dashboard-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px' }}>
                        Loading attributes...
                    </div>
                ) : attributes.length > 0 ? (
                    attributes.map((attr) => (
                        <div key={attr.id} className="dashboard-card">
                            <div className="card-header-flex" style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sliders size={18} style={{ color: 'var(--admin-primary)' }} />
                                    <h3 className="card-title">{attr.name}</h3>
                                </div>
                                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--admin-danger)', padding: '4px 8px' }} onClick={() => handleDeleteAttribute(attr.id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginBottom: '8px' }}>Attribute Options / Values:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {attr.values?.length ? (
                                        attr.values.map((v) => (
                                            <span key={v.id} className="badge badge-shipped" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                                                {v.value}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>No values added yet.</span>
                                    )}
                                </div>
                            </div>

                            <button
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => {
                                    setSelectedAttr(attr);
                                    setIsValueModalOpen(true);
                                }}
                            >
                                <Plus size={14} />
                                <span>Add Value Option</span>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="dashboard-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px' }}>
                        No attributes configured yet. Click "Create Attribute" to get started!
                    </div>
                )}
            </div>

            {/* Create Attribute Modal */}
            {isAttrModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '440px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 className="card-title">Create Attribute</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setIsAttrModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAttribute}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Attribute Name *
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Color, Size, Material"
                                    value={attrName}
                                    onChange={(e) => setAttrName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsAttrModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    <Check size={16} />
                                    <span>{submitting ? 'Saving...' : 'Save Attribute'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Attribute Value Modal */}
            {isValueModalOpen && selectedAttr && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '440px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 className="card-title">Add Value option for {selectedAttr.name}</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setIsValueModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateValue}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Option Value *
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={selectedAttr.name === 'Size' ? 'e.g. XL' : selectedAttr.name === 'Color' ? 'e.g. Navy Blue' : 'e.g. Cotton'}
                                    value={valueName}
                                    onChange={(e) => setValueName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsValueModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    <Check size={16} />
                                    <span>{submitting ? 'Saving...' : 'Add Value Option'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
