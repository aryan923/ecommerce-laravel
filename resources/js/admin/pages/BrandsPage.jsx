import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Search, Plus, Edit3, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import BrandFormModal from '../components/BrandFormModal';

export default function BrandsPage() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('per_page', 100);

            const res = await axios.get(`/api/v1/admin/brands?${params.toString()}`);
            if (res.data?.success) {
                setBrands(res.data.data?.data || res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch brands:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchBrands();
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setSelectedBrand(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (brand) => {
        setModalMode('edit');
        setSelectedBrand(brand);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (brandId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await axios.put(`/api/v1/admin/brands/${brandId}`, { status: newStatus });
            showNotify(`Brand status updated to ${newStatus}.`);
            fetchBrands();
        } catch (err) {
            showNotify('Failed to update status.', 'error');
        }
    };

    const handleDelete = async (brandId) => {
        if (!window.confirm('Are you sure you want to delete this brand?')) return;
        try {
            await axios.delete(`/api/v1/admin/brands/${brandId}`);
            showNotify('Brand deleted successfully.');
            fetchBrands();
        } catch (err) {
            showNotify('Failed to delete brand.', 'error');
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
                    <h2 className="page-header-title">Brand Management</h2>
                    <p className="page-header-subtitle">Manage store manufacturer brands, logos, status, and SEO parameters</p>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={handleOpenCreate}>
                        <Plus size={16} />
                        <span>Create Brand</span>
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="dashboard-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
                <form onSubmit={handleSearchSubmit} className="filters-toolbar-form" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search brand by name or slug..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary">
                        <span>Search</span>
                    </button>
                </form>
            </div>

            {/* Brands Grid / Table */}
            <div className="dashboard-card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Brand Info</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                                        Loading brands...
                                    </td>
                                </tr>
                            ) : brands.length > 0 ? (
                                brands.map((brand) => (
                                    <tr key={brand.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '6px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--admin-border)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {brand.logo_url ? (
                                                        <img src={brand.logo_url} alt={brand.name} style={{ maxWidth: '28px', maxHeight: '28px', objectFit: 'contain' }} />
                                                    ) : (
                                                        <Award size={18} style={{ color: 'var(--admin-primary)' }} />
                                                    )}
                                                </div>
                                                <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{brand.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>{brand.slug}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(brand.id, brand.status)}
                                                className={`badge ${brand.status === 'active' ? 'badge-active' : 'badge-inactive'}`}
                                                style={{ border: 'none', cursor: 'pointer' }}
                                            >
                                                {brand.status}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(brand)}>
                                                    <Edit3 size={14} />
                                                    <span>Edit</span>
                                                </button>
                                                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => handleDelete(brand.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                                        No brands found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <BrandFormModal
                isOpen={isModalOpen}
                mode={modalMode}
                initialData={selectedBrand}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    showNotify(modalMode === 'edit' ? 'Brand updated!' : 'Brand created!');
                    fetchBrands();
                }}
            />
        </div>
    );
}
