import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    Send,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Search,
    Plus,
    Edit3,
    Trash2,
    Eye,
    RotateCcw,
    X,
    Code,
    Sliders,
    Zap,
    ChevronLeft,
    ChevronRight,
    Download,
    Radio,
    Users,
    Activity,
    ChevronUp,
    ChevronDown,
    Megaphone,
    FileText
} from 'lucide-react';

export default function NotificationPage() {
    const [templates, setTemplates] = useState([]);
    const [logs, setLogs] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState({
        total_templates: 0,
        active_templates: 0,
        total_logs: 0,
        failed_logs: 0,
        sent_logs: 0,
        channel_breakdown: { email: 0, sms: 0, push: 0, in_app: 0 },
    });
    const [analytics, setAnalytics] = useState({
        delivery_success_rate: 100,
        queued_rate: 0,
        failed_rate: 0,
        channel_health: {
            email: { percentage: 100, delivered: 0, total: 0 },
            sms: { percentage: 100, delivered: 0, total: 0 },
            push: { percentage: 100, delivered: 0, total: 0 },
        }
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notification, setNotification] = useState(null);

    // Collapsible Analytics Panel
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Active View Mode: 'templates' | 'logs' | 'campaigns'
    const [viewMode, setViewMode] = useState('templates');

    // Filters
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'email', 'sms', 'push', 'logs', 'campaigns'
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    // Modals & Drawers
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const [formEvent, setFormEvent] = useState('');
    const [formChannel, setFormChannel] = useState('email');
    const [formSubject, setFormSubject] = useState('');
    const [formBody, setFormBody] = useState('');
    const [formStatus, setFormStatus] = useState(true);

    const [isTestDispatchOpen, setIsTestDispatchOpen] = useState(false);
    const [testRecipient, setTestRecipient] = useState('sarah.connor@example.com');
    const [testDispatching, setTestDispatching] = useState(false);

    const [selectedLog, setSelectedLog] = useState(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // Broadcast Campaign Modal
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [campTitle, setCampTitle] = useState('');
    const [campChannel, setCampChannel] = useState('email');
    const [campSegment, setCampSegment] = useState('all');
    const [campSubject, setCampSubject] = useState('');
    const [campContent, setCampContent] = useState('');
    const [campSubmitting, setCampSubmitting] = useState(false);

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchStats = async () => {
        try {
            const [sRes, aRes] = await Promise.all([
                axios.get('/api/v1/admin/notifications/stats'),
                axios.get('/api/v1/admin/notifications/analytics')
            ]);
            if (sRes.data?.success && sRes.data?.data) {
                setStats(sRes.data.data);
            }
            if (aRes.data?.success && aRes.data?.data) {
                setAnalytics(aRes.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch notification stats & analytics:', err);
        }
    };

    const fetchTemplates = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeTab !== 'all' && activeTab !== 'logs' && activeTab !== 'campaigns') {
                params.append('channel', activeTab);
            }
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);
            params.append('page', targetPage);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/notifications/templates?${params.toString()}`);
            if (res.data?.success) {
                const items = res.data.data || [];
                const meta = res.data.meta || {};
                setTemplates(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch templates:', err);
            showNotify('Failed to load notification templates.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, statusFilter, search, page]);

    const fetchLogs = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);
            if (search) params.append('search', search);
            params.append('page', targetPage);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/notifications/logs?${params.toString()}`);
            if (res.data?.success) {
                const items = res.data.data || [];
                const meta = res.data.meta || {};
                setLogs(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch logs:', err);
            showNotify('Failed to load notification audit logs.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [statusFilter, search, page]);

    const fetchCampaigns = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', targetPage);
            params.append('per_page', 10);
            const res = await axios.get(`/api/v1/admin/notifications/campaigns?${params.toString()}`);
            if (res.data?.success) {
                const items = res.data.data || [];
                const meta = res.data.meta || {};
                setCampaigns(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
            showNotify('Failed to load notification campaigns.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (viewMode === 'templates') {
            fetchTemplates(page);
        } else if (viewMode === 'logs') {
            fetchLogs(page);
        } else if (viewMode === 'campaigns') {
            fetchCampaigns(page);
        }
    }, [viewMode, activeTab, statusFilter, search, page, fetchTemplates, fetchLogs, fetchCampaigns]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
        if (viewMode === 'templates') fetchTemplates(page);
        else if (viewMode === 'logs') fetchLogs(page);
        else fetchCampaigns(page);
    };

    const handleExportLogsCsv = () => {
        const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (search) params.append('search', search);

        window.open(`/api/v1/admin/notifications/export-logs?${params.toString()}`, '_blank');
        showNotify('Exporting notification audit logs to CSV...');
    };

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setPage(1);
        if (tabId === 'logs') {
            setViewMode('logs');
        } else if (tabId === 'campaigns') {
            setViewMode('campaigns');
        } else {
            setViewMode('templates');
        }
    };

    const handleOpenCreateModal = () => {
        setEditingTemplate(null);
        setFormEvent('order_placed');
        setFormChannel('email');
        setFormSubject('Order Confirmation - #{{order_number}}');
        setFormBody('Hi {{customer_name}},\n\nThank you for your order #{{order_number}} for {{order_total}}!');
        setFormStatus(true);
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (tpl) => {
        setEditingTemplate(tpl);
        setFormEvent(tpl.event);
        setFormChannel(tpl.channel);
        setFormSubject(tpl.subject || '');
        setFormBody(tpl.body || '');
        setFormStatus(Boolean(tpl.status));
        setIsEditModalOpen(true);
    };

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                event: formEvent,
                channel: formChannel,
                subject: formSubject,
                body: formBody,
                status: formStatus,
            };

            if (editingTemplate) {
                const res = await axios.put(`/api/v1/admin/notifications/templates/${editingTemplate.id}`, payload);
                if (res.data?.success) {
                    showNotify('Notification template updated successfully.');
                    setIsEditModalOpen(false);
                    fetchStats();
                    fetchTemplates(page);
                }
            } else {
                const res = await axios.post('/api/v1/admin/notifications/templates', payload);
                if (res.data?.success) {
                    showNotify('Notification template created successfully.');
                    setIsEditModalOpen(false);
                    fetchStats();
                    fetchTemplates(page);
                }
            }
        } catch (err) {
            console.error('Failed to save template:', err);
            showNotify(err.response?.data?.message || 'Failed to save template.', 'error');
        }
    };

    const handleToggleStatus = async (tplId) => {
        try {
            const res = await axios.patch(`/api/v1/admin/notifications/templates/${tplId}/toggle-status`);
            if (res.data?.success) {
                showNotify('Template status toggled.');
                fetchStats();
                fetchTemplates(page);
            }
        } catch (err) {
            console.error('Failed to toggle status:', err);
            showNotify('Failed to toggle status.', 'error');
        }
    };

    const handleDeleteTemplate = async (tplId) => {
        if (!window.confirm('Delete this notification template?')) return;
        try {
            const res = await axios.delete(`/api/v1/admin/notifications/templates/${tplId}`);
            if (res.data?.success) {
                showNotify('Notification template deleted.');
                fetchStats();
                fetchTemplates(page);
            }
        } catch (err) {
            console.error('Failed to delete template:', err);
            showNotify('Failed to delete template.', 'error');
        }
    };

    const handleOpenTestDispatchModal = (tpl) => {
        setEditingTemplate(tpl);
        setTestRecipient(tpl.channel === 'email' ? 'sarah.connor@example.com' : '+15550192834');
        setIsTestDispatchOpen(true);
    };

    const handleSendTestDispatch = async (e) => {
        e.preventDefault();
        if (!editingTemplate || !testRecipient) return;
        setTestDispatching(true);
        try {
            const res = await axios.post('/api/v1/admin/notifications/test-dispatch', {
                template_id: editingTemplate.id,
                recipient: testRecipient,
            });
            if (res.data?.success) {
                showNotify(`Test notification dispatched to ${testRecipient}.`);
                setIsTestDispatchOpen(false);
                fetchStats();
            }
        } catch (err) {
            console.error('Failed test dispatch:', err);
            showNotify('Test dispatch failed.', 'error');
        } finally {
            setTestDispatching(false);
        }
    };

    const handleOpenCampaignModal = () => {
        setCampTitle('Flash Sale Announcement & Promo Code');
        setCampChannel('email');
        setCampSegment('all');
        setCampSubject('⚡ Exclusive Flash Sale: 20% OFF Everything!');
        setCampContent('Hi Customer,\n\nEnjoy an exclusive 20% discount on your next order using coupon code FLASH20 at checkout!');
        setIsCampaignModalOpen(true);
    };

    const handleExecuteCampaign = async (e) => {
        e.preventDefault();
        setCampSubmitting(true);
        try {
            const res = await axios.post('/api/v1/admin/notifications/campaigns', {
                title: campTitle,
                channel: campChannel,
                target_segment: campSegment,
                subject: campSubject,
                content: campContent,
            });
            if (res.data?.success) {
                showNotify('Broadcast campaign executed successfully!');
                setIsCampaignModalOpen(false);
                fetchStats();
                if (viewMode === 'campaigns') fetchCampaigns(1);
            }
        } catch (err) {
            console.error('Failed to execute campaign:', err);
            showNotify('Failed to execute broadcast campaign.', 'error');
        } finally {
            setCampSubmitting(false);
        }
    };

    const handleRetryLog = async (logId) => {
        try {
            const res = await axios.post(`/api/v1/admin/notifications/logs/${logId}/retry`);
            if (res.data?.success) {
                showNotify('Notification log re-dispatched.');
                fetchStats();
                fetchLogs(page);
                if (selectedLog && selectedLog.id === logId) {
                    setSelectedLog(res.data.data);
                }
            }
        } catch (err) {
            console.error('Failed to retry log:', err);
            showNotify('Failed to re-dispatch notification.', 'error');
        }
    };

    const insertVariableTag = (varName) => {
        setFormBody((prev) => `${prev} {{${varName}}}`);
    };

    const getChannelBadge = (ch) => {
        switch (ch) {
            case 'email':
                return <span style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '20px', padding: '2px 9px', fontWeight: 700, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Mail size={11} /> Email</span>;
            case 'sms':
                return <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '2px 9px', fontWeight: 700, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={11} /> SMS</span>;
            case 'push':
                return <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '2px 9px', fontWeight: 700, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Smartphone size={11} /> Push</span>;
            default:
                return <span style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '20px', padding: '2px 9px', fontWeight: 700, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Bell size={11} /> In-App</span>;
        }
    };

    const getLogStatusBadge = (st) => {
        switch (st) {
            case 'delivered':
            case 'sent':
                return <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '2px 9px', fontWeight: 700, fontSize: '0.72rem' }}>Delivered</span>;
            case 'failed':
                return <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px', padding: '2px 9px', fontWeight: 700, fontSize: '0.72rem' }}>Failed</span>;
            case 'queued':
            default:
                return <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '2px 9px', fontWeight: 700, fontSize: '0.72rem' }}>Queued</span>;
        }
    };

    // Live preview text interpolation
    const renderLivePreview = (text) => {
        if (!text) return '';
        return text
            .replace(/\{\{\s*customer_name\s*\}\}/gi, 'Sarah Connor')
            .replace(/\{\{\s*order_number\s*\}\}/gi, 'ORD-89421')
            .replace(/\{\{\s*order_total\s*\}\}/gi, '$249.99')
            .replace(/\{\{\s*tracking_number\s*\}\}/gi, 'TRK-99018247')
            .replace(/\{\{\s*carrier_name\s*\}\}/gi, 'FedEx Express')
            .replace(/\{\{\s*otp_code\s*\}\}/gi, '784920')
            .replace(/\{\{\s*store_name\s*\}\}/gi, 'Apex Commerce')
            .replace(/\{\{\s*support_email\s*\}\}/gi, 'support@apexcommerce.com');
    };

    const hasActiveFilters = Boolean(search || statusFilter || activeTab !== 'all');

    return (
        <div>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 1200,
                    padding: '12px 20px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger, #ef4444)' : 'var(--admin-success, #10b981)',
                    color: '#fff',
                    boxShadow: 'var(--shadow-lg)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    animation: 'slideInRight 0.2s ease-out'
                }}>
                    {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    <span>{notification.msg}</span>
                </div>
            )}

            {/* Page Header (Sleek Single-Line Responsive Action Placement) */}
            <div className="page-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <h2 className="page-header-title">Notification Templates & Delivery Audit</h2>
                    <p className="page-header-subtitle">Manage multi-channel notification event templates, dynamic variable placeholders, test dispatches, broadcast announcements, and delivery audit logs</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                        <Activity size={14} color="var(--admin-primary)" />
                        <span>{showAnalytics ? 'Hide Health Report' : 'Delivery Analytics'}</span>
                        {showAnalytics ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleExportLogsCsv}
                        title="Export filtered delivery audit logs to CSV"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    >
                        <Download size={14} />
                        <span>Export Logs CSV</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleOpenCampaignModal}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', color: '#6366f1', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                        <Megaphone size={14} />
                        <span>Broadcast Campaign</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleOpenCreateModal}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', fontWeight: 700, whiteSpace: 'nowrap' }}
                    >
                        <Plus size={14} />
                        <span>New Template</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Cards Grid */}
            <div className="stat-cards-grid-4">
                {/* 1. Total Templates */}
                <div
                    onClick={() => handleTabChange('all')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'all' && viewMode === 'templates' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Total Templates
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {stats.total_templates}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Event triggers configured
                        </div>
                    </div>
                </div>

                {/* 2. Active Templates */}
                <div
                    onClick={() => handleTabChange('all')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Active Templates
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {stats.active_templates}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Currently enabled dispatches
                        </div>
                    </div>
                </div>

                {/* 3. Sent Delivery Audit Logs */}
                <div
                    onClick={() => handleTabChange('logs')}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: viewMode === 'logs' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Delivered Notifications
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Send size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {stats.sent_logs}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Successful delivery logs
                        </div>
                    </div>
                </div>

                {/* 4. Failed Delivery Logs */}
                <div
                    onClick={() => { handleTabChange('logs'); setStatusFilter('failed'); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Failed Dispatches
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.failed_logs > 0 ? '#ef4444' : 'var(--admin-text)' }}>
                            {stats.failed_logs}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Requires retry or investigation
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsible Delivery Analytics & Health Panel */}
            {showAnalytics && (
                <div style={{
                    backgroundColor: 'var(--admin-card-bg)',
                    borderRadius: '12px',
                    padding: '18px 20px',
                    marginBottom: '20px',
                    border: '1px solid var(--admin-border)',
                    boxShadow: 'var(--shadow-sm)',
                    animation: 'fadeIn 0.2s ease-in'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Activity size={16} color="var(--admin-primary)" />
                            Multi-Channel Notification Health & Delivery Rates
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                            Overall Delivery Success Rate: <strong style={{ color: '#10b981' }}>{analytics.delivery_success_rate}%</strong>
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div style={{ backgroundColor: 'var(--admin-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={12} /> Email Health</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6366f1' }}>{analytics.channel_health?.email?.percentage ?? 100}%</span>
                            </div>
                            <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${analytics.channel_health?.email?.percentage ?? 100}%`, height: '100%', backgroundColor: '#6366f1', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'var(--admin-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '4px' }}><MessageSquare size={12} /> SMS Health</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981' }}>{analytics.channel_health?.sms?.percentage ?? 100}%</span>
                            </div>
                            <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${analytics.channel_health?.sms?.percentage ?? 100}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'var(--admin-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '4px' }}><Smartphone size={12} /> Push Health</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b' }}>{analytics.channel_health?.push?.percentage ?? 100}%</span>
                            </div>
                            <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${analytics.channel_health?.push?.percentage ?? 100}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '4px' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Integrated Container */}
            <div className="card" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                {/* Top Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '4px',
                    padding: '10px 14px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)'
                }}>
                    {[
                        { id: 'all', label: 'All Templates', icon: <Bell size={13} /> },
                        { id: 'email', label: 'Email Templates', icon: <Mail size={13} /> },
                        { id: 'sms', label: 'SMS Templates', icon: <MessageSquare size={13} /> },
                        { id: 'push', label: 'Push Notifications', icon: <Smartphone size={13} /> },
                        { id: 'campaigns', label: 'Broadcast Campaigns', icon: <Megaphone size={13} /> },
                        { id: 'logs', label: 'Delivery Audit Logs', icon: <FileText size={13} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id)}
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
                                backgroundColor: activeTab === tab.id ? 'var(--admin-primary, #6366f1)' : 'transparent',
                                color: activeTab === tab.id ? '#ffffff' : 'var(--admin-muted, #64748b)'
                            }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div style={{
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-bg-secondary)'
                }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '260px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder={viewMode === 'templates' ? 'Search event, subject, body...' : 'Search recipient, subject...'}
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                style={{ paddingLeft: '34px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                            />
                        </div>

                        {viewMode === 'logs' && (
                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                style={{ width: '140px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                            >
                                <option value="">All Statuses</option>
                                <option value="delivered">Delivered</option>
                                <option value="queued">Queued</option>
                                <option value="failed">Failed</option>
                            </select>
                        )}

                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => { setSearch(''); setStatusFilter(''); setPage(1); }}
                                style={{ height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <RotateCcw size={13} /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Table Content */}
                <div className="table-responsive">
                    {viewMode === 'templates' ? (
                        <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)', borderBottom: '1px solid var(--admin-border)' }}>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Event Trigger</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Channel</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Subject Line</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Variables</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                                            <div>Loading notification templates...</div>
                                        </td>
                                    </tr>
                                ) : templates.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            <Bell size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                                            <div>No notification templates found.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    templates.map((tpl) => (
                                        <tr key={tpl.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--admin-text)' }}>
                                                    {tpl.event}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                    ID: #{tpl.id}
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {getChannelBadge(tpl.channel)}
                                            </td>

                                            <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {tpl.subject || <span style={{ color: 'var(--admin-muted)', fontStyle: 'italic' }}>No Subject (SMS/Push)</span>}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                                                    {tpl.body}
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '220px' }}>
                                                    {Array.isArray(tpl.variables) && tpl.variables.length > 0 ? (
                                                        tpl.variables.slice(0, 3).map((v, i) => (
                                                            <span key={i} style={{ backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600, color: 'var(--admin-muted)' }}>
                                                                {`{{${v}}}`}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>None</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(tpl.id)}
                                                    style={{
                                                        backgroundColor: tpl.status ? 'rgba(16, 185, 129, 0.15)' : 'var(--admin-border)',
                                                        color: tpl.status ? '#10b981' : 'var(--admin-muted)',
                                                        border: 'none',
                                                        borderRadius: '16px',
                                                        padding: '4px 12px',
                                                        fontSize: '0.74rem',
                                                        fontWeight: 800,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {tpl.status ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>

                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleOpenEditModal(tpl)}
                                                        title="Edit Template"
                                                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                                                    >
                                                        <Edit3 size={13} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleOpenTestDispatchModal(tpl)}
                                                        title="Test Notification Dispatch"
                                                        style={{ padding: '4px 8px', borderRadius: '6px', color: '#6366f1' }}
                                                    >
                                                        <Send size={13} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteTemplate(tpl.id)}
                                                        title="Delete Template"
                                                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : viewMode === 'campaigns' ? (
                        /* Broadcast Campaigns View */
                        <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)', borderBottom: '1px solid var(--admin-border)' }}>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Campaign Title</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Channel</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Target Segment</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Audience Size</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Date Executed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                                            <div>Loading broadcast campaigns...</div>
                                        </td>
                                    </tr>
                                ) : campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            <Megaphone size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                                            <div>No broadcast campaigns launched yet.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map((c) => (
                                        <tr key={c.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--admin-text)' }}>
                                                    {c.title}
                                                </div>
                                                {c.subject && (
                                                    <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                        Subject: {c.subject}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {getChannelBadge(c.channel)}
                                            </td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <span style={{ backgroundColor: 'var(--admin-bg-secondary)', border: '1px solid var(--admin-border)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
                                                    {c.target_segment.replace(/_/g, ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, fontSize: '0.84rem' }}>
                                                {c.recipients_count} Customers
                                            </td>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {getLogStatusBadge(c.status)}
                                            </td>
                                            <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                {c.created_at ? new Date(c.created_at).toLocaleString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        /* Delivery Audit Logs View */
                        <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--admin-bg-secondary)', borderBottom: '1px solid var(--admin-border)' }}>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Recipient</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Event</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Channel</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Content Preview</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Status</th>
                                    <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                                            <div>Loading delivery audit logs...</div>
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                            <Bell size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                                            <div>No delivery logs found.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--admin-text)' }}>
                                                    {log.recipient}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                    {log.sent_at ? new Date(log.sent_at).toLocaleString() : 'Not sent'}
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text)' }}>
                                                    {log.event}
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {getChannelBadge(log.channel)}
                                            </td>

                                            <td style={{ padding: '12px 14px', maxWidth: '240px' }}>
                                                {log.subject && (
                                                    <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {log.subject}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {log.content}
                                                </div>
                                            </td>

                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {getLogStatusBadge(log.status)}
                                            </td>

                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => { setSelectedLog(log); setIsLogModalOpen(true); }}
                                                        title="Inspect Log Detail & Trace"
                                                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                                                    >
                                                        <Eye size={13} />
                                                    </button>

                                                    {log.status === 'failed' && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleRetryLog(log.id)}
                                                            title="Retry Failed Dispatch"
                                                            style={{ padding: '4px 8px', borderRadius: '6px', color: '#10b981' }}
                                                        >
                                                            <RotateCcw size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Footer */}
                {pagination.last_page > 1 && (
                    <div style={{
                        padding: '12px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--admin-border)',
                        backgroundColor: 'var(--admin-card-bg)'
                    }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                            Showing page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total items)
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page === 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px' }}
                            >
                                <ChevronLeft size={14} /> Previous
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.last_page))}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '6px' }}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Template Create & Edit Modal */}
            {isEditModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '680px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--admin-border)',
                        animation: 'scaleUp 0.15s ease-out'
                    }}>
                        <form onSubmit={handleSaveTemplate}>
                            <div style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid var(--admin-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--admin-bg-secondary)'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                        {editingTemplate ? `Edit Template #${editingTemplate.id}` : 'Create New Notification Template'}
                                    </h3>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                        Configure event trigger, subject line, body text, and dynamic variables
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{ background: 'none', border: 'none', color: 'var(--admin-muted)', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            Event Trigger Key
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g. order_shipped"
                                            value={formEvent}
                                            onChange={(e) => setFormEvent(e.target.value)}
                                            required
                                            disabled={Boolean(editingTemplate)}
                                            style={{ fontSize: '0.84rem', borderRadius: '8px' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            Dispatch Channel
                                        </label>
                                        <select
                                            className="form-select"
                                            value={formChannel}
                                            onChange={(e) => setFormChannel(e.target.value)}
                                            disabled={Boolean(editingTemplate)}
                                            style={{ fontSize: '0.84rem', borderRadius: '8px' }}
                                        >
                                            <option value="email">Email</option>
                                            <option value="sms">SMS</option>
                                            <option value="push">Push Notification</option>
                                            <option value="in_app">In-App Notification</option>
                                        </select>
                                    </div>
                                </div>

                                {formChannel === 'email' && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            Email Subject Line
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Subject line with {{order_number}}..."
                                            value={formSubject}
                                            onChange={(e) => setFormSubject(e.target.value)}
                                            style={{ fontSize: '0.84rem', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}

                                <div style={{ marginBottom: '14px' }}>
                                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                        Insert Variable Chips (Click to append):
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        {['customer_name', 'order_number', 'order_total', 'tracking_number', 'carrier_name', 'otp_code', 'store_name'].map((v) => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => insertVariableTag(v)}
                                                style={{
                                                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                                    color: 'var(--admin-primary)',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                    borderRadius: '6px',
                                                    padding: '3px 8px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                + {`{{${v}}}`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                        Notification Message Body
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="5"
                                        value={formBody}
                                        onChange={(e) => setFormBody(e.target.value)}
                                        required
                                        style={{ fontSize: '0.86rem', borderRadius: '8px' }}
                                    />
                                </div>

                                <div style={{ backgroundColor: 'var(--admin-bg-secondary)', padding: '14px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--admin-primary)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Zap size={13} /> Live Variable Interpolation Preview
                                    </div>
                                    {formSubject && formChannel === 'email' && (
                                        <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--admin-text)', marginBottom: '6px' }}>
                                            Subject: {renderLivePreview(formSubject)}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                        {renderLivePreview(formBody)}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '16px 20px',
                                borderTop: '1px solid var(--admin-border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--admin-bg-secondary)'
                            }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700 }}>
                                    <input
                                        type="checkbox"
                                        checked={formStatus}
                                        onChange={(e) => setFormStatus(e.target.checked)}
                                    />
                                    <span>Enable Template Dispatch</span>
                                </label>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-sm"
                                        style={{ fontWeight: 700 }}
                                    >
                                        Save Template
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Broadcast Campaign Modal */}
            {isCampaignModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '600px',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--admin-border)'
                    }}>
                        <form onSubmit={handleExecuteCampaign}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--admin-bg-secondary)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Megaphone size={18} color="#6366f1" /> Create & Broadcast Announcement Campaign
                                </h3>
                                <button type="button" onClick={() => setIsCampaignModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                        Campaign Title
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Black Friday 30% OFF Flash Sale"
                                        value={campTitle}
                                        onChange={(e) => setCampTitle(e.target.value)}
                                        required
                                        style={{ fontSize: '0.86rem', borderRadius: '8px' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            Dispatch Channel
                                        </label>
                                        <select
                                            className="form-select"
                                            value={campChannel}
                                            onChange={(e) => setCampChannel(e.target.value)}
                                            style={{ fontSize: '0.84rem', borderRadius: '8px' }}
                                        >
                                            <option value="email">Email</option>
                                            <option value="sms">SMS</option>
                                            <option value="push">Push Notification</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            Target Customer Segment
                                        </label>
                                        <select
                                            className="form-select"
                                            value={campSegment}
                                            onChange={(e) => setCampSegment(e.target.value)}
                                            style={{ fontSize: '0.84rem', borderRadius: '8px' }}
                                        >
                                            <option value="all">All Registered Customers</option>
                                            <option value="verified_buyers">Verified Buyers Only</option>
                                            <option value="active">Active Accounts</option>
                                        </select>
                                    </div>
                                </div>

                                {campChannel === 'email' && (
                                    <div style={{ marginBottom: '14px' }}>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                            Announcement Subject Line
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Subject line..."
                                            value={campSubject}
                                            onChange={(e) => setCampSubject(e.target.value)}
                                            style={{ fontSize: '0.86rem', borderRadius: '8px' }}
                                        />
                                    </div>
                                )}

                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                        Announcement Content Body
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Write broadcast announcement message..."
                                        value={campContent}
                                        onChange={(e) => setCampContent(e.target.value)}
                                        required
                                        style={{ fontSize: '0.86rem', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: 'var(--admin-bg-secondary)' }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCampaignModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={campSubmitting} style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Send size={13} />
                                    <span>{campSubmitting ? 'Executing Broadcast...' : 'Launch Broadcast Campaign'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Test Dispatch Modal */}
            {isTestDispatchOpen && editingTemplate && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '480px',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--admin-border)'
                    }}>
                        <form onSubmit={handleSendTestDispatch}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                    Test Notification Dispatch
                                </h3>
                                <button type="button" onClick={() => setIsTestDispatchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <p style={{ margin: '0 0 14px 0', fontSize: '0.84rem', color: 'var(--admin-muted)' }}>
                                    Send a live mock test notification for event <strong>{editingTemplate.event}</strong> ({editingTemplate.channel.toUpperCase()}).
                                </p>

                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: '4px' }}>
                                    Target Recipient {editingTemplate.channel === 'email' ? '(Email Address)' : '(Mobile Phone Number)'}
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={editingTemplate.channel === 'email' ? 'admin@example.com' : '+15550192834'}
                                    value={testRecipient}
                                    onChange={(e) => setTestRecipient(e.target.value)}
                                    required
                                    style={{ fontSize: '0.86rem', borderRadius: '8px', marginBottom: '14px' }}
                                />
                            </div>

                            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsTestDispatchOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={testDispatching} style={{ fontWeight: 700 }}>
                                    {testDispatching ? 'Dispatching...' : 'Send Test Notification'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delivery Audit Log Inspection Modal */}
            {isLogModalOpen && selectedLog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        backgroundColor: 'var(--admin-card-bg)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '600px',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--admin-border)'
                    }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                    Notification Delivery Log #{selectedLog.id}
                                </h3>
                                <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                    Event: {selectedLog.event} • Channel: {selectedLog.channel.toUpperCase()}
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsLogModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px', backgroundColor: 'var(--admin-bg-secondary)', padding: '12px', borderRadius: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Recipient</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--admin-text)', marginTop: '2px' }}>{selectedLog.recipient}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Delivery Status</div>
                                    <div style={{ marginTop: '2px' }}>{getLogStatusBadge(selectedLog.status)}</div>
                                </div>
                            </div>

                            {selectedLog.subject && (
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)' }}>Subject</div>
                                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--admin-text)' }}>{selectedLog.subject}</div>
                                </div>
                            )}

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '4px' }}>Dispatched Message Content</div>
                                <div style={{ fontSize: '0.84rem', color: 'var(--admin-text)', whiteSpace: 'pre-wrap', backgroundColor: 'var(--admin-bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                    {selectedLog.content}
                                </div>
                            </div>

                            {selectedLog.failure_reason && (
                                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>Failure Error Trace</div>
                                    <div style={{ fontSize: '0.78rem', color: '#ef4444', fontFamily: 'monospace' }}>{selectedLog.failure_reason}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                {selectedLog.status === 'failed' && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleRetryLog(selectedLog.id)}
                                        style={{ color: '#10b981', fontWeight: 700, fontSize: '0.78rem' }}
                                    >
                                        <RotateCcw size={13} /> Retry Notification
                                    </button>
                                )}
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsLogModalOpen(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
