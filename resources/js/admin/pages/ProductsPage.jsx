import React, { useState, useEffect, useCallback } from 'react';
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
    CheckCircle2,
    AlertCircle,
    Globe,
    RotateCcw,
    Image as ImageIcon,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    Boxes,
    Tag,
    Layers,
    DollarSign,
    Sparkles,
    Eye,
    TrendingUp,
    RefreshCw,
    Download
} from 'lucide-react';
import BulkActionsBar from '../components/BulkActionsBar';
import ImportProductsModal from '../components/ImportProductsModal';
import ProductFormModal from '../components/ProductFormModal';
import { loadCurrenciesFromApi, getCurrencyList, formatCurrency } from '../utils/currency';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    // Multi-Currency State
    const [displayCurrency, setDisplayCurrency] = useState('INR');
    const [currenciesList, setCurrenciesList] = useState(getCurrencyList());

    useEffect(() => {
        loadCurrenciesFromApi().then((currMap) => {
            setCurrenciesList(Object.values(currMap));
        });
    }, []);

    // Modal States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productModalMode, setProductModalMode] = useState('create');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [notification, setNotification] = useState(null);

    // Filters state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [page, setPage] = useState(1);

    // Dynamic stats
    const [catalogStats, setCatalogStats] = useState({
        total: 0,
        active: 0,
        draft: 0,
        variable: 0,
    });

    const fetchProducts = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('type', typeFilter);
            if (sortBy) params.append('sort_by', sortBy);
            params.append('page', targetPage);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/products?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setProducts(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });

                // Compute stats
                const totalCount = meta.total ?? items.length;
                const activeCount = items.filter(p => p.status === 'active').length;
                const draftCount = items.filter(p => p.status === 'draft').length;
                const varCount = items.filter(p => p.type === 'variable').length;
                setCatalogStats(prev => ({
                    total: totalCount || prev.total,
                    active: activeCount,
                    draft: draftCount,
                    variable: varCount,
                }));
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
            showNotify(err.response?.data?.message || 'Failed to load products. Please verify API connection.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, statusFilter, typeFilter, sortBy, page]);

    useEffect(() => {
        fetchProducts(page);
    }, [page, statusFilter, typeFilter, sortBy, fetchProducts]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProducts(page);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchProducts(1);
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setTypeFilter('');
        setSortBy('latest');
        setPage(1);
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCopy = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedId(key);
        setTimeout(() => setCopiedId(null), 2000);
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
            showNotify(`Product status updated to ${newStatus.toUpperCase()}.`);
            fetchProducts(page);
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
                fetchProducts(page);
            }
        } catch (err) {
            showNotify('Failed to duplicate product.', 'error');
        }
    };

    // Delete single product
    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
        try {
            await axios.delete(`/api/v1/admin/products/${productId}`);
            showNotify('Product deleted successfully.');
            fetchProducts(page);
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
                fetchProducts(page);
            }
        } catch (err) {
            showNotify('Failed to execute bulk operation.', 'error');
        }
    };

    const SVG_IMAGE_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";

    // Helper for main image url in listing
    const getProductImage = (prd) => {
        if (prd.product_images && prd.product_images.length > 0) {
            const mainPi = prd.product_images.find((pi) => pi.type === 'main');
            if (mainPi?.media?.url) return mainPi.media.url;
            if (prd.product_images[0]?.media?.url) return prd.product_images[0].media.url;
        }
        if (prd.media && prd.media.length > 0) {
            const mainMedia = prd.media.find((m) => m.pivot?.type === 'main' || m.type === 'main');
            if (mainMedia?.url) return mainMedia.url;
            if (prd.media[0]?.url) return prd.media[0].url;
        }
        if (prd.main_image_url) return prd.main_image_url;
        if (prd.image_url) return prd.image_url;
        return prd.image || SVG_IMAGE_PLACEHOLDER;
    };

    const getStatusStyle = (st) => {
        switch (st) {
            case 'active':
                return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.25)', dot: '#10b981' };
            case 'draft':
                return { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)', dot: '#f59e0b' };
            case 'archived':
            case 'inactive':
            default:
                return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.25)', dot: '#94a3b8' };
        }
    };

    const hasActiveFilters = Boolean(search || statusFilter || typeFilter || sortBy !== 'latest');

    return (
        <div>
            {/* Notification Alert Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 1200,
                    padding: '12px 20px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    animation: 'slideInRight 0.2s ease-out'
                }}>
                    {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Product Catalog Management</h2>
                    <p className="page-header-subtitle">Manage storefront catalog items, variable variants, multi-currency pricing, media, and inventory status</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Currency Switcher */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'var(--admin-card-bg)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--admin-border)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <Globe size={13} style={{ color: 'var(--admin-primary)' }} />
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)' }}>Display:</span>
                        <select
                            className="form-select"
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                            style={{ border: 'none', background: 'transparent', padding: '2px 14px 2px 2px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--admin-text)', cursor: 'pointer' }}
                        >
                            {currenciesList.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} ({c.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Reload product list"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsImportModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <Upload size={14} />
                        <span>Import</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleOpenCreateModal}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                    >
                        <Plus size={15} />
                        <span>Create Product</span>
                    </button>
                </div>
            </div>

            {/* 4 Executive Product Catalog KPI Cards (Standard 4 Cards Per Row) */}
            <div className="stat-cards-grid-4">
                {/* 1. Total Catalog SKUs */}
                <div
                    onClick={() => { setStatusFilter(''); setTypeFilter(''); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === '' && typeFilter === '' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Total Catalog SKUs
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {catalogStats.total.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            All store product items
                        </div>
                    </div>
                </div>

                {/* 2. Active Live Products */}
                <div
                    onClick={() => { setStatusFilter(statusFilter === 'active' ? '' : 'active'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === 'active' ? '2px solid #10b981' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Active Live Catalog
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {catalogStats.active.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Published & live on storefront
                        </div>
                    </div>
                </div>

                {/* 3. Draft Products */}
                <div
                    onClick={() => { setStatusFilter(statusFilter === 'draft' ? '' : 'draft'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: statusFilter === 'draft' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Drafts Pending Review
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertCircle size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                            {catalogStats.draft.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Unpublished drafts
                        </div>
                    </div>
                </div>

                {/* 4. Variable / Multi-variant Items */}
                <div
                    onClick={() => { setTypeFilter(typeFilter === 'variable' ? '' : 'variable'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: typeFilter === 'variable' ? '2px solid #a855f7' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Variable Products
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7' }}>
                            {catalogStats.variable.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Multi-variant configurations
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Table Card with Tabs & Toolbar */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Top Status Tabs Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflowX: 'auto',
                    padding: '12px 16px 8px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)',
                    scrollbarWidth: 'none'
                }}>
                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === '' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter(''); setPage(1); }}
                    >
                        <span>All Products</span>
                        <span className="order-tab-badge">{pagination.total}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'active' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('active'); setPage(1); }}
                    >
                        <span className="order-status-dot" style={{ backgroundColor: '#10b981' }} />
                        <span>Active Live</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'draft' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('draft'); setPage(1); }}
                    >
                        <span className="order-status-dot" style={{ backgroundColor: '#f59e0b' }} />
                        <span>Drafts</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'inactive' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('inactive'); setPage(1); }}
                    >
                        <span className="order-status-dot" style={{ backgroundColor: '#94a3b8' }} />
                        <span>Inactive</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${statusFilter === 'archived' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('archived'); setPage(1); }}
                    >
                        <span>Archived</span>
                    </button>
                </div>

                {/* Filter Controls Row */}
                <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)'
                }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Product Name, SKU, Barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px', paddingRight: search ? '30px' : '10px', height: '36px', borderRadius: '8px' }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setPage(1); fetchProducts(1); }}
                                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Product Type Filter */}
                        <select
                            className="form-select"
                            style={{ width: 'auto', minWidth: '130px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Types</option>
                            <option value="simple">Simple Product</option>
                            <option value="variable">Variable Product</option>
                            <option value="digital">Digital Product</option>
                        </select>

                        {/* Sort Dropdown */}
                        <select
                            className="form-select"
                            style={{ width: 'auto', minWidth: '140px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        >
                            <option value="latest">Latest Added</option>
                            <option value="oldest">Oldest Added</option>
                            <option value="price_low_high">Price: Low to High</option>
                            <option value="price_high_low">Price: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>

                        <button type="submit" className="btn btn-secondary" style={{ height: '36px', padding: '0 14px', borderRadius: '8px', fontWeight: 600 }}>
                            <Filter size={14} />
                            <span>Filter</span>
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleResetFilters}
                                title="Reset all filters"
                                style={{ height: '36px', padding: '0 10px', borderRadius: '8px' }}
                            >
                                <RotateCcw size={13} />
                                <span>Reset</span>
                            </button>
                        )}
                    </form>

                    {/* Active Filter Chips Bar */}
                    {hasActiveFilters && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontWeight: 600 }}>Active:</span>

                            {search && (
                                <span className="order-filter-chip">
                                    <span>Search: "{search}"</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setSearch(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {statusFilter && (
                                <span className="order-filter-chip">
                                    <span>Status: {statusFilter.toUpperCase()}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setStatusFilter(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {typeFilter && (
                                <span className="order-filter-chip">
                                    <span>Type: {typeFilter.toUpperCase()}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setTypeFilter(''); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            {sortBy !== 'latest' && (
                                <span className="order-filter-chip">
                                    <span>Sort: {sortBy.replace(/_/g, ' ')}</span>
                                    <button type="button" className="order-filter-chip-remove" onClick={() => { setSortBy('latest'); setPage(1); }}>
                                        <X size={11} />
                                    </button>
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={handleResetFilters}
                                style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', marginLeft: '4px' }}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr style={{
                                backgroundColor: 'var(--admin-card-hover)',
                                borderBottom: '1px solid var(--admin-border)',
                                color: 'var(--admin-muted)',
                                textAlign: 'left',
                                fontSize: '0.72rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em'
                            }}>
                                <th style={{ width: '40px', padding: '14px 16px' }}>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={products.length > 0 && selectedIds.length === products.length}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </th>
                                <th style={{ width: '64px', padding: '14px 8px' }}>Image</th>
                                <th style={{ padding: '14px 16px' }}>Product Title & SKU</th>
                                <th style={{ padding: '14px 14px', textAlign: 'center' }}>Type</th>
                                <th style={{ padding: '14px 16px' }}>Pricing ({displayCurrency})</th>
                                <th style={{ padding: '14px 14px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                            <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--admin-primary)' }} />
                                            <span>Loading product catalog...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((prd) => {
                                    const thumbUrl = getProductImage(prd);
                                    const brandName = prd.brand?.name;
                                    const primaryCategory = prd.categories?.[0]?.name;
                                    const isChecked = selectedIds.includes(prd.id);
                                    const statusStyle = getStatusStyle(prd.status);

                                    return (
                                        <tr
                                            key={prd.id}
                                            style={{
                                                borderBottom: '1px solid var(--admin-border)',
                                                backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                            className="admin-table-row"
                                        >
                                            {/* Checkbox */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleSelectOne(prd.id)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </td>

                                            {/* Media Thumbnail */}
                                            <td style={{ padding: '14px 8px' }}>
                                                <div
                                                    onClick={() => handleOpenEditModal(prd)}
                                                    style={{
                                                        width: '46px',
                                                        height: '46px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        backgroundColor: 'var(--admin-card-hover)',
                                                        border: '1px solid var(--admin-border)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <img
                                                        src={thumbUrl}
                                                        alt={prd.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = SVG_IMAGE_PLACEHOLDER;
                                                        }}
                                                    />
                                                </div>
                                            </td>

                                            {/* Product Title, SKU, Brand, Category */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div
                                                    onClick={() => handleOpenEditModal(prd)}
                                                    style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.92rem', cursor: 'pointer' }}
                                                    title="Click to edit product"
                                                >
                                                    {prd.name}
                                                </div>

                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                                    {/* SKU with Copy */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--admin-muted)', fontFamily: 'monospace' }}>
                                                        <span>SKU: {prd.sku || 'N/A'}</span>
                                                        {prd.sku && (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleCopy(prd.sku, `sku_${prd.id}`); }}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: 'var(--admin-muted)' }}
                                                                title="Copy SKU"
                                                            >
                                                                {copiedId === `sku_${prd.id}` ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {brandName && (
                                                        <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--admin-card-hover)', color: 'var(--admin-muted)', fontWeight: 600 }}>
                                                            {brandName}
                                                        </span>
                                                    )}

                                                    {primaryCategory && (
                                                        <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(99, 102, 241, 0.08)', color: 'var(--admin-primary)', fontWeight: 700 }}>
                                                            {primaryCategory}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Product Type */}
                                            <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    textTransform: 'uppercase',
                                                    backgroundColor: prd.type === 'variable' ? 'rgba(168, 85, 247, 0.12)' : (prd.type === 'digital' ? 'rgba(14, 165, 233, 0.12)' : 'rgba(99, 102, 241, 0.1)'),
                                                    color: prd.type === 'variable' ? '#a855f7' : (prd.type === 'digital' ? '#0ea5e9' : 'var(--admin-primary)')
                                                }}>
                                                    {prd.type}
                                                </span>
                                            </td>

                                            {/* Pricing */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--admin-text)' }}>
                                                    {formatCurrency(prd.price, displayCurrency, true)}
                                                </div>
                                                {prd.sale_price && (
                                                    <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', textDecoration: 'line-through' }}>
                                                        {formatCurrency(prd.sale_price, displayCurrency, true)}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Dropdown */}
                                            <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                                                <select
                                                    className="form-select"
                                                    value={prd.status}
                                                    onChange={(e) => handleToggleStatus(prd.id, e.target.value)}
                                                    style={{
                                                        padding: '4px 10px',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 700,
                                                        width: 'auto',
                                                        borderRadius: '8px',
                                                        backgroundColor: statusStyle.bg,
                                                        color: statusStyle.color,
                                                        border: `1px solid ${statusStyle.border}`
                                                    }}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="draft">Draft</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="archived">Archived</option>
                                                </select>
                                            </td>

                                            {/* Action Buttons */}
                                            <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleOpenEditModal(prd)}
                                                        title="Edit Product"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px' }}
                                                    >
                                                        <Edit3 size={13} />
                                                        <span>Edit</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleDuplicate(prd.id)}
                                                        title="Duplicate / Clone Product"
                                                        style={{ padding: '5px 8px', borderRadius: '8px' }}
                                                    >
                                                        <Copy size={13} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ color: 'var(--admin-danger)', padding: '5px 8px', borderRadius: '8px' }}
                                                        onClick={() => handleDelete(prd.id)}
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            No products found
                                        </div>
                                        <div style={{ fontSize: '0.84rem' }}>
                                            Try modifying your search query or switching the status filter tab.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        padding: '14px 20px',
                        borderTop: '1px solid var(--admin-border)',
                        backgroundColor: 'var(--admin-card-bg)',
                        fontSize: '0.85rem'
                    }}>
                        <span style={{ color: 'var(--admin-muted)' }}>
                            Showing page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total products)
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page <= 1}
                                onClick={() => setPage(pagination.current_page - 1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
                            >
                                <ChevronLeft size={14} />
                                <span>Previous</span>
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page >= pagination.last_page}
                                onClick={() => setPage(pagination.current_page + 1)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
                            >
                                <span>Next</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Bulk Actions Bar */}
            <BulkActionsBar
                selectedIds={selectedIds}
                displayCurrency={displayCurrency}
                onClearSelection={() => setSelectedIds([])}
                onExecuteBulk={handleExecuteBulk}
            />

            {/* Product Form Modal (Add / Edit) */}
            <ProductFormModal
                isOpen={isProductModalOpen}
                mode={productModalMode}
                initialData={selectedProduct}
                displayCurrency={displayCurrency}
                onClose={() => setIsProductModalOpen(false)}
                onSuccess={() => {
                    showNotify(productModalMode === 'edit' ? 'Product updated successfully!' : 'Product created successfully!');
                    fetchProducts(page);
                }}
            />

            {/* Import Products Modal */}
            <ImportProductsModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    showNotify('Product import completed!');
                    fetchProducts(page);
                }}
            />
        </div>
    );
}
