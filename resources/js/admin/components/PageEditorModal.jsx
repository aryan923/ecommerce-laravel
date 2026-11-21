import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Globe, Eye, AlertCircle, Sparkles, Code, FileText } from 'lucide-react';

export default function PageEditorModal({ isOpen, onClose, mode = 'create', page = null, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        seo_title: '',
        seo_description: '',
        status: 'draft'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAutoSlug, setIsAutoSlug] = useState(true);
    const [showHtmlCode, setShowHtmlCode] = useState(false);

    useEffect(() => {
        if (page && mode === 'edit') {
            setFormData({
                title: page.title || '',
                slug: page.slug || '',
                content: page.content || '',
                seo_title: page.seo_title || '',
                seo_description: page.seo_description || '',
                status: page.status || 'draft'
            });
            setIsAutoSlug(false);
        } else {
            setFormData({
                title: '',
                slug: '',
                content: '',
                seo_title: '',
                seo_description: '',
                status: 'draft'
            });
            setIsAutoSlug(true);
        }
        setError(null);
    }, [page, mode, isOpen]);

    if (!isOpen) return null;

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-');        // Replace multiple - with single -
    };

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({
            ...prev,
            title: val,
            slug: isAutoSlug ? slugify(val) : prev.slug
        }));
    };

    const handleSlugChange = (e) => {
        setIsAutoSlug(false);
        setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (mode === 'edit' && page) {
                await axios.put(`/api/v1/admin/pages/${page.id}`, formData);
            } else {
                await axios.post('/api/v1/admin/pages', formData);
            }

            onSuccess(mode === 'edit' ? 'CMS page updated successfully.' : 'CMS page created successfully.');
            onClose();
        } catch (err) {
            console.error('Page form error:', err);
            const msg = err.response?.data?.message || err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(', ')
                : 'Failed to save page.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const previewTitle = formData.seo_title || formData.title || 'Page Title';
    const previewSlug = formData.slug || 'page-slug';
    const previewDesc = formData.seo_description || 'Read the official page details, policies, and store information online.';

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
                maxWidth: '850px',
                maxHeight: '92vh',
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
                        {mode === 'edit' ? 'Edit CMS Page' : 'Create New CMS Page'}
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

                    <div style={{ display: 'grid', gap: '20px' }}>
                        {/* Title & Slug Bar */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                    Page Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={handleTitleChange}
                                    placeholder="e.g. Terms & Conditions"
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                        URL Slug *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAutoSlug(true);
                                            setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Auto-Generate
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{
                                        padding: '10px 12px',
                                        backgroundColor: 'var(--admin-border)',
                                        borderRadius: '6px 0 0 6px',
                                        fontSize: '0.8rem',
                                        color: 'var(--admin-muted)',
                                        border: '1px solid var(--admin-border)',
                                        borderRight: 'none'
                                    }}>
                                        /pages/
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={handleSlugChange}
                                        placeholder="terms-and-conditions"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            borderRadius: '0 6px 6px 0',
                                            border: '1px solid var(--admin-border)',
                                            backgroundColor: 'var(--admin-bg)',
                                            color: 'var(--admin-text)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                                Publishing Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--admin-border)',
                                    backgroundColor: 'var(--admin-bg)',
                                    color: 'var(--admin-text)'
                                }}
                            >
                                <option value="draft">Draft (Hidden from storefront)</option>
                                <option value="published">Published (Live on storefront)</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Content Area */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                    HTML Body Content *
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowHtmlCode(!showHtmlCode)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--admin-primary)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Code size={14} />
                                    <span>{showHtmlCode ? 'Switch to Standard Editor' : 'View HTML Source Code'}</span>
                                </button>
                            </div>
                            <textarea
                                required
                                rows={10}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="<h1>Title</h1><p>Enter HTML content here...</p>"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--admin-border)',
                                    backgroundColor: 'var(--admin-bg)',
                                    color: 'var(--admin-text)',
                                    fontFamily: showHtmlCode ? 'monospace' : 'inherit',
                                    fontSize: '0.88rem',
                                    lineHeight: 1.5
                                }}
                            />
                        </div>

                        {/* SEO Section */}
                        <div style={{
                            padding: '18px',
                            borderRadius: '8px',
                            border: '1px solid var(--admin-border)',
                            backgroundColor: 'rgba(255, 255, 255, 0.02)'
                        }}>
                            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Globe size={18} style={{ color: 'var(--admin-primary)' }} />
                                <span>SEO & Search Engine Settings</span>
                            </h4>

                            <div style={{ display: 'grid', gap: '14px' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <label style={{ fontWeight: 600 }}>SEO Meta Title</label>
                                        <span style={{ color: formData.seo_title.length > 60 ? 'var(--admin-danger)' : 'var(--admin-muted)' }}>
                                            {formData.seo_title.length}/60 chars
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        value={formData.seo_title}
                                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                        placeholder="Terms & Conditions | Our Store"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--admin-border)',
                                            backgroundColor: 'var(--admin-bg)',
                                            color: 'var(--admin-text)',
                                            fontSize: '0.85rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <label style={{ fontWeight: 600 }}>SEO Meta Description</label>
                                        <span style={{ color: formData.seo_description.length > 160 ? 'var(--admin-danger)' : 'var(--admin-muted)' }}>
                                            {formData.seo_description.length}/160 chars
                                        </span>
                                    </div>
                                    <textarea
                                        rows={3}
                                        maxLength={300}
                                        value={formData.seo_description}
                                        onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                        placeholder="Read our store terms and conditions..."
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid var(--admin-border)',
                                            backgroundColor: 'var(--admin-bg)',
                                            color: 'var(--admin-text)',
                                            fontSize: '0.85rem'
                                        }}
                                    />
                                </div>

                                {/* Google SERP Live Snippet Preview */}
                                <div style={{
                                    marginTop: '8px',
                                    padding: '14px',
                                    backgroundColor: '#ffffff',
                                    color: '#202124',
                                    borderRadius: '8px',
                                    border: '1px solid #dadce0',
                                    fontFamily: 'arial, sans-serif'
                                }}>
                                    <div style={{ fontSize: '11px', color: '#5f6368', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                                        Google Search Snippet Preview
                                    </div>
                                    <div style={{ color: '#1a0dab', fontSize: '18px', fontWeight: 400, lineHeight: 1.3, cursor: 'pointer' }}>
                                        {previewTitle}
                                    </div>
                                    <div style={{ color: '#202124', fontSize: '14px', lineHeight: 1.3 }}>
                                        https://yourstore.com › pages › {previewSlug}
                                    </div>
                                    <div style={{ color: '#4d5156', fontSize: '14px', lineHeight: 1.4, marginTop: '4px' }}>
                                        {previewDesc}
                                    </div>
                                </div>
                            </div>
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
                            {loading ? 'Saving...' : (mode === 'edit' ? 'Update Page' : 'Publish Page')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
