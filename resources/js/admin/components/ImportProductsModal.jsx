import React, { useState } from 'react';
import { Upload, X, Check, FileText, Download, Table, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function ImportProductsModal({ isOpen, onClose, onSuccess }) {
    const [importMode, setImportMode] = useState('csv'); // 'csv' | 'json'
    const [csvFile, setCsvFile] = useState(null);
    const [parsedProducts, setParsedProducts] = useState([]);
    const [parseError, setParseError] = useState('');

    const defaultJsonTemplate = [
        { name: 'boAt Rockerz 255 Pro+', price: 1299.00, sku: 'BOAT-ROCKERZ-255', stock_qty: 50, type: 'simple', status: 'active', requires_shipping: true, weight: 0.25 },
        { name: 'Noise ColorFit Ultra 3', price: 2999.00, sku: 'NOISE-ULTRA-3', stock_qty: 30, type: 'simple', status: 'active', requires_shipping: true, weight: 0.35 }
    ];

    const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultJsonTemplate, null, 2));
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    // Handle CSV File Select & Parse
    const handleCsvFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvFile(file);
        setParseError('');

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const text = evt.target.result;
                const rows = text.split(/\r\n|\n/).filter((r) => r.trim() !== '');

                if (rows.length < 2) {
                    setParseError('CSV file must contain a header row and at least one data row.');
                    setParsedProducts([]);
                    return;
                }

                const headers = rows[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());
                
                // Validate required headers
                if (!headers.includes('name') || !headers.includes('price')) {
                    setParseError('CSV header missing mandatory columns: "name" and "price".');
                    setParsedProducts([]);
                    return;
                }

                const productsList = [];
                for (let i = 1; i < rows.length; i++) {
                    const values = rows[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
                    if (values.length < headers.length) continue;

                    const rowObj = {};
                    headers.forEach((h, idx) => {
                        rowObj[h] = values[idx];
                    });

                    productsList.push({
                        name: rowObj.name,
                        price: parseFloat(rowObj.price) || 0,
                        sku: rowObj.sku || `IMP-CSV-${i}`,
                        stock_qty: rowObj.stock_qty ? parseInt(rowObj.stock_qty) : 10,
                        type: rowObj.type || 'simple',
                        status: rowObj.status || 'active',
                        weight: rowObj.weight ? parseFloat(rowObj.weight) : null,
                        requires_shipping: rowObj.requires_shipping !== undefined ? rowObj.requires_shipping === 'true' || rowObj.requires_shipping === '1' : true,
                    });
                }

                setParsedProducts(productsList);
            } catch (err) {
                console.error('CSV Parsing Error:', err);
                setParseError('Failed to parse CSV file format.');
            }
        };

        reader.readAsText(file);
    };

    // Download Sample CSV Template Trigger
    const handleDownloadSampleCsv = () => {
        const csvContent =
            'name,price,sku,stock_qty,type,status,weight,requires_shipping\n' +
            '"boAt Airdopes 141 TWS",1499.00,"BOAT-AIR-141",50,"simple","active",0.20,true\n' +
            '"Noise Pulse 2 Max Smartwatch",2499.00,"NOISE-PULSE-2",35,"simple","active",0.30,true\n' +
            '"Fastrack Revoltt FS1",1999.00,"FASTRACK-FS1",25,"simple","active",0.25,true\n';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'sample_products_import.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSubmitting(true);

        try {
            let productsToImport = [];
            if (importMode === 'csv') {
                if (parsedProducts.length === 0) {
                    setErrorMsg('Please upload a valid CSV file with product rows.');
                    setSubmitting(false);
                    return;
                }
                productsToImport = parsedProducts;
            } else {
                const parsed = JSON.parse(jsonInput);
                productsToImport = Array.isArray(parsed) ? parsed : [parsed];
            }

            const response = await axios.post('/api/v1/admin/products/import', {
                products: productsToImport
            });

            if (response.data?.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Import error:', err);
            setErrorMsg(err.response?.data?.message || 'Invalid CSV/JSON payload or import processing failure.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '720px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Upload size={22} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title">Bulk Product Importer (CSV / JSON)</h3>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Import Mode Switcher */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            className={`btn btn-sm ${importMode === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setImportMode('csv')}
                        >
                            <FileText size={14} />
                            <span>CSV File Upload</span>
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${importMode === 'json' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setImportMode('json')}
                        >
                            <Table size={14} />
                            <span>Raw JSON Payload</span>
                        </button>
                    </div>

                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleDownloadSampleCsv}>
                        <Download size={14} />
                        <span>Download Sample CSV Template</span>
                    </button>
                </div>

                {errorMsg && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleImportSubmit}>
                    {importMode === 'csv' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div
                                style={{
                                    border: '2px dashed var(--admin-border)',
                                    borderRadius: '8px',
                                    padding: '24px',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--admin-bg)',
                                    cursor: 'pointer',
                                }}
                            >
                                <Upload size={32} style={{ color: 'var(--admin-primary)', marginBottom: '8px' }} />
                                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Select .CSV Product File</p>
                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>Headers: name, price, sku, stock_qty, type, status, weight</span>

                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCsvFileChange}
                                    style={{ marginTop: '16px', display: 'block', margin: '16px auto 0' }}
                                />
                            </div>

                            {parseError && (
                                <div style={{ color: 'var(--admin-danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    {parseError}
                                </div>
                            )}

                            {/* Parsed CSV Preview Table */}
                            {parsedProducts.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Check size={16} />
                                        <span>Parsed {parsedProducts.length} Product Records Ready for Import:</span>
                                    </div>
                                    <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto', fontSize: '0.8rem' }}>
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Price (₹)</th>
                                                    <th>SKU</th>
                                                    <th>Stock</th>
                                                    <th>Type</th>
                                                    <th>Shipping</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {parsedProducts.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td style={{ fontWeight: 600 }}>{row.name}</td>
                                                        <td>₹{row.price}</td>
                                                        <td>{row.sku}</td>
                                                        <td>{row.stock_qty}</td>
                                                        <td>{row.type}</td>
                                                        <td>{row.requires_shipping ? 'Physical' : 'Digital'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                Batch JSON Payload
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
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting || (importMode === 'csv' && parsedProducts.length === 0)}>
                            <Check size={16} />
                            <span>{submitting ? 'Enqueuing Batch Import...' : 'Start Product Import'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
