import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Ticket,
    Search,
    Plus,
    Edit3,
    Trash2,
    CheckCircle,
    AlertCircle,
    BarChart2,
    ToggleLeft,
    ToggleRight,
    Calendar,
    DollarSign,
    Percent,
    X,
    UserCheck,
    ShoppingBag,
    Tag,
    Clock,
    Layers,
    Copy,
    Download,
    Zap,
    CheckSquare,
    Square,
    Filter,
    ArrowUpDown,
    Check,
    Users,
    Award,
    Package,
    FileText
} from 'lucide-react';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Sorting state
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'scheduled', 'inactive', 'archived'
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');

    // Selection & Bulk actions
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [modalTab, setModalTab] = useState('general'); // 'general', 'restrictions'
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [notification, setNotification] = useState(null);
    const [copiedCode, setCopiedCode] = useState('');

    // Targeting options & search filters for Modal Tab 2
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [brands, setBrands] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loadingTargetOptions, setLoadingTargetOptions] = useState(false);

    const [categoryFilter, setCategoryFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [brandFilter, setBrandFilter] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');

    // Bulk Customer Import Paste Modal state
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [pasteText, setPasteText] = useState('');

    // Bulk Product Import Paste Modal state
    const [isProductPasteModalOpen, setIsProductPasteModalOpen] = useState(false);
    const [productPasteText, setProductPasteText] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        min_order_value: '',
        max_discount: '',
        start_date: '',
        end_date: '',
        usage_limit: '',
        per_customer_limit: '',
        is_first_order_only: false,
        is_new_customer_only: false,
        free_shipping: false,
        status: 'active',
        category_ids: [],
        product_ids: [],
        brand_ids: [],
        user_ids: []
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Report modal state
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            let effectiveStatus = statusFilter;
            if (activeTab === 'active') effectiveStatus = 'active';
            else if (activeTab === 'inactive') effectiveStatus = 'inactive';
            else if (activeTab === 'archived') effectiveStatus = 'archived';

            if (effectiveStatus) params.append('status', effectiveStatus);
            if (typeFilter) params.append('type', typeFilter);
            if (sortBy) params.append('sort_by', sortBy);
            if (sortOrder) params.append('sort_order', sortOrder);
            params.append('per_page', 100);

            const res = await axios.get(`/api/v1/admin/coupons?${params.toString()}`);
            if (res.data?.success) {
                setCoupons(res.data.data?.data || res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch coupons:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [activeTab, statusFilter, typeFilter, sortBy, sortOrder]);

    const fetchTargetingOptions = async () => {
        setLoadingTargetOptions(true);
        try {
            const [catRes, prodRes, brandRes, custRes] = await Promise.allSettled([
                axios.get('/api/v1/admin/categories?per_page=100'),
                axios.get('/api/v1/admin/products?per_page=100'),
                axios.get('/api/v1/admin/brands?per_page=100'),
                axios.get('/api/v1/admin/customers?per_page=100'),
            ]);

            if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
                setCategories(catRes.value.data.data?.data || catRes.value.data.data || []);
            }
            if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
                setProducts(prodRes.value.data.data?.data || prodRes.value.data.data || []);
            }
            if (brandRes.status === 'fulfilled' && brandRes.value.data?.success) {
                setBrands(brandRes.value.data.data?.data || brandRes.value.data.data || []);
            }
            if (custRes.status === 'fulfilled' && custRes.value.data?.success) {
                setCustomers(custRes.value.data.data?.data || custRes.value.data.data || []);
            }
        } catch (err) {
            console.error('Failed to load target options:', err);
        } finally {
            setLoadingTargetOptions(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchCoupons();
    };

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showNotify(`Copied code "${code}" to clipboard!`);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const handleGenerateCode = () => {
        const prefixes = ['SAVE', 'PROMO', 'FLAT', 'SUPER', 'VIP', 'DEAL', 'FESTIVE'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const num = Math.floor(10 + Math.random() * 89);
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const generated = `${prefix}${num}-${randomStr}`;
        setFormData({ ...formData, code: generated });
        showNotify(`Generated code: ${generated}`);
    };

    const selectCustomerSegment = (segment) => {
        if (!customers || customers.length === 0) {
            showNotify('No customer accounts loaded yet.', 'error');
            return;
        }
        let matchedIds = [];
        if (segment === 'top_spenders') {
            matchedIds = customers
                .filter(c => (c.total_spent && parseFloat(c.total_spent) > 100) || (c.orders_count && c.orders_count >= 2))
                .map(c => c.id);
            if (matchedIds.length === 0) {
                matchedIds = customers.slice(0, Math.ceil(customers.length * 0.35)).map(c => c.id);
            }
            showNotify(`Targeted ${matchedIds.length} Top Spenders!`);
        } else if (segment === 'repeat_buyers') {
            matchedIds = customers.filter(c => c.orders_count && c.orders_count >= 1).map(c => c.id);
            if (matchedIds.length === 0) {
                matchedIds = customers.slice(0, Math.ceil(customers.length * 0.5)).map(c => c.id);
            }
            showNotify(`Targeted ${matchedIds.length} Repeat Buyers!`);
        } else if (segment === 'recent_signups') {
            matchedIds = customers.slice(-Math.ceil(customers.length * 0.35)).map(c => c.id);
            showNotify(`Targeted ${matchedIds.length} Recent Signups!`);
        }
        setFormData(prev => ({
            ...prev,
            user_ids: Array.from(new Set([...prev.user_ids, ...matchedIds]))
        }));
    };

    const handleApplyPastedCustomers = () => {
        if (!pasteText.trim()) return;
        const rawTokens = pasteText.split(/[\n,\s;]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
        if (rawTokens.length === 0) return;

        const matchedIds = [];
        customers.forEach(cust => {
            const email = (cust.email || '').toLowerCase();
            const idStr = String(cust.id);
            const fullName = `${cust.first_name || ''} ${cust.last_name || ''}`.toLowerCase();

            if (rawTokens.includes(email) || rawTokens.includes(idStr) || rawTokens.some(tok => tok.length > 2 && fullName.includes(tok))) {
                matchedIds.push(cust.id);
            }
        });

        if (matchedIds.length > 0) {
            setFormData(prev => ({
                ...prev,
                user_ids: Array.from(new Set([...prev.user_ids, ...matchedIds]))
            }));
            showNotify(`Matched & targeted ${matchedIds.length} customer(s) from paste!`);
        } else {
            showNotify(`No matching customer accounts found for the pasted text.`, 'error');
        }
        setIsPasteModalOpen(false);
        setPasteText('');
    };

    const selectProductSegment = (segment) => {
        if (!products || products.length === 0) {
            showNotify('No catalog products loaded yet.', 'error');
            return;
        }
        let matchedIds = [];
        if (segment === 'best_sellers') {
            matchedIds = products
                .filter(p => p.is_featured || (p.sales_count && p.sales_count > 0))
                .map(p => p.id);
            if (matchedIds.length === 0) {
                matchedIds = products.slice(0, Math.ceil(products.length * 0.4)).map(p => p.id);
            }
            showNotify(`Targeted ${matchedIds.length} Best Seller / Featured Products!`);
        } else if (segment === 'on_sale') {
            matchedIds = products
                .filter(p => (p.sale_price && parseFloat(p.sale_price) > 0) || (p.discount_price && parseFloat(p.discount_price) > 0))
                .map(p => p.id);
            if (matchedIds.length === 0) {
                matchedIds = products.slice(0, Math.ceil(products.length * 0.3)).map(p => p.id);
            }
            showNotify(`Targeted ${matchedIds.length} On-Sale Products!`);
        } else if (segment === 'low_stock') {
            matchedIds = products
                .filter(p => p.stock_quantity !== undefined && p.stock_quantity < 15)
                .map(p => p.id);
            if (matchedIds.length === 0) {
                matchedIds = products.slice(0, Math.ceil(products.length * 0.25)).map(p => p.id);
            }
            showNotify(`Targeted ${matchedIds.length} Low-Stock Clearance Products!`);
        } else if (segment === 'new_arrivals') {
            matchedIds = products.slice(-Math.ceil(products.length * 0.35)).map(p => p.id);
            showNotify(`Targeted ${matchedIds.length} New Arrival Products!`);
        }
        setFormData(prev => ({
            ...prev,
            product_ids: Array.from(new Set([...prev.product_ids, ...matchedIds]))
        }));
    };

    const handleApplyPastedProducts = () => {
        if (!productPasteText.trim()) return;
        const rawTokens = productPasteText.split(/[\n,\s;]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
        if (rawTokens.length === 0) return;

        const matchedIds = [];
        products.forEach(prod => {
            const sku = (prod.sku || '').toLowerCase();
            const idStr = String(prod.id);
            const name = (prod.name || '').toLowerCase();

            if (rawTokens.includes(sku) || rawTokens.includes(idStr) || rawTokens.some(tok => tok.length > 2 && name.includes(tok))) {
                matchedIds.push(prod.id);
            }
        });

        if (matchedIds.length > 0) {
            setFormData(prev => ({
                ...prev,
                product_ids: Array.from(new Set([...prev.product_ids, ...matchedIds]))
            }));
            showNotify(`Matched & targeted ${matchedIds.length} product(s) from paste!`);
        } else {
            showNotify(`No matching products found in catalog for the pasted text.`, 'error');
        }
        setIsProductPasteModalOpen(false);
        setProductPasteText('');
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setModalTab('general');
        setSelectedCoupon(null);
        setCategoryFilter('');
        setProductFilter('');
        setBrandFilter('');
        setCustomerFilter('');
        setFormData({
            code: '',
            name: '',
            description: '',
            type: 'percentage',
            value: '',
            min_order_value: '',
            max_discount: '',
            start_date: '',
            end_date: '',
            usage_limit: '',
            per_customer_limit: '',
            is_first_order_only: false,
            is_new_customer_only: false,
            free_shipping: false,
            status: 'active',
            category_ids: [],
            product_ids: [],
            brand_ids: [],
            user_ids: []
        });
        setFormErrors({});
        setIsModalOpen(true);
        fetchTargetingOptions();
    };

    const handleOpenEdit = (coupon) => {
        setModalMode('edit');
        setModalTab('general');
        setSelectedCoupon(coupon);
        setCategoryFilter('');
        setProductFilter('');
        setBrandFilter('');
        setCustomerFilter('');
        setFormData({
            code: coupon.code || '',
            name: coupon.name || '',
            description: coupon.description || '',
            type: coupon.type || 'percentage',
            value: coupon.value || '',
            min_order_value: coupon.min_order_value || '',
            max_discount: coupon.max_discount || '',
            start_date: coupon.start_date ? coupon.start_date.substring(0, 16).replace(' ', 'T') : '',
            end_date: coupon.end_date ? coupon.end_date.substring(0, 16).replace(' ', 'T') : '',
            usage_limit: coupon.usage_limit || '',
            per_customer_limit: coupon.per_customer_limit || '',
            is_first_order_only: Boolean(coupon.is_first_order_only),
            is_new_customer_only: Boolean(coupon.is_new_customer_only),
            free_shipping: Boolean(coupon.free_shipping),
            status: coupon.status || 'active',
            category_ids: coupon.categories ? coupon.categories.map(c => c.id) : [],
            product_ids: coupon.products ? coupon.products.map(p => p.id) : [],
            brand_ids: coupon.brands ? coupon.brands.map(b => b.id) : [],
            user_ids: coupon.customers ? coupon.customers.map(u => u.id) : []
        });
        setFormErrors({});
        setIsModalOpen(true);
        fetchTargetingOptions();
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormErrors({});

        const payload = {
            ...formData,
            code: formData.code.toUpperCase(),
            value: parseFloat(formData.value) || 0,
            min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : null,
            max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
            usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
            per_customer_limit: formData.per_customer_limit ? parseInt(formData.per_customer_limit) : null,
            start_date: formData.start_date ? formData.start_date.replace('T', ' ') + ':00' : null,
            end_date: formData.end_date ? formData.end_date.replace('T', ' ') + ':00' : null,
        };

        try {
            if (modalMode === 'create') {
                await axios.post('/api/v1/admin/coupons', payload);
                showNotify('Coupon created successfully.');
            } else {
                await axios.put(`/api/v1/admin/coupons/${selectedCoupon.id}`, payload);
                showNotify('Coupon updated successfully.');
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (err) {
            if (err.response?.status === 422) {
                setFormErrors(err.response.data.errors || {});
                if (err.response.data.errors?.category_ids || err.response.data.errors?.product_ids) {
                    setModalTab('restrictions');
                }
            } else {
                showNotify(err.response?.data?.message || 'Operation failed.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle handlers for pill selections
    const toggleArrayItem = (key, id) => {
        const currentArr = formData[key] || [];
        if (currentArr.includes(id)) {
            setFormData({ ...formData, [key]: currentArr.filter(i => i !== id) });
        } else {
            setFormData({ ...formData, [key]: [...currentArr, id] });
        }
    };

    const handleToggleStatus = async (coupon) => {
        const newStatus = coupon.status === 'active' ? 'inactive' : 'active';
        try {
            await axios.patch(`/api/v1/admin/coupons/${coupon.id}/status`, { status: newStatus });
            showNotify(`Coupon status changed to ${newStatus}.`);
            fetchCoupons();
        } catch (err) {
            showNotify('Failed to toggle status.', 'error');
        }
    };

    const handleDelete = async (couponId) => {
        if (!window.confirm('Are you sure you want to archive this coupon?')) return;
        try {
            await axios.delete(`/api/v1/admin/coupons/${couponId}`);
            showNotify('Coupon archived successfully.');
            fetchCoupons();
        } catch (err) {
            showNotify('Failed to archive coupon.', 'error');
        }
    };

    const handleOpenReport = async (coupon) => {
        setSelectedCoupon(coupon);
        setIsReportOpen(true);
        setLoadingReport(true);
        setReportData(null);
        try {
            const res = await axios.get(`/api/v1/admin/coupons/${coupon.id}/reports`);
            if (res.data?.success) {
                setReportData(res.data.data);
            }
        } catch (err) {
            showNotify('Failed to load performance report.', 'error');
        } finally {
            setLoadingReport(false);
        }
    };

    // Bulk selection handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(coupons.map(c => c.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedIds.length === 0) return;
        const confirmMsg = action === 'archive' ?
            `Archive ${selectedIds.length} selected coupon(s)?` :
            `Set ${selectedIds.length} coupon(s) to ${action}?`;

        if (!window.confirm(confirmMsg)) return;

        setBulkProcessing(true);
        try {
            await Promise.all(selectedIds.map(id => {
                if (action === 'archive') {
                    return axios.delete(`/api/v1/admin/coupons/${id}`);
                } else {
                    return axios.patch(`/api/v1/admin/coupons/${id}/status`, { status: action });
                }
            }));
            showNotify(`Bulk ${action} completed for ${selectedIds.length} coupons.`);
            setSelectedIds([]);
            fetchCoupons();
        } catch (err) {
            showNotify('Bulk operation failed for some items.', 'error');
        } finally {
            setBulkProcessing(false);
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        if (coupons.length === 0) {
            showNotify('No coupons available to export.', 'error');
            return;
        }

        const headers = ['ID', 'Code', 'Name', 'Type', 'Value', 'Min Order', 'Max Discount', 'Redemptions', 'Usage Limit', 'Start Date', 'End Date', 'Status'];
        const rows = coupons.map(c => [
            c.id,
            `"${c.code}"`,
            `"${(c.name || '').replace(/"/g, '""')}"`,
            c.type,
            c.value,
            c.min_order_value || 0,
            c.max_discount || 0,
            c.uses_count || c.usages_count || 0,
            c.usage_limit || 'Unlimited',
            c.start_date || '',
            c.end_date || '',
            c.status || 'active'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `admin-coupons-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotify('Exported coupons CSV successfully.');
    };

    // Filtered lists for pill selectors
    const filteredCategories = categories.filter(c => c.name?.toLowerCase().includes(categoryFilter.toLowerCase()));
    const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(productFilter.toLowerCase()) || p.sku?.toLowerCase().includes(productFilter.toLowerCase()));
    const filteredBrands = brands.filter(b => b.name?.toLowerCase().includes(brandFilter.toLowerCase()));
    const filteredCustomers = customers.filter(u => `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''}`.toLowerCase().includes(customerFilter.toLowerCase()));

    // Derived stats for metrics cards
    const now = new Date();
    const totalCount = coupons.length;
    const activeCount = coupons.filter(c => c.status === 'active').length;
    const scheduledCount = coupons.filter(c => c.start_date && new Date(c.start_date) > now).length;
    const inactiveCount = coupons.filter(c => c.status === 'inactive' || (c.end_date && new Date(c.end_date) < now)).length;
    const archivedCount = coupons.filter(c => c.status === 'archived').length;

    const totalRedemptions = coupons.reduce((sum, c) => sum + parseInt(c.uses_count || c.usages_count || 0, 10), 0);
    const activePercentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Notification Toast */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 2000,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: notification.type === 'error' ? 'var(--admin-danger, #ef4444)' : 'var(--admin-success, #10b981)',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                }}>
                    {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.msg}</span>
                </div>
            )}

            {/* Page Header */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)', letterSpacing: '-0.01em' }}>
                        Coupon & Promotion Management
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleExportCSV}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                            <Download size={14} />
                            <span>Export CSV</span>
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleOpenCreate}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                            <Plus size={15} />
                            <span>Create New Coupon</span>
                        </button>
                    </div>
                </div>
                <p style={{ color: 'var(--admin-muted)', margin: 0, fontSize: '0.82rem' }}>
                    Manage promo codes, discount rules, campaign eligibility, targeting restrictions, and performance analytics.
                </p>
            </div>

            {/* KPI Summary Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {/* 1. Total Campaigns */}
                <div style={{
                    backgroundColor: 'var(--admin-card-bg, #ffffff)',
                    border: '1px solid var(--admin-border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Total Campaigns
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text, #0f172a)', marginTop: '4px' }}>
                            {totalCount}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            {scheduledCount} scheduled for future
                        </div>
                    </div>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        color: '#3b82f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Ticket size={22} />
                    </div>
                </div>

                {/* 2. Active Coupons */}
                <div style={{
                    backgroundColor: 'var(--admin-card-bg, #ffffff)',
                    border: '1px solid var(--admin-border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Active Coupons
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                            {activeCount}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
                            {activePercentage}% of total catalog
                        </div>
                    </div>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle size={22} />
                    </div>
                </div>

                {/* 3. Total Redemptions */}
                <div style={{
                    backgroundColor: 'var(--admin-card-bg, #ffffff)',
                    border: '1px solid var(--admin-border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Total Redemptions
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8b5cf6', marginTop: '4px' }}>
                            {totalRedemptions}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Customer redemptions
                        </div>
                    </div>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(139, 92, 246, 0.12)',
                        color: '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BarChart2 size={22} />
                    </div>
                </div>

                {/* 4. Expired / Inactive */}
                <div style={{
                    backgroundColor: 'var(--admin-card-bg, #ffffff)',
                    border: '1px solid var(--admin-border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}>
                    <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Expired / Inactive
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text, #0f172a)', marginTop: '4px' }}>
                            {inactiveCount}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            {archivedCount} archived
                        </div>
                    </div>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Clock size={22} />
                    </div>
                </div>
            </div>

            {/* Enclosed Structured Table & Filter Card (Matching Products & Inventory Views) */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--admin-border, #e2e8f0)', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

                {/* 1. Status Filter Tabs Bar (Inside Card Top) */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                    overflowX: 'auto',
                    backgroundColor: 'var(--admin-card-bg, #ffffff)'
                }}>
                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'all' ? 'var(--admin-primary, #3b82f6)' : 'var(--admin-bg, #f1f5f9)', color: activeTab === 'all' ? '#fff' : 'var(--admin-text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <span>All Campaigns</span>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: activeTab === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--admin-border)', fontSize: '0.75rem' }}>
                            {totalCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'active' ? '#10b981' : 'var(--admin-bg, #f1f5f9)', color: activeTab === 'active' ? '#fff' : 'var(--admin-text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <span>Active</span>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: activeTab === 'active' ? 'rgba(255,255,255,0.25)' : 'var(--admin-border)', fontSize: '0.75rem' }}>
                            {activeCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('scheduled')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'scheduled' ? '#8b5cf6' : 'var(--admin-bg, #f1f5f9)', color: activeTab === 'scheduled' ? '#fff' : 'var(--admin-text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <span>Scheduled</span>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: activeTab === 'scheduled' ? 'rgba(255,255,255,0.25)' : 'var(--admin-border)', fontSize: '0.75rem' }}>
                            {scheduledCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'inactive' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inactive')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'inactive' ? '#f59e0b' : 'var(--admin-bg, #f1f5f9)', color: activeTab === 'inactive' ? '#fff' : 'var(--admin-text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <span>Expired / Inactive</span>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: activeTab === 'inactive' ? 'rgba(255,255,255,0.25)' : 'var(--admin-border)', fontSize: '0.75rem' }}>
                            {inactiveCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`order-tab-btn ${activeTab === 'archived' ? 'active' : ''}`}
                        onClick={() => setActiveTab('archived')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'archived' ? '#ef4444' : 'var(--admin-bg, #f1f5f9)', color: activeTab === 'archived' ? '#fff' : 'var(--admin-text)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                        <span>Archived</span>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: activeTab === 'archived' ? 'rgba(255,255,255,0.25)' : 'var(--admin-border)', fontSize: '0.75rem' }}>
                            {archivedCount}
                        </span>
                    </button>
                </div>

                {/* 2. Search & Filter Bar (Inside Card Middle) */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border, #e2e8f0)', backgroundColor: 'var(--admin-card-bg, #ffffff)' }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Coupon Code, Campaign Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
                            />
                        </div>

                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ width: '170px', height: '38px', fontSize: '0.85rem' }}
                        >
                            <option value="">All Discount Types</option>
                            <option value="percentage">Percentage Rate</option>
                            <option value="fixed_amount">Fixed Monetary</option>
                            <option value="free_shipping">Free Shipping</option>
                        </select>

                        <select
                            className="form-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: '150px', height: '38px', fontSize: '0.85rem' }}
                        >
                            <option value="created_at">Latest Added</option>
                            <option value="code">Sort: Code A-Z</option>
                            <option value="uses_count">Sort: Redemptions</option>
                            <option value="start_date">Sort: Start Date</option>
                            <option value="end_date">Sort: End Date</option>
                        </select>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            title={`Order: ${sortOrder.toUpperCase()}`}
                            style={{ padding: '8px 12px', height: '38px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                        >
                            <ArrowUpDown size={14} />
                            <span>{sortOrder.toUpperCase()}</span>
                        </button>

                        <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', height: '38px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Filter size={14} />
                            <span>Filter</span>
                        </button>
                    </form>
                </div>

                {/* 3. Bulk Actions Bar (Inside Card if selected) */}
                {selectedIds.length > 0 && (
                    <div style={{
                        padding: '12px 20px',
                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                        borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        <div style={{ fontWeight: 600, color: '#3b82f6', fontSize: '0.86rem' }}>
                            {selectedIds.length} campaign(s) selected
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleBulkAction('active')}
                                disabled={bulkProcessing}
                            >
                                Set Active
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleBulkAction('inactive')}
                                disabled={bulkProcessing}
                            >
                                Set Inactive
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleBulkAction('archive')}
                                disabled={bulkProcessing}
                                style={{ color: '#ef4444' }}
                            >
                                Archive Selected
                            </button>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => setSelectedIds([])}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. Flush Table Body */}
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                        Loading coupons...
                    </div>
                ) : coupons.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                        No promotional coupons found matching your criteria.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table" style={{ width: '100%', margin: 0, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--admin-border)', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>
                                    <th style={{ padding: '14px 18px', width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === coupons.length && coupons.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th style={{ padding: '14px 18px' }}>Campaign Code & Name</th>
                                    <th style={{ padding: '14px 18px' }}>Discount Value</th>
                                    <th style={{ padding: '14px 18px' }}>Redemptions Quota</th>
                                    <th style={{ padding: '14px 18px' }}>Validity Window</th>
                                    <th style={{ padding: '14px 18px' }}>Status</th>
                                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupons.map((coupon) => {
                                    const isSelected = selectedIds.includes(coupon.id);
                                    const isExpired = coupon.end_date && new Date(coupon.end_date) < new Date();
                                    const uses = coupon.uses_count || coupon.usages_count || 0;
                                    const limit = coupon.usage_limit;
                                    const usagePct = limit ? Math.min(100, Math.round((uses / limit) * 100)) : null;

                                    return (
                                        <tr
                                            key={coupon.id}
                                            style={{
                                                borderBottom: '1px solid var(--admin-border)',
                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                                                transition: 'background-color 0.15s ease'
                                            }}
                                        >
                                            <td style={{ padding: '14px 18px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectOne(coupon.id)}
                                                />
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontFamily: 'monospace',
                                                        fontWeight: 700,
                                                        fontSize: '0.95rem',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        color: '#3b82f6',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {coupon.code}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        title="Copy Code"
                                                        onClick={() => handleCopyCode(coupon.code)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedCode === coupon.code ? '#10b981' : 'var(--admin-muted)', padding: '2px' }}
                                                    >
                                                        {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{coupon.name}</div>
                                                {coupon.description && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                        {coupon.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                                                {coupon.type === 'percentage' ? (
                                                    <span style={{ color: '#8b5cf6' }}>{coupon.value}% OFF</span>
                                                ) : coupon.type === 'fixed_amount' ? (
                                                    <span style={{ color: '#10b981' }}>${parseFloat(coupon.value).toFixed(2)} OFF</span>
                                                ) : (
                                                    <span style={{ color: '#3b82f6' }}>Free Shipping</span>
                                                )}
                                                {coupon.max_discount && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontWeight: 400 }}>
                                                        Cap: ${parseFloat(coupon.max_discount).toFixed(2)}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    <span style={{ fontWeight: 600 }}>{uses}</span>
                                                    <span style={{ color: 'var(--admin-muted)' }}>
                                                        {limit ? ` / ${limit}` : ' (Unlimited)'}
                                                    </span>
                                                </div>
                                                {usagePct !== null && (
                                                    <div style={{ width: '100px', height: '5px', backgroundColor: 'var(--admin-border)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${usagePct}%`,
                                                            height: '100%',
                                                            backgroundColor: usagePct >= 90 ? '#ef4444' : usagePct >= 75 ? '#f59e0b' : '#10b981'
                                                        }} />
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                                                <div>Start: {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString() : 'Immediate'}</div>
                                                <div>End: {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString() : 'No Expiry'}</div>
                                            </td>
                                            <td style={{ padding: '14px 18px' }}>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: coupon.status === 'active' ? 'rgba(16, 185, 129, 0.15)' :
                                                        coupon.status === 'inactive' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: coupon.status === 'active' ? '#10b981' :
                                                        coupon.status === 'inactive' ? '#f59e0b' : '#ef4444'
                                                }}>
                                                    {coupon.status ? coupon.status.toUpperCase() : 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        title="View Usage Report"
                                                        onClick={() => handleOpenReport(coupon)}
                                                        style={{ padding: '6px' }}
                                                    >
                                                        <BarChart2 size={15} />
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        title="Toggle Active Status"
                                                        onClick={() => handleToggleStatus(coupon)}
                                                        style={{ padding: '6px' }}
                                                    >
                                                        {coupon.status === 'active' ? <ToggleRight size={15} style={{ color: '#10b981' }} /> : <ToggleLeft size={15} />}
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        title="Edit Coupon"
                                                        onClick={() => handleOpenEdit(coupon)}
                                                        style={{ padding: '6px' }}
                                                    >
                                                        <Edit3 size={15} />
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
                                                        title="Archive Coupon"
                                                        onClick={() => handleDelete(coupon.id)}
                                                        style={{ padding: '6px', color: 'var(--admin-danger, #ef4444)' }}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create / Edit Coupon Modal */}
            {isModalOpen && (
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
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="modal-card"
                        style={{
                            maxWidth: '840px',
                            width: '96%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--admin-card-bg, #ffffff)',
                            color: 'var(--admin-text, #0f172a)',
                            border: '1px solid var(--admin-border, #e2e8f0)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--admin-card-bg, #ffffff)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Ticket size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>
                                        {modalMode === 'create' ? 'Create New Coupon' : `Edit Coupon: ${formData.code}`}
                                    </h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)', margin: '2px 0 0 0' }}>
                                        Configure campaign rules, discount values, validity window, and targeting restrictions.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: '6px', borderRadius: '6px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form Sub-Tabs (General Rules vs Targeting Restrictions) */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border, #e2e8f0)', backgroundColor: 'var(--admin-bg, #f8fafc)', padding: '0 24px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTab('general')}
                                style={{
                                    padding: '12px 18px',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    borderBottom: modalTab === 'general' ? '2px solid #3b82f6' : '2px solid transparent',
                                    background: 'none',
                                    color: modalTab === 'general' ? '#3b82f6' : 'var(--admin-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Tag size={15} />
                                <span>1. Campaign Rules & Limits</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTab('restrictions')}
                                style={{
                                    padding: '12px 18px',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    border: 'none',
                                    borderBottom: modalTab === 'restrictions' ? '2px solid #3b82f6' : '2px solid transparent',
                                    background: 'none',
                                    color: modalTab === 'restrictions' ? '#3b82f6' : 'var(--admin-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Layers size={15} />
                                <span>2. Targeting Restrictions</span>
                            </button>
                        </div>

                        {/* Modal Form Body */}
                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                                {/* TAB 1: General Rules */}
                                {modalTab === 'general' && (
                                    <>
                                        {/* Row 1: Code & Name */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)', margin: 0 }}>
                                                        Coupon Code *
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link"
                                                        onClick={handleGenerateCode}
                                                        style={{ fontSize: '0.75rem', padding: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6', fontWeight: 600 }}
                                                    >
                                                        <Zap size={13} />
                                                        <span>Auto-Generate</span>
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="E.G. SUMMER20"
                                                    value={formData.code}
                                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                    required
                                                    style={{
                                                        textTransform: 'uppercase',
                                                        fontFamily: 'monospace',
                                                        fontWeight: 700,
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: formErrors.code ? '#ef4444' : 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                                {formErrors.code && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.code[0]}</div>}
                                            </div>

                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Campaign Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="e.g. Summer Flat Sale"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: formErrors.name ? '#ef4444' : 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                                {formErrors.name && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{formErrors.name[0]}</div>}
                                            </div>
                                        </div>

                                        {/* Row 2: Description */}
                                        <div>
                                            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                Description
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows={2}
                                                placeholder="Internal details or customer terms..."
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                style={{
                                                    backgroundColor: 'var(--admin-bg, #ffffff)',
                                                    color: 'var(--admin-text, #0f172a)',
                                                    borderColor: 'var(--admin-border, #cbd5e1)'
                                                }}
                                            />
                                        </div>

                                        {/* Row 3: Discount Type, Value, Max Cap */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Discount Type *
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                >
                                                    <option value="percentage">Percentage Rate (%)</option>
                                                    <option value="fixed_amount">Fixed Amount ($)</option>
                                                    <option value="free_shipping">Free Shipping</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Discount Value *
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    placeholder="e.g. 20 or 15.00"
                                                    value={formData.value}
                                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                                    required
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Max Discount Cap ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    placeholder="e.g. 50.00"
                                                    value={formData.max_discount}
                                                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 4: Min Order, Usage Limit, Per Customer Limit */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Min Order Value ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    placeholder="e.g. 100.00"
                                                    value={formData.min_order_value}
                                                    onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Total Store Limit
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Unlimited"
                                                    value={formData.usage_limit}
                                                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Per Customer Limit
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Unlimited"
                                                    value={formData.per_customer_limit}
                                                    onChange={(e) => setFormData({ ...formData, per_customer_limit: e.target.value })}
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 5: Start & End Date */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    Start Date
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={formData.start_date}
                                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                            </div>

                                            <div>
                                                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--admin-text, #0f172a)' }}>
                                                    End Date
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={formData.end_date}
                                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                    style={{
                                                        backgroundColor: 'var(--admin-bg, #ffffff)',
                                                        color: 'var(--admin-text, #0f172a)',
                                                        borderColor: 'var(--admin-border, #cbd5e1)'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 6: Eligibility Toggles */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '20px',
                                            padding: '14px 16px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--admin-bg, #f8fafc)',
                                            border: '1px solid var(--admin-border, #e2e8f0)'
                                        }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text, #0f172a)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_first_order_only}
                                                    onChange={(e) => setFormData({ ...formData, is_first_order_only: e.target.checked })}
                                                />
                                                <span>First Order Only</span>
                                            </label>

                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text, #0f172a)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_new_customer_only}
                                                    onChange={(e) => setFormData({ ...formData, is_new_customer_only: e.target.checked })}
                                                />
                                                <span>New Customers Only</span>
                                            </label>

                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: 'var(--admin-text, #0f172a)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.free_shipping}
                                                    onChange={(e) => setFormData({ ...formData, free_shipping: e.target.checked })}
                                                />
                                                <span>Include Free Shipping</span>
                                            </label>
                                        </div>
                                    </>
                                )}

                                {/* TAB 2: Interactive Compact Targeting Restrictions */}
                                {modalTab === 'restrictions' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {loadingTargetOptions ? (
                                            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                                Loading store categories, products, brands, and customers...
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                                {/* 1. Target Categories Card */}
                                                <div className="form-section-box" style={{ margin: 0 }}>
                                                    <div className="form-section-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Layers size={15} style={{ color: 'var(--admin-primary, #3b82f6)' }} />
                                                            <h4 className="form-section-title" style={{ fontSize: '0.86rem' }}>
                                                                Target Categories ({formData.category_ids.length} Selected)
                                                            </h4>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, category_ids: categories.map(c => c.id) })}
                                                                style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                            >
                                                                Select All
                                                            </button>
                                                            <span style={{ color: 'var(--admin-border)', fontSize: '0.75rem' }}>|</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, category_ids: [] })}
                                                                style={{ border: 'none', background: 'none', color: 'var(--admin-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                Clear
                                                            </button>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Filter categories..."
                                                                value={categoryFilter}
                                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                                style={{ padding: '3px 8px', fontSize: '0.75rem', width: '150px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-section-body">
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '130px', overflowY: 'auto', padding: '2px' }}>
                                                            {filteredCategories.length > 0 ? filteredCategories.map((cat) => {
                                                                const isSelected = formData.category_ids.includes(cat.id);
                                                                return (
                                                                    <div
                                                                        key={cat.id}
                                                                        onClick={() => toggleArrayItem('category_ids', cat.id)}
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            fontSize: '0.78rem',
                                                                            cursor: 'pointer',
                                                                            padding: '5px 11px',
                                                                            borderRadius: '8px',
                                                                            border: isSelected ? '1px solid #3b82f6' : '1px solid var(--admin-border, #e2e8f0)',
                                                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--admin-bg, #f8fafc)',
                                                                            color: isSelected ? '#3b82f6' : 'var(--admin-text, #0f172a)',
                                                                            fontWeight: isSelected ? 700 : 500,
                                                                            transition: 'all 0.15s ease',
                                                                            userSelect: 'none'
                                                                        }}
                                                                    >
                                                                        <div style={{
                                                                            width: '14px',
                                                                            height: '14px',
                                                                            borderRadius: '4px',
                                                                            border: isSelected ? 'none' : '1px solid var(--admin-border, #cbd5e1)',
                                                                            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            {isSelected && <Check size={10} color="#fff" />}
                                                                        </div>
                                                                        <span>{cat.name}</span>
                                                                    </div>
                                                                );
                                                            }) : (
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>No categories found matching filter.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Target Products Card */}
                                                <div className="form-section-box" style={{ margin: 0 }}>
                                                    <div className="form-section-header" style={{ flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Package size={15} style={{ color: 'var(--admin-primary, #3b82f6)' }} />
                                                            <h4 className="form-section-title" style={{ fontSize: '0.86rem' }}>
                                                                Target Products ({formData.product_ids.length} Selected)
                                                            </h4>
                                                        </div>

                                                        {/* Product Segment Quick Rules & Bulk Tools */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--admin-bg, #f1f5f9)', padding: '2px 6px', borderRadius: '6px' }}>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--admin-muted)' }}>Quick Rules:</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectProductSegment('best_sellers')}
                                                                    style={{ border: 'none', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                >
                                                                    🔥 Best Sellers
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectProductSegment('on_sale')}
                                                                    style={{ border: 'none', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                >
                                                                    🏷️ On Sale
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectProductSegment('low_stock')}
                                                                    style={{ border: 'none', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                >
                                                                    ⚠️ Low Stock
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectProductSegment('new_arrivals')}
                                                                    style={{ border: 'none', background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                >
                                                                    ✨ New Arrivals
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setIsProductPasteModalOpen(true)}
                                                                style={{
                                                                    border: '1px solid #3b82f6',
                                                                    background: 'rgba(59, 130, 246, 0.08)',
                                                                    color: '#2563eb',
                                                                    fontSize: '0.72rem',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 600,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <FileText size={12} /> 📋 Paste SKUs / IDs
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, product_ids: products.map(p => p.id) })}
                                                                style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                            >
                                                                Select All
                                                            </button>
                                                            <span style={{ color: 'var(--admin-border)', fontSize: '0.75rem' }}>|</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, product_ids: [] })}
                                                                style={{ border: 'none', background: 'none', color: 'var(--admin-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                Clear
                                                            </button>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Filter products..."
                                                                value={productFilter}
                                                                onChange={(e) => setProductFilter(e.target.value)}
                                                                style={{ padding: '3px 8px', fontSize: '0.75rem', width: '130px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-section-body">
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '2px' }}>
                                                            {filteredProducts.length > 0 ? filteredProducts.map((prod) => {
                                                                const isSelected = formData.product_ids.includes(prod.id);
                                                                return (
                                                                    <div
                                                                        key={prod.id}
                                                                        onClick={() => toggleArrayItem('product_ids', prod.id)}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            fontSize: '0.78rem',
                                                                            cursor: 'pointer',
                                                                            padding: '6px 12px',
                                                                            borderRadius: '8px',
                                                                            border: isSelected ? '1px solid #3b82f6' : '1px solid var(--admin-border, #e2e8f0)',
                                                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--admin-bg, #f8fafc)',
                                                                            color: isSelected ? '#3b82f6' : 'var(--admin-text, #0f172a)',
                                                                            fontWeight: isSelected ? 700 : 500,
                                                                            transition: 'all 0.15s ease',
                                                                            userSelect: 'none'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', marginRight: '8px' }}>
                                                                            <div style={{
                                                                                width: '14px',
                                                                                height: '14px',
                                                                                borderRadius: '4px',
                                                                                border: isSelected ? 'none' : '1px solid var(--admin-border, #cbd5e1)',
                                                                                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {isSelected && <Check size={10} color="#fff" />}
                                                                            </div>
                                                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prod.name}>
                                                                                {prod.name}
                                                                            </span>
                                                                        </div>
                                                                        {prod.sku && (
                                                                            <span style={{
                                                                                fontSize: '0.68rem',
                                                                                color: isSelected ? '#3b82f6' : 'var(--admin-muted)',
                                                                                fontFamily: 'monospace',
                                                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--admin-border, #e2e8f0)',
                                                                                padding: '2px 6px',
                                                                                borderRadius: '4px',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {prod.sku}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }) : (
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>No products found matching filter.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 3. Target Brands Card */}
                                                <div className="form-section-box" style={{ margin: 0 }}>
                                                    <div className="form-section-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Award size={15} style={{ color: 'var(--admin-primary, #3b82f6)' }} />
                                                            <h4 className="form-section-title" style={{ fontSize: '0.86rem' }}>
                                                                Target Brands ({formData.brand_ids.length} Selected)
                                                            </h4>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, brand_ids: brands.map(b => b.id) })}
                                                                style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                            >
                                                                Select All
                                                            </button>
                                                            <span style={{ color: 'var(--admin-border)', fontSize: '0.75rem' }}>|</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, brand_ids: [] })}
                                                                style={{ border: 'none', background: 'none', color: 'var(--admin-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                Clear
                                                            </button>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Filter brands..."
                                                                value={brandFilter}
                                                                onChange={(e) => setBrandFilter(e.target.value)}
                                                                style={{ padding: '3px 8px', fontSize: '0.75rem', width: '150px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-section-body">
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '2px' }}>
                                                            {filteredBrands.length > 0 ? filteredBrands.map((b) => {
                                                                const isSelected = formData.brand_ids.includes(b.id);
                                                                return (
                                                                    <div
                                                                        key={b.id}
                                                                        onClick={() => toggleArrayItem('brand_ids', b.id)}
                                                                        style={{
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: '6px',
                                                                            fontSize: '0.78rem',
                                                                            cursor: 'pointer',
                                                                            padding: '5px 11px',
                                                                            borderRadius: '8px',
                                                                            border: isSelected ? '1px solid #3b82f6' : '1px solid var(--admin-border, #e2e8f0)',
                                                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--admin-bg, #f8fafc)',
                                                                            color: isSelected ? '#3b82f6' : 'var(--admin-text, #0f172a)',
                                                                            fontWeight: isSelected ? 700 : 500,
                                                                            transition: 'all 0.15s ease',
                                                                            userSelect: 'none'
                                                                        }}
                                                                    >
                                                                        <div style={{
                                                                            width: '14px',
                                                                            height: '14px',
                                                                            borderRadius: '4px',
                                                                            border: isSelected ? 'none' : '1px solid var(--admin-border, #cbd5e1)',
                                                                            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            {isSelected && <Check size={10} color="#fff" />}
                                                                        </div>
                                                                        <span>{b.name}</span>
                                                                    </div>
                                                                );
                                                            }) : (
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>No brands found matching filter.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 4. Target VIP Customers Card */}
                                                <div className="form-section-box" style={{ margin: 0 }}>
                                                    <div className="form-section-header" style={{ flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <Users size={15} style={{ color: 'var(--admin-primary, #3b82f6)' }} />
                                                            <h4 className="form-section-title" style={{ fontSize: '0.86rem' }}>
                                                                Target VIP Customers ({formData.user_ids.length} Selected)
                                                            </h4>
                                                        </div>

                                                        {/* Segment Quick Rules & Bulk Tools */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--admin-bg, #f1f5f9)', padding: '2px 6px', borderRadius: '6px' }}>
                                                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--admin-muted)' }}>Quick Rules:</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectCustomerSegment('top_spenders')}
                                                                    style={{ border: 'none', background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                >
                                                                    👑 Top Spenders
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectCustomerSegment('repeat_buyers')}
                                                                    style={{ border: 'none', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                >
                                                                    ⭐ Repeat Buyers
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectCustomerSegment('recent_signups')}
                                                                    style={{ border: 'none', background: 'rgba(139, 92, 246, 0.12)', color: '#7c3aed', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                                                                >
                                                                    ⚡ New Signups
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setIsPasteModalOpen(true)}
                                                                style={{
                                                                    border: '1px solid #3b82f6',
                                                                    background: 'rgba(59, 130, 246, 0.08)',
                                                                    color: '#2563eb',
                                                                    fontSize: '0.72rem',
                                                                    padding: '3px 8px',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 600,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <FileText size={12} /> 📋 Paste Emails / IDs
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, user_ids: customers.map(c => c.id) })}
                                                                style={{ border: 'none', background: 'none', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                                                            >
                                                                Select All
                                                            </button>
                                                            <span style={{ color: 'var(--admin-border)', fontSize: '0.75rem' }}>|</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, user_ids: [] })}
                                                                style={{ border: 'none', background: 'none', color: 'var(--admin-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                Clear
                                                            </button>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="Filter customers..."
                                                                value={customerFilter}
                                                                onChange={(e) => setCustomerFilter(e.target.value)}
                                                                style={{ padding: '3px 8px', fontSize: '0.75rem', width: '130px' }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="form-section-body">
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '8px', maxHeight: '150px', overflowY: 'auto', padding: '2px' }}>
                                                            {filteredCustomers.length > 0 ? filteredCustomers.map((cust) => {
                                                                const isSelected = formData.user_ids.includes(cust.id);
                                                                return (
                                                                    <div
                                                                        key={cust.id}
                                                                        onClick={() => toggleArrayItem('user_ids', cust.id)}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'space-between',
                                                                            fontSize: '0.78rem',
                                                                            cursor: 'pointer',
                                                                            padding: '6px 12px',
                                                                            borderRadius: '8px',
                                                                            border: isSelected ? '1px solid #3b82f6' : '1px solid var(--admin-border, #e2e8f0)',
                                                                            backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--admin-bg, #f8fafc)',
                                                                            color: isSelected ? '#3b82f6' : 'var(--admin-text, #0f172a)',
                                                                            fontWeight: isSelected ? 700 : 500,
                                                                            transition: 'all 0.15s ease',
                                                                            userSelect: 'none'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', marginRight: '8px' }}>
                                                                            <div style={{
                                                                                width: '14px',
                                                                                height: '14px',
                                                                                borderRadius: '4px',
                                                                                border: isSelected ? 'none' : '1px solid var(--admin-border, #cbd5e1)',
                                                                                backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {isSelected && <Check size={10} color="#fff" />}
                                                                            </div>
                                                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                {cust.first_name} {cust.last_name}
                                                                            </span>
                                                                        </div>
                                                                        {cust.email && (
                                                                            <span style={{
                                                                                fontSize: '0.68rem',
                                                                                color: isSelected ? '#3b82f6' : 'var(--admin-muted)',
                                                                                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--admin-border, #e2e8f0)',
                                                                                padding: '2px 6px',
                                                                                borderRadius: '4px',
                                                                                flexShrink: 0
                                                                            }}>
                                                                                {cust.email}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }) : (
                                                                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>No customers found matching filter.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid var(--admin-border, #e2e8f0)',
                                backgroundColor: 'var(--admin-bg, #f8fafc)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    {modalTab === 'general' ? (
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalTab('restrictions')}>
                                            Next: Targeting Restrictions &rarr;
                                        </button>
                                    ) : (
                                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalTab('general')}>
                                            &larr; Back to Rules
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Usage & Performance Report Modal */}
            {isReportOpen && (
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
                    onClick={() => setIsReportOpen(false)}
                >
                    <div
                        className="modal-card"
                        style={{
                            maxWidth: '800px',
                            width: '96%',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--admin-card-bg, #ffffff)',
                            color: 'var(--admin-text, #0f172a)',
                            border: '1px solid var(--admin-border, #e2e8f0)',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Report Header */}
                        <div
                            style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid var(--admin-border, #e2e8f0)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'var(--admin-card-bg, #ffffff)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                                    color: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <BarChart2 size={20} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--admin-text, #0f172a)' }}>
                                        Performance Analytics: {selectedCoupon?.code}
                                    </h2>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted, #64748b)', margin: '2px 0 0 0' }}>
                                        Campaign redemptions, monetary discounts, and customer usage audit.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setIsReportOpen(false)}
                                style={{ padding: '6px', borderRadius: '6px' }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Report Body */}
                        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                            {loadingReport ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                    Fetching campaign performance metrics...
                                </div>
                            ) : !reportData ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                    Could not load performance data.
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                                        <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--admin-bg, #f8fafc)', border: '1px solid var(--admin-border, #e2e8f0)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted, #64748b)' }}>Total Redemptions</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>{reportData.metrics?.total_uses || 0}</div>
                                        </div>
                                        <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--admin-bg, #f8fafc)', border: '1px solid var(--admin-border, #e2e8f0)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted, #64748b)' }}>Total Discount Value</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                                                ${parseFloat(reportData.metrics?.total_discount_amount || 0).toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--admin-bg, #f8fafc)', border: '1px solid var(--admin-border, #e2e8f0)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted, #64748b)' }}>Revenue Driven</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6', marginTop: '4px' }}>
                                                ${parseFloat(reportData.metrics?.total_order_revenue || 0).toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--admin-bg, #f8fafc)', border: '1px solid var(--admin-border, #e2e8f0)' }}>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted, #64748b)' }}>Remaining Quota</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '4px' }}>
                                                {reportData.metrics?.remaining_uses !== null ? reportData.metrics?.remaining_uses : '∞'}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--admin-text, #0f172a)' }}>
                                        Customer Redemption Log
                                    </h3>
                                    {(!reportData.recent_usages || reportData.recent_usages.length === 0) ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--admin-muted)', backgroundColor: 'var(--admin-bg, #f8fafc)', borderRadius: '8px' }}>
                                            No redemptions logged yet for this campaign.
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
                                            <table className="table" style={{ width: '100%', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--admin-border)', textAlign: 'left', color: 'var(--admin-muted)' }}>
                                                        <th style={{ padding: '8px 12px' }}>Customer</th>
                                                        <th style={{ padding: '8px 12px' }}>Order ID</th>
                                                        <th style={{ padding: '8px 12px' }}>Discount</th>
                                                        <th style={{ padding: '8px 12px' }}>Redeemed At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.recent_usages.map((u, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                                            <td style={{ padding: '8px 12px' }}>
                                                                {u.user ? `${u.user.first_name || ''} ${u.user.last_name || ''} (${u.user.email})` : `User #${u.user_id}`}
                                                            </td>
                                                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>#{u.order_id}</td>
                                                            <td style={{ padding: '8px 12px', color: '#10b981', fontWeight: 600 }}>
                                                                ${parseFloat(u.discount_amount || 0).toFixed(2)}
                                                            </td>
                                                            <td style={{ padding: '8px 12px', color: 'var(--admin-muted)' }}>
                                                                {u.used_at ? new Date(u.used_at).toLocaleString() : '-'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 📋 Bulk Email / Customer ID Paste Modal */}
            {isPasteModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1200 }}>
                    <div className="modal-card" style={{ maxWidth: '520px', width: '90%' }}>
                        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} style={{ color: 'var(--admin-primary, #3b82f6)' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                    Bulk Import Customer Emails or IDs
                                </h3>
                            </div>
                            <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }} onClick={() => setIsPasteModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', marginBottom: '12px' }}>
                                Paste customer email addresses or user IDs separated by commas, spaces, or newlines (e.g. copied from Excel, Mailchimp, or CRM exports).
                            </p>
                            <textarea
                                className="form-control"
                                rows={6}
                                placeholder={"john@example.com, sara@company.com\n102\n105..."}
                                value={pasteText}
                                onChange={(e) => setPasteText(e.target.value)}
                                style={{ fontFamily: 'monospace', fontSize: '0.82rem', width: '100%' }}
                            />
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '8px' }}>
                                💡 Tip: Matching is case-insensitive. Matching customer accounts will be automatically checked and added to your targets.
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid var(--admin-border, #e2e8f0)', backgroundColor: 'var(--admin-bg, #f8fafc)' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsPasteModalOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary btn-sm" onClick={handleApplyPastedCustomers}>
                                Match & Select Customers
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 📋 Bulk Product SKU / ID Paste Modal */}
            {isProductPasteModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 1200 }}>
                    <div className="modal-card" style={{ maxWidth: '520px', width: '90%' }}>
                        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Package size={18} style={{ color: 'var(--admin-primary, #3b82f6)' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                                    Bulk Import Product SKUs or IDs
                                </h3>
                            </div>
                            <button type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--admin-muted)' }} onClick={() => setIsProductPasteModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '20px' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', marginBottom: '12px' }}>
                                Paste product SKUs or product IDs separated by commas, spaces, or newlines (e.g. copied from Excel, inventory lists, or ERP exports).
                            </p>
                            <textarea
                                className="form-control"
                                rows={6}
                                placeholder={"PRD-QYEA5N4E, PRD-4OA2FQ4S\nPRD-AM7VZD0L\n102, 105..."}
                                value={productPasteText}
                                onChange={(e) => setProductPasteText(e.target.value)}
                                style={{ fontFamily: 'monospace', fontSize: '0.82rem', width: '100%' }}
                            />
                            <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '8px' }}>
                                💡 Tip: Matching is case-insensitive. Matching products will be automatically checked and added to your targets.
                            </div>
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid var(--admin-border, #e2e8f0)', backgroundColor: 'var(--admin-bg, #f8fafc)' }}>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsProductPasteModalOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary btn-sm" onClick={handleApplyPastedProducts}>
                                Match & Select Products
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
