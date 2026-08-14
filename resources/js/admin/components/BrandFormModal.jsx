import React, { useState, useEffect } from 'react';
import { Award, X, Check, AlertCircle, Image as ImageIcon, Trash2 } from 'lucide-react';
import axios from 'axios';
import MediaLibraryModal from './MediaLibraryModal';

export default function BrandFormModal({ isOpen, mode = 'create', initialData = null, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        logo_url: '',
        banner_url: '',
        status: 'active',
        seo_title: '',
        seo_description: '',
        logo_media: null,
        banner_media: null,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Media Library Modal Picker State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [mediaTargetField, setMediaTargetField] = useState('logo_url'); // 'logo_url' | 'banner_url'

    const handleOpenMediaPicker = (field) => {
        setMediaTargetField(field);
        setIsMediaModalOpen(true);
    };

    const handleSelectMediaAsset = (selectedAsset) => {
        if (selectedAsset) {
            const url = typeof selectedAsset === 'object' ? (selectedAsset.url || (selectedAsset.file_path ? `/storage/${selectedAsset.file_path}` : '')) : selectedAsset;
            const mediaObj = typeof selectedAsset === 'object' ? selectedAsset : null;
            setFormData((prev) => ({
                ...prev,
                [mediaTargetField]: url,
                [mediaTargetField === 'logo_url' ? 'logo_media' : 'banner_media']: mediaObj,
            }));
        }
        setIsMediaModalOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (mode === 'edit' && initialData) {
                const logoImgObj = initialData.brand_images?.find((bi) => bi.type === 'logo' || bi.type === 'main')?.media || initialData.media?.find((m) => m.pivot?.type === 'logo' || m.pivot?.type === 'main') || null;
                const bannerImgObj = initialData.brand_images?.find((bi) => bi.type === 'banner')?.media || initialData.media?.find((m) => m.pivot?.type === 'banner') || null;

                const logoImg = logoImgObj?.url || initialData.logo_url || initialData.logo || '';
                const bannerImg = bannerImgObj?.url || initialData.banner_url || initialData.banner || '';

                setFormData({
                    name: initialData.name || '',
                    slug: initialData.slug || '',
                    logo_url: logoImg,
                    banner_url: bannerImg,
                    status: initialData.status || 'active',
                    seo_title: initialData.seo_title || '',
                    seo_description: initialData.seo_description || '',
                    logo_media: logoImgObj,
                    banner_media: bannerImgObj,
                });
            } else {
                setFormData({
                    name: '',
                    slug: '',
                    logo_url: '',
                    banner_url: '',
                    status: 'active',
                    seo_title: '',
                    seo_description: '',
                    logo_media: null,
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
            status: formData.status,
            logo: formData.logo_url || null,
            logo_url: formData.logo_url || null,
            banner: formData.banner_url || null,
            banner_url: formData.banner_url || null,
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

            if (brandId) {
                if (formData.logo_media?.id) {
                    try {
                        await axios.post('/api/v1/admin/media/attach', {
                            media_id: formData.logo_media.id,
                            model_type: 'brand',
                            model_id: brandId,
                            type: 'logo',
                        });
                    } catch (mErr) {
                        console.error('Failed to attach brand logo media:', mErr);
                    }
                }

                if (formData.banner_media?.id) {
                    try {
                        await axios.post('/api/v1/admin/media/attach', {
                            media_id: formData.banner_media.id,
                            model_type: 'brand',
                            model_id: brandId,
                            type: 'banner',
                        });
                    } catch (bErr) {
                        console.error('Failed to attach brand banner media:', bErr);
                    }
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
                        <Award size={22} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title" style={{ margin: 0 }}>{mode === 'edit' ? 'Edit Brand' : 'Create New Brand'}</h3>
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

                    <form id="brand-form" onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Brand Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="e.g., Apple, Samsung, Sony"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    URL Slug
                                </label>
                                <input
                                    type="text"
                                    name="slug"
                                    className="form-control"
                                    placeholder="apple-inc"
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
                                    SEO Meta Title
                                </label>
                                <input
                                    type="text"
                                    name="seo_title"
                                    className="form-control"
                                    placeholder="Buy Official Apple Products Online"
                                    value={formData.seo_title}
                                    onChange={handleChange}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    SEO Meta Description
                                </label>
                                <textarea
                                    name="seo_description"
                                    className="form-control"
                                    rows={2}
                                    placeholder="Discover premium laptops, smartphones, and accessories..."
                                    value={formData.seo_description}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Brand Logo Picker */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Brand Logo
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
                                                onClick={() => handleOpenMediaPicker('logo_url')}
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

                            {/* Brand Banner Picker */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Brand Banner Image
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ width: '120px', height: '64px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {formData.banner_url ? (
                                            <img src={formData.banner_url} alt="Brand banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <button type="submit" form="brand-form" className="btn btn-primary" disabled={submitting}>
                        <Check size={16} />
                        <span>{submitting ? 'Saving...' : mode === 'edit' ? 'Update Brand' : 'Create Brand'}</span>
                    </button>
                </div>

                <MediaLibraryModal
                    isOpen={isMediaModalOpen}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={handleSelectMediaAsset}
                    isMultiSelect={false}
                    targetType="brand"
                    title={mediaTargetField === 'logo_url' ? 'Select Brand Logo' : 'Select Brand Banner'}
                />
            </div>
        </div>
    );
}
