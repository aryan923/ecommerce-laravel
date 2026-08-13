import React, { useState } from 'react';
import { Upload, X, Check, FileText } from 'lucide-react';
import axios from 'axios';

export default function ImportProductsModal({ isOpen, onClose, onSuccess }) {
    const [jsonInput, setJsonInput] = useState(
        JSON.stringify(
            [
                { name: 'Imported Smartwatch v1', price: 199.99, sku: 'IMP-SW-01', stock_qty: 25 },
                { name: 'Imported Bluetooth Speaker', price: 89.99, sku: 'IMP-SP-01', stock_qty: 40 }
            ],
            null,
            2
        )
    );
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSubmitting(true);

        try {
            const parsed = JSON.parse(jsonInput);
            const response = await axios.post('/api/v1/admin/products/import', {
                products: Array.isArray(parsed) ? parsed : [parsed]
            });

            if (response.data?.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Import error:', err);
            setErrorMsg(err.response?.data?.message || 'Invalid JSON input or import format error.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Upload size={20} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title">Bulk Product Import</h3>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', marginBottom: '16px' }}>
                    Paste your product data array below. Skus will automatically be generated if omitted.
                </p>

                {errorMsg && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px' }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleImportSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                            JSON Batch Payload
                        </label>
                        <textarea
                            className="form-control"
                            rows={8}
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            <Check size={16} />
                            <span>{submitting ? 'Importing...' : 'Start Import Batch'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
