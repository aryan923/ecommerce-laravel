import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Boxes,
    Package,
    AlertTriangle,
    XCircle,
    CheckCircle2,
    Download,
    Search,
    Filter,
    RotateCcw,
    History,
    SlidersHorizontal,
    DollarSign,
    Building2,
    UploadCloud,
    TrendingUp,
    Clock,
    X,
    Copy,
    Check,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    MapPin,
    ShieldAlert
} from 'lucide-react';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import InventoryHistoryModal from '../components/InventoryHistoryModal';
import WarehouseManagementModal from '../components/WarehouseManagementModal';
import BulkStockImportModal from '../components/BulkStockImportModal';
import { loadCurrenciesFromApi, getCurrencyList, formatCurrency } from '../utils/currency';

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [kpis, setKpis] = useState({
        total_skus: 0,
        total_stock_units: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        reserved_stock_units: 0,
        damaged_stock_units: 0,
        total_inventory_cost_value: 0,
        total_inventory_retail_value: 0,
        potential_margin_value: 0,
        damaged_stock_loss_value: 0,
    });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // Multi-Currency State
    const [displayCurrency, setDisplayCurrency] = useState('INR');
    const [currenciesList, setCurrenciesList] = useState(getCurrencyList());

    // Filters State
    const [search, setSearch] = useState('');
    const [stockStatus, setStockStatus] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [page, setPage] = useState(1);

    // Modals State
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedItemForAdjust, setSelectedItemForAdjust] = useState(null);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    useEffect(() => {
        const initCurrencies = async () => {
            await loadCurrenciesFromApi();
            setCurrenciesList(getCurrencyList());
        };
        initCurrencies();
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const res = await axios.get('/api/v1/admin/warehouses');
            if (res.data?.success) {
                setWarehouses(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch warehouses:', err);
        }
    };

    const fetchKpis = async () => {
        try {
            const params = new URLSearchParams();
            if (warehouseFilter) params.append('warehouse_id', warehouseFilter);
            const res = await axios.get(`/api/v1/admin/inventory/kpis?${params.toString()}`);
            if (res.data?.success) {
                setKpis(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch inventory KPIs:', err);
        }
    };

    const fetchInventory = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (stockStatus) params.append('stock_status', stockStatus);
            if (warehouseFilter) params.append('warehouse_id', warehouseFilter);
            params.append('page', targetPage);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/inventory?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setInventory(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch inventory catalog:', err);
            showNotify('Failed to fetch inventory catalog.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [search, stockStatus, warehouseFilter, page]);

    useEffect(() => {
        fetchKpis();
        fetchInventory(page);
    }, [page, stockStatus, warehouseFilter, fetchInventory]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchKpis();
        fetchInventory(page);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchInventory(1);
    };

    const handleResetFilters = () => {
        setSearch('');
        setStockStatus('');
        setWarehouseFilter('');
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

    const handleOpenAdjustment = (item) => {
        setSelectedItemForAdjust(item);
        setIsAdjustmentModalOpen(true);
    };

    const handleExportCsv = async () => {
        try {
            const params = new URLSearchParams();
            if (warehouseFilter) params.append('warehouse_id', warehouseFilter);
            const res = await axios.get(`/api/v1/admin/inventory/export?${params.toString()}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showNotify('Inventory exported to CSV successfully.');
        } catch (err) {
            console.error('Export error:', err);
            showNotify('Failed to export inventory CSV.', 'error');
        }
    };

    const hasActiveFilters = Boolean(search || stockStatus || warehouseFilter);

    return (
        <div>
            {/* Notification Toast */}
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
                    {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Inventory & Stock Control</h2>
                    <p className="page-header-subtitle">Multi-warehouse stock levels, reorder threshold alerts, COGS valuation, and audit trail logs</p>
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
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)' }}>Currency:</span>
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
                        title="Reload inventory records"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsHistoryModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <History size={14} />
                        <span>Audit Logs</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsImportModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <UploadCloud size={14} />
                        <span>Import</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsWarehouseModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <Building2 size={14} />
                        <span>Warehouses ({warehouses.length})</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleExportCsv}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* 4 Executive KPI Cards Matrix (Standard 4 Cards Per Row) */}
            <div className="stat-cards-grid-4">
                {/* Available Stock Units */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Available Stock Units
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {kpis.total_stock_units.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Across <strong>{kpis.total_skus}</strong> SKUs • {kpis.reserved_stock_units || 0} reserved
                        </div>
                    </div>
                </div>

                {/* Stock Health Alerts (Low & Out) */}
                <div
                    onClick={() => { setStockStatus(stockStatus === 'low_stock' ? '' : 'low_stock'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: stockStatus === 'low_stock' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                        boxShadow: 'var(--shadow-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: kpis.low_stock_count + kpis.out_of_stock_count > 0 ? '#f59e0b' : 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Stock Health Alerts
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: kpis.low_stock_count + kpis.out_of_stock_count > 0 ? '#f59e0b' : 'var(--admin-text)' }}>
                            {kpis.low_stock_count + kpis.out_of_stock_count}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            <strong style={{ color: '#f59e0b' }}>{kpis.low_stock_count}</strong> low • <strong style={{ color: '#ef4444' }}>{kpis.out_of_stock_count}</strong> out
                        </div>
                    </div>
                </div>

                {/* Inventory Cost Asset Valuation */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Cost Asset Value (COGS)
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {formatCurrency(kpis.total_inventory_cost_value, displayCurrency, true)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Procurement value in stock
                        </div>
                    </div>
                </div>

                {/* Retail Valuation & Margin */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Retail Valuation
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {formatCurrency(kpis.total_inventory_retail_value, displayCurrency, true)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Estimated retail gross potential
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Table Card with Tabs & Toolbar */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Quick Segmented Stock Status Tabs */}
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
                        className={`order-tab-btn ${stockStatus === '' ? 'active' : ''}`}
                        onClick={() => { setStockStatus(''); setPage(1); }}
                    >
                        <span>All Inventory</span>
                        <span className="order-tab-badge">{kpis.total_skus}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${stockStatus === 'in_stock' ? 'active' : ''}`}
                        onClick={() => { setStockStatus('in_stock'); setPage(1); }}
                    >
                        <span className="order-status-dot" style={{ backgroundColor: '#10b981' }} />
                        <span>In Stock</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${stockStatus === 'low_stock' ? 'active' : ''}`}
                        onClick={() => { setStockStatus('low_stock'); setPage(1); }}
                    >
                        <span className="order-status-dot pulse" style={{ backgroundColor: '#f59e0b' }} />
                        <span>Low Stock</span>
                        <span className="order-tab-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                            {kpis.low_stock_count}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${stockStatus === 'out_of_stock' ? 'active' : ''}`}
                        onClick={() => { setStockStatus('out_of_stock'); setPage(1); }}
                    >
                        <span className="order-status-dot" style={{ backgroundColor: '#ef4444' }} />
                        <span>Out of Stock</span>
                        <span className="order-tab-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                            {kpis.out_of_stock_count}
                        </span>
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
                                placeholder="Search SKU, Product Name, Bin..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px', paddingRight: search ? '30px' : '10px', height: '36px', borderRadius: '8px' }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => { setSearch(''); setPage(1); fetchInventory(1); }}
                                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Warehouse Filter */}
                        <select
                            className="form-select"
                            style={{ width: 'auto', minWidth: '150px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                            value={warehouseFilter}
                            onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">All Warehouses</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name} {w.is_default ? '(Default)' : ''}
                                </option>
                            ))}
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
                                title="Reset filters"
                                style={{ height: '36px', padding: '0 10px', borderRadius: '8px' }}
                            >
                                <RotateCcw size={13} />
                                <span>Reset</span>
                            </button>
                        )}
                    </form>
                </div>

                {/* Active Filter Chips */}
                {hasActiveFilters && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '12px', padding: '0 16px 12px 16px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', fontWeight: 600 }}>Active Filters:</span>

                        {search && (
                            <span className="order-filter-chip">
                                <span>Search: "{search}"</span>
                                <button type="button" className="order-filter-chip-remove" onClick={() => { setSearch(''); setPage(1); }}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {warehouseFilter && (
                            <span className="order-filter-chip">
                                <span>Warehouse: {warehouses.find(w => String(w.id) === String(warehouseFilter))?.name || warehouseFilter}</span>
                                <button type="button" className="order-filter-chip-remove" onClick={() => { setWarehouseFilter(''); setPage(1); }}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {stockStatus && (
                            <span className="order-filter-chip">
                                <span>Level: {stockStatus.replace(/_/g, ' ').toUpperCase()}</span>
                                <button type="button" className="order-filter-chip-remove" onClick={() => { setStockStatus(''); setPage(1); }}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={handleResetFilters}
                            style={{ background: 'none', border: 'none', color: 'var(--admin-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginLeft: '4px' }}
                        >
                            Clear All
                        </button>
                    </div>
                )}

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
                                <th style={{ padding: '14px 20px' }}>SKU & Product Name</th>
                                <th style={{ padding: '14px 16px' }}>Warehouse Location</th>
                                <th style={{ padding: '14px 16px' }}>Available Stock</th>
                                <th style={{ padding: '14px 16px' }}>Valuation ({displayCurrency})</th>
                                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Safety Limit</th>
                                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Stock Status</th>
                                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                            <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--admin-primary)' }} />
                                            <span>Loading inventory stock levels...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : inventory.length > 0 ? (
                                inventory.map((item) => {
                                    const productName = item.variant?.product?.name || item.product_name || 'Product Item';
                                    const brandName = item.variant?.product?.brand?.name;
                                    const available = item.available_qty ?? 0;
                                    const threshold = item.low_stock_threshold ?? 10;
                                    const reorder = item.reorder_qty ?? 50;
                                    const isOut = available <= 0;
                                    const isLow = available > 0 && available <= threshold;
                                    const warehouseName = item.warehouse?.name || 'Main Warehouse';
                                    const locationCode = item.location_code;

                                    return (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: '1px solid var(--admin-border)',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                            className="admin-table-row"
                                        >
                                            {/* SKU & Product */}
                                            <td style={{ padding: '14px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontWeight: 800, color: 'var(--admin-primary)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                                                        {item.sku}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(item.sku, `sku_${item.id}`)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: 'var(--admin-muted)' }}
                                                        title="Copy SKU"
                                                    >
                                                        {copiedId === `sku_${item.id}` ? <Check size={11} style={{ color: '#10b981' }} /> : <Copy size={11} />}
                                                    </button>
                                                </div>

                                                <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.9rem', marginTop: '2px' }}>
                                                    {productName}
                                                </div>

                                                {brandName && (
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '1px' }}>
                                                        Brand: {brandName}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Warehouse & Location */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Building2 size={13} style={{ color: 'var(--admin-primary)' }} />
                                                    <span>{warehouseName}</span>
                                                </div>
                                                <div style={{ fontSize: '0.74rem', color: locationCode ? 'var(--admin-muted)' : 'var(--admin-subtle)', marginTop: '2px' }}>
                                                    Bin: <strong>{locationCode || 'General Staging'}</strong>
                                                </div>
                                            </td>

                                            {/* Available Stock */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{
                                                    fontSize: '1.15rem',
                                                    fontWeight: 800,
                                                    color: isOut ? '#ef4444' : (isLow ? '#f59e0b' : '#10b981')
                                                }}>
                                                    {available.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>units</span>
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                    Res: {item.reserved_qty ?? 0} • Dmg: {item.damaged_qty ?? 0}
                                                </div>
                                            </td>

                                            {/* Valuation */}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--admin-text)' }}>
                                                    Cost: {formatCurrency(item.cost_price ?? 0, displayCurrency, true)}
                                                </div>
                                                <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginTop: '1px' }}>
                                                    Retail: {formatCurrency(item.variant?.price ?? 0, displayCurrency, true)}
                                                </div>
                                            </td>

                                            {/* Safety Limit & Reorder */}
                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                                    Min: {threshold}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                                    Batch: +{reorder}
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                {isOut ? (
                                                    <span className="order-status-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                                                        <span className="order-status-dot" style={{ backgroundColor: '#ef4444' }} />
                                                        <span>Out of Stock</span>
                                                    </span>
                                                ) : isLow ? (
                                                    <span className="order-status-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                                                        <span className="order-status-dot pulse" style={{ backgroundColor: '#f59e0b' }} />
                                                        <span>Low Stock</span>
                                                    </span>
                                                ) : (
                                                    <span className="order-status-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                                        <span className="order-status-dot" style={{ backgroundColor: '#10b981' }} />
                                                        <span>In Stock</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Button */}
                                            <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleOpenAdjustment(item)}
                                                    title="Adjust Stock, Transfer Warehouses, or Record Scrap"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '8px', fontWeight: 700 }}
                                                >
                                                    <SlidersHorizontal size={13} />
                                                    <span>Adjust Stock</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            No inventory items found
                                        </div>
                                        <div style={{ fontSize: '0.84rem' }}>
                                            Try modifying your search criteria or resetting the warehouse filter.
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
                            Showing page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total inventory records)
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

            {/* Stock Adjustment Modal */}
            <StockAdjustmentModal
                isOpen={isAdjustmentModalOpen}
                initialItem={selectedItemForAdjust}
                warehouses={warehouses}
                onClose={() => setIsAdjustmentModalOpen(false)}
                onSuccess={(msg) => {
                    showNotify(msg);
                    fetchKpis();
                    fetchInventory(page);
                }}
            />

            {/* Unified Transaction Audit History Modal */}
            <InventoryHistoryModal
                isOpen={isHistoryModalOpen}
                warehouses={warehouses}
                onClose={() => setIsHistoryModalOpen(false)}
            />

            {/* Warehouse Management Modal */}
            <WarehouseManagementModal
                isOpen={isWarehouseModalOpen}
                onClose={() => setIsWarehouseModalOpen(false)}
                onSuccess={(msg) => {
                    showNotify(msg);
                    fetchWarehouses();
                    fetchKpis();
                    fetchInventory(page);
                }}
            />

            {/* Bulk Stock Import Modal */}
            <BulkStockImportModal
                isOpen={isImportModalOpen}
                warehouses={warehouses}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={(msg) => {
                    showNotify(msg);
                    fetchKpis();
                    fetchInventory(page);
                }}
            />
        </div>
    );
}
