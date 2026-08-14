import React, { useState } from 'react';
import {
    X,
    UploadCloud,
    FileText,
    Download,
    AlertTriangle,
    CheckCircle2,
    Check,
    Building2,
    Boxes,
    FileSpreadsheet
} from 'lucide-react';
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
        <div className="modal-overlay">
            <div
                className="modal-card"
                style={{
                    maxWidth: '580px',
                    width: '96%',
                    maxHeight: '90vh',
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
                            <UploadCloud size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                Bulk Stock CSV Import
                            </h3>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--admin-muted)' }}>
                                Ingest physical stock-taking counts, batch restocks, and warehouse reconciliations
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

                    {result && (
                        <div style={{ marginBottom: '14px' }}>
                            <div style={{
                                padding: '10px 14px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#10b981',
                                fontSize: '0.82rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 600,
                                marginBottom: result.skipped_count > 0 || (result.warnings && result.warnings.length > 0) ? '8px' : '0'
                            }}>
                                <CheckCircle2 size={16} />
                                <span>Processed <strong>{result.rows_processed}</strong> rows. Updated <strong>{result.skus_updated}</strong> SKUs in <strong>{result.warehouse}</strong>.</span>
                            </div>

                            {result.skipped_count > 0 && (
                                <div style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                    border: '1px solid rgba(245, 158, 11, 0.25)',
                                    color: '#f59e0b',
                                    fontSize: '0.76rem'
                                }}>
                                    <strong>{result.skipped_count} SKU(s) Skipped:</strong> {result.skipped_skus?.join(', ')}
                                </div>
                            )}

                            {result.warnings && result.warnings.length > 0 && (
                                <div style={{
                                    marginTop: '8px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--admin-card-hover)',
                                    border: '1px solid var(--admin-border)',
                                    color: 'var(--admin-text)',
                                    fontSize: '0.75rem',
                                    maxHeight: '100px',
                                    overflowY: 'auto'
                                }}>
                                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>Import Notes & Warnings:</div>
                                    <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                        {result.warnings.map((w, idx) => (
                                            <li key={idx}>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <form id="bulkStockForm" onSubmit={handleSubmit}>
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <h4 className="form-section-title">
                                    <Building2 size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Destination Warehouse Location</span>
                                </h4>
                            </div>

                            <div className="form-section-body">
                                <select
                                    className="form-select"
                                    value={warehouseId}
                                    onChange={(e) => setWarehouseId(e.target.value)}
                                    style={{ fontWeight: 600 }}
                                >
                                    <option value="">Default Primary Warehouse</option>
                                    {warehouses.map((wh) => (
                                        <option key={wh.id} value={wh.id}>
                                            {wh.name} ({wh.code}) {wh.is_default ? '★ [Default]' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* File Upload Drop Zone */}
                        <div style={{
                            border: file ? '2px solid var(--admin-primary)' : '2px dashed var(--admin-border)',
                            borderRadius: '12px',
                            padding: '24px 16px',
                            textAlign: 'center',
                            backgroundColor: file ? 'rgba(99, 102, 241, 0.04)' : 'var(--admin-card-hover)',
                            marginBottom: '14px',
                            transition: 'all 0.15s ease'
                        }}>
                            <FileSpreadsheet size={36} style={{ color: file ? 'var(--admin-primary)' : 'var(--admin-muted)', marginBottom: '8px' }} />
                            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-text)', marginBottom: '2px' }}>
                                {file ? file.name : 'Select or Drop Stock Audit CSV File'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginBottom: '14px' }}>
                                Format: SKU, Action (add / deduct / set / damage), Quantity, Unit Cost, Low Limit, Reorder Qty, Location Code
                            </div>

                            <input
                                type="file"
                                accept=".csv,text/csv"
                                id="csv-file-input"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="csv-file-input"
                                className="btn btn-secondary btn-sm"
                                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                            >
                                <UploadCloud size={14} />
                                <span>{file ? 'Change File' : 'Browse Local CSV'}</span>
                            </label>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleDownloadTemplate}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}
                    >
                        <Download size={13} />
                        <span>Download Sample CSV Template</span>
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={uploading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="bulkStockForm"
                            className="btn btn-primary btn-sm"
                            disabled={uploading || !file}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '7px 16px' }}
                        >
                            <Check size={15} />
                            <span>{uploading ? 'Processing CSV...' : 'Ingest & Audit Stock'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
