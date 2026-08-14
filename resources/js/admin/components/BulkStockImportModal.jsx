import React, { useState } from 'react';
import { X, UploadCloud, FileText, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function BulkStockImportModal({
    isOpen,
    warehouses = [],
    onClose,
    onSuccess,
}) {
    const [file, setFile] = useState(null);
    const [warehouseId, setWarehouseId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await axios.get('/api/v1/admin/inventory/sample-template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'bulk-stock-import-template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download template error:', err);
            setError('Failed to download CSV template.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file to upload.');
            return;
        }

        setError('');
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        if (warehouseId) {
            formData.append('warehouse_id', warehouseId);
        }

        try {
            const res = await axios.post('/api/v1/admin/inventory/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data?.success) {
                setResult(res.data.data);
                if (onSuccess) onSuccess('Bulk stock import processed successfully.');
            }
        } catch (err) {
            console.error('CSV import error:', err);
            setError(err.response?.data?.message || 'Failed to process bulk stock CSV import.');
        } finally {
            setUploading(false);
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
                maxWidth: '540px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--admin-border)',
                overflow: 'hidden',
                animation: 'modalSlideIn 0.2s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--admin-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
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
                            <UploadCloud size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)' }}>Bulk Stock Audit Import</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>Upload CSV file for physical inventory stock-taking audits</span>
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
                            marginBottom: '16px'
                        }}>
                            <AlertTriangle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {result && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{
                                padding: '12px 16px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                color: 'var(--admin-success)',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: result.skipped_count > 0 || (result.warnings && result.warnings.length > 0) ? '8px' : '0'
                            }}>
                                <CheckCircle size={16} />
                                <span>Processed <strong>{result.rows_processed}</strong> rows. Updated <strong>{result.skus_updated}</strong> SKUs in <strong>{result.warehouse}</strong>.</span>
                            </div>

                            {result.skipped_count > 0 && (
                                <div style={{
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    color: 'var(--admin-warning)',
                                    fontSize: '0.8rem'
                                }}>
                                    <strong>{result.skipped_count} SKU(s) Skipped:</strong> {result.skipped_skus?.join(', ')}
                                </div>
                            )}

                            {result.warnings && result.warnings.length > 0 && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '10px 14px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    color: 'var(--admin-text)',
                                    fontSize: '0.78rem',
                                    maxHeight: '120px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>Import Notes & Warnings:</div>
                                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                        {result.warnings.map((w, idx) => (
                                            <li key={idx}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--admin-text)' }}>
                            Target Warehouse Location
                        </label>
                        <select
                            className="form-select"
                            value={warehouseId}
                            onChange={(e) => setWarehouseId(e.target.value)}
                        >
                            <option value="">Default Primary Warehouse</option>
                            {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>
                                    {wh.name} ({wh.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{
                        border: '2px dashed var(--admin-border)',
                        borderRadius: '10px',
                        padding: '24px',
                        textAlign: 'center',
                        backgroundColor: 'var(--admin-bg)',
                        marginBottom: '16px'
                    }}>
                        <FileText size={32} style={{ color: 'var(--admin-muted)', marginBottom: '8px' }} />
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>
                            {file ? file.name : 'Select or Drop Stock Audit CSV'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', marginBottom: '14px' }}>
                            Columns: SKU, Action (add / deduct / set / damage), Quantity, Unit Cost, Low Limit, Reorder Qty, Location Code
                        </div>
                        <input
                            type="file"
                            accept=".csv,text/csv"
                            id="csv-file-input"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="csv-file-input" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                            Choose CSV File
                        </label>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownloadTemplate}>
                            <Download size={14} />
                            <span>Download Template CSV</span>
                        </button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={uploading || !file}>
                                {uploading ? 'Processing CSV...' : 'Upload & Audit Stock'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
