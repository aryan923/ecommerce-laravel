import React, { useState } from 'react';
import { CheckSquare, X, Zap } from 'lucide-react';
import { getCurrencySymbol } from '../utils/currency';

export default function BulkActionsBar({
    selectedIds,
    displayCurrency = 'INR',
    onClearSelection,
    onExecuteBulk
}) {
    const [action, setAction] = useState('activate');
    const [inputValue, setInputValue] = useState('');

    if (!selectedIds || selectedIds.length === 0) {
        return null;
    }

    const symbol = getCurrencySymbol(displayCurrency);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (action === 'delete' && !window.confirm(`Are you sure you want to BULK DELETE ${selectedIds.length} selected products?`)) {
            return;
        }

        let payloadData = {};
        if (action === 'update_price') {
            payloadData.price = parseFloat(inputValue);
        } else if (action === 'update_stock') {
            payloadData.stock_qty = parseInt(inputValue);
        }

        onExecuteBulk(action, payloadData);
    };

    return (
        <div className="bulk-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--admin-text)' }}>
                <CheckSquare size={18} style={{ color: 'var(--admin-primary)' }} />
                <span>{selectedIds.length} items selected</span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <select
                    className="form-select"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                    <option value="activate">Bulk Activate</option>
                    <option value="deactivate">Bulk Deactivate</option>
                    <option value="archive">Bulk Archive</option>
                    <option value="update_price">Bulk Set Base Price ({symbol})</option>
                    <option value="update_stock">Bulk Set Stock Qty</option>
                    <option value="delete">Bulk Delete</option>
                </select>

                {(action === 'update_price' || action === 'update_stock') && (
                    <input
                        type="number"
                        step={action === 'update_price' ? '0.01' : '1'}
                        className="form-control"
                        placeholder={action === 'update_price' ? `e.g. 1499.00 (${symbol})` : 'e.g. 50'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        required
                        style={{ width: '150px', padding: '6px 10px', fontSize: '0.85rem' }}
                    />
                )}

                <button type="submit" className="btn btn-primary btn-sm">
                    <Zap size={14} />
                    <span>Apply Action</span>
                </button>
            </form>

            <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClearSelection}
                title="Clear selection"
            >
                <X size={14} />
            </button>
        </div>
    );
}
