import React, { useState, useEffect } from 'react';
import { Tag, X, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function CategoryFormModal({ isOpen, mode = 'create', initialData = null, categories = [], onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent_id: '',
        sort_order: 0,
        status: 'active',
        image_url: '',
        banner_url: '',
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
                    parent_id: initialData.parent_id || '',
                    sort_order: initialData.sort_order || 0,
                    status: initialData.status || 'active',
                    image_url: initialData.image_url || '',
                    banner_url: initialData.banner_url || '',
                    seo_title: initialData.seo_title || '',
                    seo_description: initialData.seo_description || '',
                });
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    parent_id: '',
                    sort_order: 0,
                    status: 'active',
                    image_url: '',
                    banner_url: '',
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
            parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
            sort_order: parseInt(formData.sort_order) || 0,
            status: formData.status,
            image_url: formData.image_url || null,
            banner_url: formData.banner_url || null,
            seo_title: formData.seo_title || null,
            seo_description: formData.seo_description || null,
        };

        if (formData.slug) payload.slug = formData.slug;

        try {
            if (mode === 'edit' && initialData?.id) {
                await axios.put(`/api/v1/admin/categories/${initialData.id}`, payload);
            } else {
                await axios.post('/api/v1/admin/categories', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Category save error:', err);
            setError(err.response?.data?.message || 'Failed to save category.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Tag size={22} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title">{mode === 'edit' ? 'Edit Category' : 'Create New Category'}</h3>
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
                                Category Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                placeholder="e.g. Consumer Electronics"
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
                                placeholder="consumer-electronics"
                                value={formData.slug}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Parent Category
                            </label>
                            <select name="parent_id" className="form-select" value={formData.parent_id} onChange={handleChange}>
                                <option value="">None (Top-Level Root Category)</option>
                                {categories.filter(c => c.id !== initialData?.id).map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Sort Order
                            </label>
                            <input
                                type="number"
                                name="sort_order"
                                className="form-control"
                                value={formData.sort_order}
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
                                Image Thumbnail URL
                            </label>
                            <input
                                type="text"
                                name="image_url"
                                className="form-control"
                                placeholder="https://cdn.example.com/category-thumb.jpg"
                                value={formData.image_url}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Banner Image URL
                            </label>
                            <input
                                type="text"
                                name="banner_url"
                                className="form-control"
                                placeholder="https://cdn.example.com/category-banner.jpg"
                                value={formData.banner_url}
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
                            <span>{submitting ? 'Saving...' : mode === 'edit' ? 'Update Category' : 'Create Category'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
