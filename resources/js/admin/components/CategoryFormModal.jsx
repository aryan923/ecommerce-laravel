import React, { useState, useEffect } from 'react';
import { Tag, X, Check, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import axios from 'axios';
import MediaLibraryModal from './MediaLibraryModal';

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

    // Media Library Modal Picker State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [mediaTargetField, setMediaTargetField] = useState('image_url'); // 'image_url' | 'banner_url'

    const handleOpenMediaPicker = (fieldName) => {
        setMediaTargetField(fieldName);
        setIsMediaModalOpen(true);
    };

    const handleSelectMediaAsset = (selectedAsset) => {
        if (selectedAsset) {
            const url = typeof selectedAsset === 'object' ? (selectedAsset.url || (selectedAsset.file_path ? `/storage/${selectedAsset.file_path}` : '')) : selectedAsset;
            const mediaObj = typeof selectedAsset === 'object' ? selectedAsset : null;

            setFormData((prev) => ({
                ...prev,
                [mediaTargetField]: url,
                [mediaTargetField === 'image_url' ? 'image_media' : 'banner_media']: mediaObj,
            }));
        }
        setIsMediaModalOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (mode === 'edit' && initialData) {
                const thumbImgObj = initialData.category_images?.find((ci) => ci.type === 'thumbnail')?.media || initialData.media?.find((m) => m.pivot?.type === 'thumbnail') || null;
                const bannerImgObj = initialData.category_images?.find((ci) => ci.type === 'banner')?.media || initialData.media?.find((m) => m.pivot?.type === 'banner') || null;

                const thumbImg = thumbImgObj?.url || initialData.image_url || initialData.image || '';
                const bannerImg = bannerImgObj?.url || initialData.banner_url || initialData.banner || '';

                setFormData({
                    name: initialData.name || '',
                    slug: initialData.slug || '',
                    parent_id: initialData.parent_id || '',
                    sort_order: initialData.sort_order || 0,
                    status: initialData.status || 'active',
                    image_url: thumbImg,
                    banner_url: bannerImg,
                    seo_title: initialData.seo_title || '',
                    seo_description: initialData.seo_description || '',
                    image_media: thumbImgObj,
                    banner_media: bannerImgObj,
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
                    image_media: null,
                    banner_media: null,
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
            image: formData.image_url || null,
            banner: formData.banner_url || null,
            image_url: formData.image_url || null,
            banner_url: formData.banner_url || null,
            seo_title: formData.seo_title || null,
            seo_description: formData.seo_description || null,
        };

        if (formData.slug) payload.slug = formData.slug;

        try {
            let res;
            if (mode === 'edit' && initialData?.id) {
                res = await axios.put(`/api/v1/admin/categories/${initialData.id}`, payload);
            } else {
                res = await axios.post('/api/v1/admin/categories', payload);
            }

            const savedCategory = res.data?.data;
            const catId = savedCategory?.id || initialData?.id;

            if (catId) {
                if (formData.image_media?.id) {
                    try {
                        await axios.post('/api/v1/admin/media/attach', {
                            media_id: formData.image_media.id,
                            model_type: 'category',
                            model_id: catId,
                            type: 'thumbnail',
                        });
                    } catch (mErr) {
                        console.error('Failed to attach category image:', mErr);
                    }
                }

                if (formData.banner_media?.id) {
                    try {
                        await axios.post('/api/v1/admin/media/attach', {
                            media_id: formData.banner_media.id,
                            model_type: 'category',
                            model_id: catId,
                            type: 'banner',
                        });
                    } catch (bErr) {
                        console.error('Failed to attach category banner:', bErr);
                    }
                }
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
            <div
                className="modal-card"
                style={{
                    maxWidth: '680px',
                    width: '95%',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    padding: 0,
                    borderRadius: '16px',
                    boxShadow: '0 24px 64px -12px rgba(0,0,0,0.3)',
                }}
            >
                {/* Header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--admin-card-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Tag size={22} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title" style={{ margin: 0 }}>{mode === 'edit' ? 'Edit Category' : 'Create New Category'}</h3>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    {error && (
                        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form id="category-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
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

                            {/* Category Image Thumbnail Picker */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Category Image Thumbnail
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {formData.image_url ? (
                                            <img src={formData.image_url} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={24} style={{ color: 'var(--admin-subtle)' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleOpenMediaPicker('image_url')}
                                            >
                                                <ImageIcon size={14} />
                                                <span>{formData.image_url ? 'Change Image' : 'Select from Media Library'}</span>
                                            </button>
                                            {formData.image_url && (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ color: 'var(--admin-danger)' }}
                                                    onClick={() => setFormData((prev) => ({ ...prev, image_url: '', image_media: null }))}
                                                    title="Remove Thumbnail"
                                                >
                                                    <Trash2 size={14} />
                                                    <span>Remove</span>
                                                </button>
                                            )}
                                        </div>
                                        {formData.image_url && (
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', wordBreak: 'break-all' }}>
                                                Selected: {formData.image_url.split('/').pop()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Category Banner Image Picker */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Category Banner Image
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ width: '120px', height: '64px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {formData.banner_url ? (
                                            <img src={formData.banner_url} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={24} style={{ color: 'var(--admin-subtle)' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleOpenMediaPicker('banner_url')}
                                            >
                                                <ImageIcon size={14} />
                                                <span>{formData.banner_url ? 'Change Banner' : 'Select from Media Library'}</span>
                                            </button>
                                            {formData.banner_url && (
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ color: 'var(--admin-danger)' }}
                                                    onClick={() => setFormData((prev) => ({ ...prev, banner_url: '', banner_media: null }))}
                                                    title="Remove Banner"
                                                >
                                                    <Trash2 size={14} />
                                                    <span>Remove</span>
                                                </button>
                                            )}
                                        </div>
                                        {formData.banner_url && (
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', wordBreak: 'break-all' }}>
                                                Selected: {formData.banner_url.split('/').pop()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="submit" form="category-form" className="btn btn-primary" disabled={submitting}>
                        <Check size={16} />
                        <span>{submitting ? 'Saving...' : mode === 'edit' ? 'Update Category' : 'Create Category'}</span>
                    </button>
                </div>

                {/* Centralized Media Library Picker Modal */}
                <MediaLibraryModal
                    isOpen={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={handleSelectMediaAsset}
                    isMultiSelect={false}
                    targetType="category"
                    title={mediaTargetField === 'image_url' ? 'Select Category Thumbnail' : 'Select Category Banner'}
                />
            </div>
        </div>
    );
}
