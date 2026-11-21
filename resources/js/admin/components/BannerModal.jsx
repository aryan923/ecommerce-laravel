import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Image, Link, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BannerModal({ isOpen, onClose, mode = 'create', banner = null, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        image_desktop: '',
        image_mobile: '',
        link_url: '',
        button_text: '',
        placement: 'home_hero',
        sort_order: 0,
        is_active: true,
        starts_at: '',
        ends_at: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (banner && mode === 'edit') {
            setFormData({
                title: banner.title || '',
                image_desktop: banner.image_desktop || '',
                image_mobile: banner.image_mobile || '',
                link_url: banner.link_url || '',
                button_text: banner.button_text || '',
                placement: banner.placement || 'home_hero',
                sort_order: banner.sort_order ?? 0,
                is_active: banner.is_active ?? true,
                starts_at: banner.starts_at ? banner.starts_at.replace('T', ' ').substring(0, 19) : '',
                ends_at: banner.ends_at ? banner.ends_at.replace('T', ' ').substring(0, 19) : ''
            });
        } else {
            setFormData({
                title: '',
                image_desktop: '',
                image_mobile: '',
                link_url: '',
                button_text: '',
                placement: 'home_hero',
                sort_order: 0,
                is_active: true,
                starts_at: '',
                ends_at: ''
            });
        }
        setError(null);
    }, [banner, mode, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...formData,
                sort_order: parseInt(formData.sort_order, 10) || 0,
                starts_at: formData.starts_at || null,
                ends_at: formData.ends_at || null
            };

            if (mode === 'edit' && banner) {
                await axios.put(`/api/v1/admin/banners/${banner.id}`, payload);
            } else {
                await axios.post('/api/v1/admin/banners', payload);
            }

            onSuccess(mode === 'edit' ? 'Banner updated successfully.' : 'Banner created successfully.');
            onClose();
        } catch (err) {
            console.error('Banner form error:', err);
            const msg = err.response?.data?.message || err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : 'Failed to save banner.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'var(--admin-card-bg)',
                color: 'var(--admin-text)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '640px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--admin-border)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                        {mode === 'edit' ? 'Edit Promotional Banner' : 'Create Promotional Banner'}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--admin-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--admin-danger)',
                            color: 'var(--admin-danger)',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.88rem'
                        }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                Banner Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Summer Super Sale 2026"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--admin-border)',
                                    backgroundColor: 'var(--admin-bg)',
                                    color: 'var(--admin-text)'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    Placement Location *
                                </label>
                                <select
                                    value={formData.placement}
                                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border)',
                                        backgroundColor: 'var(--admin-bg)',
                                        color: 'var(--admin-text)'
                                    }}
                                >
                                    <option value="home_hero">Homepage Hero Carousel</option>
                                    <option value="category_banner">Category Header Banner</option>
                                    <option value="sidebar">Sidebar Promo</option>
                                    <option value="footer">Footer Promo Bar</option>
                                    <option value="popup">Promotional Popup</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    Sort Order
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.sort_order}
                                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border)',
                                        backgroundColor: 'var(--admin-bg)',
                                        color: 'var(--admin-text)'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                Desktop Image URL *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.image_desktop}
                                onChange={(e) => setFormData({ ...formData, image_desktop: e.target.value })}
                                placeholder="/storage/banners/desktop-hero.jpg or https://..."
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--admin-border)',
                                    backgroundColor: 'var(--admin-bg)',
                                    color: 'var(--admin-text)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                Mobile Image URL (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.image_mobile}
                                onChange={(e) => setFormData({ ...formData, image_mobile: e.target.value })}
                                placeholder="/storage/banners/mobile-hero.jpg or https://..."
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--admin-border)',
                                    backgroundColor: 'var(--admin-bg)',
                                    color: 'var(--admin-text)'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    CTA Link URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.link_url}
                                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                    placeholder="/category/summer-sale"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border)',
                                        backgroundColor: 'var(--admin-bg)',
                                        color: 'var(--admin-text)'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    Button Caption
                                </label>
                                <input
                                    type="text"
                                    value={formData.button_text}
                                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                    placeholder="Shop Now"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border)',
                                        backgroundColor: 'var(--admin-bg)',
                                        color: 'var(--admin-text)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    Start Schedule (YYYY-MM-DD HH:MM:SS)
                                </label>
                                <input
                                    type="text"
                                    value={formData.starts_at}
                                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                    placeholder="2026-09-01 00:00:00"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border)',
                                        backgroundColor: 'var(--admin-bg)',
                                        color: 'var(--admin-text)'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    End Schedule (YYYY-MM-DD HH:MM:SS)
                                </label>
                                <input
                                    type="text"
                                    value={formData.ends_at}
                                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                                    placeholder="2026-10-01 23:59:59"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--admin-border)',
                                        backgroundColor: 'var(--admin-bg)',
                                        color: 'var(--admin-text)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="is_active" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                                Enable Active Status (Publish on Storefront)
                            </label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--admin-border)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px'
                    }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '6px',
                                border: '1px solid var(--admin-border)',
                                backgroundColor: 'transparent',
                                color: 'var(--admin-text)',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'var(--admin-primary)',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Saving...' : (mode === 'edit' ? 'Update Banner' : 'Create Banner')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
