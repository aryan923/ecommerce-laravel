import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Image,
    Upload,
    Search,
    Filter,
    Trash2,
    Edit2,
    Copy,
    Check,
    RefreshCw,
    Grid,
    List,
    FileText,
    File,
    CheckCircle2,
    AlertCircle,
    X,
    ExternalLink,
    Eye,
    Tag,
    Layers,
    ShieldAlert,
    Download
} from 'lucide-react';

export default function MediaLibraryPage() {
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });

    // Filter state
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [modelTypeFilter, setModelTypeFilter] = useState('');
    const [unattachedOnly, setUnattachedOnly] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    // Selection & Modal states
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ alt: '', type: 'main' });
    const [submittingEdit, setSubmittingEdit] = useState(false);

    // Upload Drawer state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Purge Unused Modal state
    const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
    const [purgeDays, setPurgeDays] = useState(1);
    const [purging, setPurging] = useState(false);

    // Toast Notification & Copy state
    const [notification, setNotification] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    const showNotify = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    };

    // Fetch Media Assets
    const fetchMedia = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: 24
            };
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            if (modelTypeFilter) params.model_type = modelTypeFilter;
            if (unattachedOnly) params.unattached_only = 1;

            const res = await axios.get('/api/v1/admin/media', { params });
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                setMediaList(items);

                const meta = res.data.meta || {};
                setPagination({
                    current_page: meta.current_page || rawData?.current_page || 1,
                    last_page: meta.last_page || rawData?.last_page || 1,
                    total: meta.total !== undefined ? meta.total : (rawData?.total || items.length),
                    per_page: meta.per_page || rawData?.per_page || 24
                });
            }
        } catch (err) {
            showNotify('Failed to fetch media assets.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia(1);
    }, [typeFilter, modelTypeFilter, unattachedOnly]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchMedia(1);
    };

    // Copy URL to Clipboard
    const handleCopyUrl = (url, id) => {
        if (!url) return;
        const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        navigator.clipboard.writeText(fullUrl);
        setCopiedId(id);
        showNotify('Media URL copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // File Upload Handler
    const handleFileSelect = (e) => {
        if (e.target.files) {
            setUploadFiles(Array.from(e.target.files));
        }
    };

    const handleDropFiles = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setUploadFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) {
            showNotify('Please select at least one file to upload.', 'error');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            if (uploadFiles.length === 1) {
                formData.append('file', uploadFiles[0]);
            } else {
                uploadFiles.forEach(file => formData.append('files[]', file));
            }
            formData.append('type', 'main');

            const res = await axios.post('/api/v1/admin/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success) {
                showNotify(`${uploadFiles.length} file(s) uploaded successfully.`);
                setUploadFiles([]);
                setIsUploadModalOpen(false);
                fetchMedia(1);
            }
        } catch (err) {
            showNotify(err.response?.data?.message || 'Failed to upload files.', 'error');
        } finally {
            setUploading(false);
        }
    };

    // Edit Metadata Handler
    const handleOpenEdit = (media) => {
        setSelectedMedia(media);
        setEditForm({
            alt: media.alt || '',
            type: media.type || 'main'
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!selectedMedia) return;

        setSubmittingEdit(true);
        try {
            const res = await axios.put(`/api/v1/admin/media/${selectedMedia.id}`, editForm);
            if (res.data?.success) {
                showNotify('Media metadata updated successfully.');
                setIsEditModalOpen(false);
                fetchMedia(pagination.current_page);
            }
        } catch (err) {
            showNotify('Failed to update media metadata.', 'error');
        } finally {
            setSubmittingEdit(false);
        }
    };

    // Delete Media Asset Handler
    const handleDelete = async (media, force = false) => {
        const isAttached = media.model_type || media.model_id;
        const confirmMsg = isAttached && !force ?
            `Warning: This media is attached to ${media.model_type || 'a model'} #${media.model_id}. Are you sure you want to delete it?` :
            `Delete "${media.original_filename || media.filename}" permanently?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const url = force ? `/api/v1/admin/media/${media.id}?force=1` : `/api/v1/admin/media/${media.id}`;
            await axios.delete(url);
            showNotify('Media deleted successfully.');
            if (selectedMedia?.id === media.id) {
                setIsDetailModalOpen(false);
            }
            fetchMedia(pagination.current_page);
        } catch (err) {
            if (err.response?.status === 422 && !force) {
                if (window.confirm('Media is currently attached to an active entity. Force delete permanently?')) {
                    handleDelete(media, true);
                }
            } else {
                showNotify('Failed to delete media asset.', 'error');
            }
        }
    };

    // Purge Unused Handler
    const handlePurgeUnused = async () => {
        setPurging(true);
        try {
            const res = await axios.delete('/api/v1/admin/media/unused', {
                params: { older_than_days: purgeDays }
            });
            if (res.data?.success) {
                const count = res.data.data?.purged_count || 0;
                showNotify(`${count} orphaned media file(s) purged successfully.`);
                setIsPurgeModalOpen(false);
                fetchMedia(1);
            }
        } catch (err) {
            showNotify('Failed to purge orphaned media.', 'error');
        } finally {
            setPurging(false);
        }
    };

    // Format bytes to KB/MB
    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Calculate executive KPIs
    const totalAssets = pagination.total;
    const imageCount = mediaList.filter(m => m.mime_type?.startsWith('image/')).length;
    const documentCount = mediaList.filter(m => !m.mime_type?.startsWith('image/')).length;
    const unattachedCount = mediaList.filter(m => !m.model_type && !m.model_id).length;

    return (
        <div>
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
                    {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{notification.msg}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="page-header-row">
                <div>
                    <h2 className="page-header-title">Media Asset Library</h2>
                    <p className="page-header-subtitle">Centralized media manager for product images, categories, brand logos, promotional banners, and documents</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => fetchMedia(pagination.current_page)}
                        disabled={loading}
                        title="Reload media assets"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsPurgeModalOpen(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px' }}
                    >
                        <Trash2 size={14} />
                        <span>Purge Orphaned</span>
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                            setUploadFiles([]);
                            setIsUploadModalOpen(true);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontWeight: 700 }}
                    >
                        <Upload size={14} />
                        <span>Upload Media</span>
                    </button>
                </div>
            </div>

            {/* Executive KPI Summary Grid */}
            <div className="stat-cards-grid-4" style={{ marginBottom: '20px' }}>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Total Media Assets</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--admin-text)', marginTop: '4px' }}>{totalAssets} Files</div>
                </div>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Image Files</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{imageCount} Images</div>
                </div>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Documents / Files</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>{documentCount} Files</div>
                </div>
                <div style={{ padding: '16px 18px', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Unattached / Orphaned</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: unattachedCount > 0 ? '#f59e0b' : 'var(--admin-muted)', marginTop: '4px' }}>{unattachedCount} Assets</div>
                </div>
            </div>

            {/* Main Enclosed Card */}
            <div className="card" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
                {/* Search & Filter Toolbar */}
                <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg-secondary)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '260px' }}>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
                            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by filename or alt text..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ paddingLeft: '32px', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '36px', padding: '0 12px', borderRadius: '8px' }}>
                            Search
                        </button>
                    </form>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Asset Type Filter */}
                        <select
                            className="form-select"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            style={{ height: '36px', fontSize: '0.82rem', padding: '0 10px', borderRadius: '8px' }}
                        >
                            <option value="">All Asset Types</option>
                            <option value="main">Main Image</option>
                            <option value="gallery">Gallery Image</option>
                            <option value="thumbnail">Thumbnail</option>
                            <option value="banner">Banner</option>
                            <option value="document">Document / PDF</option>
                        </select>

                        {/* Model Type Filter */}
                        <select
                            className="form-select"
                            value={modelTypeFilter}
                            onChange={(e) => setModelTypeFilter(e.target.value)}
                            style={{ height: '36px', fontSize: '0.82rem', padding: '0 10px', borderRadius: '8px' }}
                        >
                            <option value="">All Entity Models</option>
                            <option value="product">Products</option>
                            <option value="category">Categories</option>
                            <option value="brand">Brands</option>
                            <option value="banner">Banners</option>
                            <option value="cms_page">CMS Pages</option>
                        </select>

                        {/* Unattached Toggle */}
                        <button
                            type="button"
                            onClick={() => setUnattachedOnly(!unattachedOnly)}
                            className={`btn btn-sm ${unattachedOnly ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ height: '36px', padding: '0 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.78rem' }}
                        >
                            Unattached Only
                        </button>

                        {/* View Mode Switcher */}
                        <div style={{ display: 'flex', border: '1px solid var(--admin-border)', borderRadius: '8px', overflow: 'hidden' }}>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                style={{ padding: '7px 10px', background: viewMode === 'grid' ? 'var(--admin-primary)' : 'transparent', color: viewMode === 'grid' ? '#fff' : 'var(--admin-text)', border: 'none', cursor: 'pointer' }}
                                title="Grid View"
                            >
                                <Grid size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                style={{ padding: '7px 10px', background: viewMode === 'list' ? 'var(--admin-primary)' : 'transparent', color: viewMode === 'list' ? '#fff' : 'var(--admin-text)', border: 'none', cursor: 'pointer' }}
                                title="List View"
                            >
                                <List size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Media Content Display */}
                <div style={{ padding: '18px' }}>
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading media asset library...</p>
                        </div>
                    ) : mediaList.length === 0 ? (
                        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--admin-muted)' }}>
                            <Image size={42} style={{ opacity: 0.4, marginBottom: '12px' }} />
                            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--admin-text)' }}>No Media Assets Found</h4>
                            <p style={{ margin: 0, fontSize: '0.82rem' }}>Upload images or adjust search filters to display files.</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        /* GRID VIEW */
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                            {mediaList.map((media) => {
                                const isImg = media.mime_type?.startsWith('image/');
                                const isCopied = copiedId === media.id;
                                const isUnattached = !media.model_type && !media.model_id;

                                return (
                                    <div
                                        key={media.id}
                                        style={{
                                            borderRadius: '10px',
                                            border: '1px solid var(--admin-border)',
                                            backgroundColor: 'var(--admin-card-bg)',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                        }}
                                    >
                                        {/* Image / Thumbnail Container */}
                                        <div
                                            onClick={() => {
                                                setSelectedMedia(media);
                                                setIsDetailModalOpen(true);
                                            }}
                                            style={{
                                                height: '140px',
                                                backgroundColor: 'var(--admin-bg-secondary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {isImg ? (
                                                <img
                                                    src={media.url}
                                                    alt={media.alt || media.original_filename}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}

                                            <div style={{ display: isImg ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: 'var(--admin-muted)' }}>
                                                <FileText size={32} />
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{media.mime_type?.split('/')[1] || 'File'}</span>
                                            </div>

                                            {/* Type Badge */}
                                            <span style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                padding: '2px 7px',
                                                borderRadius: '10px',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                                                color: '#fff',
                                                textTransform: 'uppercase',
                                                backdropFilter: 'blur(4px)'
                                            }}>
                                                {media.type || 'Media'}
                                            </span>

                                            {/* Attached status badge */}
                                            {isUnattached ? (
                                                <span style={{
                                                    position: 'absolute',
                                                    bottom: '8px',
                                                    right: '8px',
                                                    padding: '2px 7px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    backgroundColor: 'rgba(245, 158, 11, 0.85)',
                                                    color: '#fff',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    Unattached
                                                </span>
                                            ) : (
                                                <span style={{
                                                    position: 'absolute',
                                                    bottom: '8px',
                                                    right: '8px',
                                                    padding: '2px 7px',
                                                    borderRadius: '10px',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    backgroundColor: 'rgba(16, 185, 129, 0.85)',
                                                    color: '#fff',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    {media.model_type} #{media.model_id}
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Info Footer */}
                                        <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={media.original_filename || media.filename}>
                                                    {media.original_filename || media.filename}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                                                    {formatFileSize(media.size)}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--admin-border)' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyUrl(media.url, media.id)}
                                                    style={{ border: 'none', background: 'transparent', color: isCopied ? '#10b981' : 'var(--admin-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700 }}
                                                    title="Copy Public Media URL"
                                                >
                                                    {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                                    <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                                                </button>

                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(media)}
                                                        style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: 'var(--admin-muted)', cursor: 'pointer', borderRadius: '4px' }}
                                                        title="Edit Alt Text & Type"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(media)}
                                                        style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', borderRadius: '4px' }}
                                                        title="Delete Media Asset"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* LIST TABLE VIEW */
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 800 }}>Preview</th>
                                        <th style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 800 }}>Filename</th>
                                        <th style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 800 }}>Asset Type</th>
                                        <th style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 800 }}>Size</th>
                                        <th style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 800 }}>Attached Entity</th>
                                        <th style={{ padding: '10px 14px', fontSize: '0.75rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mediaList.map((media) => {
                                        const isImg = media.mime_type?.startsWith('image/');
                                        const isCopied = copiedId === media.id;

                                        return (
                                            <tr key={media.id}>
                                                <td style={{ padding: '8px 14px', width: '60px' }}>
                                                    <div
                                                        onClick={() => {
                                                            setSelectedMedia(media);
                                                            setIsDetailModalOpen(true);
                                                        }}
                                                        style={{ width: '40px', height: '40px', borderRadius: '6px', backgroundColor: 'var(--admin-bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                    >
                                                        {isImg ? (
                                                            <img src={media.url} alt={media.alt || media.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <FileText size={18} style={{ color: 'var(--admin-muted)' }} />
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '8px 14px' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--admin-text)' }}>{media.original_filename || media.filename}</div>
                                                    {media.alt && <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Alt: {media.alt}</div>}
                                                </td>
                                                <td style={{ padding: '8px 14px' }}>
                                                    <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                                        {media.type || 'Media'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                                                    {formatFileSize(media.size)}
                                                </td>
                                                <td style={{ padding: '8px 14px' }}>
                                                    {media.model_type ? (
                                                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.74rem', fontWeight: 700 }}>
                                                            {media.model_type} #{media.model_id}
                                                        </span>
                                                    ) : (
                                                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontSize: '0.74rem', fontWeight: 700 }}>
                                                            Unattached
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleCopyUrl(media.url, media.id)}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                                                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleOpenEdit(media)}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                                        >
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleDelete(media)}
                                                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444' }}
                                                        >
                                                            <Trash2 size={12} />
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

                    {/* Pagination Controls */}
                    {pagination.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--admin-border)' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total assets)
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.current_page <= 1}
                                    onClick={() => fetchMedia(pagination.current_page - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    disabled={pagination.current_page >= pagination.last_page}
                                    onClick={() => fetchMedia(pagination.current_page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL 1: MEDIA UPLOAD DRAWER */}
            {isUploadModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ width: '100%', maxWidth: '520px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '16px', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Upload size={18} style={{ color: 'var(--admin-primary)' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text)' }}>Upload Media Files</h3>
                            </div>
                            <button type="button" onClick={() => setIsUploadModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadSubmit} style={{ padding: '20px' }}>
                            {/* Drag and Drop Zone */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDropFiles}
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--admin-border)',
                                    borderRadius: '12px',
                                    padding: '32px 20px',
                                    textAlign: 'center',
                                    backgroundColor: 'var(--admin-bg-secondary)',
                                    cursor: 'pointer',
                                    transition: 'border-color 0.2s ease'
                                }}
                            >
                                <Upload size={36} style={{ color: 'var(--admin-primary)', opacity: 0.8, marginBottom: '8px' }} />
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text)' }}>Drag and drop files here</h4>
                                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--admin-muted)' }}>or click to browse from your device (PNG, JPG, WEBP, PDF up to 10MB)</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    multiple
                                    accept="image/*,application/pdf"
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* Selected Files List */}
                            {uploadFiles.length > 0 && (
                                <div style={{ marginTop: '14px', maxHeight: '140px', overflowY: 'auto' }}>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', marginBottom: '6px' }}>
                                        Selected Files ({uploadFiles.length}):
                                    </div>
                                    {uploadFiles.map((file, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'var(--admin-bg-secondary)', marginBottom: '4px', fontSize: '0.78rem' }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{file.name}</span>
                                            <span style={{ color: 'var(--admin-muted)', fontSize: '0.72rem' }}>{formatFileSize(file.size)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsUploadModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={uploading || uploadFiles.length === 0} style={{ fontWeight: 700 }}>
                                    {uploading ? 'Uploading...' : `Upload ${uploadFiles.length} File(s)`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT METADATA MODAL */}
            {isEditModalOpen && selectedMedia && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '16px', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Edit2 size={18} style={{ color: 'var(--admin-primary)' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text)' }}>Edit Media Metadata</h3>
                            </div>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                    Image Alt Text (SEO & Accessibility)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Descriptive alt text..."
                                    value={editForm.alt}
                                    onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                                    style={{ height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                    Asset Classification Type
                                </label>
                                <select
                                    className="form-select"
                                    value={editForm.type}
                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                    style={{ height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                                >
                                    <option value="main">Main Image</option>
                                    <option value="gallery">Gallery Image</option>
                                    <option value="thumbnail">Thumbnail</option>
                                    <option value="banner">Banner</option>
                                    <option value="document">Document</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingEdit} style={{ fontWeight: 700 }}>
                                    {submittingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: PURGE ORPHANED MEDIA MODAL */}
            {isPurgeModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1100, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                    <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '16px', border: '1px solid var(--admin-border)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldAlert size={18} style={{ color: '#ef4444' }} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--admin-text)' }}>Purge Orphaned Media</h3>
                            </div>
                            <button type="button" onClick={() => setIsPurgeModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--admin-muted)' }}>
                                This process permanently deletes all unattached media records and removes physical files from disk storage.
                            </p>

                            <div>
                                <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--admin-text)' }}>
                                    Purge Unattached Assets Older Than:
                                </label>
                                <select
                                    className="form-select"
                                    value={purgeDays}
                                    onChange={(e) => setPurgeDays(parseInt(e.target.value, 10))}
                                    style={{ height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
                                >
                                    <option value={1}>1 Day</option>
                                    <option value={7}>7 Days</option>
                                    <option value={30}>30 Days</option>
                                    <option value={0}>All Unattached Files Immediately</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsPurgeModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-danger btn-sm" onClick={handlePurgeUnused} disabled={purging} style={{ fontWeight: 700, backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '8px' }}>
                                    {purging ? 'Purging...' : 'Purge Orphaned Media'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 0: FULL-SCREEN LIGHTBOX / MEDIA DETAIL PREVIEW */}
            {isDetailModalOpen && selectedMedia && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ width: '100%', maxWidth: '840px', backgroundColor: 'var(--admin-card-bg)', borderRadius: '16px', border: '1px solid var(--admin-border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        {/* Header */}
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--admin-bg-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Eye size={18} style={{ color: 'var(--admin-primary)' }} />
                                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--admin-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                                    {selectedMedia.original_filename || selectedMedia.file_name}
                                </h3>
                            </div>
                            <button type="button" onClick={() => setIsDetailModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--admin-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0, overflow: 'hidden', flex: 1 }}>
                            {/* Image Preview Panel */}
                            <div style={{ padding: '20px', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                {selectedMedia.mime_type?.startsWith('image/') ? (
                                    <img
                                        src={selectedMedia.url}
                                        alt={selectedMedia.alt || selectedMedia.file_name}
                                        style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#94a3b8' }}>
                                        <FileText size={64} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedMedia.original_filename || selectedMedia.file_name}</span>
                                        <span style={{ fontSize: '0.78rem', opacity: 0.8 }}>{selectedMedia.mime_type}</span>
                                    </div>
                                )}
                            </div>

                            {/* Metadata Details Sidebar */}
                            <div style={{ padding: '20px', borderLeft: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-card-bg)', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>File Information</label>
                                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-text)', wordBreak: 'break-all' }}>{selectedMedia.original_filename || selectedMedia.file_name}</div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <div>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', display: 'block' }}>File Size</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>{formatFileSize(selectedMedia.size)}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', display: 'block' }}>Dimensions</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>{selectedMedia.width && selectedMedia.height ? `${selectedMedia.width} × ${selectedMedia.height}` : 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', display: 'block' }}>MIME Type</span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--admin-text)' }}>{selectedMedia.mime_type || 'Unknown'}</span>
                                    </div>

                                    <div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', display: 'block' }}>Classification</span>
                                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--admin-bg-secondary)', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', display: 'inline-block', marginTop: '2px' }}>
                                            {selectedMedia.type || 'Media'}
                                        </span>
                                    </div>

                                    <div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', display: 'block' }}>Attached Entity</span>
                                        {selectedMedia.model_type ? (
                                            <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.74rem', fontWeight: 700, display: 'inline-block', marginTop: '2px' }}>
                                                {selectedMedia.model_type} #{selectedMedia.model_id}
                                            </span>
                                        ) : (
                                            <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontSize: '0.74rem', fontWeight: 700, display: 'inline-block', marginTop: '2px' }}>
                                                Unattached / Orphaned
                                            </span>
                                        )}
                                    </div>

                                    {selectedMedia.alt && (
                                        <div>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', display: 'block' }}>Alt Text</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-text)', fontStyle: 'italic' }}>"{selectedMedia.alt}"</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Action Buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--admin-border)' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia.id)}
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                                    >
                                        {copiedId === selectedMedia.id ? <Check size={14} /> : <Copy size={14} />}
                                        <span>{copiedId === selectedMedia.id ? 'Copied to Clipboard' : 'Copy Public URL'}</span>
                                    </button>

                                    <a
                                        href={selectedMedia.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary btn-sm"
                                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', textDecoration: 'none' }}
                                    >
                                        <ExternalLink size={14} />
                                        <span>Open Original</span>
                                    </a>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setIsDetailModalOpen(false);
                                                handleOpenEdit(selectedMedia);
                                            }}
                                            style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                        >
                                            <Edit2 size={13} />
                                            <span>Edit Alt</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleDelete(selectedMedia)}
                                            style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
