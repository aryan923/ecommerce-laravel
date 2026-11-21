import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Image, Search, Plus, Edit3, Trash2, CheckCircle, AlertCircle, RefreshCw, Calendar, Eye, EyeOff } from 'lucide-react';
import BannerModal from '../components/BannerModal';

export default function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [placementFilter, setPlacementFilter] = useState('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (placementFilter !== 'all') params.append('placement', placementFilter);
            params.append('per_page', 100);

            const res = await axios.get(`/api/v1/admin/banners?${params.toString()}`);
            if (res.data?.success) {
                setBanners(res.data.data?.data || res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch banners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [placementFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBanners();
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setSelectedBanner(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (banner) => {
        setModalMode('edit');
        setSelectedBanner(banner);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (banner) => {
        try {
            await axios.patch(`/api/v1/admin/banners/${banner.id}/status`, { is_active: !banner.is_active });
            showNotify(`Banner status updated to ${!banner.is_active ? 'Active' : 'Inactive'}.`);
            fetchBanners();
        } catch (err) {
            showNotify('Failed to update banner status.', 'error');
        }
    };

    const handleDelete = async (bannerId) => {
        if (!window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await axios.delete(`/api/v1/admin/banners/${bannerId}`);
            showNotify('Banner deleted successfully.');
            fetchBanners();
        } catch (err) {
            showNotify('Failed to delete banner.', 'error');
        }
    };

    const activeCount = banners.filter(b => b.is_active).length;
    const heroCount = banners.filter(b => b.placement === 'home_hero').length;

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
                        Banner & Promotional Media
                    </h1>
                    <p style={{ color: 'var(--admin-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                        Manage storefront hero banners, placement positioning, active scheduling, and sort ordering.
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
                    <span>Create Banner</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Banners</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{banners.length}</div>
                </div>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-success)', textTransform: 'uppercase', fontWeight: 700 }}>Active Banners</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--admin-success)' }}>{activeCount}</div>
                </div>
                <div style={{ padding: '16px 20px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-primary)', textTransform: 'uppercase', fontWeight: 700 }}>Homepage Hero</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{heroCount}</div>
                </div>
            </div>

            {/* Placement Tabs & Search Toolbar */}
            <div style={{ backgroundColor: 'var(--admin-card-bg)', borderRadius: '12px', border: '1px solid var(--admin-border)', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'all', label: 'All Placements' },
                            { id: 'home_hero', label: 'Homepage Hero' },
                            { id: 'category_banner', label: 'Category Banner' },
                            { id: 'sidebar', label: 'Sidebar' },
                            { id: 'footer', label: 'Footer' },
                            { id: 'popup', label: 'Popup' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setPlacementFilter(tab.id)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: placementFilter === tab.id ? 'var(--admin-primary)' : 'var(--admin-border)',
                                    backgroundColor: placementFilter === tab.id ? 'var(--admin-primary)' : 'transparent',
                                    color: placementFilter === tab.id ? '#fff' : 'var(--admin-text)',
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
                                placeholder="Search banners..."
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
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>Loading banners...</div>
                ) : banners.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>No banners found.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--admin-border)', color: 'var(--admin-muted)' }}>
                                    <th style={{ padding: '12px' }}>Preview</th>
                                    <th style={{ padding: '12px' }}>Banner Details</th>
                                    <th style={{ padding: '12px' }}>Placement</th>
                                    <th style={{ padding: '12px' }}>Schedule</th>
                                    <th style={{ padding: '12px' }}>Sort Order</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {banners.map((banner) => (
                                    <tr key={banner.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                        <td style={{ padding: '12px' }}>
                                            <img
                                                src={banner.image_desktop}
                                                alt={banner.title}
                                                style={{ width: '100px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--admin-border)' }}
                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/100x50?text=Banner'; }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{banner.title}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                {banner.link_url ? `Link: ${banner.link_url}` : 'No link URL'}
                                                {banner.button_text ? ` | CTA: "${banner.button_text}"` : ''}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--admin-primary)',
                                                textTransform: 'uppercase'
                                            }}>
                                                {banner.placement}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                            {banner.starts_at || banner.ends_at ? (
                                                <div>
                                                    <div>From: {banner.starts_at ? banner.starts_at.substring(0, 10) : 'Anytime'}</div>
                                                    <div>To: {banner.ends_at ? banner.ends_at.substring(0, 10) : 'Indefinite'}</div>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--admin-success)', fontWeight: 600 }}>Always Active</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>{banner.sort_order}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                onClick={() => handleToggleStatus(banner)}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    backgroundColor: banner.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                                    color: banner.is_active ? 'var(--admin-success)' : 'var(--admin-muted)'
                                                }}
                                            >
                                                {banner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                                <span>{banner.is_active ? 'Active' : 'Inactive'}</span>
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleOpenEdit(banner)}
                                                    style={{ padding: '6px', background: 'none', border: '1px solid var(--admin-border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--admin-text)' }}
                                                    title="Edit Banner"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(banner.id)}
                                                    style={{ padding: '6px', background: 'none', border: '1px solid var(--admin-danger)', borderRadius: '4px', cursor: 'pointer', color: 'var(--admin-danger)' }}
                                                    title="Delete Banner"
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

            <BannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                banner={selectedBanner}
                onSuccess={(msg) => {
                    showNotify(msg);
                    fetchBanners();
                }}
            />
        </div>
    );
}
