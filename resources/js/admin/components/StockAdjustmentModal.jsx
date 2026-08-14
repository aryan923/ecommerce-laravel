import React, { useState, useEffect } from 'react';
import {
    X,
    Plus,
    Minus,
    RefreshCw,
    AlertTriangle,
    Package,
    ShieldAlert,
    ArrowRightLeft,
    Check,
    Building2,
    SlidersHorizontal,
    DollarSign,
    Tag,
    MapPin,
    RotateCcw
} from 'lucide-react';
import axios from 'axios';

export default function StockAdjustmentModal({
    isOpen,
    initialItem = null,
    warehouses = [],
    onClose,
    onSuccess,
}) {
    const [type, setType] = useState('add');
    const [warehouseId, setWarehouseId] = useState('');
    const [targetWarehouseId, setTargetWarehouseId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [costPrice, setCostPrice] = useState(0);
    const [lowStockThreshold, setLowStockThreshold] = useState(10);
    const [reorderQty, setReorderQty] = useState(50);
    const [allowBackorder, setAllowBackorder] = useState(false);
    const [locationCode, setLocationCode] = useState('');
    const [reason, setReason] = useState('Supplier Restock');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && initialItem) {
            setType('add');
            setWarehouseId(initialItem.warehouse_id || (warehouses.find(w => w.is_default)?.id || ''));
            setTargetWarehouseId('');
            setQuantity(1);
            setCostPrice(initialItem.cost_price ?? 0);
            setLowStockThreshold(initialItem.low_stock_threshold ?? 10);
            setReorderQty(initialItem.reorder_qty ?? 50);
            setAllowBackorder(initialItem.allow_backorder ?? false);
            setLocationCode(initialItem.location_code ?? '');
            setReason('Supplier Restock');
            setRemarks('');
            setError('');
        }
    }, [isOpen, initialItem]);

    if (!isOpen || !initialItem) return null;

    const currentAvailable = initialItem.available_qty ?? 0;
    const variantId = initialItem.product_variant_id || initialItem.variant?.id || initialItem.id;
    const sku = initialItem.sku || initialItem.variant?.sku || 'N/A';
    const productName = initialItem.variant?.product?.name || initialItem.product_name || 'Product Item';
    const currentWarehouseName = initialItem.warehouse?.name || 'Main Warehouse';

    const handleReasonTypeChange = (newType) => {
        setType(newType);
        if (newType === 'add') setReason('Supplier Restock');
        else if (newType === 'deduct') setReason('Damaged Stock');
        else if (newType === 'damage') setReason('Damaged Write-Off');
        else if (newType === 'set') setReason('Physical Inventory Audit');
        else if (newType === 'transfer') setReason('Inter-Warehouse Transfer');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            if (type === 'transfer') {
                if (!targetWarehouseId) {
                    setError('Please select target destination warehouse for transfer.');
                    setSubmitting(false);
                    return;
                }

                const res = await axios.post('/api/v1/admin/inventory/transfer', {
                    product_variant_id: variantId,
                    source_warehouse_id: parseInt(warehouseId, 10),
                    target_warehouse_id: parseInt(targetWarehouseId, 10),
                    quantity: parseInt(quantity, 10),
                    remarks,
                });

                if (res.data?.success) {
                    onSuccess(res.data?.message || 'Stock transferred successfully.');
                    onClose();
                }
            } else {
                const payload = {
                    product_variant_id: variantId,
                    warehouse_id: warehouseId ? parseInt(warehouseId, 10) : null,
                    type,
                    quantity: parseInt(quantity, 10),
                    cost_price: parseFloat(costPrice),
                    low_stock_threshold: parseInt(lowStockThreshold, 10),
                    reorder_qty: parseInt(reorderQty, 10),
                    allow_backorder: allowBackorder,
                    location_code: locationCode,
                    reason,
                    remarks,
                };

                const res = await axios.post('/api/v1/admin/inventory/adjust', payload);
                if (res.data?.success) {
                    onSuccess(res.data?.message || 'Stock adjusted successfully.');
                    onClose();
                }
            }
        } catch (err) {
            console.error('Stock adjustment error:', err);
            setError(err.response?.data?.message || err.response?.data?.errors?.quantity?.[0] || 'Failed to perform stock adjustment.');
        } finally {
            setSubmitting(false);
        }
    };

    const operations = [
        { key: 'add', label: 'Add Stock', icon: Plus, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
        { key: 'deduct', label: 'Deduct Qty', icon: Minus, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
        { key: 'damage', label: 'Mark Damaged', icon: ShieldAlert, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', border: 'rgba(220, 38, 38, 0.3)' },
        { key: 'set', label: 'Set Absolute', icon: RefreshCw, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
        { key: 'transfer', label: 'Transfer Hub', icon: ArrowRightLeft, color: 'var(--admin-primary)', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.3)' },
    ];

    return (
        <div className="modal-overlay">
            <div
                className="modal-card"
                style={{
                    maxWidth: '680px',
                    width: '96%',
                }}
            >
                {/* Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                color: 'var(--admin-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <SlidersHorizontal size={20} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                    Stock Adjustment & Logistics
                                </h3>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--admin-card-hover)',
                                    color: 'var(--admin-primary)',
                                    border: '1px solid var(--admin-border)'
                                }}>
                                    {sku}
                                </span>
                            </div>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--admin-muted)' }}>
                                Manage stock levels, threshold limits, COGS valuation, and hub transfers
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ borderRadius: '8px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="modal-body">
                    {error && (
                        <div
                            style={{
                                padding: '10px 14px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                marginBottom: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 600
                            }}
                        >
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Product Summary Card */}
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--admin-card-hover)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '12px',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {productName}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span>Warehouse: <strong style={{ color: 'var(--admin-text)' }}>{currentWarehouseName}</strong></span>
                                <span>•</span>
                                <span>Bin / Aisle: <strong style={{ color: 'var(--admin-text)' }}>{initialItem.location_code || 'Unassigned'}</strong></span>
                                <span>•</span>
                                <span>Cost Price: <strong style={{ color: 'var(--admin-text)' }}>₹{initialItem.cost_price ?? 0}</strong></span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                                Current Available
                            </div>
                            <div style={{
                                fontSize: '1.35rem',
                                fontWeight: 800,
                                color: currentAvailable <= 0 ? '#ef4444' : (currentAvailable <= (initialItem.low_stock_threshold || 5) ? '#f59e0b' : '#10b981')
                            }}>
                                {currentAvailable} <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>units</span>
                            </div>
                        </div>
                    </div>

                    <form id="stockAdjustmentForm" onSubmit={handleSubmit}>
                        {/* Adjustment Mode Selector */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                Select Adjustment Operation *
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '6px' }}>
                                {operations.map((op) => {
                                    const Icon = op.icon;
                                    const isSelected = type === op.key;
                                    return (
                                        <button
                                            key={op.key}
                                            type="button"
                                            onClick={() => handleReasonTypeChange(op.key)}
                                            style={{
                                                padding: '8px 6px',
                                                borderRadius: '8px',
                                                border: `1.5px solid ${isSelected ? op.color : 'var(--admin-border)'}`,
                                                backgroundColor: isSelected ? op.bg : 'var(--admin-card-bg)',
                                                color: isSelected ? op.color : 'var(--admin-muted)',
                                                fontWeight: isSelected ? 800 : 600,
                                                fontSize: '0.76rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            <Icon size={16} />
                                            <span>{op.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Warehouses & Quantity Section */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <h4 className="form-section-title">
                                    <Building2 size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Warehouse & Quantity Parameters</span>
                                </h4>
                            </div>

                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                            {type === 'transfer' ? 'Source Warehouse *' : 'Target Warehouse *'}
                                        </label>
                                        <select
                                            className="form-select"
                                            value={warehouseId}
                                            onChange={(e) => setWarehouseId(e.target.value)}
                                            style={{ fontWeight: 600 }}
                                        >
                                            {warehouses.map((wh) => (
                                                <option key={wh.id} value={wh.id}>
                                                    {wh.name} ({wh.code}) {wh.is_default ? '★ [Default]' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {type === 'transfer' && (
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Destination Hub *
                                            </label>
                                            <select
                                                className="form-select"
                                                value={targetWarehouseId}
                                                onChange={(e) => setTargetWarehouseId(e.target.value)}
                                                required
                                                style={{ fontWeight: 600 }}
                                            >
                                                <option value="">Select Target Warehouse</option>
                                                {warehouses.filter(w => String(w.id) !== String(warehouseId)).map((wh) => (
                                                    <option key={wh.id} value={wh.id}>
                                                        {wh.name} ({wh.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                            {type === 'set' ? 'New Total Stock Qty *' : 'Quantity Units *'}
                                        </label>
                                        <input
                                            type="number"
                                            min={type === 'set' ? "0" : "1"}
                                            className="form-control"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            required
                                            style={{ fontWeight: 800, fontSize: '0.92rem' }}
                                        />
                                    </div>

                                    {type !== 'transfer' && (
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Unit Purchase Cost (₹ COGS)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="form-control"
                                                value={costPrice}
                                                onChange={(e) => setCostPrice(e.target.value)}
                                                style={{ fontWeight: 700 }}
                                            />
                                            {type === 'add' && (
                                                <span style={{ fontSize: '0.68rem', color: 'var(--admin-muted)' }}>
                                                    * Updates Weighted Average Cost (AVCO)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Thresholds & Location (Non-transfer) */}
                        {type !== 'transfer' && (
                            <div className="form-section-box">
                                <div className="form-section-header">
                                    <h4 className="form-section-title">
                                        <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
                                        <span>Threshold Alerts & Bin Location</span>
                                    </h4>
                                </div>

                                <div className="form-section-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Low Stock Alert Limit
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                value={lowStockThreshold}
                                                onChange={(e) => setLowStockThreshold(e.target.value)}
                                                style={{ fontWeight: 700 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Suggested Reorder Qty
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                value={reorderQty}
                                                onChange={(e) => setReorderQty(e.target.value)}
                                                style={{ fontWeight: 700 }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                Warehouse Bin / Location Code
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. Aisle 3, Bin 12"
                                                value={locationCode}
                                                onChange={(e) => setLocationCode(e.target.value)}
                                                style={{ fontWeight: 600 }}
                                            />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', padding: '8px 12px', backgroundColor: 'var(--admin-card-hover)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={allowBackorder}
                                                    onChange={(e) => setAllowBackorder(e.target.checked)}
                                                />
                                                <span style={{ fontWeight: 600 }}>Allow customer backorders on storefront when stock is depleted</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Audit Reason & Remarks */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <h4 className="form-section-title">
                                    <Tag size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Audit Log Reason & Remarks</span>
                                </h4>
                            </div>

                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                            Reason Category *
                                        </label>
                                        <select
                                            className="form-select"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            required
                                            style={{ fontWeight: 600 }}
                                        >
                                            {type === 'add' && (
                                                <>
                                                    <option value="Supplier Restock">Supplier Restock (PO Inbound)</option>
                                                    <option value="Customer Return">Customer Return (Restock)</option>
                                                    <option value="Inventory Transfer">Inventory Transfer</option>
                                                    <option value="Audit Correction">Audit Correction</option>
                                                </>
                                            )}
                                            {type === 'deduct' && (
                                                <>
                                                    <option value="Damaged Stock">Damaged / Broken Stock</option>
                                                    <option value="Expired Product">Expired Product</option>
                                                    <option value="Theft / Shrinkage">Theft / Shrinkage</option>
                                                    <option value="Internal Use / Sample">Internal Use / Demo Sample</option>
                                                </>
                                            )}
                                            {type === 'damage' && (
                                                <>
                                                    <option value="Damaged Write-Off">Damaged Write-Off</option>
                                                    <option value="Shipping Damage">Shipping Transit Damage</option>
                                                    <option value="Defective Factory Return">Defective Factory Return</option>
                                                </>
                                            )}
                                            {type === 'set' && (
                                                <>
                                                    <option value="Physical Inventory Audit">Physical Inventory Audit</option>
                                                    <option value="Warehouse Reconciliation">Warehouse Reconciliation</option>
                                                    <option value="System Reset">System Reset</option>
                                                </>
                                            )}
                                            {type === 'transfer' && (
                                                <>
                                                    <option value="Inter-Warehouse Transfer">Inter-Warehouse Transfer</option>
                                                    <option value="Storefront Restock">Storefront Restock</option>
                                                    <option value="Hub Balancing">Hub Rebalancing</option>
                                                </>
                                            )}
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                            Internal Reference / Audit Note
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            placeholder="Enter purchase order number, audit ticket, or reference note..."
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="stockAdjustmentForm"
                        className="btn btn-primary btn-sm"
                        disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '7px 18px' }}
                    >
                        <Check size={15} />
                        <span>{submitting ? 'Processing...' : (type === 'transfer' ? 'Confirm Stock Transfer' : 'Confirm Stock Adjustment')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
