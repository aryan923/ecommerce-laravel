import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    MessageSquare,
    Star,
    CheckCircle2,
    XCircle,
    Eye,
    Trash2,
    RefreshCw,
    Search,
    Clock,
    AlertTriangle,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    X,
    User,
    Package,
    RotateCcw,
    Download,
    Flag,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Send
} from 'lucide-react';

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({
        total_reviews: 0,
        pending_reviews: 0,
        approved_reviews: 0,
        rejected_reviews: 0,
        hidden_reviews: 0,
        flagged_reviews: 0,
        average_rating: 0,
        rating_breakdown: { '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 },
    });
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [notification, setNotification] = useState(null);

    // Analytics Distribution Collapsible Panel
    const [showDistribution, setShowDistribution] = useState(false);

    // Filters
    const [activeTab, setActiveTab] = useState('all'); // all, pending, approved, rejected, hidden, flagged
    const [ratingFilter, setRatingFilter] = useState('');
    const [verifiedFilter, setVerifiedFilter] = useState(''); // '' | 'yes' | 'no'
    const [hasImagesFilter, setHasImagesFilter] = useState(''); // '' | 'yes' | 'no'
    const [periodFilter, setPeriodFilter] = useState(''); // '' | 'today' | 'last_7_days' | 'last_30_days' | 'last_90_days'
    const [flaggedFilter, setFlaggedFilter] = useState(''); // '' | 'yes' | 'no'
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState([]);

    // Detail & Moderation Modal
    const [selectedReview, setSelectedReview] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [adminNotesInput, setAdminNotesInput] = useState('');
    const [adminReplyInput, setAdminReplyInput] = useState('');
    const [replyingLoading, setReplyingLoading] = useState(false);

    // Lightbox image preview
    const [previewImage, setPreviewImage] = useState(null);

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const parseImages = (imgs) => {
        if (!imgs) return [];
        if (Array.isArray(imgs)) return imgs;
        if (typeof imgs === 'string') {
            try {
                const parsed = JSON.parse(imgs);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/v1/admin/reviews/stats');
            if (res.data?.success && res.data?.data) {
                const d = res.data.data;
                setStats({
                    total_reviews: Number(d.total_reviews) || 0,
                    pending_reviews: Number(d.pending_reviews) || 0,
                    approved_reviews: Number(d.approved_reviews) || 0,
                    rejected_reviews: Number(d.rejected_reviews) || 0,
                    hidden_reviews: Number(d.hidden_reviews) || 0,
                    flagged_reviews: Number(d.flagged_reviews) || 0,
                    average_rating: Number(d.average_rating) || 0,
                    rating_breakdown: d.rating_breakdown || { '5_star': 0, '4_star': 0, '3_star': 0, '2_star': 0, '1_star': 0 },
                });
            }
        } catch (err) {
            console.error('Failed to fetch review statistics:', err);
        }
    };

    const fetchReviews = useCallback(async (targetPage = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeTab === 'flagged') {
                params.append('flagged', 'yes');
            } else if (activeTab !== 'all') {
                params.append('status', activeTab);
            }

            if (ratingFilter) params.append('rating', ratingFilter);
            if (verifiedFilter) params.append('verified', verifiedFilter);
            if (hasImagesFilter) params.append('has_images', hasImagesFilter);
            if (periodFilter) params.append('period', periodFilter);
            if (flaggedFilter && activeTab !== 'flagged') params.append('flagged', flaggedFilter);
            if (search) params.append('search', search);
            if (sortBy) params.append('sort_by', sortBy);
            if (sortOrder) params.append('sort_order', sortOrder);
            params.append('page', targetPage);
            params.append('per_page', 12);

            const res = await axios.get(`/api/v1/admin/reviews?${params.toString()}`);
            if (res.data?.success) {
                const rawItems = res.data.data;
                const items = Array.isArray(rawItems) ? rawItems : (rawItems?.data || []);
                const meta = res.data.meta || (typeof rawItems === 'object' && !Array.isArray(rawItems) ? rawItems : {});
                setReviews(items);
                setPagination({
                    current_page: meta.current_page || targetPage,
                    last_page: meta.last_page || 1,
                    total: meta.total ?? items.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            showNotify('Failed to load reviews catalog.', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab, ratingFilter, verifiedFilter, hasImagesFilter, periodFilter, flaggedFilter, search, sortBy, sortOrder, page]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchReviews(page);
    }, [activeTab, ratingFilter, verifiedFilter, hasImagesFilter, periodFilter, flaggedFilter, sortBy, sortOrder, page, fetchReviews]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
        fetchReviews(page);
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams();
        if (activeTab === 'flagged') params.append('flagged', 'yes');
        else if (activeTab !== 'all') params.append('status', activeTab);
        if (ratingFilter) params.append('rating', ratingFilter);
        if (verifiedFilter) params.append('verified', verifiedFilter);
        if (hasImagesFilter) params.append('has_images', hasImagesFilter);
        if (periodFilter) params.append('period', periodFilter);
        if (search) params.append('search', search);

        window.open(`/api/v1/admin/reviews/export?${params.toString()}`, '_blank');
        showNotify('Exporting reviews to CSV file...');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        fetchReviews(1);
    };

    const handleResetFilters = () => {
        setActiveTab('all');
        setRatingFilter('');
        setVerifiedFilter('');
        setHasImagesFilter('');
        setPeriodFilter('');
        setFlaggedFilter('');
        setSortBy('created_at');
        setSortOrder('desc');
        setSearch('');
        setPage(1);
    };

    const handleUpdateStatus = async (reviewId, newStatus, customNotes = null) => {
        try {
            const payload = { status: newStatus };
            if (customNotes !== null) payload.admin_notes = customNotes;

            const res = await axios.patch(`/api/v1/admin/reviews/${reviewId}/status`, payload);
            if (res.data?.success) {
                showNotify(`Review marked as ${newStatus}.`);
                fetchStats();
                fetchReviews(page);
                if (selectedReview && selectedReview.id === reviewId) {
                    setSelectedReview(res.data.data);
                }
            }
        } catch (err) {
            console.error('Failed to update review status:', err);
            showNotify(err.response?.data?.message || 'Failed to update review status.', 'error');
        }
    };

    const handleToggleFlag = async (reviewId, currentFlagState) => {
        try {
            const reason = currentFlagState ? null : 'Flagged by administrator for investigation';
            const res = await axios.patch(`/api/v1/admin/reviews/${reviewId}/flag`, { flag_reason: reason });
            if (res.data?.success) {
                showNotify(currentFlagState ? 'Review unflagged.' : 'Review flagged for spam/profanity.');
                fetchStats();
                fetchReviews(page);
                if (selectedReview && selectedReview.id === reviewId) {
                    setSelectedReview(res.data.data);
                }
            }
        } catch (err) {
            console.error('Failed to toggle review flag:', err);
            showNotify('Failed to update review flag.', 'error');
        }
    };

    const handlePostStoreReply = async () => {
        if (!selectedReview || !adminReplyInput.trim()) return;
        setReplyingLoading(true);
        try {
            const res = await axios.post(`/api/v1/admin/reviews/${selectedReview.id}/reply`, {
                admin_reply: adminReplyInput.trim()
            });
            if (res.data?.success) {
                showNotify('Official store reply published successfully.');
                setSelectedReview(res.data.data);
                fetchReviews(page);
            }
        } catch (err) {
            console.error('Failed to post store reply:', err);
            showNotify('Failed to publish store reply.', 'error');
        } finally {
            setReplyingLoading(false);
        }
    };

    const handleDeleteStoreReply = async () => {
        if (!selectedReview || !window.confirm('Delete official store response?')) return;
        setReplyingLoading(true);
        try {
            const res = await axios.delete(`/api/v1/admin/reviews/${selectedReview.id}/reply`);
            if (res.data?.success) {
                showNotify('Official store reply removed.');
                setAdminReplyInput('');
                setSelectedReview(res.data.data);
                fetchReviews(page);
            }
        } catch (err) {
            console.error('Failed to delete store reply:', err);
            showNotify('Failed to delete store reply.', 'error');
        } finally {
            setReplyingLoading(false);
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        if (selectedIds.length === 0) return;
        try {
            const res = await axios.post('/api/v1/admin/reviews/bulk-status', {
                ids: selectedIds,
                status: newStatus,
            });
            if (res.data?.success) {
                showNotify(`${selectedIds.length} reviews updated to ${newStatus}.`);
                setSelectedIds([]);
                fetchStats();
                fetchReviews(page);
            }
        } catch (err) {
            console.error('Failed bulk status update:', err);
            showNotify('Bulk update failed.', 'error');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this customer review?')) return;
        try {
            const res = await axios.delete(`/api/v1/admin/reviews/${reviewId}`);
            if (res.data?.success) {
                showNotify('Review deleted successfully.');
                fetchStats();
                fetchReviews(page);
                if (isDetailModalOpen && selectedReview?.id === reviewId) {
                    setIsDetailModalOpen(false);
                }
            }
        } catch (err) {
            console.error('Failed to delete review:', err);
            showNotify('Failed to delete review.', 'error');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected reviews?`)) return;
        try {
            const res = await axios.post('/api/v1/admin/reviews/bulk-delete', { ids: selectedIds });
            if (res.data?.success) {
                showNotify(`${selectedIds.length} reviews deleted successfully.`);
                setSelectedIds([]);
                fetchStats();
                fetchReviews(page);
            }
        } catch (err) {
            console.error('Failed bulk delete:', err);
            showNotify('Bulk delete failed.', 'error');
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(reviews.map((r) => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleOpenDetailModal = (review) => {
        setSelectedReview(review);
        setAdminNotesInput(review?.admin_notes || '');
        setAdminReplyInput(review?.admin_reply || '');
        setIsDetailModalOpen(true);
    };

    const renderStars = (ratingCount) => {
        const stars = [];
        const num = Number(ratingCount) || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    fill={i <= num ? '#f59e0b' : 'none'}
                    color={i <= num ? '#f59e0b' : 'var(--admin-border, #cbd5e1)'}
                    style={{ marginRight: '2px' }}
                />
            );
        }
        return <div style={{ display: 'inline-flex', alignItems: 'center' }}>{stars}</div>;
    };

    const getStatusBadge = (st) => {
        switch (st) {
            case 'approved':
                return <span className="status-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '3px 10px', fontWeight: 700, fontSize: '0.74rem' }}>Approved</span>;
            case 'rejected':
                return <span className="status-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '20px', padding: '3px 10px', fontWeight: 700, fontSize: '0.74rem' }}>Rejected</span>;
            case 'hidden':
                return <span className="status-badge" style={{ backgroundColor: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: '1px solid rgba(100, 116, 139, 0.3)', borderRadius: '20px', padding: '3px 10px', fontWeight: 700, fontSize: '0.74rem' }}>Hidden</span>;
            case 'pending':
            default:
                return <span className="status-badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '3px 10px', fontWeight: 700, fontSize: '0.74rem' }}>Pending</span>;
        }
    };

    const safeReviews = Array.isArray(reviews) ? reviews : [];
    const hasActiveFilters = Boolean(search || ratingFilter || verifiedFilter || hasImagesFilter || periodFilter || flaggedFilter || activeTab !== 'all');

    // Helper function to truncate long text with ...
    const truncateText = (str, maxLength = 45) => {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.slice(0, maxLength).trim() + '...';
    };

    // Rating breakdown percentages
    const totalCountForBreakdown = (stats?.total_reviews || 1);
    const breakdownData = [
        { label: '5 Stars', count: stats?.rating_breakdown?.['5_star'] || 0, color: '#10b981' },
        { label: '4 Stars', count: stats?.rating_breakdown?.['4_star'] || 0, color: '#3b82f6' },
        { label: '3 Stars', count: stats?.rating_breakdown?.['3_star'] || 0, color: '#f59e0b' },
        { label: '2 Stars', count: stats?.rating_breakdown?.['2_star'] || 0, color: '#f97316' },
        { label: '1 Star', count: stats?.rating_breakdown?.['1_star'] || 0, color: '#ef4444' },
    ];

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

            {/* Page Top Header Row */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Review Moderation & Feedback</h2>
                    <p className="page-header-subtitle">Moderate customer ratings, inspect uploaded media, publish official staff replies, and manage store feedback</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowDistribution(!showDistribution)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                        <span>{showDistribution ? 'Hide Rating Breakdown' : 'Rating Distribution'}</span>
                        {showDistribution ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleExportCsv}
                        title="Export filtered reviews to CSV"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        title="Reload customer reviews"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Cards Grid */}
            <div className="stat-cards-grid-4">
                {/* 1. Total Reviews */}
                <div
                    onClick={() => { setActiveTab('all'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'all' ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Total Reviews
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            {(stats?.total_reviews ?? 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Customer feedback submitted
                        </div>
                    </div>
                </div>

                {/* 2. Pending Moderation */}
                <div
                    onClick={() => { setActiveTab('pending'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'pending' ? '2px solid #f59e0b' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Pending Approval
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: (stats?.pending_reviews ?? 0) > 0 ? '#f59e0b' : 'var(--admin-text)' }}>
                            {(stats?.pending_reviews ?? 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Awaiting admin moderation
                        </div>
                    </div>
                </div>

                {/* 3. Approved Reviews */}
                <div
                    onClick={() => { setActiveTab('approved'); setPage(1); }}
                    style={{
                        padding: '16px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--admin-card-bg)',
                        border: activeTab === 'approved' ? '2px solid #10b981' : '1px solid var(--admin-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Approved Reviews
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                            {(stats?.approved_reviews ?? 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Published on product pages
                        </div>
                    </div>
                </div>

                {/* 4. Average Store Rating */}
                <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--admin-card-bg)',
                    border: '1px solid var(--admin-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Average Rating
                        </span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={16} fill="#f59e0b" />
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{stats?.average_rating ?? 0}</span>
                            <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700 }}>/ 5.0</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            Storewide customer score
                        </div>
                    </div>
                </div>
            </div>

            {/* Star Rating Distribution Progress Bars (Collapsible Panel) */}
            {showDistribution && (
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
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                            Star Rating Breakdown & Store Health
                        </h4>
                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                            Based on {stats?.total_reviews ?? 0} total customer reviews
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                        {breakdownData.map((item, idx) => {
                            const pct = Math.round((item.count / totalCountForBreakdown) * 100);
                            return (
                                <div key={idx} style={{ backgroundColor: 'var(--admin-bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)' }}>{item.label}</span>
                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: item.color }}>{item.count} ({pct}%)</span>
                                    </div>
                                    <div style={{ width: '100%', height: '7px', backgroundColor: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: item.color, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Main Integrated Table Card Container */}
            <div className="card" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                {/* Single Line Enclosed Top Navigation Tabs Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-card-bg)',
                    scrollbarWidth: 'none'
                }}>
                    {[
                        { id: 'all', label: 'All Reviews', count: stats?.total_reviews ?? 0 },
                        { id: 'pending', label: 'Pending Moderation', count: stats?.pending_reviews ?? 0 },
                        { id: 'approved', label: 'Approved', count: stats?.approved_reviews ?? 0 },
                        { id: 'rejected', label: 'Rejected', count: stats?.rejected_reviews ?? 0 },
                        { id: 'hidden', label: 'Hidden', count: stats?.hidden_reviews ?? 0 },
                        { id: 'flagged', label: '⚠️ Flagged / Spam', count: stats?.flagged_reviews ?? 0 },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => { setActiveTab(tab.id); setPage(1); }}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.15s ease',
                                backgroundColor: activeTab === tab.id ? 'var(--admin-primary, #6366f1)' : 'transparent',
                                color: activeTab === tab.id ? '#ffffff' : 'var(--admin-muted, #64748b)'
                            }}
                        >
                            <span>{tab.label}</span>
                            <span style={{
                                fontSize: '0.72rem',
                                padding: '1px 7px',
                                borderRadius: '10px',
                                fontWeight: 800,
                                backgroundColor: activeTab === tab.id ? 'rgba(255, 255, 255, 0.25)' : 'var(--admin-border, #e2e8f0)',
                                color: activeTab === tab.id ? '#ffffff' : 'var(--admin-text, #0f172a)'
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Filter & Bulk Actions Toolbar */}
                <div style={{
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--admin-border)',
                    backgroundColor: 'var(--admin-bg-secondary, var(--admin-bg))'
                }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: '240px' }}>
                        {/* Search Input */}
                        <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search reviewer, product, title..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '34px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                            />
                        </div>

                        {/* Star Rating Dropdown */}
                        <select
                            className="form-select"
                            value={ratingFilter}
                            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
                            style={{ width: '130px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                        >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                            <option value="4">4 Stars ⭐⭐⭐⭐</option>
                            <option value="3">3 Stars ⭐⭐⭐</option>
                            <option value="2">2 Stars ⭐⭐</option>
                            <option value="1">1 Star ⭐</option>
                        </select>

                        {/* Verified Buyer Dropdown */}
                        <select
                            className="form-select"
                            value={verifiedFilter}
                            onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
                            style={{ width: '145px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                        >
                            <option value="">All Buyers</option>
                            <option value="yes">✓ Verified Buyers</option>
                            <option value="no">Non-Verified</option>
                        </select>

                        {/* Media / Photos Dropdown */}
                        <select
                            className="form-select"
                            value={hasImagesFilter}
                            onChange={(e) => { setHasImagesFilter(e.target.value); setPage(1); }}
                            style={{ width: '140px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                        >
                            <option value="">All Content</option>
                            <option value="yes">📷 With Photos</option>
                            <option value="no">Text-Only</option>
                        </select>

                        {/* Date Period Filter */}
                        <select
                            className="form-select"
                            value={periodFilter}
                            onChange={(e) => { setPeriodFilter(e.target.value); setPage(1); }}
                            style={{ width: '130px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                        >
                            <option value="">All Time</option>
                            <option value="today">Today</option>
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                            <option value="last_90_days">Last 90 Days</option>
                        </select>

                        {/* Sort By Dropdown */}
                        <select
                            className="form-select"
                            value={`${sortBy}_${sortOrder}`}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'created_at_desc') { setSortBy('created_at'); setSortOrder('desc'); }
                                else if (val === 'created_at_asc') { setSortBy('created_at'); setSortOrder('asc'); }
                                else if (val === 'rating_desc') { setSortBy('rating'); setSortOrder('desc'); }
                                else if (val === 'rating_asc') { setSortBy('rating'); setSortOrder('asc'); }
                                setPage(1);
                            }}
                            style={{ width: '145px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                        >
                            <option value="created_at_desc">Newest First</option>
                            <option value="created_at_asc">Oldest First</option>
                            <option value="rating_desc">Highest Rating</option>
                            <option value="rating_asc">Lowest Rating</option>
                        </select>

                        {/* Reset Filters Button */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={handleResetFilters}
                                title="Reset all active filters"
                                style={{ height: '36px', padding: '0 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                            >
                                <RotateCcw size={13} /> Reset
                            </button>
                        )}
                    </form>

                    {/* Bulk Action Controls */}
                    {selectedIds.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-primary)' }}>
                                {selectedIds.length} Selected
                            </span>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleBulkStatusUpdate('approved')}
                                style={{ height: '34px', padding: '0 10px', borderRadius: '6px', color: '#10b981', fontWeight: 700 }}
                            >
                                <CheckCircle2 size={14} /> Approve Selected
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleBulkStatusUpdate('rejected')}
                                style={{ height: '34px', padding: '0 10px', borderRadius: '6px', color: '#ef4444', fontWeight: 700 }}
                            >
                                <XCircle size={14} /> Reject Selected
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={handleBulkDelete}
                                style={{ height: '34px', padding: '0 10px', borderRadius: '6px' }}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Table View (Standard Sizing with Truncated Review Content ...) */}
                <div className="table-responsive">
                    <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--admin-bg-secondary)', borderBottom: '1px solid var(--admin-border)' }}>
                                <th style={{ padding: '12px 14px', width: '40px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={safeReviews.length > 0 && selectedIds.length === safeReviews.length}
                                    />
                                </th>
                                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Reviewer</th>
                                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Rating</th>
                                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'left' }}>Review Preview</th>
                                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Media</th>
                                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 14px', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                        <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                                        <div>Loading customer reviews...</div>
                                    </td>
                                </tr>
                            ) : safeReviews.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                                        <MessageSquare size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                                        <div>No customer reviews found matching current filter criteria.</div>
                                    </td>
                                </tr>
                            ) : (
                                safeReviews.map((r) => {
                                    const reviewImages = parseImages(r.images);
                                    const previewText = truncateText(r.review || r.title || '', 48);

                                    return (
                                        <tr key={r.id} style={{ borderBottom: '1px solid var(--admin-border)' }}>
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(r.id)}
                                                    onChange={() => handleToggleSelect(r.id)}
                                                />
                                            </td>

                                            {/* Reviewer Info */}
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '34px',
                                                        height: '34px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                                        color: 'var(--admin-primary)',
                                                        fontWeight: 800,
                                                        fontSize: '0.82rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        {r.user?.name ? r.user.name.charAt(0).toUpperCase() : <User size={16} />}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span>{r.user?.name || 'Anonymous Customer'}</span>
                                                            {r.is_flagged && (
                                                                <span title={r.flag_reason || 'Flagged review'} style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '4px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                                                    <Flag size={10} /> Flagged
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)' }}>
                                                            {r.user?.email || 'N/A'}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                                                            {r.order_id && (
                                                                <span style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                                    <ShieldCheck size={11} /> Verified Buyer
                                                                </span>
                                                            )}
                                                            {r.admin_reply && (
                                                                <span style={{ fontSize: '0.68rem', color: '#6366f1', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                                    <MessageCircle size={11} /> Replied
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Product Info */}
                                            <td style={{ padding: '12px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {r.product?.thumbnail ? (
                                                        <img src={r.product.thumbnail} alt={r.product.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                                                    ) : (
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: 'var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-muted)', flexShrink: 0 }}>
                                                            <Package size={16} />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {r.product?.name || 'Deleted Product'}
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                                            SKU: {r.product?.sku || 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Rating */}
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {renderStars(r.rating)}
                                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                                                    {r.rating ?? 0}.0 / 5.0
                                                </div>
                                            </td>

                                            {/* Short Truncated Review Preview */}
                                            <td style={{ padding: '12px 14px', maxWidth: '220px' }}>
                                                {r.title && (
                                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {r.title}
                                                    </div>
                                                )}
                                                <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.review}>
                                                    "{previewText}"
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                    {r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                                                </div>
                                            </td>

                                            {/* Media */}
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {reviewImages.length > 0 ? (
                                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                        {reviewImages.slice(0, 2).map((imgUrl, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={imgUrl}
                                                                alt="Review Attachment"
                                                                onClick={() => setPreviewImage(imgUrl)}
                                                                style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--admin-border)' }}
                                                            />
                                                        ))}
                                                        {reviewImages.length > 2 && (
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--admin-muted)', alignSelf: 'center' }}>
                                                                +{reviewImages.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.74rem', color: 'var(--admin-muted)' }}>None</span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                {getStatusBadge(r.status)}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleOpenDetailModal(r)}
                                                        title="View Full Review Details"
                                                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                                                    >
                                                        <Eye size={13} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary btn-sm"
                                                        onClick={() => handleToggleFlag(r.id, r.is_flagged)}
                                                        title={r.is_flagged ? 'Unflag Review' : 'Flag Review'}
                                                        style={{ padding: '4px 8px', borderRadius: '6px', color: r.is_flagged ? '#ef4444' : 'var(--admin-muted)' }}
                                                    >
                                                        <Flag size={13} />
                                                    </button>

                                                    {r.status !== 'approved' && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleUpdateStatus(r.id, 'approved')}
                                                            title="Approve Review"
                                                            style={{ padding: '4px 8px', borderRadius: '6px', color: '#10b981' }}
                                                        >
                                                            <CheckCircle2 size={13} />
                                                        </button>
                                                    )}

                                                    {r.status !== 'rejected' && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleUpdateStatus(r.id, 'rejected')}
                                                            title="Reject Review"
                                                            style={{ padding: '4px 8px', borderRadius: '6px', color: '#ef4444' }}
                                                        >
                                                            <XCircle size={13} />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDeleteReview(r.id)}
                                                        title="Delete Review"
                                                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
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
                            Showing page <strong>{pagination.current_page}</strong> of <strong>{pagination.last_page}</strong> ({pagination.total} total reviews)
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

            {/* Review Detail & Official Reply Modal */}
            {isDetailModalOpen && selectedReview && (
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
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--admin-border)',
                        animation: 'scaleUp 0.15s ease-out'
                    }}>
                        {/* Modal Header */}
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
                                    Customer Review & Store Response
                                </h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                    Review ID: #{selectedReview.id} • Submitted {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleString() : 'N/A'}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'var(--admin-muted)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '20px' }}>
                            {/* Customer & Product Banner */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', backgroundColor: 'var(--admin-bg-secondary)', padding: '14px', borderRadius: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Customer Info</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--admin-text)', marginTop: '2px' }}>
                                        {selectedReview.user?.name || 'Anonymous Customer'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>{selectedReview.user?.email || 'N/A'}</div>
                                    {selectedReview.order_id && (
                                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                            <ShieldCheck size={12} /> Verified Buyer (Order #{selectedReview.order?.order_number || selectedReview.order_id})
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Target Product</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--admin-text)', marginTop: '2px' }}>
                                        {selectedReview.product?.name || 'Deleted Product'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>SKU: {selectedReview.product?.sku || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Rating & Review Content */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    {renderStars(selectedReview.rating)}
                                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>
                                        {selectedReview.rating ?? 0}.0 / 5.0 Rating
                                    </span>
                                    {selectedReview.is_flagged && (
                                        <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '4px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            <Flag size={11} /> {selectedReview.flag_reason || 'Flagged for Spam'}
                                        </span>
                                    )}
                                </div>

                                {selectedReview.title && (
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                        {selectedReview.title}
                                    </h4>
                                )}

                                <div style={{
                                    fontSize: '0.9rem',
                                    color: 'var(--admin-text)',
                                    lineHeight: '1.6',
                                    backgroundColor: 'var(--admin-card-bg)',
                                    padding: '14px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--admin-border)'
                                }}>
                                    "{selectedReview.review || ''}"
                                </div>
                            </div>

                            {/* Attached Images */}
                            {parseImages(selectedReview.images).length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                                        Customer Uploaded Media ({parseImages(selectedReview.images).length})
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {parseImages(selectedReview.images).map((imgUrl, idx) => (
                                            <img
                                                key={idx}
                                                src={imgUrl}
                                                alt="Customer Attachment"
                                                onClick={() => setPreviewImage(imgUrl)}
                                                style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer', border: '1px solid var(--admin-border)' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Official Store Response Section */}
                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(99, 102, 241, 0.05)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--admin-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                                        <MessageCircle size={15} /> Official Public Store Response
                                    </label>
                                    {selectedReview.replied_at && (
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                            Posted {new Date(selectedReview.replied_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Write an official store response to display publicly on the product page..."
                                    value={adminReplyInput}
                                    onChange={(e) => setAdminReplyInput(e.target.value)}
                                    style={{ fontSize: '0.86rem', borderRadius: '8px', marginBottom: '10px' }}
                                />

                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    {selectedReview.admin_reply && (
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleDeleteStoreReply}
                                            disabled={replyingLoading}
                                            style={{ color: '#ef4444', fontSize: '0.78rem' }}
                                        >
                                            Remove Reply
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-sm"
                                        onClick={handlePostStoreReply}
                                        disabled={replyingLoading || !adminReplyInput.trim()}
                                        style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                                    >
                                        <Send size={12} />
                                        <span>{selectedReview.admin_reply ? 'Update Store Reply' : 'Publish Public Reply'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Internal Staff Moderation Notes */}
                            <div style={{ marginBottom: '10px' }}>
                                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Internal Staff Moderation Notes
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    placeholder="Add internal notes regarding this review..."
                                    value={adminNotesInput}
                                    onChange={(e) => setAdminNotesInput(e.target.value)}
                                    style={{ fontSize: '0.84rem', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div style={{
                            padding: '16px 20px',
                            borderTop: '1px solid var(--admin-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: 'var(--admin-bg-secondary)'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {getStatusBadge(selectedReview.status)}
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleToggleFlag(selectedReview.id, selectedReview.is_flagged)}
                                    style={{ color: selectedReview.is_flagged ? '#ef4444' : 'var(--admin-muted)', fontSize: '0.76rem' }}
                                >
                                    <Flag size={12} /> {selectedReview.is_flagged ? 'Unflag' : 'Flag as Spam'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleUpdateStatus(selectedReview.id, 'rejected', adminNotesInput)}
                                    style={{ color: '#ef4444', fontWeight: 700 }}
                                >
                                    <XCircle size={14} /> Reject
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => handleUpdateStatus(selectedReview.id, 'hidden', adminNotesInput)}
                                    style={{ color: '#64748b', fontWeight: 700 }}
                                >
                                    Hide
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleUpdateStatus(selectedReview.id, 'approved', adminNotesInput)}
                                    style={{ fontWeight: 700 }}
                                >
                                    <CheckCircle2 size={14} /> Approve Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Preview */}
            {previewImage && (
                <div
                    onClick={() => setPreviewImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 1300,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        cursor: 'pointer'
                    }}
                >
                    <img src={previewImage} alt="Expanded Review" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', boxShadow: 'var(--shadow-xl)' }} />
                </div>
            )}
        </div>
    );
}
