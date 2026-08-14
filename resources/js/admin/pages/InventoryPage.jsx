import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Boxes,
    Package,
    AlertTriangle,
    XCircle,
    CheckCircle,
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
    X
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
    const [notification, setNotification] = useState(null);

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

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (stockStatus) params.append('stock_status', stockStatus);
            if (warehouseFilter) params.append('warehouse_id', warehouseFilter);
            params.append('page', page);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/inventory?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                const meta = res.data.meta || (typeof rawData === 'object' && !Array.isArray(rawData) ? rawData : {});
                setInventory(items);
                setPagination({
                    current_page: meta.current_page || 1,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch inventory catalog:', err);
            showNotify('Failed to fetch inventory catalog.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKpis();
        fetchInventory();
    }, [page, stockStatus, warehouseFilter]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchInventory();
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

    return (
        <div>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1100,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.msg}</span>
                </div>
            )}

            {/* Page Header Row */}
            <div className="page-header-row" style={{ flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <h2 className="page-header-title">Multi-Warehouse Inventory Control</h2>
                    <p className="page-header-subtitle">Real-time multi-location stock tracking, COGS valuation, inter-warehouse transfers & audit logging</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Currency Switcher */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '4px 10px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted)' }}>Currency:</span>
                        <select
                            className="form-select"
                            style={{ padding: '2px 24px 2px 8px', fontSize: '0.82rem', border: 'none', backgroundColor: 'transparent', fontWeight: 700 }}
                            value={displayCurrency}
                            onChange={(e) => setDisplayCurrency(e.target.value)}
                        >
                            {currenciesList.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {c.code} ({c.symbol})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button className="btn btn-secondary" onClick={() => setIsHistoryModalOpen(true)}>
                        <History size={16} />
                        <span>Transaction Audit Logs</span>
                    </button>

                    <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(true)}>
                        <UploadCloud size={16} />
                        <span>Bulk Import CSV</span>
                    </button>

                    <button className="btn btn-secondary" onClick={() => setIsWarehouseModalOpen(true)}>
                        <Building2 size={16} />
                        <span>Manage Warehouses</span>
                    </button>

                    <button className="btn btn-primary" onClick={handleExportCsv}>
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
            }}>
                <div className="kpi-card" style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total SKUs</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <Boxes size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {kpis.total_skus}
                    </div>
                </div>

                <div className="kpi-card" style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Available Units</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--admin-success)', flexShrink: 0 }}>
                            <Package size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {kpis.total_stock_units}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStockStatus(stockStatus === 'low_stock' ? '' : 'low_stock'); setPage(1); }}
                    style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: `1.5px solid ${stockStatus === 'low_stock' ? 'var(--admin-warning)' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Low Stock</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--admin-warning)', flexShrink: 0 }}>
                            <AlertTriangle size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: kpis.low_stock_count > 0 ? 'var(--admin-warning)' : 'var(--admin-text)' }}>
                        {kpis.low_stock_count}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStockStatus(stockStatus === 'out_of_stock' ? '' : 'out_of_stock'); setPage(1); }}
                    style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: `1.5px solid ${stockStatus === 'out_of_stock' ? 'var(--admin-danger)' : 'var(--admin-border)'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Out of Stock</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--admin-danger)', flexShrink: 0 }}>
                            <XCircle size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: kpis.out_of_stock_count > 0 ? 'var(--admin-danger)' : 'var(--admin-text)' }}>
                        {kpis.out_of_stock_count}
                    </div>
                </div>

                <div className="kpi-card" style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Cost Asset Value</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <DollarSign size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {formatCurrency(kpis.total_inventory_cost_value, displayCurrency, true)}
                    </div>
                </div>

                <div className="kpi-card" style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minWidth: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Retail Valuation</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--admin-success)', flexShrink: 0 }}>
                            <TrendingUp size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                        {formatCurrency(kpis.total_inventory_retail_value, displayCurrency, true)}
                    </div>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="dashboard-card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by SKU, Product, Location..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px', paddingRight: search ? '32px' : '12px' }}
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setPage(1); fetchInventory(); }}
                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={warehouseFilter}
                        onChange={(e) => {
                            setWarehouseFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Warehouses</option>
                        {warehouses.map((wh) => (
                            <option key={wh.id} value={wh.id}>
                                {wh.name} ({wh.code}) {wh.is_default ? '[Default]' : ''}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={stockStatus}
                        onChange={(e) => {
                            setStockStatus(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Stock Statuses</option>
                        <option value="in_stock">In Stock (&gt; Threshold)</option>
                        <option value="low_stock">Low Stock Alerts (≤ Threshold)</option>
                        <option value="out_of_stock">Out of Stock (= 0)</option>
                    </select>

                    <button type="submit" className="btn btn-primary">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>

                    {(search || stockStatus || warehouseFilter) && (
                        <button type="button" className="btn btn-secondary" onClick={handleResetFilters} title="Reset filters">
                            <RotateCcw size={14} />
                        </button>
                    )}
                </form>
            </div>

            {/* Inventory Data Table */}
            <div className="dashboard-card">
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>SKU & Product</th>
                                <th>Warehouse Location</th>
                                <th>Available Stock</th>
                                <th>Cost / Retail Price</th>
                                <th>Threshold / Reorder Qty</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        Loading inventory catalog...
                                    </td>
                                </tr>
                            ) : inventory.length > 0 ? (
                                inventory.map((item) => {
                                    const productName = item.variant?.product?.name || 'N/A';
                                    const brandName = item.variant?.product?.brand?.name;
                                    const available = item.available_qty ?? 0;
                                    const threshold = item.low_stock_threshold ?? 10;
                                    const reorder = item.reorder_qty ?? 50;
                                    const isOut = available <= 0;
                                    const isLow = available > 0 && available <= threshold;
                                    const warehouseName = item.warehouse?.name || 'Main Warehouse';
                                    const locationCode = item.location_code;

                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <div style={{ fontWeight: 700, color: 'var(--admin-text)', fontSize: '0.9rem' }}>
                                                    {item.sku}
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text)', marginTop: '2px' }}>
                                                    {productName}
                                                </div>
                                                {brandName && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                        Brand: {brandName}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Building2 size={13} style={{ color: 'var(--admin-primary)' }} />
                                                    <span>{warehouseName}</span>
                                                </div>
                                                {locationCode ? (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                        Loc: <strong>{locationCode}</strong>
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                        Unassigned Location
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isOut ? 'var(--admin-danger)' : (isLow ? 'var(--admin-warning)' : 'var(--admin-text)') }}>
                                                    {available} units
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    Res: {item.reserved_qty ?? 0} | Dmg: {item.damaged_qty ?? 0}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                                                    Cost: {formatCurrency(item.cost_price ?? 0, displayCurrency, true)}
                                                </div>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                    Retail: {formatCurrency(item.variant?.price ?? 0, displayCurrency, true)}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                                                    Limit: <strong>{threshold}</strong>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                                                    Reorder: <strong>{reorder}</strong>
                                                </div>
                                            </td>
                                            <td>
                                                {isOut ? (
                                                    <span className="badge badge-cancelled">Out of Stock</span>
                                                ) : isLow ? (
                                                    <span className="badge badge-pending">Low Stock</span>
                                                ) : (
                                                    <span className="badge badge-completed">In Stock</span>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {/* Single Primary Action per Row */}
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleOpenAdjustment(item)}
                                                    title="Adjust Stock Quantity, Transfer, or Cost"
                                                >
                                                    <SlidersHorizontal size={14} />
                                                    <span>Adjust Stock</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        No inventory items found matching your search filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total SKUs)
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

            {/* Stock Adjustment Modal */}
            <StockAdjustmentModal
                isOpen={isAdjustmentModalOpen}
                initialItem={selectedItemForAdjust}
                warehouses={warehouses}
                onClose={() => setIsAdjustmentModalOpen(false)}
                onSuccess={(msg) => {
                    showNotify(msg);
                    fetchKpis();
                    fetchInventory();
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
                    fetchInventory();
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
                    fetchInventory();
                }}
            />
        </div>
    );
}
