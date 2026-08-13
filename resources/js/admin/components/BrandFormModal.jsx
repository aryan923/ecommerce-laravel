import React, { useState, useEffect } from 'react';
import { Award, X, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function BrandFormModal({ isOpen, mode = 'create', initialData = null, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        logo_url: '',
        status: 'active',
        seo_title: '',
        seo_description: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (mode === 'edit' && initialData) {
                setFormData({
                    name: initialData.name || '',
                    slug: initialData.slug || '',
                    logo_url: initialData.logo_url || '',
                    status: initialData.status || 'active',
                    seo_title: initialData.seo_title || '',
                    seo_description: initialData.seo_description || '',
                });
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    logo_url: '',
                    status: 'active',
                    seo_title: '',
                    seo_description: '',
                });
            }
        }
    }, [isOpen, mode, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const payload = {
            name: formData.name,
            status: formData.status,
            logo_url: formData.logo_url || null,
            seo_title: formData.seo_title || null,
            seo_description: formData.seo_description || null,
        };

        if (formData.slug) payload.slug = formData.slug;

        try {
            if (mode === 'edit' && initialData?.id) {
                await axios.put(`/api/v1/admin/brands/${initialData.id}`, payload);
            } else {
                await axios.post('/api/v1/admin/brands', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Brand save error:', err);
            setError(err.response?.data?.message || 'Failed to save brand.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '540px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Award size={22} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title">{mode === 'edit' ? 'Edit Brand' : 'Create New Brand'}</h3>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="e.g. Sony, Apple, Nike"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Slug (Auto-generated if empty)
                            </label>
                            <input
                                type="text"
                                name="slug"
                                className="form-control"
                                placeholder="sony"
                                value={formData.slug}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Status *
                            </label>
                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                <option value="active">Active (Visible)</option>
                                <option value="inactive">Inactive (Hidden)</option>
                            </select>
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Brand Logo Image URL
                            </label>
                            <input
                                type="text"
                                name="logo_url"
                                className="form-control"
                                placeholder="https://cdn.example.com/brand-logo.png"
                                value={formData.logo_url}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            <Check size={16} />
                            <span>{submitting ? 'Saving...' : mode === 'edit' ? 'Update Brand' : 'Create Brand'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
