import React, { useState, useEffect } from 'react';
import { Image, Upload, X, Check, Search, Trash2, FileText, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function MediaLibraryModal({
    isOpen,
    onClose,
    onSelect,
    isMultiSelect = false,
    targetType = 'product',
    title = 'Centralized Media Library'
}) {
    const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload'
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedMedia, setSelectedMedia] = useState([]);

    // File Upload state
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [altText, setAltText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedMedia([]);
            setErrorMsg('');
            fetchMedia();
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            params.append('per_page', 40);

            const res = await axios.get(`/api/v1/admin/media?${params.toString()}`);
            if (res.data?.success) {
                const rawData = res.data.data;
                const items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                setMediaItems(items);
            }
        } catch (err) {
            console.error('Failed to fetch media assets:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSelectMediaItem = (item) => {
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

    const handleConfirmSelection = () => {
        if (selectedMedia.length === 0) {
            setErrorMsg('Please select at least one media asset.');
            return;
        }

        onSelect(isMultiSelect ? selectedMedia : selectedMedia[0]);
        onClose();
    };

    const handleFileUploadChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (selectedFiles.length === 0) {
            setErrorMsg('Please select a file to upload.');
            return;
        }

        setUploading(true);
        setErrorMsg('');

        try {
            const formData = new FormData();
            if (selectedFiles.length === 1) {
                formData.append('file', selectedFiles[0]);
            } else {
                selectedFiles.forEach((file) => formData.append('files[]', file));
            }
            formData.append('model_type', targetType);
            if (altText) formData.append('alt', altText);

            const res = await axios.post('/api/v1/admin/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data?.success) {
                const uploadedData = res.data.data;
                setSelectedFiles([]);
                setAltText('');
                setActiveTab('library');
                await fetchMedia();

                // Auto select uploaded item
                if (Array.isArray(uploadedData)) {
                    setSelectedMedia(uploadedData);
                } else if (uploadedData) {
                    setSelectedMedia([uploadedData]);
                }
            }
        } catch (err) {
            console.error('Upload error:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to upload media asset.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteMedia = async (e, mediaId) => {
        e.stopPropagation();
        if (!window.confirm('Delete this asset from Centralized Media Repository?')) return;

        try {
            await axios.delete(`/api/v1/admin/media/${mediaId}`);
            setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
            setSelectedMedia((prev) => prev.filter((m) => m.id !== mediaId));
        } catch (err) {
            console.error('Failed to delete media:', err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '840px', width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Image size={22} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title">{title}</h3>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {errorMsg && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--admin-border)', marginBottom: '16px' }}>
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'library' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('library')}
                    >
                        <Image size={14} />
                        <span>Media Repository</span>
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <Upload size={14} />
                        <span>Upload New File</span>
                    </button>
                </div>

                {/* Tab Content 1: Media Library Repository */}
                {activeTab === 'library' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)' }} />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search central media assets..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
                                    style={{ paddingLeft: '36px' }}
                                />
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={fetchMedia}>
                                Refresh
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>
                                    Loading central media assets...
                                </div>
                            ) : mediaItems.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                    {mediaItems.map((item) => {
                                        const isSelected = selectedMedia.some((m) => m.id === item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleSelectMediaItem(item)}
                                                style={{
                                                    position: 'relative',
                                                    border: isSelected ? '2px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    backgroundColor: 'var(--admin-bg)',
                                                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                                                }}
                                            >
                                                <div style={{ width: '100%', height: '110px', backgroundColor: 'var(--admin-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    <img
                                                        src={item.url}
                                                        alt={item.alt || item.file_name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://via.placeholder.com/150?text=Image';
                                                        }}
                                                    />
                                                </div>

                                                <div style={{ padding: '6px 8px', fontSize: '0.75rem' }}>
                                                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.file_name}
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: 'var(--admin-primary)', color: '#fff', borderRadius: '50%', padding: '2px' }}>
                                                        <Check size={14} />
                                                    </div>
                                                )}

                                                <button
                                                    onClick={(e) => handleDeleteMedia(e, item.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: '6px',
                                                        right: '6px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '4px',
                                                        color: 'var(--admin-danger)',
                                                        cursor: 'pointer',
                                                    }}
                                                    title="Delete Media Asset"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-muted)' }}>
                                    No central media assets found. Upload images to get started.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content 2: Upload File */}
                {activeTab === 'upload' && (
                    <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div
                            style={{
                                border: '2px dashed var(--admin-border)',
                                borderRadius: '8px',
                                padding: '32px',
                                textAlign: 'center',
                                backgroundColor: 'var(--admin-bg)',
                                cursor: 'pointer',
                            }}
                        >
                            <Upload size={32} style={{ color: 'var(--admin-primary)', marginBottom: '8px' }} />
                            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Choose or drag media file to upload</p>
                            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>Supports JPG, PNG, WEBP, GIF (Max 5MB)</span>

                            <input
                                type="file"
                                accept="image/*"
                                multiple={isMultiSelect}
                                onChange={handleFileUploadChange}
                                style={{ marginTop: '16px', display: 'block', margin: '16px auto 0' }}
                            />
                        </div>

                        {selectedFiles.length > 0 && (
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Alt Text / Description (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter descriptive image alt text for accessibility..."
                                    value={altText}
                                    onChange={(e) => setAltText(e.target.value)}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary" disabled={uploading || selectedFiles.length === 0}>
                                <Upload size={16} />
                                <span>{uploading ? 'Uploading to Central Storage...' : 'Upload & Attach'}</span>
                            </button>
                        </div>
                    </form>
                )}

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
                        {selectedMedia.length > 0
                            ? `${selectedMedia.length} asset(s) selected`
                            : 'No asset selected'}
                    </span>

                    <div style={{ display: 'flex', gap: '12px' }}>
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
                            <span>Select & Attach Asset</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
