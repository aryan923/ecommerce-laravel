import React, { useState, useEffect } from 'react';
import { Package, X, Check, AlertCircle, Tag, DollarSign, Truck, Search, Download } from 'lucide-react';
import axios from 'axios';

export default function ProductFormModal({ isOpen, mode = 'create', initialData = null, onClose, onSuccess }) {
    const [activeTab, setActiveTab] = useState('general');
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        type: 'simple',
        status: 'active',
        featured: false,
        brand_id: '',
        category_ids: [],
        primary_category_id: '',
        price: '',
        sale_price: '',
        cost_price: '',
        short_description: '',
        description: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        download_url: '',
        download_limit: '',
        download_expiry_days: '',
        seo_title: '',
        seo_description: '',
        meta_keywords: '',
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            fetchBrandsAndCategories();

            if (mode === 'edit' && initialData) {
                const catIds = initialData.categories ? initialData.categories.map((c) => c.id) : [];
                const primCat = initialData.categories ? initialData.categories.find((c) => c.pivot?.is_primary)?.id : '';

                setFormData({
                    name: initialData.name || '',
                    sku: initialData.sku || '',
                    type: initialData.type || 'simple',
                    status: initialData.status || 'active',
                    featured: Boolean(initialData.featured),
                    brand_id: initialData.brand_id || '',
                    category_ids: catIds,
                    primary_category_id: primCat || (catIds[0] || ''),
                    price: initialData.price || '',
                    sale_price: initialData.sale_price || '',
                    cost_price: initialData.cost_price || '',
                    short_description: initialData.short_description || '',
                    description: initialData.description || '',
                    weight: initialData.weight || '',
                    length: initialData.length || '',
                    width: initialData.width || '',
                    height: initialData.height || '',
                    download_url: initialData.download_url || '',
                    download_limit: initialData.download_limit || '',
                    download_expiry_days: initialData.download_expiry_days || '',
                    seo_title: initialData.seo_title || '',
                    seo_description: initialData.seo_description || '',
                    meta_keywords: initialData.meta_keywords || '',
                });
            } else {
                setFormData({
                    name: '',
                    sku: '',
                    type: 'simple',
                    status: 'active',
                    featured: false,
                    brand_id: '',
                    category_ids: [],
                    primary_category_id: '',
                    price: '',
                    sale_price: '',
                    cost_price: '',
                    short_description: '',
                    description: '',
                    weight: '',
                    length: '',
                    width: '',
                    height: '',
                    download_url: '',
                    download_limit: '',
                    download_expiry_days: '',
                    seo_title: '',
                    seo_description: '',
                    meta_keywords: '',
                });
            }
        }
    }, [isOpen, mode, initialData]);

    const fetchBrandsAndCategories = async () => {
        try {
            const [bRes, cRes] = await Promise.all([
                axios.get('/api/v1/admin/brands?per_page=100').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/categories?per_page=100').catch(() => ({ data: { data: [] } })),
            ]);
            setBrands(bRes.data?.data?.data || bRes.data?.data || []);
            setCategories(cRes.data?.data?.data || cRes.data?.data || []);
        } catch (e) {
            console.error('Error fetching brands/categories:', e);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCategoryToggle = (catId) => {
        setFormData((prev) => {
            const current = [...prev.category_ids];
            const exists = current.includes(catId);
            const updated = exists ? current.filter((id) => id !== catId) : [...current, catId];
            const primary = updated.includes(prev.primary_category_id) ? prev.primary_category_id : (updated[0] || '');

            return {
                ...prev,
                category_ids: updated,
                primary_category_id: primary,
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.category_ids.length === 0) {
            setError('Please select at least one category for the product.');
            setActiveTab('general');
            return;
        }

        setSubmitting(true);

        const payload = {
            name: formData.name,
            type: formData.type,
            status: formData.status,
            featured: formData.featured,
            brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
            category_ids: formData.category_ids,
            primary_category_id: formData.primary_category_id ? parseInt(formData.primary_category_id) : (formData.category_ids[0] || null),
            price: parseFloat(formData.price),
            sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
            cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
            short_description: formData.short_description || null,
            description: formData.description || null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            length: formData.length ? parseFloat(formData.length) : null,
            width: formData.width ? parseFloat(formData.width) : null,
            height: formData.height ? parseFloat(formData.height) : null,
            seo_title: formData.seo_title || null,
            seo_description: formData.seo_description || null,
            meta_keywords: formData.meta_keywords || null,
        };

        if (formData.sku) payload.sku = formData.sku;

        if (formData.type === 'digital') {
            payload.download_url = formData.download_url || null;
            payload.download_limit = formData.download_limit ? parseInt(formData.download_limit) : null;
            payload.download_expiry_days = formData.download_expiry_days ? parseInt(formData.download_expiry_days) : null;
        }

        try {
            if (mode === 'edit' && initialData?.id) {
                await axios.put(`/api/v1/admin/products/${initialData.id}`, payload);
            } else {
                await axios.post('/api/v1/admin/products', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Product save error:', err);
            setError(err.response?.data?.message || 'Failed to save product details. Check validation errors.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={22} style={{ color: 'var(--admin-primary)' }} />
                        <h3 className="card-title">{mode === 'edit' ? 'Edit Product Specification' : 'Create Complete Product'}</h3>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {error && (
                    <div style={{ padding: '10px 14px', backgroundColor: 'var(--admin-danger-light)', color: 'var(--admin-danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Tabbed Navigation Bar */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--admin-border)', marginBottom: '20px' }}>
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'general' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <Tag size={14} />
                        <span>General & Catalog</span>
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'pricing' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('pricing')}
                    >
                        <DollarSign size={14} />
                        <span>Pricing & Tax</span>
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'shipping' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('shipping')}
                    >
                        <Truck size={14} />
                        <span>Shipping & Spec</span>
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${activeTab === 'seo' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        <Search size={14} />
                        <span>SEO Metadata</span>
                    </button>
                    {formData.type === 'digital' && (
                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'digital' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('digital')}
                        >
                            <Download size={14} />
                            <span>Digital File</span>
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Tab 1: General & Catalog */}
                    {activeTab === 'general' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Wireless Noise Cancelling Headphones"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    SKU (Auto-generated if empty)
                                </label>
                                <input
                                    type="text"
                                    name="sku"
                                    className="form-control"
                                    placeholder="PRD-HEAD-01"
                                    value={formData.sku}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Product Type *
                                </label>
                                <select name="type" className="form-select" value={formData.type} onChange={handleChange}>
                                    <option value="simple">Simple Product</option>
                                    <option value="variable">Variable Product</option>
                                    <option value="digital">Digital Download Product</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Status *
                                </label>
                                <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                    <option value="active">Active (Published)</option>
                                    <option value="draft">Draft (Unpublished)</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Brand
                                </label>
                                <select name="brand_id" className="form-select" value={formData.brand_id} onChange={handleChange}>
                                    <option value="">Select Brand (Optional)</option>
                                    {brands.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Categories * (Select applicable categories)
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                                    {categories.length ? categories.map((cat) => (
                                        <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', backgroundColor: formData.category_ids.includes(cat.id) ? 'var(--admin-primary-light)' : 'transparent' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.category_ids.includes(cat.id)}
                                                onChange={() => handleCategoryToggle(cat.id)}
                                            />
                                            <span>{cat.name}</span>
                                        </label>
                                    )) : (
                                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>No categories available in catalog.</span>
                                    )}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleChange}
                                    />
                                    <span style={{ fontWeight: 600 }}>Mark as Featured Product</span>
                                </label>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Short Description
                                </label>
                                <input
                                    type="text"
                                    name="short_description"
                                    className="form-control"
                                    placeholder="Brief feature summary for listing cards..."
                                    value={formData.short_description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Full Product Description
                                </label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    rows={4}
                                    placeholder="Detailed technical specifications, features, and overview..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Pricing & Tax */}
                    {activeTab === 'pricing' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Regular Price ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    className="form-control"
                                    placeholder="199.99"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Sale Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="sale_price"
                                    className="form-control"
                                    placeholder="149.99"
                                    value={formData.sale_price}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Cost Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cost_price"
                                    className="form-control"
                                    placeholder="85.00"
                                    value={formData.cost_price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Shipping & Specifications */}
                    {activeTab === 'shipping' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="weight"
                                    className="form-control"
                                    placeholder="0.85"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Length (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="length"
                                    className="form-control"
                                    placeholder="20.0"
                                    value={formData.length}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Width (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="width"
                                    className="form-control"
                                    placeholder="15.0"
                                    value={formData.width}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="height"
                                    className="form-control"
                                    placeholder="8.5"
                                    value={formData.height}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 4: SEO Metadata */}
                    {activeTab === 'seo' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    SEO Meta Title
                                </label>
                                <input
                                    type="text"
                                    name="seo_title"
                                    className="form-control"
                                    placeholder="Buy Wireless Headphones Online | Best Price"
                                    value={formData.seo_title}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Meta Keywords (Comma separated)
                                </label>
                                <input
                                    type="text"
                                    name="meta_keywords"
                                    className="form-control"
                                    placeholder="headphones, bluetooth, audio, wireless"
                                    value={formData.meta_keywords}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    SEO Meta Description
                                </label>
                                <textarea
                                    name="seo_description"
                                    className="form-control"
                                    rows={3}
                                    placeholder="Discover premium noise cancelling headphones with long battery life..."
                                    value={formData.seo_description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 5: Digital File Parameters */}
                    {activeTab === 'digital' && formData.type === 'digital' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Download URL / File Link *
                                </label>
                                <input
                                    type="text"
                                    name="download_url"
                                    className="form-control"
                                    placeholder="https://downloads.example.com/software-v1.zip"
                                    value={formData.download_url}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Max Download Limit
                                </label>
                                <input
                                    type="number"
                                    name="download_limit"
                                    className="form-control"
                                    placeholder="5 (Leave empty for unlimited)"
                                    value={formData.download_limit}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                    Link Expiry (Days)
                                </label>
                                <input
                                    type="number"
                                    name="download_expiry_days"
                                    className="form-control"
                                    placeholder="30"
                                    value={formData.download_expiry_days}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    )}

                    {/* Modal Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--admin-border)' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            <Check size={16} />
                            <span>{submitting ? 'Saving Product...' : mode === 'edit' ? 'Update Full Specification' : 'Create Product'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
