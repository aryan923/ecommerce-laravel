import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, RefreshCw, AlertTriangle, Package, ShieldAlert, ArrowRightLeft } from 'lucide-react';
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

    return (
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
                maxWidth: '640px',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--admin-border)',
                animation: 'modalSlideIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: 'var(--admin-card-bg)',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--admin-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Package size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)' }}>Adjust Inventory & Thresholds</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>SKU: <strong>{sku}</strong> ({currentWarehouseName})</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ padding: '6px' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--admin-danger)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px'
                        }}>
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Product Card Overview */}
                    <div style={{
                        backgroundColor: 'var(--admin-bg)',
                        padding: '14px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--admin-text)' }}>{productName}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                Location: <strong>{initialItem.location_code || 'Unassigned'}</strong> | Unit Cost: <strong>₹{initialItem.cost_price ?? 0}</strong>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>Available Stock</div>
                            <div style={{
                                fontSize: '1.4rem',
                                fontWeight: 800,
                                color: currentAvailable <= 0 ? 'var(--admin-danger)' : (currentAvailable <= (initialItem.low_stock_threshold || 5) ? 'var(--admin-warning)' : 'var(--admin-success)')
                            }}>
                                {currentAvailable} units
                            </div>
                        </div>
                    </div>

                    {/* Action Selector Tabs */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--admin-text)' }}>Select Adjustment Operation</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px' }}>
                            <button
                                type="button"
                                onClick={() => handleReasonTypeChange('add')}
                                style={{
                                    padding: '8px 4px',
                                    borderRadius: '6px',
                                    border: `1.5px solid ${type === 'add' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                    backgroundColor: type === 'add' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    color: type === 'add' ? 'var(--admin-primary)' : 'var(--admin-text)',
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Plus size={16} />
                                <span>Add Stock</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleReasonTypeChange('deduct')}
                                style={{
                                    padding: '8px 4px',
                                    borderRadius: '6px',
                                    border: `1.5px solid ${type === 'deduct' ? 'var(--admin-danger)' : 'var(--admin-border)'}`,
                                    backgroundColor: type === 'deduct' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                    color: type === 'deduct' ? 'var(--admin-danger)' : 'var(--admin-text)',
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Minus size={16} />
                                <span>Deduct</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleReasonTypeChange('damage')}
                                style={{
                                    padding: '8px 4px',
                                    borderRadius: '6px',
                                    border: `1.5px solid ${type === 'damage' ? '#dc2626' : 'var(--admin-border)'}`,
                                    backgroundColor: type === 'damage' ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
                                    color: type === 'damage' ? '#dc2626' : 'var(--admin-text)',
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <ShieldAlert size={16} />
                                <span>Mark Damaged</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleReasonTypeChange('set')}
                                style={{
                                    padding: '8px 4px',
                                    borderRadius: '6px',
                                    border: `1.5px solid ${type === 'set' ? '#f59e0b' : 'var(--admin-border)'}`,
                                    backgroundColor: type === 'set' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                    color: type === 'set' ? '#f59e0b' : 'var(--admin-text)',
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <RefreshCw size={16} />
                                <span>Set Absolute</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleReasonTypeChange('transfer')}
                                style={{
                                    padding: '8px 4px',
                                    borderRadius: '6px',
                                    border: `1.5px solid ${type === 'transfer' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                                    backgroundColor: type === 'transfer' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    color: type === 'transfer' ? 'var(--admin-primary)' : 'var(--admin-text)',
                                    fontWeight: 600,
                                    fontSize: '0.78rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <ArrowRightLeft size={16} />
                                <span>Transfer</span>
                            </button>
                        </div>
                    </div>

                    {/* Warehouse & Destination Selection Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                                {type === 'transfer' ? 'Source Warehouse' : 'Target Warehouse'}
                            </label>
                            <select
                                className="form-select"
                                value={warehouseId}
                                onChange={(e) => setWarehouseId(e.target.value)}
                            >
                                {warehouses.map((wh) => (
                                    <option key={wh.id} value={wh.id}>
                                        {wh.name} ({wh.code}) {wh.is_default ? '[Default]' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {type === 'transfer' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                                    Destination Warehouse <span style={{ color: 'var(--admin-danger)' }}>*</span>
                                </label>
                                <select
                                    className="form-select"
                                    value={targetWarehouseId}
                                    onChange={(e) => setTargetWarehouseId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Destination Warehouse</option>
                                    {warehouses.filter(w => String(w.id) !== String(warehouseId)).map((wh) => (
                                        <option key={wh.id} value={wh.id}>
                                            {wh.name} ({wh.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Quantity & Unit Cost Price Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                                {type === 'set' ? 'New Total Available Qty' : 'Quantity Units'} <span style={{ color: 'var(--admin-danger)' }}>*</span>
                            </label>
                            <input
                                type="number"
                                min={type === 'set' ? "0" : "1"}
                                className="form-control"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>

                        {type !== 'transfer' && (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                                    Unit Purchase Cost Price (COGS ₹)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="form-control"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Thresholds & Location Code Row */}
                    {type !== 'transfer' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                                    Low Stock Alert Limit
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    value={lowStockThreshold}
                                    onChange={(e) => setLowStockThreshold(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                                    Suggested Reorder Qty
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    value={reorderQty}
                                    onChange={(e) => setReorderQty(e.target.value)}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                                    Storage Location Code
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Aisle 3, Bin 12"
                                    value={locationCode}
                                    onChange={(e) => setLocationCode(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Allow Backorders Toggle */}
                    {type !== 'transfer' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                                <input
                                    type="checkbox"
                                    checked={allowBackorder}
                                    onChange={(e) => setAllowBackorder(e.target.checked)}
                                />
                                <span>Allow customer backorders when available stock reaches zero</span>
                            </label>
                        </div>
                    )}

                    {/* Reason & Remarks */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                            Reason Category <span style={{ color: 'var(--admin-danger)' }}>*</span>
                        </label>
                        <select
                            className="form-select"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            {type === 'add' && (
                                <>
                                    <option value="Supplier Restock">Supplier Restock</option>
                                    <option value="Customer Return">Customer Return</option>
                                    <option value="Inventory Transfer">Inventory Transfer</option>
                                    <option value="Audit Correction">Audit Correction</option>
                                </>
                            )}
                            {type === 'deduct' && (
                                <>
                                    <option value="Damaged Stock">Damaged / Broken Stock</option>
                                    <option value="Expired Product">Expired Product</option>
                                    <option value="Theft / Shrinkage">Theft / Shrinkage</option>
                                    <option value="Internal Use / Sample">Internal Use / Sample</option>
                                </>
                            )}
                            {type === 'damage' && (
                                <>
                                    <option value="Damaged Write-Off">Damaged Write-Off</option>
                                    <option value="Shipping Damage">Shipping Damage</option>
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
                                    <option value="Hub Balancing">Hub Balancing</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                            Internal Remarks / Reference Code
                        </label>
                        <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Enter purchase order number, audit ticket, or reference note..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>

                    {/* Action Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : (type === 'transfer' ? 'Confirm Stock Transfer' : 'Confirm Stock Adjustment')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
