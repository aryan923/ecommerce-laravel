import React, { useState, useEffect } from 'react';
import {
    Settings,
    Store,
    Globe,
    ShoppingBag,
    Search,
    DollarSign,
    ShieldAlert,
    Save,
    RefreshCw,
    Plus,
    Edit2,
    Trash2,
    CheckCircle2,
    Check,
    X,
    FileText,
    Building2,
    Mail,
    Phone,
    MapPin,
    Hash,
    Image as ImageIcon,
    Calendar,
    Clock,
    Sliders,
    Filter,
    RotateCcw,
    Share2,
    Download,
    BarChart3,
    ShieldCheck,
    Truck,
    Package,
    CreditCard,
    Lock,
    Send,
    MessageSquare,
    Zap,
    Shield,
    HardDrive,
    Key,
    Server
} from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'localization' | 'commerce' | 'seo' | 'email' | 'payment' | 'notifications_gateway' | 'security' | 'currencies' | 'audit'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Settings Data States
    const [generalSettings, setGeneralSettings] = useState({
        store_name: '',
        store_email: '',
        store_phone: '',
        store_address: '',
        store_logo: '',
        store_favicon: '',
        store_gstin: '',
        store_hours: '',
        social_facebook: '',
        social_instagram: '',
        social_twitter: '',
        social_linkedin: '',
        support_portal_url: ''
    });

    const [localizationSettings, setLocalizationSettings] = useState({
        default_currency: 'INR',
        timezone: 'Asia/Kolkata',
        date_format: 'Y-m-d',
        number_format: '1,234.56',
        default_language: 'en',
        weight_unit: 'kg',
        dimension_unit: 'cm',
        multi_language_enabled: false
    });

    const [commerceSettings, setCommerceSettings] = useState({
        guest_checkout: true,
        stock_management: true,
        reviews_enabled: true,
        min_order_value: 0,
        max_order_value: 1000000,
        cart_reservation_ttl_minutes: 15,
        unpaid_order_cancellation_hours: 24,
        free_shipping_threshold: 999,
        low_stock_threshold_default: 5,
        products_per_page: 12
    });

    const [seoSettings, setSeoSettings] = useState({
        default_meta_title: '',
        default_meta_description: '',
        default_og_image: '',
        sitemap_enabled: true,
        robots_txt: '',
        google_analytics_id: '',
        facebook_pixel_id: '',
        google_tag_manager_id: '',
        auto_sitemap_regeneration: true
    });

    const [emailSettings, setEmailSettings] = useState({
        mail_driver: 'smtp',
        smtp_host: 'smtp.mailtrap.io',
        smtp_port: 2525,
        smtp_encryption: 'tls',
        smtp_username: '',
        smtp_password: '',
        from_name: 'Acme Support',
        from_email: 'support@acme.com'
    });

    const [paymentSettings, setPaymentSettings] = useState({
        razorpay_enabled: true,
        stripe_enabled: true,
        paypal_enabled: false,
        cod_enabled: true,
        bank_transfer_enabled: false,
        razorpay_key: '',
        razorpay_secret: '',
        stripe_key: '',
        stripe_secret: '',
        max_cod_amount: 50000,
        cod_handling_fee: 50
    });

    const [notificationsGatewaySettings, setNotificationsGatewaySettings] = useState({
        sms_provider: 'msg91',
        sms_api_key: '',
        sms_sender_id: 'ACMSTR',
        whatsapp_enabled: true,
        order_confirmation_sms: true,
        dispatch_sms: true,
        otp_sms: true
    });

    const [securitySettings, setSecuritySettings] = useState({
        admin_2fa_required: false,
        max_login_attempts: 5,
        session_timeout_minutes: 30,
        maintenance_mode_enabled: false,
        maintenance_message: 'Store is currently undergoing scheduled maintenance. We will return online shortly.',
        ip_whitelist: '127.0.0.1'
    });

    // Test Email Modal State
    const [testEmailModal, setTestEmailModal] = useState(false);
    const [testEmailAddress, setTestEmailAddress] = useState('');
    const [testingEmail, setTestingEmail] = useState(false);

    // Currencies State
    const [currencies, setCurrencies] = useState([]);
    const [currencySearch, setCurrencySearch] = useState('');
    const [currencyStatusFilter, setCurrencyStatusFilter] = useState('all');
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState(null);
    const [currencyForm, setCurrencyForm] = useState({
        code: '',
        name: '',
        symbol: '',
        exchange_rate: 1.0,
        decimal_places: 2,
        is_default: false,
        status: 'active'
    });

    // Audit Logs State
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditFilterGroup, setAuditFilterGroup] = useState('all');

    useEffect(() => {
        fetchAllSettings();
    }, []);

    const fetchAllSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const headers = {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const [settingsRes, currenciesRes, auditRes] = await Promise.all([
                fetch('/api/v1/admin/settings', { headers }),
                fetch('/api/v1/admin/currencies', { headers }),
                fetch('/api/v1/admin/settings/audit-logs', { headers })
            ]);

            const settingsData = await settingsRes.json();
            const currenciesData = await currenciesRes.json();
            const auditData = await auditRes.json();

            if (settingsData.success && settingsData.data) {
                if (settingsData.data.general) setGeneralSettings(prev => ({ ...prev, ...settingsData.data.general }));
                if (settingsData.data.localization) setLocalizationSettings(prev => ({ ...prev, ...settingsData.data.localization }));
                if (settingsData.data.commerce) setCommerceSettings(prev => ({ ...prev, ...settingsData.data.commerce }));
                if (settingsData.data.seo) setSeoSettings(prev => ({ ...prev, ...settingsData.data.seo }));
                if (settingsData.data.email) setEmailSettings(prev => ({ ...prev, ...settingsData.data.email }));
                if (settingsData.data.payment) setPaymentSettings(prev => ({ ...prev, ...settingsData.data.payment }));
                if (settingsData.data.notifications_gateway) setNotificationsGatewaySettings(prev => ({ ...prev, ...settingsData.data.notifications_gateway }));
                if (settingsData.data.security) setSecuritySettings(prev => ({ ...prev, ...settingsData.data.security }));
            }

            if (currenciesData.success && currenciesData.data) {
                setCurrencies(currenciesData.data.data || currenciesData.data);
            }

            if (auditData.success && auditData.data) {
                setAuditLogs(auditData.data.data || auditData.data);
            }
        } catch (err) {
            console.error('Failed to load store settings:', err);
            setMessage({ type: 'error', text: 'Error connecting to settings server.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGroup = async (group, data) => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/settings/${group}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: `Settings for [${group.toUpperCase()}] saved successfully!` });
                fetchAllSettings();
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to save settings.' });
            }
        } catch (err) {
            console.error('Error saving settings group:', err);
            setMessage({ type: 'error', text: 'Server error while saving settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSendTestEmail = async (e) => {
        e.preventDefault();
        setTestingEmail(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/settings/test-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email: testEmailAddress })
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: result.message || 'Test email dispatched successfully.' });
                setTestEmailModal(false);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to send test email.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error dispatching test email.' });
        } finally {
            setTestingEmail(false);
        }
    };

    const handleClearCache = async () => {
        if (!confirm('Are you sure you want to flush all system application and settings cache?')) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch('/api/v1/admin/settings/clear-cache', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: 'System cache cleared successfully.' });
                fetchAllSettings();
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to clear cache.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error clearing system cache.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCurrency = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const isEdit = !!editingCurrency;
            const url = isEdit ? `/api/v1/admin/currencies/${editingCurrency.id}` : '/api/v1/admin/currencies';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(currencyForm)
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: `Currency ${isEdit ? 'updated' : 'created'} successfully!` });
                setIsCurrencyModalOpen(false);
                setEditingCurrency(null);
                fetchAllSettings();
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to save currency.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error saving currency.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSetDefaultCurrency = async (id) => {
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/currencies/${id}/set-default`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: 'Default store currency updated.' });
                fetchAllSettings();
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to set default currency.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error setting default currency.' });
        }
    };

    const handleDeleteCurrency = async (id) => {
        if (!confirm('Are you sure you want to delete this currency?')) return;

        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const res = await fetch(`/api/v1/admin/currencies/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setMessage({ type: 'success', text: 'Currency deleted successfully.' });
                fetchAllSettings();
            } else {
                setMessage({ type: 'error', text: result.message || 'Cannot delete currency.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error deleting currency.' });
        }
    };

    const handleExportAuditCsv = () => {
        if (!filteredAuditLogs.length) return;
        const headers = ['Log ID', 'Admin User', 'Group', 'Action', 'IP Address', 'Timestamp'];
        const rows = filteredAuditLogs.map(log => [
            log.id,
            log.admin_user ? log.admin_user.name : 'System Administrator',
            log.group,
            log.action,
            log.ip_address || '127.0.0.1',
            new Date(log.created_at).toLocaleString()
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `settings_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openAddCurrencyModal = () => {
        setEditingCurrency(null);
        setCurrencyForm({
            code: '',
            name: '',
            symbol: '',
            exchange_rate: 1.0,
            decimal_places: 2,
            is_default: false,
            status: 'active'
        });
        setIsCurrencyModalOpen(true);
    };

    const openEditCurrencyModal = (curr) => {
        setEditingCurrency(curr);
        setCurrencyForm({
            code: curr.code,
            name: curr.name,
            symbol: curr.symbol,
            exchange_rate: curr.exchange_rate,
            decimal_places: curr.decimal_places,
            is_default: curr.is_default,
            status: curr.status
        });
        setIsCurrencyModalOpen(true);
    };

    // Filtered currencies
    const filteredCurrencies = currencies.filter(c => {
        const matchesSearch = c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
            c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
            c.symbol.includes(currencySearch);
        const matchesStatus = currencyStatusFilter === 'all' || c.status === currencyStatusFilter;
        return matchesSearch && matchesStatus;
    });

    // Filtered audit logs
    const filteredAuditLogs = auditLogs.filter(log =>
        auditFilterGroup === 'all' || log.group === auditFilterGroup
    );

    const defaultCurrencyObj = currencies.find(c => c.is_default) || { code: localizationSettings.default_currency || 'INR', symbol: '₹' };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '12px' }}>
                <RefreshCw size={32} className="spin" style={{ color: 'var(--admin-primary)' }} />
                <span style={{ color: 'var(--admin-muted)', fontWeight: 600 }}>Loading store settings...</span>
            </div>
        );
    }

    return (
        <div className="settings-page-container">
            {/* Page Header Row (Matching Inventory & Customer Accounts Layout) */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Store Settings & System Configuration</h2>
                    <p className="page-header-subtitle">
                        Manage store identity, regional formatting, commerce rules, SMTP email, payment gateways, SMS/WhatsApp gateways, security, currencies, and audit logs
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleClearCache}
                        title="Flush system cache"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <Zap size={13} style={{ color: '#f59e0b' }} />
                        <span>Flush Cache</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchAllSettings}
                        disabled={loading}
                        title="Reload store settings"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={loading ? 'spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    {activeTab === 'currencies' && (
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={openAddCurrencyModal}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                        >
                            <Plus size={14} />
                            <span>Add Currency</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Notification Banner */}
            {message.text && (
                <div
                    style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: message.type === 'error' ? 'var(--admin-danger-light)' : 'var(--admin-success-light)',
                        border: `1px solid ${message.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)'}`,
                        color: message.type === 'error' ? 'var(--admin-danger)' : 'var(--admin-success)',
                        fontSize: '0.82rem'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        {message.type === 'error' ? <ShieldAlert size={15} /> : <CheckCircle2 size={15} />}
                        <span>{message.text}</span>
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Executive KPI Cards Grid (Standard 4 Cards Per Row - Matches Inventory & Customers) */}
            <div className="stat-cards-grid-4">
                {/* 1. Store Identity */}
                <div
                    onClick={() => setActiveTab('general')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'general' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Store Profile
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {generalSettings.store_name || 'Acme Store'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            {generalSettings.store_email || 'Identity configured'}
                        </div>
                    </div>
                </div>

                {/* 2. Base Currency & Gateways */}
                <div
                    onClick={() => setActiveTab('payment')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'payment' ? '2px solid #10b981' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Payment Gateways
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {[paymentSettings.razorpay_enabled && 'Razorpay', paymentSettings.stripe_enabled && 'Stripe', paymentSettings.cod_enabled && 'COD'].filter(Boolean).join(' • ') || 'Configured'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Base: {defaultCurrencyObj.code} ({defaultCurrencyObj.symbol})
                        </div>
                    </div>
                </div>

                {/* 3. SMTP & Gateways */}
                <div
                    onClick={() => setActiveTab('email')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'email' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Email & SMS Gateways
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                            {emailSettings.mail_driver.toUpperCase()} Driver
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            SMS: {notificationsGatewaySettings.sms_provider.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* 4. Security & Maintenance */}
                <div
                    onClick={() => setActiveTab('security')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'security' ? '2px solid #8b5cf6' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>
                            Store Security
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: securitySettings.maintenance_mode_enabled ? 'var(--admin-danger)' : '#8b5cf6' }}>
                            {securitySettings.maintenance_mode_enabled ? 'MAINTENANCE' : 'STORE ONLINE'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Session Timeout: {securitySettings.session_timeout_minutes}m
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrated Table/Content Card Enclosing Tabs & Toolbar */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Segmented Navigation Tab Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflowX: 'auto',
                    padding: '12px 16px 8px 16px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)',
                    scrollbarWidth: 'none'
                }}>
                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <Store size={13} />
                        <span>General Profile</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'localization' ? 'active' : ''}`}
                        onClick={() => setActiveTab('localization')}
                    >
                        <Globe size={13} />
                        <span>Localization</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'commerce' ? 'active' : ''}`}
                        onClick={() => setActiveTab('commerce')}
                    >
                        <ShoppingBag size={13} />
                        <span>Commerce Rules</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'email' ? 'active' : ''}`}
                        onClick={() => setActiveTab('email')}
                    >
                        <Mail size={13} />
                        <span>SMTP Email</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
                        onClick={() => setActiveTab('payment')}
                    >
                        <CreditCard size={13} />
                        <span>Payment Gateways</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'notifications_gateway' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications_gateway')}
                    >
                        <MessageSquare size={13} />
                        <span>SMS / WhatsApp</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Shield size={13} />
                        <span>Security & System</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        <Search size={13} />
                        <span>SEO & Meta</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'currencies' ? 'active' : ''}`}
                        onClick={() => setActiveTab('currencies')}
                    >
                        <DollarSign size={13} />
                        <span>Currencies</span>
                        <span className="order-tab-badge">{currencies.length}</span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('audit')}
                    >
                        <FileText size={13} />
                        <span>Audit Logs</span>
                        <span className="order-tab-badge">{auditLogs.length}</span>
                    </button>
                </div>

                {/* Contextual Toolbar for Currencies & Audit Logs */}
                {activeTab === 'currencies' && (
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--admin-border)',
                        backgroundColor: 'var(--admin-card-bg)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', flex: 1 }}>
                            <div style={{ position: 'relative', minWidth: '220px', maxWidth: '360px', flex: 1 }}>
                                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search Currency Code, Name, Symbol..."
                                    value={currencySearch}
                                    onChange={(e) => setCurrencySearch(e.target.value)}
                                    style={{ paddingLeft: '36px', height: '36px', borderRadius: '8px', fontSize: '0.82rem' }}
                                />
                                {currencySearch && (
                                    <button
                                        type="button"
                                        onClick={() => setCurrencySearch('')}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                                    >
                                        <X size={13} />
                                    </button>
                                )}
                            </div>

                            <select
                                className="form-select"
                                style={{ width: 'auto', minWidth: '150px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                                value={currencyStatusFilter}
                                onChange={(e) => setCurrencyStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>

                            {(currencySearch || currencyStatusFilter !== 'all') && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setCurrencySearch(''); setCurrencyStatusFilter('all'); }}
                                    style={{ height: '36px', padding: '0 10px', borderRadius: '8px' }}
                                >
                                    <RotateCcw size={13} />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={openAddCurrencyModal}
                            style={{ height: '36px', padding: '0 14px', borderRadius: '8px', fontWeight: 700 }}
                        >
                            <Plus size={14} />
                            <span>Add Currency</span>
                        </button>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--admin-border)',
                        backgroundColor: 'var(--admin-card-bg)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-muted)' }}>Filter Group:</span>
                            <select
                                className="form-select"
                                style={{ width: 'auto', minWidth: '160px', height: '36px', borderRadius: '8px', fontSize: '0.8rem' }}
                                value={auditFilterGroup}
                                onChange={(e) => setAuditFilterGroup(e.target.value)}
                            >
                                <option value="all">All Change Groups</option>
                                <option value="general">General Profile</option>
                                <option value="localization">Localization</option>
                                <option value="commerce">Commerce Rules</option>
                                <option value="email">SMTP Email</option>
                                <option value="payment">Payment Gateways</option>
                                <option value="notifications_gateway">SMS / WhatsApp</option>
                                <option value="security">Security</option>
                                <option value="seo">SEO Defaults</option>
                                <option value="currency">Currencies</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={handleExportAuditCsv}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 12px', borderRadius: '8px', fontWeight: 600 }}
                        >
                            <Download size={14} />
                            <span>Export CSV</span>
                        </button>
                    </div>
                )}

                {/* TAB 1: GENERAL PROFILE */}
                {activeTab === 'general' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <Building2 size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Store Identity & Contact Details</span>
                                </div>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Store size={13} style={{ color: 'var(--admin-muted)' }} />
                                            Store Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.store_name}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_name: e.target.value })}
                                            placeholder="Acme Superstore"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Mail size={13} style={{ color: 'var(--admin-muted)' }} />
                                            Support Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={generalSettings.store_email}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_email: e.target.value })}
                                            placeholder="support@acme.com"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Phone size={13} style={{ color: 'var(--admin-muted)' }} />
                                            Customer Care Phone
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.store_phone}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_phone: e.target.value })}
                                            placeholder="+1-800-555-0199"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Hash size={13} style={{ color: 'var(--admin-muted)' }} />
                                            Store GSTIN / Tax ID
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.store_gstin}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_gstin: e.target.value })}
                                            placeholder="27AAAAA0000A1Z5"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Clock size={13} style={{ color: 'var(--admin-muted)' }} />
                                            Store Operating Hours
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.store_hours}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_hours: e.target.value })}
                                            placeholder="Mon-Sat: 9:00 AM - 8:00 PM IST"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Globe size={13} style={{ color: 'var(--admin-muted)' }} />
                                            Support Desk / Help Portal URL
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.support_portal_url}
                                            onChange={e => setGeneralSettings({ ...generalSettings, support_portal_url: e.target.value })}
                                            placeholder="https://support.acme.com"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <MapPin size={13} style={{ color: 'var(--admin-muted)' }} />
                                            Store Physical Address
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            value={generalSettings.store_address}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_address: e.target.value })}
                                            placeholder="123 E-Commerce Way, Suite 400, Tech City..."
                                            style={{ borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section B: Media Assets & Branding */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <ImageIcon size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Branding & Media Assets</span>
                                </div>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Header Logo Asset URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.store_logo}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_logo: e.target.value })}
                                            placeholder="/images/logo.png"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Favicon Asset URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.store_favicon}
                                            onChange={e => setGeneralSettings({ ...generalSettings, store_favicon: e.target.value })}
                                            placeholder="/favicon.ico"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section C: Social Media Handles */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <Share2 size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Social Media Accounts & Presence</span>
                                </div>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Facebook Page URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.social_facebook}
                                            onChange={e => setGeneralSettings({ ...generalSettings, social_facebook: e.target.value })}
                                            placeholder="https://facebook.com/acme"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Instagram Handle / URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.social_instagram}
                                            onChange={e => setGeneralSettings({ ...generalSettings, social_instagram: e.target.value })}
                                            placeholder="https://instagram.com/acme"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Twitter / X URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.social_twitter}
                                            onChange={e => setGeneralSettings({ ...generalSettings, social_twitter: e.target.value })}
                                            placeholder="https://x.com/acme"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>LinkedIn Page URL</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={generalSettings.social_linkedin}
                                            onChange={e => setGeneralSettings({ ...generalSettings, social_linkedin: e.target.value })}
                                            placeholder="https://linkedin.com/company/acme"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('general', generalSettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving Profile...' : 'Save General Profile'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 2: LOCALIZATION */}
                {activeTab === 'localization' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <Globe size={15} style={{ color: '#10b981' }} />
                                    <span>Regional Formatting, Timezone & Units</span>
                                </div>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <DollarSign size={13} style={{ color: '#10b981' }} />
                                            Default Base Currency
                                        </label>
                                        <select
                                            className="form-select"
                                            value={localizationSettings.default_currency}
                                            onChange={e => setLocalizationSettings({ ...localizationSettings, default_currency: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="INR">INR (₹ - Indian Rupee)</option>
                                            <option value="USD">USD ($ - US Dollar)</option>
                                            <option value="EUR">EUR (€ - Euro)</option>
                                            <option value="GBP">GBP (£ - British Pound)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Clock size={13} style={{ color: '#10b981' }} />
                                            System Timezone
                                        </label>
                                        <select
                                            className="form-select"
                                            value={localizationSettings.timezone}
                                            onChange={e => setLocalizationSettings({ ...localizationSettings, timezone: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                                            <option value="UTC">UTC (+00:00)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Calendar size={13} style={{ color: '#10b981' }} />
                                            Display Date Format
                                        </label>
                                        <select
                                            className="form-select"
                                            value={localizationSettings.date_format}
                                            onChange={e => setLocalizationSettings({ ...localizationSettings, date_format: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="Y-m-d">YYYY-MM-DD (e.g. 2026-08-20)</option>
                                            <option value="d/m/Y">DD/MM/YYYY (e.g. 20/08/2026)</option>
                                            <option value="m/d/Y">MM/DD/YYYY (e.g. 08/20/2026)</option>
                                            <option value="d-m-Y">DD-MM-YYYY (e.g. 20-08-2026)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Package size={13} style={{ color: '#10b981' }} />
                                            Standard Weight Unit
                                        </label>
                                        <select
                                            className="form-select"
                                            value={localizationSettings.weight_unit}
                                            onChange={e => setLocalizationSettings({ ...localizationSettings, weight_unit: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="g">Grams (g)</option>
                                            <option value="lbs">Pounds (lbs)</option>
                                            <option value="oz">Ounces (oz)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            <Sliders size={13} style={{ color: '#10b981' }} />
                                            Standard Dimension Unit
                                        </label>
                                        <select
                                            className="form-select"
                                            value={localizationSettings.dimension_unit}
                                            onChange={e => setLocalizationSettings({ ...localizationSettings, dimension_unit: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="cm">Centimeters (cm)</option>
                                            <option value="m">Meters (m)</option>
                                            <option value="in">Inches (in)</option>
                                            <option value="ft">Feet (ft)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Number Formatting
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={localizationSettings.number_format}
                                            onChange={e => setLocalizationSettings({ ...localizationSettings, number_format: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('localization', localizationSettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save Localization Settings'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 3: COMMERCE RULES */}
                {activeTab === 'commerce' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <ShoppingBag size={15} style={{ color: '#f59e0b' }} />
                                    <span>Checkout & Commerce Operation Rules</span>
                                </div>
                            </div>
                            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 700 }}>Guest Checkout Access</h4>
                                        <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--admin-muted)' }}>Allow buyers to place storefront orders without creating a customer account.</p>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <span className={`badge ${commerceSettings.guest_checkout ? 'badge-active' : 'badge-inactive'}`}>
                                            {commerceSettings.guest_checkout ? 'ENABLED' : 'DISABLED'}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={commerceSettings.guest_checkout}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, guest_checkout: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                        />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 700 }}>Automated Inventory Management</h4>
                                        <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--admin-muted)' }}>Automatically deduct inventory stock levels upon order confirmation.</p>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <span className={`badge ${commerceSettings.stock_management ? 'badge-active' : 'badge-inactive'}`}>
                                            {commerceSettings.stock_management ? 'ENABLED' : 'DISABLED'}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={commerceSettings.stock_management}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, stock_management: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                        />
                                    </label>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 700 }}>Customer Reviews Engine</h4>
                                        <p style={{ margin: 0, fontSize: '0.76rem', color: 'var(--admin-muted)' }}>Allow verified customer accounts to submit product ratings and feedback.</p>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <span className={`badge ${commerceSettings.reviews_enabled ? 'badge-active' : 'badge-inactive'}`}>
                                            {commerceSettings.reviews_enabled ? 'ENABLED' : 'DISABLED'}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={commerceSettings.reviews_enabled}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, reviews_enabled: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                        />
                                    </label>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '4px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Minimum Order Value ({defaultCurrencyObj.symbol})
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={commerceSettings.min_order_value}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, min_order_value: parseFloat(e.target.value) || 0 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Maximum Order Value Limit ({defaultCurrencyObj.symbol})
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={commerceSettings.max_order_value}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, max_order_value: parseFloat(e.target.value) || 0 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Free Shipping Threshold Amount ({defaultCurrencyObj.symbol})
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={commerceSettings.free_shipping_threshold}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Cart Reservation Hold Expiry (Minutes)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={commerceSettings.cart_reservation_ttl_minutes}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, cart_reservation_ttl_minutes: parseInt(e.target.value) || 15 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Auto-Cancel Unpaid Orders Timeout (Hours)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={commerceSettings.unpaid_order_cancellation_hours}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, unpaid_order_cancellation_hours: parseInt(e.target.value) || 24 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Default Low Stock Alert Threshold (Units)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={commerceSettings.low_stock_threshold_default}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, low_stock_threshold_default: parseInt(e.target.value) || 5 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Storefront Catalog Products Per Page (Default)
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            max="100"
                                            value={commerceSettings.products_per_page || 12}
                                            onChange={e => setCommerceSettings({ ...commerceSettings, products_per_page: parseInt(e.target.value) || 12 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('commerce', commerceSettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save Commerce Rules'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* NEW TAB 4: SMTP EMAIL */}
                {activeTab === 'email' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <Mail size={15} style={{ color: '#f59e0b' }} />
                                    <span>SMTP Mailer & Transactional Mail Configuration</span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setTestEmailModal(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 10px', borderRadius: '6px', fontSize: '0.78rem' }}
                                >
                                    <Send size={12} />
                                    <span>Send Test Email</span>
                                </button>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Mailer Provider</label>
                                        <select
                                            className="form-select"
                                            value={emailSettings.mail_driver}
                                            onChange={e => setEmailSettings({ ...emailSettings, mail_driver: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="smtp">Custom SMTP Server</option>
                                            <option value="mailgun">Mailgun API</option>
                                            <option value="ses">Amazon SES</option>
                                            <option value="sendgrid">SendGrid API</option>
                                            <option value="postmark">Postmark</option>
                                            <option value="log">Log (Local Development)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>SMTP Host Server</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={emailSettings.smtp_host}
                                            onChange={e => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                                            placeholder="smtp.mailtrap.io"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>SMTP Port</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={emailSettings.smtp_port}
                                            onChange={e => setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value) || 587 })}
                                            placeholder="587 / 465 / 2525"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Encryption Protocol</label>
                                        <select
                                            className="form-select"
                                            value={emailSettings.smtp_encryption}
                                            onChange={e => setEmailSettings({ ...emailSettings, smtp_encryption: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="tls">TLS (Recommended)</option>
                                            <option value="ssl">SSL</option>
                                            <option value="none">None (Plaintext)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Sender From Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={emailSettings.from_name}
                                            onChange={e => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                                            placeholder="Acme Support"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Sender From Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={emailSettings.from_email}
                                            onChange={e => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                                            placeholder="support@acme.com"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>SMTP Auth Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={emailSettings.smtp_username}
                                            onChange={e => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                                            placeholder="smtp_user"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>SMTP Auth Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={emailSettings.smtp_password}
                                            onChange={e => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                                            placeholder="••••••••••••"
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('email', emailSettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save Email Configuration'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* NEW TAB 5: PAYMENT GATEWAYS */}
                {activeTab === 'payment' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Razorpay */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <CreditCard size={15} style={{ color: '#10b981' }} />
                                    <span>Razorpay Payment Integration</span>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <span className={`badge ${paymentSettings.razorpay_enabled ? 'badge-active' : 'badge-inactive'}`}>
                                        {paymentSettings.razorpay_enabled ? 'ACTIVE' : 'DISABLED'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={paymentSettings.razorpay_enabled}
                                        onChange={e => setPaymentSettings({ ...paymentSettings, razorpay_enabled: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                    />
                                </label>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Razorpay Key ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={paymentSettings.razorpay_key}
                                            onChange={e => setPaymentSettings({ ...paymentSettings, razorpay_key: e.target.value })}
                                            placeholder="rzp_test_XXXXXXXX"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Razorpay Key Secret</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={paymentSettings.razorpay_secret}
                                            onChange={e => setPaymentSettings({ ...paymentSettings, razorpay_secret: e.target.value })}
                                            placeholder="••••••••••••"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stripe */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <CreditCard size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Stripe Credit Card Integration</span>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <span className={`badge ${paymentSettings.stripe_enabled ? 'badge-active' : 'badge-inactive'}`}>
                                        {paymentSettings.stripe_enabled ? 'ACTIVE' : 'DISABLED'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={paymentSettings.stripe_enabled}
                                        onChange={e => setPaymentSettings({ ...paymentSettings, stripe_enabled: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                    />
                                </label>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Stripe Publishable Key</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={paymentSettings.stripe_key}
                                            onChange={e => setPaymentSettings({ ...paymentSettings, stripe_key: e.target.value })}
                                            placeholder="pk_test_XXXXXXXX"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Stripe Secret Key</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={paymentSettings.stripe_secret}
                                            onChange={e => setPaymentSettings({ ...paymentSettings, stripe_secret: e.target.value })}
                                            placeholder="••••••••••••"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cash on Delivery (COD) Rules */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <Truck size={15} style={{ color: '#f59e0b' }} />
                                    <span>Cash on Delivery (COD) Rules</span>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <span className={`badge ${paymentSettings.cod_enabled ? 'badge-active' : 'badge-inactive'}`}>
                                        {paymentSettings.cod_enabled ? 'ENABLED' : 'DISABLED'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={paymentSettings.cod_enabled}
                                        onChange={e => setPaymentSettings({ ...paymentSettings, cod_enabled: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                    />
                                </label>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Maximum Permitted COD Order Value ({defaultCurrencyObj.symbol})
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={paymentSettings.max_cod_amount}
                                            onChange={e => setPaymentSettings({ ...paymentSettings, max_cod_amount: parseFloat(e.target.value) || 0 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>
                                            Additional COD Handling Fee ({defaultCurrencyObj.symbol})
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={paymentSettings.cod_handling_fee}
                                            onChange={e => setPaymentSettings({ ...paymentSettings, cod_handling_fee: parseFloat(e.target.value) || 0 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('payment', paymentSettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save Payment Settings'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* NEW TAB 6: SMS & WHATSAPP GATEWAYS */}
                {activeTab === 'notifications_gateway' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <MessageSquare size={15} style={{ color: '#8b5cf6' }} />
                                    <span>SMS & WhatsApp Messaging Gateway</span>
                                </div>
                            </div>
                            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>SMS Provider Service</label>
                                        <select
                                            className="form-select"
                                            value={notificationsGatewaySettings.sms_provider}
                                            onChange={e => setNotificationsGatewaySettings({ ...notificationsGatewaySettings, sms_provider: e.target.value })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        >
                                            <option value="msg91">MSG91 India</option>
                                            <option value="twilio">Twilio SMS</option>
                                            <option value="fast2sms">Fast2SMS</option>
                                            <option value="disabled">Disabled (No SMS Sent)</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>SMS API Key / Auth Token</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={notificationsGatewaySettings.sms_api_key}
                                            onChange={e => setNotificationsGatewaySettings({ ...notificationsGatewaySettings, sms_api_key: e.target.value })}
                                            placeholder="api_key_XXXXXXXX"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Sender ID / DLT Header</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={notificationsGatewaySettings.sms_sender_id}
                                            onChange={e => setNotificationsGatewaySettings({ ...notificationsGatewaySettings, sms_sender_id: e.target.value })}
                                            placeholder="ACMSTR"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                        <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>WhatsApp Business Notifications Engine</span>
                                        <input
                                            type="checkbox"
                                            checked={notificationsGatewaySettings.whatsapp_enabled}
                                            onChange={e => setNotificationsGatewaySettings({ ...notificationsGatewaySettings, whatsapp_enabled: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                        <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Dispatch SMS on Order Confirmation</span>
                                        <input
                                            type="checkbox"
                                            checked={notificationsGatewaySettings.order_confirmation_sms}
                                            onChange={e => setNotificationsGatewaySettings({ ...notificationsGatewaySettings, order_confirmation_sms: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                        <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>Dispatch SMS on Shipment Out for Delivery</span>
                                        <input
                                            type="checkbox"
                                            checked={notificationsGatewaySettings.dispatch_sms}
                                            onChange={e => setNotificationsGatewaySettings({ ...notificationsGatewaySettings, dispatch_sms: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-primary)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('notifications_gateway', notificationsGatewaySettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save SMS & WhatsApp Gateway'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* NEW TAB 7: SECURITY & SYSTEM MAINTENANCE */}
                {activeTab === 'security' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Section A: Storefront Maintenance Mode */}
                        <div className="form-section-box" style={{ border: securitySettings.maintenance_mode_enabled ? '1px solid var(--admin-danger)' : '1px solid var(--admin-border)' }}>
                            <div className="form-section-header" style={{ backgroundColor: securitySettings.maintenance_mode_enabled ? 'var(--admin-danger-light)' : 'var(--admin-card-hover)' }}>
                                <div className="form-section-title">
                                    <Server size={15} style={{ color: securitySettings.maintenance_mode_enabled ? 'var(--admin-danger)' : 'var(--admin-primary)' }} />
                                    <span>Storefront Maintenance Mode</span>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <span className={`badge ${securitySettings.maintenance_mode_enabled ? 'badge-inactive' : 'badge-active'}`}>
                                        {securitySettings.maintenance_mode_enabled ? 'MAINTENANCE ACTIVE' : 'STORE ONLINE'}
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={securitySettings.maintenance_mode_enabled}
                                        onChange={e => setSecuritySettings({ ...securitySettings, maintenance_mode_enabled: e.target.checked })}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--admin-danger)' }}
                                    />
                                </label>
                            </div>
                            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Public Maintenance Message</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={securitySettings.maintenance_message}
                                        onChange={e => setSecuritySettings({ ...securitySettings, maintenance_message: e.target.value })}
                                        style={{ height: '36px', borderRadius: '8px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Staff IP Bypass Whitelist (Comma-Separated IPs)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={securitySettings.ip_whitelist}
                                        onChange={e => setSecuritySettings({ ...securitySettings, ip_whitelist: e.target.value })}
                                        placeholder="127.0.0.1, 192.168.1.10"
                                        style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section B: Security Policies */}
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <ShieldCheck size={15} style={{ color: '#8b5cf6' }} />
                                    <span>Staff Session & Auth Security Controls</span>
                                </div>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Max Failed Login Attempts Lockout</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={securitySettings.max_login_attempts}
                                            onChange={e => setSecuritySettings({ ...securitySettings, max_login_attempts: parseInt(e.target.value) || 5 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Session Inactivity Timeout (Minutes)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={securitySettings.session_timeout_minutes}
                                            onChange={e => setSecuritySettings({ ...securitySettings, session_timeout_minutes: parseInt(e.target.value) || 30 })}
                                            style={{ height: '36px', borderRadius: '8px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('security', securitySettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save Security Policies'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 8: SEO DEFAULTS */}
                {activeTab === 'seo' && (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <Search size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Global SEO & Search Engine Meta Defaults</span>
                                </div>
                            </div>
                            <div className="form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.83rem' }}>Default Meta Title</label>
                                        <span style={{ fontSize: '0.72rem', color: (seoSettings.default_meta_title?.length || 0) > 60 ? 'var(--admin-danger)' : 'var(--admin-muted)' }}>
                                            {seoSettings.default_meta_title?.length || 0} / 60 chars
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={seoSettings.default_meta_title}
                                        onChange={e => setSeoSettings({ ...seoSettings, default_meta_title: e.target.value })}
                                        style={{ height: '36px', borderRadius: '8px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.83rem' }}>Default Meta Description</label>
                                        <span style={{ fontSize: '0.72rem', color: (seoSettings.default_meta_description?.length || 0) > 160 ? 'var(--admin-danger)' : 'var(--admin-muted)' }}>
                                            {seoSettings.default_meta_description?.length || 0} / 160 chars
                                        </span>
                                    </div>
                                    <textarea
                                        className="form-control"
                                        rows={3}
                                        value={seoSettings.default_meta_description}
                                        onChange={e => setSeoSettings({ ...seoSettings, default_meta_description: e.target.value })}
                                        style={{ borderRadius: '8px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Default OpenGraph (OG) Image URL</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={seoSettings.default_og_image}
                                        onChange={e => setSeoSettings({ ...seoSettings, default_og_image: e.target.value })}
                                        placeholder="/images/og-default.jpg"
                                        style={{ height: '36px', borderRadius: '8px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Robots.txt Directives</label>
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        value={seoSettings.robots_txt}
                                        onChange={e => setSeoSettings({ ...seoSettings, robots_txt: e.target.value })}
                                        style={{ borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section-box">
                            <div className="form-section-header">
                                <div className="form-section-title">
                                    <BarChart3 size={15} style={{ color: 'var(--admin-primary)' }} />
                                    <span>Analytics & Marketing Tracking IDs</span>
                                </div>
                            </div>
                            <div className="form-section-body">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Google Analytics 4 ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={seoSettings.google_analytics_id}
                                            onChange={e => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
                                            placeholder="G-XXXXXXX"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Facebook Pixel ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={seoSettings.facebook_pixel_id}
                                            onChange={e => setSeoSettings({ ...seoSettings, facebook_pixel_id: e.target.value })}
                                            placeholder="123456789012345"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Google Tag Manager (GTM) ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={seoSettings.google_tag_manager_id}
                                            onChange={e => setSeoSettings({ ...seoSettings, google_tag_manager_id: e.target.value })}
                                            placeholder="GTM-XXXXXXX"
                                            style={{ height: '36px', borderRadius: '8px', fontFamily: 'monospace' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button
                                className="btn btn-primary"
                                disabled={saving}
                                onClick={() => handleSaveGroup('seo', seoSettings)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px', padding: '0 18px', borderRadius: '8px', fontWeight: 700 }}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save SEO Defaults'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* TAB 9: CURRENCIES (Enclosed Table Layout) */}
                {activeTab === 'currencies' && (
                    <div className="table-responsive" style={{ margin: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>CODE</th>
                                    <th>NAME</th>
                                    <th>SYMBOL</th>
                                    <th>EXCHANGE RATE</th>
                                    <th>DECIMALS</th>
                                    <th>STATUS</th>
                                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCurrencies.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            No currencies found matching filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCurrencies.map(curr => (
                                        <tr key={curr.id}>
                                            <td style={{ fontWeight: 800, color: 'var(--admin-text)' }}>{curr.code}</td>
                                            <td style={{ fontWeight: 600 }}>{curr.name}</td>
                                            <td style={{ fontWeight: 700, fontSize: '0.9rem' }}>{curr.symbol}</td>
                                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{curr.exchange_rate}</td>
                                            <td>{curr.decimal_places}</td>
                                            <td>
                                                {curr.is_default ? (
                                                    <span className="badge badge-active">
                                                        <CheckCircle2 size={12} /> Default Base
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleSetDefaultCurrency(curr.id)}
                                                        style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '6px' }}
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => openEditCurrencyModal(curr)}
                                                        title="Edit Currency"
                                                        style={{ padding: '5px 8px' }}
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    {!curr.is_default && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDeleteCurrency(curr.id)}
                                                            title="Delete Currency"
                                                            style={{ padding: '5px 8px' }}
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 10: AUDIT LOGS (Enclosed Table Layout) */}
                {activeTab === 'audit' && (
                    <div className="table-responsive" style={{ margin: 0 }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>LOG ID</th>
                                    <th>ADMIN USER</th>
                                    <th>GROUP</th>
                                    <th>ACTION</th>
                                    <th>IP ADDRESS</th>
                                    <th>TIMESTAMP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAuditLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            No settings audit log entries recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAuditLogs.map(log => (
                                        <tr key={log.id}>
                                            <td style={{ fontWeight: 700 }}>#{log.id}</td>
                                            <td style={{ fontWeight: 600 }}>
                                                {log.admin_user ? log.admin_user.name : 'System Administrator'}
                                            </td>
                                            <td>
                                                <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: 'var(--admin-bg)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                                                    {log.group}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge badge-shipped">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{log.ip_address || '127.0.0.1'}</td>
                                            <td style={{ color: 'var(--admin-muted)', fontSize: '0.78rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* TEST EMAIL MODAL DIALOG */}
            {testEmailModal && (
                <div className="modal-overlay" onClick={() => setTestEmailModal(false)}>
                    <div className="modal-card" style={{ width: '440px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Send size={15} style={{ color: 'var(--admin-primary)' }} />
                                Dispatch Test Email
                            </h3>
                            <button
                                type="button"
                                onClick={() => setTestEmailModal(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendTestEmail}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Recipient Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        required
                                        value={testEmailAddress}
                                        onChange={e => setTestEmailAddress(e.target.value)}
                                        placeholder="admin@acme.com"
                                        style={{ height: '38px', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setTestEmailModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={testingEmail} style={{ fontWeight: 700 }}>
                                    {testingEmail ? 'Sending...' : 'Send Test Mail'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CURRENCY MODAL DIALOG */}
            {isCurrencyModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCurrencyModalOpen(false)}>
                    <div className="modal-card" style={{ width: '480px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                                {editingCurrency ? 'Edit Store Currency' : 'Add New Currency'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCurrencyModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCurrency}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>ISO Code (3 Letters)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        maxLength={3}
                                        value={currencyForm.code}
                                        onChange={e => setCurrencyForm({ ...currencyForm, code: e.target.value.toUpperCase() })}
                                        placeholder="USD"
                                        style={{ height: '36px', borderRadius: '8px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Full Currency Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={currencyForm.name}
                                        onChange={e => setCurrencyForm({ ...currencyForm, name: e.target.value })}
                                        placeholder="US Dollar"
                                        style={{ height: '36px', borderRadius: '8px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.83rem' }}>Symbol</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={currencyForm.symbol}
                                        onChange={e => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                                        placeholder="$"
                                        style={{ height: '36px', borderRadius: '8px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.83rem' }}>Exchange Rate (relative to base default)</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        className="form-control"
                                        required
                                        value={currencyForm.exchange_rate}
                                        onChange={e => setCurrencyForm({ ...currencyForm, exchange_rate: parseFloat(e.target.value) || 1.0 })}
                                        style={{ height: '36px', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsCurrencyModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ fontWeight: 700 }}>
                                    {saving ? 'Saving...' : 'Save Currency'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
