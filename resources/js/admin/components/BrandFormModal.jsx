import React, { useState, useEffect } from 'react';
import { Award, X, Check, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import axios from 'axios';
import MediaLibraryModal from './MediaLibraryModal';

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

    // Media Library Modal Picker State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

    const handleSelectMediaAsset = (selectedAsset) => {
        if (selectedAsset) {
            const url = typeof selectedAsset === 'object' ? (selectedAsset.url || (selectedAsset.file_path ? `/storage/${selectedAsset.file_path}` : '')) : selectedAsset;
            const mediaObj = typeof selectedAsset === 'object' ? selectedAsset : null;
            setFormData((prev) => ({
                ...prev,
                logo_url: url,
                logo_media: mediaObj
            }));
        }
        setIsMediaModalOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (mode === 'edit' && initialData) {
                setFormData({
                    name: initialData.name || '',
                    slug: initialData.slug || '',
                    logo_url: initialData.logo || initialData.logo_url || '',
                    status: initialData.status || 'active',
                    seo_title: initialData.seo_title || '',
                    seo_description: initialData.seo_description || '',
                    logo_media: null,
                });
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    logo_url: '',
                    status: 'active',
                    seo_title: '',
                    seo_description: '',
                    logo_media: null,
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
            logo: formData.logo_url || null,
            logo_url: formData.logo_url || null,
            seo_title: formData.seo_title || null,
            seo_description: formData.seo_description || null,
        };

        if (formData.slug) payload.slug = formData.slug;

        try {
            let res;
            if (mode === 'edit' && initialData?.id) {
                res = await axios.put(`/api/v1/admin/brands/${initialData.id}`, payload);
            } else {
                res = await axios.post('/api/v1/admin/brands', payload);
            }

            const savedBrand = res.data?.data;
            const brandId = savedBrand?.id || initialData?.id;

            if (brandId && formData.logo_media?.id) {
                try {
                    await axios.post('/api/v1/admin/media/attach', {
                        media_id: formData.logo_media.id,
                        model_type: 'brand',
                        model_id: brandId,
                        type: 'main',
                    });
                } catch (mErr) {
                    console.error('Failed to attach brand logo media:', mErr);
                }
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
            <div className="modal-card" style={{ maxWidth: '600px' }}>
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
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

                        {/* Brand Logo Picker */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Brand Logo Image
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {formData.logo_url ? (
                                        <img src={formData.logo_url} alt="Brand logo preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                                    ) : (
                                        <Award size={24} style={{ color: 'var(--admin-subtle)' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setIsMediaModalOpen(true)}
                                        >
                                            <ImageIcon size={14} />
                                            <span>{formData.logo_url ? 'Change Logo' : 'Select from Media Library'}</span>
                                        </button>
                                        {formData.logo_url && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                style={{ color: 'var(--admin-danger)' }}
                                                onClick={() => setFormData((prev) => ({ ...prev, logo_url: '', logo_media: null }))}
                                                title="Remove Logo"
                                            >
                                                <Trash2 size={14} />
                                                <span>Remove</span>
                                            </button>
                                        )}
                                    </div>
                                    {formData.logo_url && (
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', wordBreak: 'break-all' }}>
                                            Selected: {formData.logo_url.split('/').pop()}
                                        </span>
                                    )}
                                </div>
                            </div>
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

                {/* Centralized Media Library Picker Modal */}
                <MediaLibraryModal
                    isOpen={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={handleSelectMediaAsset}
                    isMultiSelect={false}
                    targetType="brand"
                    title="Select Brand Logo"
                />
            </div>
        </div>
    );
}
