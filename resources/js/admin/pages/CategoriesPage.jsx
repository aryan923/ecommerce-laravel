import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Search, Plus, Edit3, Trash2, CheckCircle, AlertCircle, CornerDownRight } from 'lucide-react';
import CategoryFormModal from '../components/CategoryFormModal';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [notification, setNotification] = useState(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('per_page', 100);

            const res = await axios.get(`/api/v1/admin/categories?${params.toString()}`);
            if (res.data?.success) {
                setCategories(res.data.data?.data || res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCategories();
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (category) => {
        setModalMode('edit');
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (catId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await axios.put(`/api/v1/admin/categories/${catId}`, { status: newStatus });
            showNotify(`Category status updated to ${newStatus}.`);
            fetchCategories();
        } catch (err) {
            showNotify('Failed to update status.', 'error');
        }
    };

    const handleDelete = async (catId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await axios.delete(`/api/v1/admin/categories/${catId}`);
            showNotify('Category deleted successfully.');
            fetchCategories();
        } catch (err) {
            showNotify('Failed to delete category.', 'error');
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
                    <h2 className="page-header-title">Category Management</h2>
                    <p className="page-header-subtitle">Organize product catalog categories, subcategories, sort orders, and banners</p>
                </div>
                <div>
                    <button className="btn btn-primary" onClick={handleOpenCreate}>
                        <Plus size={16} />
                        <span>Create Category</span>
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
                            placeholder="Search category by name or slug..."
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

            {/* Table */}
            <div className="dashboard-card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>Media</th>
                                <th>Category Name</th>
                                <th>Slug</th>
                                <th>Parent Category</th>
                                <th>Sort Order</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : categories.length > 0 ? (
                                categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>
                                            <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {cat.image_url ? (
                                                    <img
                                                        src={cat.image_url}
                                                        alt={cat.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <Tag size={18} style={{ color: 'var(--admin-subtle)' }} />
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                                                {cat.parent_id && <CornerDownRight size={14} style={{ color: 'var(--admin-subtle)' }} />}
                                                <span>{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-muted" style={{ fontSize: '0.85rem' }}>{cat.slug}</td>
                                        <td>
                                            {cat.parent ? (
                                                <span className="badge badge-shipped">{cat.parent.name}</span>
                                            ) : (
                                                <span className="text-muted" style={{ fontSize: '0.8rem' }}>Root Category</span>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{cat.sort_order || 0}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(cat.id, cat.status)}
                                                className={`badge ${cat.status === 'active' ? 'badge-active' : 'badge-inactive'}`}
                                                style={{ border: 'none', cursor: 'pointer' }}
                                            >
                                                {cat.status}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(cat)}>
                                                    <Edit3 size={14} />
                                                    <span>Edit</span>
                                                </button>
                                                <button className="btn btn-secondary btn-sm" style={{ color: 'var(--admin-danger)' }} onClick={() => handleDelete(cat.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CategoryFormModal
                isOpen={isModalOpen}
                mode={modalMode}
                initialData={selectedCategory}
                categories={categories}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    showNotify(modalMode === 'edit' ? 'Category updated!' : 'Category created!');
                    fetchCategories();
                }}
            />
        </div>
    );
}
