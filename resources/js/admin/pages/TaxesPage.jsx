import React, { useState, useEffect } from 'react';
import {
    Percent,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Shield,
    Settings,
    FileText,
    Check,
    X,
    Filter,
    RefreshCw,
    Tag,
    Zap,
    Ticket,
    BookOpen,
    BarChart3,
    Download,
    Truck,
    DollarSign,
    Layers
} from 'lucide-react';

export default function TaxesPage() {
    const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'rates' | 'settings' | 'logs'
    const [loading, setLoading] = useState(true);

    // Data States
    const [taxClasses, setTaxClasses] = useState([]);
    const [taxRates, setTaxRates] = useState([]);
    const [taxSettings, setTaxSettings] = useState({
        pricing_mode: 'tax_exclusive',
        store_gstin: '27AAAAA0000A1Z5',
        store_state_code: 'MH',
        default_tax_class_id: ''
    });
    const [auditLogs, setAuditLogs] = useState([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modals
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [classModalTab, setClassModalTab] = useState('details'); // 'details' | 'rates'
    const [editingClass, setEditingClass] = useState(null);
    const [editingRate, setEditingRate] = useState(null);

    // Form States
    const [classForm, setClassForm] = useState({
        name: '',
        code: '',
        description: '',
        is_default: false,
        status: 'active',
        cgst_rate: '9.00',
        sgst_rate: '9.00',
        igst_rate: '18.00',
        state_code: 'MH'
    });

    const [rateForm, setRateForm] = useState({
        tax_class_id: '',
        name: '',
        type: 'cgst',
        rate: '9.00',
        state_code: 'MH',
        country_code: 'IN',
        is_active: true
    });

    // HSN Directory & GST Report States
    const [hsnCodes, setHsnCodes] = useState([]);
    const [isHsnModalOpen, setIsHsnModalOpen] = useState(false);
    const [editingHsn, setEditingHsn] = useState(null);
    const [hsnForm, setHsnForm] = useState({
        code: '',
        description: '',
        type: 'hsn',
        tax_class_id: '',
        status: 'active'
    });
    const [hsnSearch, setHsnSearch] = useState('');

    const [reportStartDate, setReportStartDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [reportEndDate, setReportEndDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [gstReport, setGstReport] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    useEffect(() => {
        fetchTaxData();
        fetchGstReport();
    }, []);

    const fetchTaxData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const headers = { Authorization: `Bearer ${token}` };

            const [classesRes, ratesRes, settingsRes, logsRes, hsnRes] = await Promise.all([
                fetch('/api/v1/admin/tax-classes', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/api/v1/admin/tax-rates', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/api/v1/admin/tax/settings', { headers }).then(r => r.json()).catch(() => ({ data: null })),
                fetch('/api/v1/admin/tax/audit-logs', { headers }).then(r => r.json()).catch(() => ({ data: [] })),
                fetch('/api/v1/admin/tax/hsn-codes', { headers }).then(r => r.json()).catch(() => ({ data: [] }))
            ]);

            const fetchedClasses = classesRes.data?.data || classesRes.data || [
                { id: 1, name: 'Standard GST 18%', code: 'GST_18', description: 'Standard electronic & consumer goods tax rate', is_default: true, status: 'active', rates: [] },
                { id: 2, name: 'Reduced GST 5%', code: 'GST_5', description: 'Essential apparel & raw items rate', is_default: false, status: 'active', rates: [] },
                { id: 3, name: 'Zero Rated 0%', code: 'EXEMPT_0', description: 'Tax exempt agriculture goods', is_default: false, status: 'active', rates: [] }
            ];

            const fetchedRates = ratesRes.data?.data || ratesRes.data || [
                { id: 1, tax_class_id: 1, name: 'CGST 9%', type: 'cgst', rate: '9.0000', state_code: 'MH', country_code: 'IN', status: 'active' },
                { id: 2, tax_class_id: 1, name: 'SGST 9%', type: 'sgst', rate: '9.0000', state_code: 'MH', country_code: 'IN', status: 'active' },
                { id: 3, tax_class_id: 1, name: 'IGST 18%', type: 'igst', rate: '18.0000', state_code: null, country_code: 'IN', status: 'active' }
            ];

            const fetchedHsn = hsnRes.data?.data || hsnRes.data || [
                { id: 1, code: '8517', description: 'Smartphones & Mobile Telephones', type: 'hsn', tax_class_id: 1, status: 'active' },
                { id: 2, code: '6109', description: 'T-Shirts, Singlets & Vests', type: 'hsn', tax_class_id: 2, status: 'active' },
                { id: 3, code: '9983', description: 'IT Consulting & Software Support', type: 'sac', tax_class_id: 1, status: 'active' }
            ];

            setTaxClasses(fetchedClasses);
            setTaxRates(fetchedRates);
            setHsnCodes(fetchedHsn);

            if (settingsRes.data) {
                setTaxSettings(settingsRes.data);
            }
            setAuditLogs(logsRes.data?.data || logsRes.data || []);

            if (fetchedClasses.length > 0 && !rateForm.tax_class_id) {
                setRateForm(prev => ({ ...prev, tax_class_id: fetchedClasses[0].id }));
            }
        } catch (err) {
            console.error('Error loading tax data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGstReport = async () => {
        setLoadingReport(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/tax/reports?start_date=${reportStartDate}&end_date=${reportEndDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.data) {
                setGstReport(data.data);
            }
        } catch (err) {
            console.error('Error loading GST report:', err);
        } finally {
            setLoadingReport(false);
        }
    };

    const handleSaveClass = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const url = editingClass
                ? `/api/v1/admin/tax-classes/${editingClass.id}`
                : '/api/v1/admin/tax-classes';
            const method = editingClass ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(classForm)
            });
            const data = await res.json();
            if (res.ok) {
                setIsClassModalOpen(false);
                setEditingClass(null);
                setClassForm({ name: '', code: '', description: '', is_default: false, status: 'active' });
                fetchTaxData();
            } else {
                alert(data.message || 'Failed to save tax class');
            }
        } catch (err) {
            alert('Error saving tax class');
        }
    };

    const handleSetDefaultClass = async (id) => {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/tax-classes/${id}/set-default`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchTaxData();
        } catch (err) {
            console.error('Error setting default tax class:', err);
        }
    };

    const handleDeleteClass = async (id) => {
        if (!confirm('Are you sure you want to delete this tax class?')) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/tax-classes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchTaxData();
        } catch (err) {
            console.error('Error deleting tax class:', err);
        }
    };

    const handleSaveRate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const url = editingRate
                ? `/api/v1/admin/tax-rates/${editingRate.id}`
                : '/api/v1/admin/tax-rates';
            const method = editingRate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(rateForm)
            });
            const data = await res.json();
            if (res.ok) {
                setIsRateModalOpen(false);
                setEditingRate(null);
                setRateForm({ tax_class_id: taxClasses[0]?.id || '', name: '', type: 'cgst', rate: '9.00', state_code: 'MH', country_code: 'IN', is_active: true });
                fetchTaxData();
            } else {
                alert(data.message || 'Failed to save tax rate');
            }
        } catch (err) {
            alert('Error saving tax rate');
        }
    };

    const handleDeleteRate = async (id) => {
        if (!confirm('Are you sure you want to delete this tax component rate?')) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/tax-rates/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchTaxData();
        } catch (err) {
            console.error('Error deleting tax rate:', err);
        }
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/tax/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(taxSettings)
            });
            const data = await res.json();
            if (res.ok) {
                alert('Global tax & fee settings updated successfully.');
                fetchTaxData();
            } else {
                alert(data.message || 'Failed to update settings');
            }
        } catch (err) {
            alert('Error saving settings');
        }
    };

    const handleSaveHsnCode = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const url = editingHsn
                ? `/api/v1/admin/tax/hsn-codes/${editingHsn.id}`
                : '/api/v1/admin/tax/hsn-codes';
            const method = editingHsn ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(hsnForm)
            });
            if (res.ok) {
                setIsHsnModalOpen(false);
                setEditingHsn(null);
                setHsnForm({ code: '', description: '', type: 'hsn', tax_class_id: '', status: 'active' });
                fetchTaxData();
            }
        } catch (err) {
            console.error('Error saving HSN code:', err);
        }
    };

    const handleDeleteHsn = async (id) => {
        if (!window.confirm('Are you sure you want to delete this HSN/SAC code?')) return;
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/tax/hsn-codes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchTaxData();
        } catch (err) {
            console.error('Error deleting HSN code:', err);
        }
    };

    const handleExportCsv = () => {
        if (!gstReport) return;
        const rows = [
            ['GSTR-1 Monthly Tax Report Summary'],
            ['Period', `${reportStartDate} to ${reportEndDate}`],
            ['Gross Sales', gstReport.summary?.gross_sales || 0],
            ['Taxable Value', gstReport.summary?.taxable_value || 0],
            ['Total Tax Collected', gstReport.summary?.total_gst_collected || 0],
            ['CGST Total', gstReport.summary?.cgst_total || 0],
            ['SGST Total', gstReport.summary?.sgst_total || 0],
            ['IGST Total', gstReport.summary?.igst_total || 0],
            [],
            ['HSN Summary Breakdown'],
            ['HSN Code', 'Description', 'Tax Class', 'Gross Sales', 'Taxable Value', 'GST Collected'],
            ...(gstReport.hsn_summary || []).map(h => [
                h.hsn_code,
                `"${h.description || ''}"`,
                h.tax_class,
                h.total_sales,
                h.taxable_amount,
                h.gst_collected
            ])
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `GSTR1_Report_${reportStartDate}_to_${reportEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Tax & GST Administration</h2>
                    <p className="page-header-subtitle">Configure tax classes, CGST/SGST/IGST component rates, HSN/SAC codes, pricing modes, and GSTR audit reports</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Refresh Button */}
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchTaxData}
                        disabled={loading}
                        title="Reload tax configurations and audit records"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    {activeTab === 'classes' && (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                setEditingClass(null);
                                setClassForm({ name: '', code: '', description: '', is_default: false, status: 'active' });
                                setIsClassModalOpen(true);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                        >
                            <Plus size={14} /> <span>Add Tax Class</span>
                        </button>
                    )}

                    {activeTab === 'hsn' && (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                setEditingHsn(null);
                                setHsnForm({ code: '', description: '', type: 'hsn', tax_class_id: taxClasses[0]?.id || '', status: 'active' });
                                setIsHsnModalOpen(true);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                        >
                            <Plus size={14} /> <span>Add HSN / SAC Code</span>
                        </button>
                    )}

                    {activeTab === 'reports' && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleExportCsv}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                        >
                            <Download size={14} /> <span>Export GSTR-1 CSV</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Executive KPI Summary Cards */}
            <div className="stat-cards-grid-4" style={{ marginBottom: '20px' }}>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Tax Classes</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '4px' }}>{taxClasses.length} Tiers</div>
                </div>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Active Tax Rates</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-primary)', marginTop: '4px' }}>{taxRates.length} Rules</div>
                </div>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>HSN / SAC Directory</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{hsnCodes.length} Codes</div>
                </div>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>GST Tax Collected</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>₹{(gstReport?.summary?.gst_collected || 0).toFixed(2)}</div>
                </div>
            </div>

            {/* Integrated Table Card with Top Status Tabs */}
            <div className="card" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                {/* Single Line Enclosed Top Navigation Tabs Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '4px',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)'
                }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('classes')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '18px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            backgroundColor: activeTab === 'classes' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'classes' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <Layers size={13} />
                        <span>Tax Classes</span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            backgroundColor: activeTab === 'classes' ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                            color: activeTab === 'classes' ? '#ffffff' : 'var(--admin-text, #0f172a)'
                        }}>
                            {taxClasses.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('rates')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '18px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            backgroundColor: activeTab === 'rates' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'rates' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <Percent size={13} />
                        <span>GST Rates</span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            backgroundColor: activeTab === 'rates' ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                            color: activeTab === 'rates' ? '#ffffff' : 'var(--admin-text, #0f172a)'
                        }}>
                            {taxRates.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('hsn')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '18px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            backgroundColor: activeTab === 'hsn' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'hsn' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <BookOpen size={13} />
                        <span>HSN / SAC Directory</span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            backgroundColor: activeTab === 'hsn' ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                            color: activeTab === 'hsn' ? '#ffffff' : 'var(--admin-text, #0f172a)'
                        }}>
                            {hsnCodes.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('reports')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '18px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            backgroundColor: activeTab === 'reports' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'reports' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <BarChart3 size={13} />
                        <span>GST Reports</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '18px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            backgroundColor: activeTab === 'settings' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'settings' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <Settings size={13} />
                        <span>Global Settings</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('logs')}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '18px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            backgroundColor: activeTab === 'logs' ? 'var(--admin-primary, #6366f1)' : 'transparent',
                            color: activeTab === 'logs' ? '#ffffff' : 'var(--admin-muted, #64748b)'
                        }}
                    >
                        <Shield size={13} />
                        <span>Audit Logs</span>
                        <span style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            backgroundColor: activeTab === 'logs' ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                            color: activeTab === 'logs' ? '#ffffff' : 'var(--admin-text, #0f172a)'
                        }}>
                            {auditLogs.length}
                        </span>
                    </button>
                </div>

                {/* TAB 1: TAX CLASSES */}
                {activeTab === 'classes' && (
                    <div style={{ padding: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                            {taxClasses.map((cls) => (
                                <div
                                    key={cls.id}
                                    className="card"
                                    style={{
                                        padding: '14px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--admin-border, #e2e8f0)',
                                        backgroundColor: 'var(--admin-card-bg, #ffffff)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '8px'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>{cls.name}</h3>
                                                {cls.is_default && (
                                                    <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`badge ${cls.status === 'active' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                                {cls.status}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--admin-muted, #64748b)', marginBottom: '4px' }}>
                                            Code: <span style={{ fontWeight: 600 }}>{cls.code}</span>
                                        </div>

                                        {cls.description && (
                                            <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)', margin: '2px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {cls.description}
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border, #f1f5f9)', paddingTop: '8px', marginTop: '2px' }}>
                                        {!cls.is_default ? (
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
                                                onClick={() => handleSetDefaultClass(cls.id)}
                                            >
                                                Set Default
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted, #94a3b8)', fontStyle: 'italic' }}>Default Tier</span>
                                        )}

                                        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                                                onClick={() => {
                                                    setEditingClass(cls);
                                                    setClassForm({ name: cls.name, code: cls.code || '', description: cls.description || '', is_default: cls.is_default, status: cls.status });
                                                    setIsClassModalOpen(true);
                                                }}
                                            >
                                                <Edit2 size={13} /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                                onClick={() => handleDeleteClass(cls.id)}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {/* TAB 2: GST COMPONENT RATES */}
            {activeTab === 'rates' && (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Rate Name</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Tax Class</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Component Type</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Rate %</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>State Jurisdiction</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Status</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxRates.map((rate) => (
                                <tr key={rate.id}>
                                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{rate.name}</td>
                                    <td style={{ padding: '16px 20px' }}>{taxClasses.find(c => c.id === rate.tax_class_id)?.name || `Class #${rate.tax_class_id}`}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                            {rate.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#10b981' }}>
                                        {parseFloat(rate.rate).toFixed(2)}%
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        {rate.state_code ? `${rate.state_code} (${rate.country_code || 'IN'})` : `All States (${rate.country_code || 'IN'})`}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span className={`badge ${rate.status === 'active' || rate.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                            {rate.status || 'active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                    setEditingRate(rate);
                                                    setRateForm({
                                                        tax_class_id: rate.tax_class_id,
                                                        name: rate.name,
                                                        type: rate.type,
                                                        rate: rate.rate,
                                                        state_code: rate.state_code || 'MH',
                                                        country_code: rate.country_code || 'IN',
                                                        is_active: rate.is_active ?? true
                                                    });
                                                    setIsRateModalOpen(true);
                                                }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                style={{ color: '#ef4444' }}
                                                onClick={() => handleDeleteRate(rate.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 3: HSN / SAC DIRECTORY */}
            {activeTab === 'hsn' && (
                <div>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '320px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search HSN code or description..."
                                value={hsnSearch}
                                onChange={e => setHsnSearch(e.target.value)}
                                style={{ paddingLeft: '36px' }}
                            />
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>HSN / SAC Code</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Type</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Description</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Linked Tax Class</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Status</th>
                                    <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hsnCodes
                                    .filter(h => !hsnSearch || h.code.toLowerCase().includes(hsnSearch.toLowerCase()) || h.description?.toLowerCase().includes(hsnSearch.toLowerCase()))
                                    .map((hsn) => (
                                        <tr key={hsn.id}>
                                            <td style={{ padding: '16px 20px', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{hsn.code}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: hsn.type === 'hsn' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                                                    color: hsn.type === 'hsn' ? '#3b82f6' : '#a855f7',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {hsn.type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', color: 'var(--admin-muted)' }}>{hsn.description || 'N/A'}</td>
                                            <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                                                {hsn.tax_class?.name || (taxClasses.find(c => c.id === hsn.tax_class_id)?.name) || 'Default Standard'}
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span className={`badge ${hsn.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                                                    {hsn.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => {
                                                            setEditingHsn(hsn);
                                                            setHsnForm({ code: hsn.code, description: hsn.description || '', type: hsn.type, tax_class_id: hsn.tax_class_id || '', status: hsn.status });
                                                            setIsHsnModalOpen(true);
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        style={{ color: '#ef4444' }}
                                                        onClick={() => handleDeleteHsn(hsn.id)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 4: GST TAX REPORTS */}
            {activeTab === 'reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Period Date Filter Header */}
                    <div className="card" style={{ padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Filing Period Range:</div>
                            <input
                                type="date"
                                value={reportStartDate}
                                onChange={e => setReportStartDate(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '0.85rem' }}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={reportEndDate}
                                onChange={e => setReportEndDate(e.target.value)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--admin-border)', fontSize: '0.85rem' }}
                            />
                            <button type="button" className="btn btn-secondary btn-sm" onClick={fetchGstReport}>
                                <RefreshCw size={14} /> Fetch GSTR Data
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    const d = new Date();
                                    setReportStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
                                    setReportEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
                                    fetchGstReport();
                                }}
                            >
                                This Month
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                    const d = new Date();
                                    d.setMonth(d.getMonth() - 1);
                                    setReportStartDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
                                    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                                    setReportEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${lastDay}`);
                                    fetchGstReport();
                                }}
                            >
                                Last Month
                            </button>
                        </div>
                    </div>

                    {/* Metric Cards Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', fontWeight: 600 }}>GROSS SALES</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 0 0', color: 'var(--admin-title)' }}>
                                ₹{gstReport?.summary?.gross_sales?.toLocaleString('en-IN') || '0.00'}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', fontWeight: 600 }}>TAXABLE BASE AMOUNT</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 0 0', color: '#3b82f6' }}>
                                ₹{gstReport?.summary?.taxable_value?.toLocaleString('en-IN') || '0.00'}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', fontWeight: 600 }}>TOTAL GST COLLECTED</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 0 0', color: '#10b981' }}>
                                ₹{gstReport?.summary?.total_gst_collected?.toLocaleString('en-IN') || '0.00'}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', fontWeight: 600 }}>CGST (INTRA-STATE)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 0 0', color: '#6366f1' }}>
                                ₹{gstReport?.summary?.cgst_total?.toLocaleString('en-IN') || '0.00'}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', fontWeight: 600 }}>SGST (INTRA-STATE)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 0 0', color: '#8b5cf6' }}>
                                ₹{gstReport?.summary?.sgst_total?.toLocaleString('en-IN') || '0.00'}
                            </div>
                        </div>

                        <div className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', fontWeight: 600 }}>IGST (INTER-STATE)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '6px 0 0 0', color: '#f59e0b' }}>
                                ₹{gstReport?.summary?.igst_total?.toLocaleString('en-IN') || '0.00'}
                            </div>
                        </div>
                    </div>

                    {/* HSN Summary Breakdown Table */}
                    <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border, #e2e8f0)', backgroundColor: 'var(--admin-card-bg, #ffffff)' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>HSN Code Sales & Tax Breakdown</h3>
                        </div>
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>HSN / SAC Code</th>
                                        <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Description</th>
                                        <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Tax Tier</th>
                                        <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Gross Sales</th>
                                        <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Taxable Base Value</th>
                                        <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>GST Tax Collected</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(gstReport?.hsn_summary || []).length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                                No HSN code sales recorded for this period range.
                                            </td>
                                        </tr>
                                    ) : (
                                        gstReport.hsn_summary.map((row, idx) => (
                                            <tr key={idx}>
                                                <td style={{ padding: '16px 20px', fontWeight: 700, fontFamily: 'monospace' }}>{row.hsn_code}</td>
                                                <td style={{ padding: '16px 20px', color: 'var(--admin-muted)' }}>{row.description || 'N/A'}</td>
                                                <td style={{ padding: '16px 20px', fontWeight: 600 }}>{row.tax_class}</td>
                                                <td style={{ padding: '16px 20px', fontWeight: 700 }}>₹{row.total_sales}</td>
                                                <td style={{ padding: '16px 20px' }}>₹{row.taxable_amount}</td>
                                                <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 700 }}>₹{row.gst_collected}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: GLOBAL TAX & FEE SETTINGS */}
            {activeTab === 'settings' && (
                <div style={{ padding: '16px' }}>
                    <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
                            {/* CARD 1: Storefront Tax Calculation Controls */}
                            <div className="card" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--admin-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Settings size={16} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--admin-text)' }}>
                                            Storefront Tax Calculation
                                        </h3>
                                        <p style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', margin: 0 }}>
                                            Pricing mode, fallback tier, and store origin parameters
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {/* Compact Selectable Radio Cards for Pricing Mode */}
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text)' }}>
                                            Pricing Calculation Mode *
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div
                                                onClick={() => setTaxSettings({ ...taxSettings, pricing_mode: 'tax_exclusive' })}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: taxSettings.pricing_mode === 'tax_exclusive' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                    backgroundColor: taxSettings.pricing_mode === 'tax_exclusive' ? 'rgba(99, 102, 241, 0.06)' : 'var(--admin-bg-secondary)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: taxSettings.pricing_mode === 'tax_exclusive' ? 'var(--admin-primary)' : 'var(--admin-text)' }}>Tax Exclusive</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>Prices exclude tax</div>
                                                </div>
                                                <div style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    borderRadius: '50%',
                                                    border: taxSettings.pricing_mode === 'tax_exclusive' ? '4px solid var(--admin-primary)' : '2px solid var(--admin-border)',
                                                    backgroundColor: '#ffffff'
                                                }} />
                                            </div>

                                            <div
                                                onClick={() => setTaxSettings({ ...taxSettings, pricing_mode: 'tax_inclusive' })}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    border: taxSettings.pricing_mode === 'tax_inclusive' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                    backgroundColor: taxSettings.pricing_mode === 'tax_inclusive' ? 'rgba(99, 102, 241, 0.06)' : 'var(--admin-bg-secondary)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: taxSettings.pricing_mode === 'tax_inclusive' ? 'var(--admin-primary)' : 'var(--admin-text)' }}>Tax Inclusive</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>Prices include tax (MRP)</div>
                                                </div>
                                                <div style={{
                                                    width: '14px',
                                                    height: '14px',
                                                    borderRadius: '50%',
                                                    border: taxSettings.pricing_mode === 'tax_inclusive' ? '4px solid var(--admin-primary)' : '2px solid var(--admin-border)',
                                                    backgroundColor: '#ffffff'
                                                }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                            Default Fallback Tax Class
                                        </label>
                                        <select
                                            value={taxSettings.default_tax_class_id || ''}
                                            onChange={e => setTaxSettings({ ...taxSettings, default_tax_class_id: e.target.value })}
                                            className="form-select"
                                            style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '8px', fontSize: '0.82rem' }}
                                        >
                                            <option value="">Select Fallback Tax Class</option>
                                            {taxClasses.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                                Store GSTIN Number
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. 27AAAAA0000A1Z5"
                                                value={taxSettings.store_gstin || ''}
                                                onChange={e => setTaxSettings({ ...taxSettings, store_gstin: e.target.value })}
                                                style={{ height: '36px', fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', borderRadius: '8px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                                Origin State Code
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="e.g. MH"
                                                value={taxSettings.store_state_code || ''}
                                                onChange={e => setTaxSettings({ ...taxSettings, store_state_code: e.target.value })}
                                                style={{ height: '36px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', borderRadius: '8px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CARD 2: Shipping & Fee Tax Rules */}
                            <div className="card" style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                        color: 'var(--admin-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Truck size={16} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--admin-text)' }}>
                                            Shipping & Fee Tax Rules
                                        </h3>
                                        <p style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', margin: 0 }}>
                                            Tax calculation rules for shipping costs & COD fees
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                            Shipping Charges Tax Rule
                                        </label>
                                        <select
                                            value={taxSettings.shipping_tax_mode || 'same_as_items'}
                                            onChange={e => setTaxSettings({ ...taxSettings, shipping_tax_mode: e.target.value })}
                                            className="form-select"
                                            style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}
                                        >
                                            <option value="same_as_items">Apply highest tax rate among cart items</option>
                                            <option value="fixed_class">Apply specific fixed shipping tax class</option>
                                            <option value="exempt">Shipping is Tax Exempt (0%)</option>
                                        </select>
                                    </div>

                                    {taxSettings.shipping_tax_mode === 'fixed_class' && (
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                                Fixed Shipping Tax Class
                                            </label>
                                            <select
                                                value={taxSettings.shipping_tax_class_id || ''}
                                                onChange={e => setTaxSettings({ ...taxSettings, shipping_tax_class_id: e.target.value })}
                                                className="form-select"
                                                style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '8px', fontSize: '0.82rem' }}
                                            >
                                                <option value="">Select Tax Class for Shipping</option>
                                                {taxClasses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '10px', marginTop: '4px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                            <input
                                                type="checkbox"
                                                checked={taxSettings.cod_fee_taxable || false}
                                                onChange={e => setTaxSettings({ ...taxSettings, cod_fee_taxable: e.target.checked })}
                                                style={{ width: '16px', height: '16px', accentColor: 'var(--admin-primary)', borderRadius: '4px' }}
                                            />
                                            Tax Cash-on-Delivery (COD) Fees
                                        </label>
                                    </div>

                                    {taxSettings.cod_fee_taxable && (
                                        <div>
                                            <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                                COD Fee Tax Class
                                            </label>
                                            <select
                                                value={taxSettings.cod_fee_tax_class_id || ''}
                                                onChange={e => setTaxSettings({ ...taxSettings, cod_fee_tax_class_id: e.target.value })}
                                                className="form-select"
                                                style={{ width: '100%', height: '36px', padding: '0 12px', borderRadius: '8px', fontSize: '0.82rem' }}
                                            >
                                                <option value="">Select Tax Class for COD Fee</option>
                                                {taxClasses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Settings Action Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                style={{ padding: '8px 24px', fontSize: '0.84rem', fontWeight: 700, borderRadius: '8px' }}
                            >
                                Save Tax & Fee Settings
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 4: AUDIT LOGS */}
            {activeTab === 'logs' && (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Action</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Resource Model</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Admin ID</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>IP Address</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--admin-muted)' }}>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                        No audit log entries recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                fontFamily: 'monospace',
                                                fontWeight: 600,
                                                fontSize: '0.78rem',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                                color: '#2563eb',
                                                border: '1px solid rgba(59, 130, 246, 0.2)'
                                            }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontFamily: 'monospace' }}>{log.model_type?.split('\\').pop() || 'SystemSetting'} #{log.model_id}</td>
                                        <td style={{ padding: '16px 20px' }}>User #{log.user_id}</td>
                                        <td style={{ padding: '16px 20px', color: 'var(--admin-muted)' }}>{log.ip_address || '127.0.0.1'}</td>
                                        <td style={{ padding: '16px 20px', color: 'var(--admin-muted)' }}>{new Date(log.created_at || Date.now()).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

            {/* CREATE/EDIT CLASS MODAL */}
            {isClassModalOpen && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        padding: '20px'
                    }}
                    onClick={() => setIsClassModalOpen(false)}
                >
                    <div
                        className="modal-card"
                        style={{
                            maxWidth: '720px',
                            width: '96%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--admin-card-bg, #ffffff)',
                            color: 'var(--admin-text, #0f172a)',
                            border: '1px solid var(--admin-border, #e2e8f0)',
                            borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--admin-card-bg, #ffffff)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Percent size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>
                                        {editingClass ? `Edit Tax Class: ${editingClass.name}` : 'Create New Tax Class'}
                                    </h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)', margin: '2px 0 0 0' }}>
                                        Configure tax tier parameters, jurisdiction rules, and CGST/SGST/IGST component rates.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsClassModalOpen(false)}
                                style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--admin-bg, #f1f5f9)', border: '1px solid var(--admin-border, #cbd5e1)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Sub-Tabs Navigation */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border, #e2e8f0)', backgroundColor: 'var(--admin-bg, #f8fafc)', padding: '0 24px' }}>
                            <button
                                type="button"
                                onClick={() => setClassModalTab('details')}
                                style={{
                                    padding: '12px 18px',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    borderBottom: classModalTab === 'details' ? '2px solid #3b82f6' : '2px solid transparent',
                                    background: 'none',
                                    color: classModalTab === 'details' ? '#3b82f6' : 'var(--admin-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Tag size={15} />
                                <span>1. Basic Details & Status</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setClassModalTab('rates')}
                                style={{
                                    padding: '12px 18px',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    borderBottom: classModalTab === 'rates' ? '2px solid #3b82f6' : '2px solid transparent',
                                    background: 'none',
                                    color: classModalTab === 'rates' ? '#3b82f6' : 'var(--admin-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Percent size={15} />
                                <span>2. Tax Rates & Breakdown</span>
                            </button>
                        </div>

                        <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', overflow: 'hidden' }}>
                            {/* Scrollable Form Body */}
                            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
                                {classModalTab === 'details' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text, #0f172a)' }}>Tax Class Code *</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const gen = classForm.name ? 'GST_' + classForm.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) : 'GST_' + Math.floor(1000 + Math.random()*9000);
                                                            setClassForm({...classForm, code: gen});
                                                        }}
                                                        style={{
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#3b82f6',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            padding: '2px 8px',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}
                                                    >
                                                        <Zap size={11} /> Auto-Generate
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="E.G. GST_18"
                                                    value={classForm.code}
                                                    onChange={e => setClassForm({ ...classForm, code: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--admin-border, #cbd5e1)',
                                                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                        fontFamily: 'monospace',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Tax Class Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Standard GST 18%"
                                                    value={classForm.name}
                                                    onChange={e => setClassForm({ ...classForm, name: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--admin-border, #cbd5e1)',
                                                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                        fontSize: '0.9rem'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Description</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Internal description or tax tier terms..."
                                                value={classForm.description}
                                                onChange={e => setClassForm({ ...classForm, description: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--admin-border, #cbd5e1)',
                                                    backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Status</label>
                                                <select
                                                    value={classForm.status}
                                                    onChange={e => setClassForm({ ...classForm, status: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--admin-border, #cbd5e1)',
                                                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>

                                            <div style={{ paddingTops: '20px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={classForm.is_default}
                                                        onChange={e => setClassForm({ ...classForm, is_default: e.target.checked })}
                                                        style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                                                    />
                                                    Set as Default Tax Tier
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {classModalTab === 'rates' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#3b82f6', marginBottom: '2px' }}>
                                                GST Percentage Component Breakdown
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)' }}>
                                                Central GST (CGST) and State GST (SGST) apply to intra-state sales. Integrated GST (IGST) applies to inter-state sales.
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>CGST Rate % *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="e.g. 9.00"
                                                    value={classForm.cgst_rate}
                                                    onChange={e => setClassForm({ ...classForm, cgst_rate: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--admin-border, #cbd5e1)',
                                                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>SGST Rate % *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="e.g. 9.00"
                                                    value={classForm.sgst_rate}
                                                    onChange={e => setClassForm({ ...classForm, sgst_rate: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--admin-border, #cbd5e1)',
                                                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>IGST Rate % *</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="e.g. 18.00"
                                                    value={classForm.igst_rate}
                                                    onChange={e => setClassForm({ ...classForm, igst_rate: e.target.value })}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 14px',
                                                        borderRadius: '8px',
                                                        border: '1px solid var(--admin-border, #cbd5e1)',
                                                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Origin State Jurisdiction Code</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. MH (State code for intra-state CGST/SGST match)"
                                                value={classForm.state_code}
                                                onChange={e => setClassForm({ ...classForm, state_code: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 14px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--admin-border, #cbd5e1)',
                                                    backgroundColor: 'var(--admin-bg, #f8fafc)',
                                                    fontSize: '0.85rem'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div
                                style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid var(--admin-border, #e2e8f0)',
                                    backgroundColor: 'var(--admin-bg, #f8fafc)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <div>
                                    {classModalTab === 'details' ? (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setClassModalTab('rates')}
                                        >
                                            Next: Tax Rates & Breakdown &rarr;
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setClassModalTab('details')}
                                        >
                                            &larr; Back to Basic Details
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsClassModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {editingClass ? 'Update Tax Class' : 'Create Tax Class'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT RATE MODAL */}
            {isRateModalOpen && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        padding: '20px'
                    }}
                    onClick={() => setIsRateModalOpen(false)}
                >
                    <div
                        className="modal-card"
                        style={{
                            maxWidth: '560px',
                            width: '96%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--admin-card-bg, #ffffff)',
                            color: 'var(--admin-text, #0f172a)',
                            border: '1px solid var(--admin-border, #e2e8f0)',
                            borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--admin-card-bg, #ffffff)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Percent size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>
                                        {editingRate ? 'Edit Tax Component Rate' : 'Add GST Component Rate'}
                                    </h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)', margin: '2px 0 0 0' }}>
                                        Configure individual CGST, SGST, IGST, or flat rates for specific tax classes.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsRateModalOpen(false)}
                                style={{ padding: '6px', borderRadius: '8px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveRate} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Target Tax Class *</label>
                                    <select value={rateForm.tax_class_id} onChange={e => setRateForm({...rateForm, tax_class_id: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem' }}>
                                        {taxClasses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Rate Component Name *</label>
                                        <input type="text" required placeholder="e.g. CGST 9%" value={rateForm.name} onChange={e => setRateForm({...rateForm, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Component Type *</label>
                                        <select value={rateForm.type} onChange={e => setRateForm({...rateForm, type: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <option value="cgst">CGST (Central GST)</option>
                                            <option value="sgst">SGST (State GST)</option>
                                            <option value="igst">IGST (Integrated GST)</option>
                                            <option value="utgst">UTGST (Union Territory GST)</option>
                                            <option value="flat">Flat Tax</option>
                                            <option value="standard">Standard</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Rate Percentage (%) *</label>
                                        <input type="number" step="0.01" required value={rateForm.rate} onChange={e => setRateForm({...rateForm, rate: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.9rem', fontWeight: 700 }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Applicable State Code</label>
                                        <input type="text" placeholder="e.g. MH (empty for all)" value={rateForm.state_code} onChange={e => setRateForm({...rateForm, state_code: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem' }} />
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid var(--admin-border, #e2e8f0)',
                                    backgroundColor: 'var(--admin-bg, #f8fafc)',
                                    display: 'flex',
                                    justify: 'flex-end',
                                    gap: '12px'
                                }}
                            >
                                <button type="button" className="btn btn-secondary" onClick={() => setIsRateModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingRate ? 'Update Rate' : 'Save Rate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE/EDIT HSN MODAL */}
            {isHsnModalOpen && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1100,
                        padding: '20px'
                    }}
                    onClick={() => setIsHsnModalOpen(false)}
                >
                    <div
                        className="modal-card"
                        style={{
                            maxWidth: '560px',
                            width: '96%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--admin-card-bg, #ffffff)',
                            color: 'var(--admin-text, #0f172a)',
                            border: '1px solid var(--admin-border, #e2e8f0)',
                            borderRadius: '16px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--admin-card-bg, #ffffff)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>
                                        {editingHsn ? 'Edit HSN / SAC Code' : 'Add HSN / SAC Code Entry'}
                                    </h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)', margin: '2px 0 0 0' }}>
                                        Configure HSN (Goods) or SAC (Services) codes and link them to default tax tiers.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsHsnModalOpen(false)}
                                style={{ padding: '6px', borderRadius: '8px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveHsnCode} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>HSN / SAC Code *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. 8517 or 9983"
                                            value={hsnForm.code}
                                            onChange={e => setHsnForm({ ...hsnForm, code: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Code Type *</label>
                                        <select
                                            value={hsnForm.type}
                                            onChange={e => setHsnForm({ ...hsnForm, type: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem', fontWeight: 600 }}
                                        >
                                            <option value="hsn">HSN (Harmonized System - Goods)</option>
                                            <option value="sac">SAC (Services Accounting Code - Services)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Smartphones & Mobile Telephones"
                                        value={hsnForm.description}
                                        onChange={e => setHsnForm({ ...hsnForm, description: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Linked Tax Class</label>
                                        <select
                                            value={hsnForm.tax_class_id}
                                            onChange={e => setHsnForm({ ...hsnForm, tax_class_id: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem' }}
                                        >
                                            <option value="">Default Standard Class</option>
                                            {taxClasses.map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--admin-text, #0f172a)' }}>Status *</label>
                                        <select
                                            value={hsnForm.status}
                                            onChange={e => setHsnForm({ ...hsnForm, status: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border, #cbd5e1)', backgroundColor: 'var(--admin-bg, #f8fafc)', fontSize: '0.85rem', fontWeight: 600 }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid var(--admin-border, #e2e8f0)',
                                    backgroundColor: 'var(--admin-bg, #f8fafc)',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px'
                                }}
                            >
                                <button type="button" className="btn btn-secondary" onClick={() => setIsHsnModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingHsn ? 'Update HSN Entry' : 'Save HSN Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
