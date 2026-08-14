import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Image,
    Upload,
    X,
    Check,
    Search,
    Trash2,
    FileText,
    AlertCircle,
    Grid,
    List,
    Copy,
    CheckCircle2,
    HardDrive,
    Calendar,
    RefreshCw,
    SlidersHorizontal,
    Plus,
    ChevronLeft,
    ChevronRight,
    Info,
    File,
    ExternalLink,
    Filter
} from 'lucide-react';
import axios from 'axios';

/**
 * Format raw byte size into human readable string (KB, MB).
 */
function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Helper to extract clean image URL.
 */
function getAssetUrl(item) {
    if (!item) return '';
    let src = item.url || (item.file_path ? `/storage/${item.file_path}` : '');
    if (typeof src === 'string') {
        src = src.replace('http://localhost/storage/', '/storage/');
        src = src.replace('http://127.0.0.1/storage/', '/storage/');
    }
    return src;
}

export default function MediaLibraryModal({
    isOpen,
    onClose,
    onSelect,
    isMultiSelect = false,
    targetType = 'product',
    title = 'Centralized Media Library'
}) {
    // Navigation & View States
    const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [showInspector, setShowInspector] = useState(true);

    // Data states
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });

    // Filtering & Sorting states
    const [search, setSearch] = useState('');
    const [modelFilter, setModelFilter] = useState('all'); // 'all' | 'product' | 'category' | 'brand' | 'unattached'
    const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'main' | 'gallery' | 'thumbnail' | 'banner'
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'

    // Selection & Inspector states
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [activeInspectorItem, setActiveInspectorItem] = useState(null);
    const [editingAlt, setEditingAlt] = useState('');
    const [savingAlt, setSavingAlt] = useState(false);

    // Upload & Drag & Drop states
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [stagedFiles, setStagedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [defaultUploadAlt, setDefaultUploadAlt] = useState('');

    // Feedback states
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [copiedToast, setCopiedToast] = useState(false);

    const dropzoneRef = useRef(null);
    const searchDebounceRef = useRef(null);

    // Handle initial open & search debounce
    useEffect(() => {
        if (isOpen) {
            setSelectedMedia([]);
            setActiveInspectorItem(null);
            setErrorMsg('');
            setSuccessMsg('');
            fetchMedia(1);
        }
    }, [isOpen, modelFilter, typeFilter, sortBy]);

    // Keyboard shortcut (Escape key to close modal)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Live search handling with debounce
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            fetchMedia(1, val);
        }, 350);
    };

    // Fetch media from server with filters and pagination
    const fetchMedia = async (page = 1, currentSearch = search) => {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('per_page', 24);

            if (currentSearch) params.append('search', currentSearch);
            if (modelFilter === 'unattached') {
                params.append('unattached_only', '1');
            } else if (modelFilter !== 'all') {
                params.append('model_type', modelFilter);
            }

            if (typeFilter !== 'all') {
                params.append('type', typeFilter);
            }

            const res = await axios.get(`/api/v1/admin/media?${params.toString()}`);
            if (res.data?.success) {
                const paginator = res.data.data;
                let items = Array.isArray(paginator) ? paginator : (paginator?.data || []);

                // Local sort if needed
                if (sortBy === 'oldest') {
                    items = [...items].sort((a, b) => a.id - b.id);
                } else if (sortBy === 'name') {
                    items = [...items].sort((a, b) => (a.file_name || '').localeCompare(b.file_name || ''));
                } else {
                    items = [...items].sort((a, b) => b.id - a.id);
                }

                if (page === 1) {
                    setMediaItems(items);
                } else {
                    setMediaItems((prev) => [...prev, ...items]);
                }

                setPagination({
                    currentPage: paginator?.current_page || page,
                    lastPage: paginator?.last_page || 1,
                    total: paginator?.total || items.length
                });

                if (items.length > 0 && !activeInspectorItem && page === 1) {
                    setActiveInspectorItem(items[0]);
                    setEditingAlt(items[0].alt || '');
                }
            }
        } catch (err) {
            console.error('Failed to fetch media assets:', err);
            setErrorMsg('Failed to load media assets. Please try refreshing.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    if (!isOpen) return null;

    // Item selection handler
    const handleSelectMediaItem = (item, e) => {
        if (e) e.stopPropagation();

        setActiveInspectorItem(item);
        setEditingAlt(item.alt || '');

        if (isMultiSelect) {
            const exists = selectedMedia.some((m) => m.id === item.id);
            if (exists) {
                setSelectedMedia(selectedMedia.filter((m) => m.id !== item.id));
            } else {
                setSelectedMedia([...selectedMedia, item]);
            }
        } else {
            setSelectedMedia([item]);
        }
    };

    // Double-click handler for fast selection
    const handleItemDoubleClick = (item) => {
        setSelectedMedia([item]);
        onSelect(isMultiSelect ? [item] : item);
        onClose();
    };

    const handleSelectAll = () => {
        setSelectedMedia([...mediaItems]);
    };

    const handleClearSelection = () => {
        setSelectedMedia([]);
    };

    const handleConfirmSelection = () => {
        if (selectedMedia.length === 0) {
            setErrorMsg('Please select at least one media asset.');
            return;
        }
        onSelect(isMultiSelect ? selectedMedia : selectedMedia[0]);
        onClose();
    };

    // Drag & Drop Handlers
    const handleGlobalDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDraggingOver) setIsDraggingOver(true);
    };

    const handleGlobalDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDraggingOver(false);
    };

    const handleGlobalDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setActiveTab('upload');
            processUploadedFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processUploadedFiles(Array.from(e.target.files));
        }
    };

    const processUploadedFiles = (files) => {
        setErrorMsg('');
        const newStaged = files.map((file) => {
            const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
            return {
                id: Math.random().toString(36).substring(2, 9),
                file,
                name: file.name,
                size: file.size,
                sizeFormatted: formatBytes(file.size),
                type: file.type,
                previewUrl,
                alt: file.name.substring(0, file.name.lastIndexOf('.')) || file.name
            };
        });

        setStagedFiles((prev) => [...prev, ...newStaged]);
    };

    const handleRemoveStagedFile = (id) => {
        setStagedFiles((prev) => {
            const item = prev.find((f) => f.id === id);
            if (item && item.previewUrl) URL.revokeObjectURL(item.previewUrl);
            return prev.filter((f) => f.id !== id);
        });
    };

    // Submit File Uploads to Backend
    const handleUploadSubmit = async (e) => {
        if (e) e.preventDefault();
        if (stagedFiles.length === 0) {
            setErrorMsg('Please select at least one file to upload.');
            return;
        }

        setUploading(true);
        setUploadProgress(15);
        setErrorMsg('');

        try {
            const formData = new FormData();

            if (stagedFiles.length === 1) {
                formData.append('file', stagedFiles[0].file);
                if (stagedFiles[0].alt || defaultUploadAlt) {
                    formData.append('alt', stagedFiles[0].alt || defaultUploadAlt);
                }
            } else {
                stagedFiles.forEach((staged) => {
                    formData.append('files[]', staged.file);
                });
                if (defaultUploadAlt) formData.append('alt', defaultUploadAlt);
            }

            formData.append('model_type', targetType);

            const res = await axios.post('/api/v1/admin/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                }
            });

            if (res.data?.success) {
                const uploadedData = res.data.data;
                setSuccessMsg(`Successfully uploaded ${stagedFiles.length} media asset(s).`);

                // Clean up previews
                stagedFiles.forEach((item) => {
                    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                });

                setStagedFiles([]);
                setDefaultUploadAlt('');
                setActiveTab('library');

                await fetchMedia(1);

                // Auto-select uploaded item
                if (Array.isArray(uploadedData) && uploadedData.length > 0) {
                    setSelectedMedia(uploadedData);
                    setActiveInspectorItem(uploadedData[0]);
                } else if (uploadedData && typeof uploadedData === 'object') {
                    setSelectedMedia([uploadedData]);
                    setActiveInspectorItem(uploadedData);
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to upload media asset.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Save Alt text in inspector
    const handleSaveAltText = async () => {
        if (!activeInspectorItem) return;
        setSavingAlt(true);
        try {
            const res = await axios.put(`/api/v1/admin/media/${activeInspectorItem.id}`, {
                alt: editingAlt
            });
            if (res.data?.success) {
                setMediaItems((prev) =>
                    prev.map((m) => (m.id === activeInspectorItem.id ? { ...m, alt: editingAlt } : m))
                );
                setActiveInspectorItem((prev) => ({ ...prev, alt: editingAlt }));
                setSuccessMsg('Alt text updated successfully.');
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            console.error('Failed to update Alt text:', err);
            setErrorMsg('Failed to update Alt text.');
        } finally {
            setSavingAlt(false);
        }
    };

    // Copy public URL
    const handleCopyUrl = (url) => {
        const fullUrl = window.location.origin + url;
        navigator.clipboard.writeText(fullUrl);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
    };

    // Delete asset
    const handleDeleteMedia = async (e, mediaId) => {
        if (e) e.stopPropagation();
        if (!window.confirm('Are you sure you want to permanently delete this media asset?')) return;

        try {
            await axios.delete(`/api/v1/admin/media/${mediaId}?force=true`);
            setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
            setSelectedMedia((prev) => prev.filter((m) => m.id !== mediaId));

            if (activeInspectorItem?.id === mediaId) {
                const remaining = mediaItems.filter((m) => m.id !== mediaId);
                setActiveInspectorItem(remaining.length > 0 ? remaining[0] : null);
            }
            setSuccessMsg('Media asset deleted.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Failed to delete media:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to delete asset (it may be attached).');
        }
    };

    return (
        <div
            className="modal-overlay"
            onDragOver={handleGlobalDragOver}
            onDragLeave={handleGlobalDragLeave}
            onDrop={handleGlobalDrop}
        >
            <div
                className={`modal-card media-modal-card ${isDraggingOver ? 'media-drag-active' : ''}`}
            >
                {/* Global Drag Overlay Visual Indicator */}
                {isDraggingOver && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 50,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px dashed var(--admin-primary)',
                            borderRadius: 'var(--radius-lg)',
                            pointerEvents: 'none'
                        }}
                    >
                        <Upload size={48} style={{ color: 'var(--admin-primary)', marginBottom: '12px' }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--admin-primary)' }}>
                            Drop files anywhere to upload instantly
                        </h3>
                    </div>
                )}

                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--admin-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--admin-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image size={20} style={{ color: 'var(--admin-primary)' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{title}</h3>
                            <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                Browse, search, upload and manage digital assets
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isMultiSelect && (
                            <span style={{ fontSize: '0.78rem', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--admin-primary-light)', color: 'var(--admin-primary)', fontWeight: 600 }}>
                                Multi-Select Mode
                            </span>
                        )}
                        <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '6px' }}>
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Notifications Alert Bar */}
                {(errorMsg || successMsg) && (
                    <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: errorMsg ? 'var(--admin-danger-light)' : 'var(--admin-success-light)', color: errorMsg ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {errorMsg ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                            <span>{errorMsg || successMsg}</span>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => { setErrorMsg(''); setSuccessMsg(''); }}>
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Main Navigation Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', marginBottom: '12px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'library' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('library')}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Image size={15} />
                            <span>Media Repository ({pagination.total})</span>
                        </button>
                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('upload')}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Upload size={15} />
                            <span>Upload Files {stagedFiles.length > 0 && `(${stagedFiles.length})`}</span>
                        </button>
                    </div>

                    {activeTab === 'library' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                className={`btn btn-sm ${showInspector ? 'btn-secondary' : 'btn-secondary'}`}
                                onClick={() => setShowInspector(!showInspector)}
                                title="Toggle Inspector Panel"
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
                            >
                                <Info size={14} />
                                <span className="d-none d-sm-inline">{showInspector ? 'Hide Info' : 'Show Info'}</span>
                            </button>
                            <div style={{ display: 'flex', border: '1px solid var(--admin-border)', borderRadius: '6px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    style={{ padding: '6px 10px', backgroundColor: viewMode === 'grid' ? 'var(--admin-primary-light)' : 'transparent', color: viewMode === 'grid' ? 'var(--admin-primary)' : 'var(--admin-muted)', border: 'none', cursor: 'pointer' }}
                                    title="Grid View"
                                >
                                    <Grid size={15} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    style={{ padding: '6px 10px', backgroundColor: viewMode === 'list' ? 'var(--admin-primary-light)' : 'transparent', color: viewMode === 'list' ? 'var(--admin-primary)' : 'var(--admin-muted)', border: 'none', cursor: 'pointer' }}
                                    title="List View"
                                >
                                    <List size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* TAB 1: MEDIA LIBRARY REPOSITORY */}
                {activeTab === 'library' && (
                    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: showInspector ? '12px' : 0 }}>
                            {/* Toolbar: Search, Filters, Sort */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                                {/* Search Bar */}
                                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px' }}>
                                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by file name or alt text..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        style={{ paddingLeft: '32px', paddingRight: search ? '30px' : '10px', fontSize: '0.82rem', height: '34px' }}
                                    />
                                    {search && (
                                        <button
                                            onClick={() => { setSearch(''); fetchMedia(1, ''); }}
                                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--admin-muted)', cursor: 'pointer' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Entity Filter */}
                                <select
                                    className="form-control"
                                    value={modelFilter}
                                    onChange={(e) => setModelFilter(e.target.value)}
                                    style={{ width: 'auto', fontSize: '0.82rem', height: '34px', padding: '0 8px' }}
                                >
                                    <option value="all">All Entities</option>
                                    <option value="product">Products</option>
                                    <option value="category">Categories</option>
                                    <option value="brand">Brands</option>
                                    <option value="unattached">Unattached Only</option>
                                </select>

                                {/* Asset Type Filter */}
                                <select
                                    className="form-control"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    style={{ width: 'auto', fontSize: '0.82rem', height: '34px', padding: '0 8px' }}
                                >
                                    <option value="all">All Asset Types</option>
                                    <option value="main">Main Image</option>
                                    <option value="gallery">Gallery</option>
                                    <option value="thumbnail">Thumbnail</option>
                                    <option value="banner">Banner</option>
                                </select>

                                {/* Sort Order */}
                                <select
                                    className="form-control"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={{ width: 'auto', fontSize: '0.82rem', height: '34px', padding: '0 8px' }}
                                >
                                    <option value="newest">Sort: Newest First</option>
                                    <option value="oldest">Sort: Oldest First</option>
                                    <option value="name">Sort: Name A-Z</option>
                                </select>

                                <button className="btn btn-secondary btn-sm" onClick={() => fetchMedia(1)} style={{ height: '34px', padding: '0 10px' }} title="Refresh Media Assets">
                                    <RefreshCw size={14} className={loading ? 'spin' : ''} />
                                </button>
                            </div>

                            {/* Batch Selection Bar (Multi Select) */}
                            {isMultiSelect && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: 'var(--admin-bg)', borderRadius: '6px', marginBottom: '10px', fontSize: '0.78rem' }}>
                                    <span style={{ color: 'var(--admin-muted)' }}>
                                        {selectedMedia.length} of {mediaItems.length} items selected
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-link btn-sm" onClick={handleSelectAll} style={{ padding: 0, fontSize: '0.78rem' }}>Select All</button>
                                        <span style={{ color: 'var(--admin-border)' }}>|</span>
                                        <button className="btn btn-link btn-sm" onClick={handleClearSelection} style={{ padding: 0, fontSize: '0.78rem' }}>Deselect All</button>
                                    </div>
                                </div>
                            )}

                            {/* Media Assets Scroll Container */}
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                                {loading ? (
                                    /* Skeleton Grid Loader */
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                        {Array.from({ length: 12 }).map((_, idx) => (
                                            <div key={idx} className="media-skeleton" style={{ height: '140px' }} />
                                        ))}
                                    </div>
                                ) : mediaItems.length > 0 ? (
                                    viewMode === 'grid' ? (
                                        /* GRID VIEW */
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(125px, 1fr))', gap: '12px' }}>
                                            {mediaItems.map((item) => {
                                                const isSelected = selectedMedia.some((m) => m.id === item.id);
                                                const isInspected = activeInspectorItem?.id === item.id;
                                                const src = getAssetUrl(item);
                                                const isImage = item.mime_type?.startsWith('image/') || (!item.mime_type && src);

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`media-grid-item ${isSelected ? 'selected' : ''}`}
                                                        onClick={(e) => handleSelectMediaItem(item, e)}
                                                        onDoubleClick={() => handleItemDoubleClick(item)}
                                                        style={{
                                                            outline: isInspected && !isSelected ? '2px solid var(--admin-subtle)' : 'none'
                                                        }}
                                                    >
                                                        {/* Thumbnail Box */}
                                                        <div style={{ width: '100%', height: '110px', backgroundColor: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                                            {isImage ? (
                                                                <img
                                                                    src={src}
                                                                    alt={item.alt || item.file_name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--admin-muted)' }}>
                                                                    <FileText size={32} />
                                                                    <span style={{ fontSize: '0.65rem', marginTop: '4px', textTransform: 'uppercase' }}>
                                                                        {item.file_name?.split('.').pop() || 'FILE'}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div style={{ display: 'none', flexDirection: 'column', alignItems: 'center', color: 'var(--admin-muted)' }}>
                                                                <FileText size={28} />
                                                            </div>
                                                        </div>

                                                        {/* Selection Badge */}
                                                        {isSelected && (
                                                            <div className="badge-select">
                                                                <Check size={14} />
                                                            </div>
                                                        )}

                                                        {/* Type Badge */}
                                                        {item.type && item.type !== 'gallery' && (
                                                            <span className="badge-type">{item.type}</span>
                                                        )}

                                                        {/* File Name Footer */}
                                                        <div style={{ padding: '6px 8px', fontSize: '0.73rem', backgroundColor: 'var(--admin-card-bg)' }}>
                                                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.file_name}>
                                                                {item.file_name}
                                                            </div>
                                                            <div style={{ fontSize: '0.68rem', color: 'var(--admin-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                                                <span>{formatBytes(item.size)}</span>
                                                                {item.width && <span>{item.width}×{item.height}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* LIST TABLE VIEW */
                                        <table className="table" style={{ width: '100%', fontSize: '0.82rem' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px' }}></th>
                                                    <th>Asset Name</th>
                                                    <th>Type</th>
                                                    <th>Resolution</th>
                                                    <th>Size</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mediaItems.map((item) => {
                                                    const isSelected = selectedMedia.some((m) => m.id === item.id);
                                                    const src = getAssetUrl(item);
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            onClick={(e) => handleSelectMediaItem(item, e)}
                                                            onDoubleClick={() => handleItemDoubleClick(item)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                backgroundColor: isSelected ? 'var(--admin-primary-light)' : 'transparent'
                                                            }}
                                                        >
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}}
                                                                />
                                                            </td>
                                                            <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <div style={{ width: '36px', height: '36px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--admin-bg)', flexShrink: 0 }}>
                                                                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 600 }}>{item.file_name}</div>
                                                                    <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>{item.alt || 'No alt text'}</div>
                                                                </div>
                                                            </td>
                                                            <td><span className="badge badge-sm">{item.type || 'gallery'}</span></td>
                                                            <td>{item.width ? `${item.width} × ${item.height}` : 'N/A'}</td>
                                                            <td>{formatBytes(item.size)}</td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={(e) => handleDeleteMedia(e, item.id)}
                                                                    style={{ padding: '4px 8px', color: 'var(--admin-danger)' }}
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )
                                ) : (
                                    /* EMPTY STATE */
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--admin-muted)' }}>
                                        <Image size={42} style={{ color: 'var(--admin-subtle)', marginBottom: '12px' }} />
                                        <h4 style={{ fontWeight: 600, color: 'var(--admin-text)', marginBottom: '4px' }}>No Media Assets Found</h4>
                                        <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                                            No files match your filter criteria or search query.
                                        </p>
                                        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('upload')}>
                                            <Upload size={14} />
                                            <span>Upload New Asset</span>
                                        </button>
                                    </div>
                                )}

                                {/* Load More Pagination Button */}
                                {pagination.currentPage < pagination.lastPage && (
                                    <div style={{ textAlign: 'center', margin: '16px 0' }}>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => fetchMedia(pagination.currentPage + 1)}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? 'Loading More...' : `Load More (Page ${pagination.currentPage + 1} of ${pagination.lastPage})`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* INSPECTOR PANEL (RIGHT SIDEBAR) */}
                        {showInspector && activeInspectorItem && (
                            <div className="media-inspector-pane">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--admin-border)', paddingBottom: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Info size={15} style={{ color: 'var(--admin-primary)' }} />
                                        Asset Details
                                    </span>
                                    <button style={{ background: 'none', border: 'none', color: 'var(--admin-muted)', cursor: 'pointer' }} onClick={() => setShowInspector(false)}>
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Preview Image Pane */}
                                <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <img
                                        src={getAssetUrl(activeInspectorItem)}
                                        alt={activeInspectorItem.alt || activeInspectorItem.file_name}
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                </div>

                                {/* File Info Specs */}
                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontWeight: 600, wordBreak: 'break-all', fontSize: '0.85rem' }}>
                                        {activeInspectorItem.file_name}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--admin-muted)', fontSize: '0.75rem' }}>
                                        <div>
                                            <span style={{ display: 'block', color: 'var(--admin-subtle)' }}>Dimensions</span>
                                            <strong style={{ color: 'var(--admin-text)' }}>{activeInspectorItem.width ? `${activeInspectorItem.width} × ${activeInspectorItem.height} px` : 'N/A'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', color: 'var(--admin-subtle)' }}>File Size</span>
                                            <strong style={{ color: 'var(--admin-text)' }}>{formatBytes(activeInspectorItem.size)}</strong>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', color: 'var(--admin-subtle)' }}>Type</span>
                                            <strong style={{ color: 'var(--admin-text)' }}>{activeInspectorItem.type || 'gallery'}</strong>
                                        </div>
                                        <div>
                                            <span style={{ display: 'block', color: 'var(--admin-subtle)' }}>Attached To</span>
                                            <strong style={{ color: 'var(--admin-text)' }}>{activeInspectorItem.model_type ? `${activeInspectorItem.model_type} #${activeInspectorItem.model_id}` : 'Unattached'}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Alt Text */}
                                <div>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                        Alt Text / Description
                                    </label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={editingAlt}
                                            onChange={(e) => setEditingAlt(e.target.value)}
                                            placeholder="Descriptive alt text for SEO..."
                                            style={{ fontSize: '0.8rem' }}
                                        />
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={handleSaveAltText}
                                            disabled={savingAlt}
                                            title="Save Alt Text"
                                        >
                                            {savingAlt ? '...' : <Check size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--admin-border)' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => handleCopyUrl(getAssetUrl(activeInspectorItem))}
                                        style={{ justifyContent: 'center', gap: '6px' }}
                                    >
                                        {copiedToast ? <Check size={14} style={{ color: 'var(--admin-success)' }} /> : <Copy size={14} />}
                                        <span>{copiedToast ? 'URL Copied!' : 'Copy Asset URL'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={(e) => handleDeleteMedia(e, activeInspectorItem.id)}
                                        style={{ justifyContent: 'center', gap: '6px', color: 'var(--admin-danger)' }}
                                    >
                                        <Trash2 size={14} />
                                        <span>Delete Asset</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: UPLOAD NEW FILE */}
                {activeTab === 'upload' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '16px' }}>
                        {/* Drag & Drop Upload Zone */}
                        <div
                            className="media-dropzone"
                            onClick={() => dropzoneRef.current?.click()}
                        >
                            <Upload size={40} style={{ color: 'var(--admin-primary)', marginBottom: '12px' }} />
                            <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Drag & Drop media files here</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', marginBottom: '12px' }}>
                                or click to browse files from your computer
                            </p>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'var(--admin-border)', color: 'var(--admin-muted)' }}>
                                Supported Formats: JPG, PNG, WEBP, GIF, SVG, PDF (Max 10MB per file)
                            </span>

                            <input
                                ref={dropzoneRef}
                                type="file"
                                accept="image/*,application/pdf"
                                multiple={isMultiSelect}
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Staged File Previews before uploading */}
                        {stagedFiles.length > 0 && (
                            <div>
                                <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
                                    Staged Files to Upload ({stagedFiles.length})
                                </h5>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {stagedFiles.map((staged) => (
                                        <div
                                            key={staged.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '8px 10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--admin-border)',
                                                backgroundColor: 'var(--admin-bg)',
                                                position: 'relative'
                                            }}
                                        >
                                            <div style={{ width: '44px', height: '44px', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--admin-card-bg)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {staged.previewUrl ? (
                                                    <img src={staged.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <FileText size={24} style={{ color: 'var(--admin-muted)' }} />
                                                )}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0, fontSize: '0.78rem' }}>
                                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {staged.name}
                                                </div>
                                                <div style={{ color: 'var(--admin-muted)', fontSize: '0.72rem' }}>
                                                    {staged.sizeFormatted}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStagedFile(staged.id)}
                                                style={{ background: 'none', border: 'none', color: 'var(--admin-muted)', cursor: 'pointer', padding: '4px' }}
                                                title="Remove file"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Default Alt text for batch upload */}
                                <div style={{ marginTop: '14px' }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                        Default Alt Text / Caption (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter image caption or description for SEO..."
                                        value={defaultUploadAlt}
                                        onChange={(e) => setDefaultUploadAlt(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Upload Progress Bar */}
                        {uploading && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                    <span>Uploading files to central storage...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--admin-border)', overflow: 'hidden' }}>
                                    <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--admin-primary)', transition: 'width 0.2s ease' }} />
                                </div>
                            </div>
                        )}

                        {/* Upload Action Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={uploading || stagedFiles.length === 0}
                                onClick={handleUploadSubmit}
                            >
                                <Upload size={16} />
                                <span>{uploading ? 'Uploading...' : `Upload & Attach ${stagedFiles.length > 0 ? `(${stagedFiles.length})` : ''}`}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* MODAL FOOTER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--admin-border)' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: selectedMedia.length > 0 ? 'var(--admin-success)' : 'var(--admin-subtle)' }} />
                        <span>
                            {selectedMedia.length > 0
                                ? `${selectedMedia.length} asset(s) selected`
                                : 'No asset selected'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={selectedMedia.length === 0}
                            onClick={handleConfirmSelection}
                        >
                            <Check size={16} />
                            <span>Select & Insert ({selectedMedia.length})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
