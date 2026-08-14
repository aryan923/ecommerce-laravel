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
    ShieldAlert,
    Eye,
    TrendingDown,
    Clock
} from 'lucide-react';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import InventoryHistoryModal from '../components/InventoryHistoryModal';

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [kpis, setKpis] = useState({
        total_skus: 0,
        total_stock_units: 0,
        low_stock_count: 0,
        out_of_stock_count: 0,
        reserved_stock_units: 0,
        damaged_stock_units: 0,
        total_inventory_value: 0,
    });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);

    // Filters State
    const [search, setSearch] = useState('');
    const [stockStatus, setStockStatus] = useState('');
    const [page, setPage] = useState(1);

    // Modals State
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedItemForAdjust, setSelectedItemForAdjust] = useState(null);

    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedSkuForHistory, setSelectedSkuForHistory] = useState('');

    const [selectedDetailItem, setSelectedDetailItem] = useState(null);

    const fetchKpis = async () => {
        try {
            const res = await axios.get('/api/v1/admin/inventory/kpis');
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
            params.append('page', page);
            params.append('per_page', 10);

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
    }, [page, stockStatus]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchInventory();
    };

    const handleResetFilters = () => {
        setSearch('');
        setStockStatus('');
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

    const handleOpenHistory = (sku = '') => {
        setSelectedSkuForHistory(sku);
        setIsHistoryModalOpen(true);
    };

    const handleExportCsv = async () => {
        try {
            const res = await axios.get('/api/v1/admin/inventory/export', { responseType: 'blob' });
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

            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Inventory Management</h2>
                    <p className="page-header-subtitle">Real-time SKU stock tracking, atomic reservations, low stock alerts, and audit logs</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => handleOpenHistory('')}>
                        <History size={16} />
                        <span>Transaction Audit Logs</span>
                    </button>
                    <button className="btn btn-primary" onClick={handleExportCsv}>
                        <Download size={16} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Metric Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                gap: '12px',
                marginBottom: '24px'
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
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total SKUs</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <Boxes size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Available</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--admin-success)', flexShrink: 0 }}>
                            <Package size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {kpis.total_stock_units}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStockStatus('low_stock'); setPage(1); }}
                    style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Low Stock</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--admin-warning)', flexShrink: 0 }}>
                            <AlertTriangle size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: kpis.low_stock_count > 0 ? 'var(--admin-warning)' : 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {kpis.low_stock_count}
                    </div>
                </div>

                <div
                    className="kpi-card"
                    onClick={() => { setStockStatus('out_of_stock'); setPage(1); }}
                    style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minWidth: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', gap: '6px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Out of Stock</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--admin-danger)', flexShrink: 0 }}>
                            <XCircle size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: kpis.out_of_stock_count > 0 ? 'var(--admin-danger)' : 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Res / Dmg</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(148, 163, 184, 0.1)', color: 'var(--admin-muted)', flexShrink: 0 }}>
                            <Clock size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {kpis.reserved_stock_units || kpis.reserved_stock_count || 0} / {kpis.damaged_stock_units || kpis.damaged_stock_count || 0}
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
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Valuation</span>
                        <div style={{ padding: '4px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--admin-primary)', flexShrink: 0 }}>
                            <DollarSign size={14} />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`$${kpis.total_inventory_value?.toLocaleString()}`}>
                        ${kpis.total_inventory_value?.toLocaleString()}
                    </div>
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
                            placeholder="Search by SKU, Product Name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>

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

                    {(search || stockStatus) && (
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
                                <th>SKU</th>
                                <th>Product Details</th>
                                <th>Available Stock</th>
                                <th>Breakdown (Res/Com/Dmg/Ret)</th>
                                <th>Alert Limit</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
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
                                    const isOut = available <= 0;
                                    const isLow = available > 0 && available <= threshold;

                                    return (
                                        <tr key={item.id}>
                                            <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>
                                                {item.sku}
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{productName}</div>
                                                {brandName && (
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                        Brand: {brandName}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isOut ? 'var(--admin-danger)' : (isLow ? 'var(--admin-warning)' : 'var(--admin-text)') }}>
                                                    {available} units
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <span title="Reserved Stock">Res: <strong>{item.reserved_qty ?? 0}</strong></span>
                                                    <span>•</span>
                                                    <span title="Committed/Sold Stock">Com: <strong>{item.committed_qty ?? 0}</strong></span>
                                                    <span>•</span>
                                                    <span title="Damaged Stock" style={{ color: item.damaged_qty > 0 ? 'var(--admin-danger)' : 'inherit' }}>Dmg: <strong>{item.damaged_qty ?? 0}</strong></span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--admin-muted)', fontWeight: 600 }}>
                                                {threshold}
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
                                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleOpenAdjustment(item)}
                                                        title="Adjust Stock Quantity & Threshold"
                                                    >
                                                        <SlidersHorizontal size={14} />
                                                        <span>Adjust</span>
                                                    </button>

                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleOpenHistory(item.sku)}
                                                        title="View History Logs"
                                                    >
                                                        <History size={14} />
                                                    </button>

                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => setSelectedDetailItem(item)}
                                                        title="View Single Item Detail"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--admin-muted)' }}>
                                        No inventory items found matching your filters.
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
                onClose={() => setIsAdjustmentModalOpen(false)}
                onSuccess={(msg) => {
                    showNotify(msg);
                    fetchKpis();
                    fetchInventory();
                }}
            />

            {/* Inventory History Modal */}
            <InventoryHistoryModal
                isOpen={isHistoryModalOpen}
                initialSku={selectedSkuForHistory}
                onClose={() => setIsHistoryModalOpen(false)}
            />

            {/* Item Detail Modal */}
            {selectedDetailItem && (
                <div className="modal-backdrop" style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1050,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                }}>
                    <div className="modal-container" style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        borderRadius: '12px',
                        width: '100%',
                        maxWidth: '520px',
                        padding: '24px',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--admin-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)' }}>SKU Detail: {selectedDetailItem.sku}</h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDetailItem(null)} style={{ padding: '4px' }}>
                                <XCircle size={16} />
                            </button>
                        </div>

                        <div style={{ backgroundColor: 'var(--admin-bg)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{selectedDetailItem.variant?.product?.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '4px' }}>
                                Price: ${selectedDetailItem.variant?.price} | Stock Status: <strong>{selectedDetailItem.available_qty <= 0 ? 'Out of Stock' : (selectedDetailItem.available_qty <= selectedDetailItem.low_stock_threshold ? 'Low Stock' : 'In Stock')}</strong>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--admin-bg)' }}>
                                <div style={{ color: 'var(--admin-muted)' }}>Available Stock</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text)', marginTop: '4px' }}>{selectedDetailItem.available_qty}</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--admin-bg)' }}>
                                <div style={{ color: 'var(--admin-muted)' }}>Reserved Stock</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text)', marginTop: '4px' }}>{selectedDetailItem.reserved_qty ?? 0}</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--admin-bg)' }}>
                                <div style={{ color: 'var(--admin-muted)' }}>Committed Stock</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-text)', marginTop: '4px' }}>{selectedDetailItem.committed_qty ?? 0}</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--admin-bg)' }}>
                                <div style={{ color: 'var(--admin-muted)' }}>Damaged Stock</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--admin-danger)', marginTop: '4px' }}>{selectedDetailItem.damaged_qty ?? 0}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedDetailItem(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
