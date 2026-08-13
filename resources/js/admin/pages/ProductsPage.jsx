import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Package,
    Search,
    Plus,
    Copy,
    Edit3,
    Trash2,
    Upload,
    Filter,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import BulkActionsBar from '../components/BulkActionsBar';
import ImportProductsModal from '../components/ImportProductsModal';
import ProductFormModal from '../components/ProductFormModal';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);

    // Modal States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productModalMode, setProductModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [notification, setNotification] = useState(null);

    // Filters state
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [type, setType] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [page, setPage] = useState(1);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (type) params.append('type', type);
            if (sortBy) params.append('sort_by', sortBy);
            params.append('page', page);
            params.append('per_page', 10);

            const res = await axios.get(`/api/v1/admin/products?${params.toString()}`);
            if (res.data?.success) {
                setProducts(res.data.data?.data || []);
                setPagination({
                    current_page: res.data.data?.current_page || 1,
                    last_page: res.data.data?.last_page || 1,
                    total: res.data.data?.total || 0,
                });
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [page, status, type, sortBy]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // Open Add Product Modal
    const handleOpenCreateModal = () => {
        setProductModalMode('create');
        setSelectedProduct(null);
        setIsProductModalOpen(true);
    };

    // Open Edit Product Modal
    const handleOpenEditModal = (product) => {
        setProductModalMode('edit');
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    // Single item status toggle
    const handleToggleStatus = async (productId, newStatus) => {
        try {
            await axios.patch(`/api/v1/admin/products/${productId}/status`, { status: newStatus });
            showNotify(`Product status updated to ${newStatus}.`);
            fetchProducts();
        } catch (err) {
            showNotify('Failed to update status.', 'error');
        }
    };

    // Duplicate product
    const handleDuplicate = async (productId) => {
        try {
            const res = await axios.post(`/api/v1/admin/products/${productId}/duplicate`);
            if (res.data?.success) {
                showNotify(`Product cloned as "${res.data.data?.name}".`);
                fetchProducts();
            }
        } catch (err) {
            showNotify('Failed to duplicate product.', 'error');
        }
    };

    // Delete single product
    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`/api/v1/admin/products/${productId}`);
            showNotify('Product deleted successfully.');
            fetchProducts();
        } catch (err) {
            showNotify('Failed to delete product.', 'error');
        }
    };

    // Checkbox selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(products.map((p) => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Execute bulk operation
    const handleExecuteBulk = async (action, data = {}) => {
        try {
            const res = await axios.post('/api/v1/admin/products/bulk', {
                product_ids: selectedIds,
                action,
                data,
            });

            if (res.data?.success) {
                showNotify(res.data.message || 'Bulk operation completed.');
                setSelectedIds([]);
                fetchProducts();
            }
        } catch (err) {
            showNotify('Failed to execute bulk operation.', 'error');
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
    };

    return (
        <div>
            {/* Notification Alert Toast */}
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

            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Product Management</h2>
                    <p className="page-header-subtitle">Manage store catalog, product variants, duplication, and bulk operations</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
                        <Upload size={16} />
                        <span>Import CSV</span>
                    </button>
                    <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                        <Plus size={16} />
                        <span>Create Product</span>
                    </button>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="dashboard-card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by product name, SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>

                    <select className="form-select" style={{ width: 'auto' }} value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="archived">Archived</option>
                    </select>

                    <select className="form-select" style={{ width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="simple">Simple</option>
                        <option value="variable">Variable</option>
                        <option value="digital">Digital</option>
                    </select>

                    <select className="form-select" style={{ width: 'auto' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="latest">Sort: Latest</option>
                        <option value="oldest">Sort: Oldest</option>
                        <option value="price_low_high">Price: Low to High</option>
                        <option value="price_high_low">Price: High to Low</option>
                        <option value="name_asc">Name: A to Z</option>
                    </select>

                    <button type="submit" className="btn btn-primary">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>
                </form>
            </div>

            {/* Products Table Card */}
            <div className="dashboard-card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={products.length > 0 && selectedIds.length === products.length}
                                    />
                                </th>
                                <th>Product Info</th>
                                <th>Type</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                                        Loading product catalog...
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((prd) => (
                                    <tr key={prd.id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(prd.id)}
                                                onChange={() => handleSelectOne(prd.id)}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{prd.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>SKU: {prd.sku}</div>
                                        </td>
                                        <td>
                                            <span className="badge badge-shipped">{prd.type}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 700 }}>{formatCurrency(prd.price)}</div>
                                            {prd.sale_price && (
                                                <div className="text-muted" style={{ fontSize: '0.75rem', textDecoration: 'line-through' }}>
                                                    {formatCurrency(prd.sale_price)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <select
                                                className="form-select"
                                                value={prd.status}
                                                onChange={(e) => handleToggleStatus(prd.id, e.target.value)}
                                                style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleOpenEditModal(prd)}
                                                    title="Edit Product"
                                                >
                                                    <Edit3 size={14} />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleDuplicate(prd.id)}
                                                    title="Duplicate Product"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    style={{ color: 'var(--admin-danger)' }}
                                                    onClick={() => handleDelete(prd.id)}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-muted" style={{ textAlign: 'center', padding: '32px' }}>
                                        No products found matching your search query.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total products)
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => setPage(page - 1)}
                            >
                                Previous
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPage(page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Bulk Actions Bar */}
            <BulkActionsBar
                selectedIds={selectedIds}
                onClearSelection={() => setSelectedIds([])}
                onExecuteBulk={handleExecuteBulk}
            />

            {/* Product Form Modal (Add / Edit) */}
            <ProductFormModal
                isOpen={isProductModalOpen}
                mode={productModalMode}
                initialData={selectedProduct}
                onClose={() => setIsProductModalOpen(false)}
                onSuccess={() => {
                    showNotify(productModalMode === 'edit' ? 'Product updated successfully!' : 'Product created successfully!');
                    fetchProducts();
                }}
            />

            {/* Import Products Modal */}
            <ImportProductsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    showNotify('Product import completed!');
                    fetchProducts();
                }}
            />
        </div>
    );
}
