import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Search, Plus, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw, Copy, Globe, Eye, EyeOff } from 'lucide-react';
import PageEditorModal from '../components/PageEditorModal';

export default function PagesPage() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedPage, setSelectedPage] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            params.append('per_page', 100);

            const res = await axios.get(`/api/v1/admin/pages?${params.toString()}`);
            if (res.data?.success) {
                setPages(res.data.data?.data || res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch pages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, [statusFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPages();
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setSelectedPage(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (page) => {
        setModalMode('edit');
        setSelectedPage(page);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (page) => {
        const nextStatus = page.status === 'published' ? 'draft' : 'published';
        try {
            await axios.patch(`/api/v1/admin/pages/${page.id}/status`, { status: nextStatus });
            showNotify(`Page status updated to ${nextStatus}.`);
            fetchPages();
        } catch (err) {
            showNotify('Failed to update page status.', 'error');
        }
    };

    const handleDelete = async (pageId) => {
        if (!window.confirm('Are you sure you want to delete this CMS page?')) return;
        try {
            await axios.delete(`/api/v1/admin/pages/${pageId}`);
            showNotify('Page deleted successfully.');
            fetchPages();
        } catch (err) {
            showNotify('Failed to delete page.', 'error');
        }
    };

    const copyPageLink = (slug) => {
        const url = `${window.location.origin}/pages/${slug}`;
        navigator.clipboard.writeText(url);
        showNotify('Page URL copied to clipboard.');
    };

    const publishedCount = pages.filter(p => p.status === 'published').length;
    const draftCount = pages.filter(p => p.status === 'draft').length;

    return (
        <div>
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
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

            {/* Top Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)', margin: 0 }}>
                        CMS Pages & Content
                    </h1>
                    <p style={{ color: 'var(--admin-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                        Create and author store policy pages (About Us, Privacy Policy, Terms, Shipping) with SEO metadata.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        backgroundColor: 'var(--admin-primary)',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} />
                    <span>Add New Page</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Pages</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{pages.length}</div>
                </div>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-success)', textTransform: 'uppercase', fontWeight: 700 }}>Published Pages</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--admin-success)' }}>{publishedCount}</div>
                </div>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-warning, #f59e0b)', textTransform: 'uppercase', fontWeight: 700 }}>Draft Pages</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--admin-warning, #f59e0b)' }}>{draftCount}</div>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div style={{ backgroundColor: 'var(--admin-card-bg)', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'all', label: 'All Pages' },
                            { id: 'published', label: 'Published' },
                            { id: 'draft', label: 'Draft' },
                            { id: 'archived', label: 'Archived' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setStatusFilter(tab.id)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: statusFilter === tab.id ? 'var(--admin-primary)' : 'var(--admin-border)',
                                    backgroundColor: statusFilter === tab.id ? 'var(--admin-primary)' : 'transparent',
                                    color: statusFilter === tab.id ? '#fff' : 'var(--admin-text)',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search title or slug..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    padding: '8px 12px 8px 36px',
                                    borderRadius: '6px',
                                    border: '1px solid var(--admin-border)',
                                    backgroundColor: 'var(--admin-bg)',
                                    color: 'var(--admin-text)',
                                    fontSize: '0.88rem'
                                }}
                            />
                        </div>
                        <button type="submit" style={{ padding: '8px 14px', backgroundColor: 'var(--admin-border)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            <RefreshCw size={16} />
                        </button>
                    </form>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>Loading CMS pages...</div>
                ) : pages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>No CMS pages found.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--admin-border)', color: 'var(--admin-muted)' }}>
                                    <th style={{ padding: '12px' }}>Page Title</th>
                                    <th style={{ padding: '12px' }}>URL Slug</th>
                                    <th style={{ padding: '12px' }}>SEO Completeness</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Last Updated</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page) => (
                                    <tr key={page.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{page.title}</div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ fontFamily: 'monospace', color: 'var(--admin-primary)', fontWeight: 600 }}>
                                                    /pages/{page.slug}
                                                </span>
                                                <button
                                                    onClick={() => copyPageLink(page.slug)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)', padding: '2px' }}
                                                    title="Copy Storefront URL"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {page.seo_title && page.seo_description ? (
                                                <span style={{ color: 'var(--admin-success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                    <CheckCircle size={14} /> Complete
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>
                                                    Partial
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => handleToggleStatus(page)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    backgroundColor: page.status === 'published' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                    color: page.status === 'published' ? 'var(--admin-success)' : '#f59e0b',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {page.status}
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                            {page.updated_at ? page.updated_at.substring(0, 10) : '-'}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleOpenEdit(page)}
                                                    style={{ padding: '6px', background: 'none', border: '1px solid var(--admin-border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--admin-text)' }}
                                                    title="Edit CMS Page"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(page.id)}
                                                    style={{ padding: '6px', background: 'none', border: '1px solid var(--admin-danger)', borderRadius: '4px', cursor: 'pointer', color: 'var(--admin-danger)' }}
                                                    title="Delete Page"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <PageEditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                page={selectedPage}
                onSuccess={(msg) => {
                    showNotify(msg);
                    fetchPages();
                }}
            />
        </div>
    );
}
