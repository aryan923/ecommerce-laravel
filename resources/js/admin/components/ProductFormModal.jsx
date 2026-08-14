import React, { useState, useEffect } from 'react';
import {
    Package,
    X,
    Check,
    AlertCircle,
    Tag,
    DollarSign,
    Truck,
    Search,
    Download,
    Image as ImageIcon,
    Plus,
    Trash2,
    Layers,
    Percent,
    Wand2,
    Info,
    Clock,
    Scale
} from 'lucide-react';
import axios from 'axios';
import MediaLibraryModal from './MediaLibraryModal';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

export default function ProductFormModal({
    isOpen,
    mode = 'create',
    initialData = null,
    displayCurrency = 'INR',
    onClose,
    onSuccess
}) {
    const [activeTab, setActiveTab] = useState('general');
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [taxClasses, setTaxClasses] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [shippingMethods, setShippingMethods] = useState([]);

    // Media Modal State
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState('main'); // 'main' | 'gallery' | 'variant'
    const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);

    // Combination Generator state
    const [selectedGenAttributes, setSelectedGenAttributes] = useState({});

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        type: 'simple',
        status: 'active',
        featured: false,
        brand_id: '',
        tax_class_id: '',
        category_ids: [],
        primary_category_id: '',
        price: '',
        sale_price: '',
        cost_price: '',
        short_description: '',
        description: '',

        // Shipping Parameters
        requires_shipping: true,
        is_free_shipping: false,
        shipping_class_id: '',
        weight: '',
        length: '',
        width: '',
        height: '',

        // Digital Parameters
        download_url: '',
        download_limit: '',
        download_expiry_days: '',

        // SEO
        seo_title: '',
        seo_description: '',
        meta_keywords: '',

        // Media State
        main_image: null,
        gallery: [],

        // Variants State
        variants: [],
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            fetchDropdownData();

            if (mode === 'edit' && initialData) {
                const catIds = initialData.categories ? initialData.categories.map((c) => c.id) : [];
                const primCat = initialData.categories ? initialData.categories.find((c) => c.pivot?.is_primary)?.id : '';

                // Extract media
                const mainMedia = initialData.media?.find((m) => m.type === 'main') || null;
                const galleryMedia = initialData.media?.filter((m) => m.type === 'gallery') || [];

                setFormData({
                    name: initialData.name || '',
                    sku: initialData.sku || '',
                    type: initialData.type || 'simple',
                    status: initialData.status || 'active',
                    featured: Boolean(initialData.featured),
                    brand_id: initialData.brand_id || '',
                    tax_class_id: initialData.tax_class_id || '',
                    category_ids: catIds,
                    primary_category_id: primCat || (catIds[0] || ''),
                    price: initialData.price || '',
                    sale_price: initialData.sale_price || '',
                    cost_price: initialData.cost_price || '',
                    short_description: initialData.short_description || '',
                    description: initialData.description || '',

                    requires_shipping: initialData.requires_shipping !== undefined ? Boolean(initialData.requires_shipping) : true,
                    is_free_shipping: Boolean(initialData.is_free_shipping),
                    shipping_class_id: initialData.shipping_class_id || '',
                    shipping_fee: initialData.shipping_fee || '',
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

                    main_image: mainMedia,
                    gallery: galleryMedia,
                    variants: initialData.variants ? initialData.variants.map((v) => ({
                        id: v.id,
                        sku: v.sku || '',
                        price: v.price || '',
                        sale_price: v.sale_price || '',
                        cost_price: v.cost_price || '',
                        stock_qty: v.stock_qty ?? 10,
                        image: v.image || '',
                        download_url: v.download_url || '',
                        download_limit: v.download_limit || '',
                        download_expiry_days: v.download_expiry_days || '',
                        attribute_value_ids: v.attribute_values ? v.attribute_values.map((av) => av.id) : (v.attribute_value_ids || []),
                    })) : [],
                });
            } else {
                setFormData({
                    name: '',
                    sku: '',
                    type: 'simple',
                    status: 'active',
                    featured: false,
                    brand_id: '',
                    tax_class_id: '',
                    category_ids: [],
                    primary_category_id: '',
                    price: '',
                    sale_price: '',
                    cost_price: '',
                    short_description: '',
                    description: '',

                    requires_shipping: true,
                    is_free_shipping: false,
                    shipping_class_id: '',
                    shipping_fee: '',
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

                    main_image: null,
                    gallery: [],
                    variants: [
                        { sku: 'VAR-01', price: '', sale_price: '', stock_qty: 10, image: '', attribute_value_ids: [] }
                    ],
                });
            }
        }
    }, [isOpen, mode, initialData]);

    const fetchDropdownData = async () => {
        try {
            const [bRes, cRes, tRes, aRes, sRes] = await Promise.all([
                axios.get('/api/v1/admin/brands?per_page=100').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/categories?per_page=100').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/tax-classes').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/attributes?per_page=100').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/shipping-methods').catch(() => ({ data: { data: [] } })),
            ]);

            setBrands(bRes.data?.data?.data || bRes.data?.data || []);
            setCategories(cRes.data?.data?.data || cRes.data?.data || []);
            setTaxClasses(tRes.data?.data?.data || tRes.data?.data || []);
            setAttributes(aRes.data?.data?.data || aRes.data?.data || []);
            setShippingMethods(sRes.data?.data?.data || sRes.data?.data || []);
        } catch (e) {
            console.error('Error fetching dropdowns:', e);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value,
            };

            if (name === 'type' && value === 'digital') {
                updated.requires_shipping = false;
            }

            return updated;
        });
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

    // Open Media Library Modal
    const handleOpenMediaPicker = (target, vIndex = null) => {
        setMediaPickerTarget(target);
        setSelectedVariantIndex(vIndex);
        setIsMediaModalOpen(true);
    };

    // Handle Media Selection
    const handleMediaSelected = (media) => {
        if (!media) return;
        if (mediaPickerTarget === 'main') {
            const item = Array.isArray(media) ? media[0] : media;
            setFormData((prev) => ({ ...prev, main_image: item }));
        } else if (mediaPickerTarget === 'gallery') {
            const newItems = Array.isArray(media) ? media : [media];
            setFormData((prev) => {
                const existingIds = new Set(prev.gallery.map((g) => (typeof g === 'object' ? g?.id : g)));
                const filteredNew = newItems.filter((m) => !existingIds.has(typeof m === 'object' ? m?.id : m));
                return {
                    ...prev,
                    gallery: [...prev.gallery, ...filteredNew],
                };
            });
        } else if (mediaPickerTarget === 'variant' && selectedVariantIndex !== null) {
            const item = Array.isArray(media) ? media[0] : media;
            const imageUrl = typeof item === 'object' ? (item.url || (item.file_path ? `/storage/${item.file_path}` : '')) : item;
            const updatedVariants = [...formData.variants];
            if (updatedVariants[selectedVariantIndex]) {
                updatedVariants[selectedVariantIndex].image = imageUrl;
            }
            setFormData((prev) => ({ ...prev, variants: updatedVariants }));
        }
    };

    // Remove Gallery Photo
    const handleRemoveGalleryPhoto = (index) => {
        setFormData((prev) => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index),
        }));
    };

    // Variant Helper functions
    const handleAddVariantRow = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [
                ...prev.variants,
                { sku: `VAR-${prev.variants.length + 1}`, price: prev.price || '', sale_price: prev.sale_price || '', cost_price: prev.cost_price || '', stock_qty: 10, image: '', download_url: prev.download_url || '', download_limit: '', download_expiry_days: '', attribute_value_ids: [] }
            ]
        }));
    };

    const handleUpdateVariantRow = (index, field, val) => {
        const updated = [...formData.variants];
        updated[index][field] = val;
        setFormData((prev) => ({ ...prev, variants: updated }));
    };

    const handleToggleVariantAttributeValue = (vIndex, valId) => {
        const updated = [...formData.variants];
        const currentVals = updated[vIndex].attribute_value_ids || [];
        const exists = currentVals.includes(valId);
        updated[vIndex].attribute_value_ids = exists
            ? currentVals.filter((id) => id !== valId)
            : [...currentVals, valId];

        setFormData((prev) => ({ ...prev, variants: updated }));
    };

    const handleRemoveVariantRow = (index) => {
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    // Auto-Generate Variant Combinations Matrix (Cartesian product)
    const handleSelectAllAttrValues = (attrId) => {
        const targetAttr = attributes.find((a) => a.id === attrId);
        if (!targetAttr?.values) return;
        const allValIds = targetAttr.values.map((v) => v.id);
        setSelectedGenAttributes((prev) => ({ ...prev, [attrId]: allValIds }));
    };

    const handleClearAttrValues = (attrId) => {
        setSelectedGenAttributes((prev) => ({ ...prev, [attrId]: [] }));
    };

    const handleApplyBatchPriceAndStock = () => {
        const basePrice = formData.price || '';
        const baseSalePrice = formData.sale_price || '';
        const baseCostPrice = formData.cost_price || '';
        const baseStock = 10;

        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.map((v) => ({
                ...v,
                price: v.price || basePrice,
                sale_price: v.sale_price || baseSalePrice,
                cost_price: v.cost_price || baseCostPrice,
                stock_qty: v.stock_qty || baseStock,
            }))
        }));
    };

    const handleAutoGenerateCombinations = () => {
        const selectedGroupedValues = [];
        const baseSku = formData.sku ? formData.sku.toUpperCase() : 'SKU';

        // Flatten value lookup for generating human-readable SKUs
        const valueLookup = {};
        attributes.forEach((attr) => {
            attr.values?.forEach((val) => {
                valueLookup[val.id] = {
                    attrName: attr.name,
                    valName: val.value || val.name,
                };
            });
        });

        Object.keys(selectedGenAttributes).forEach((attrId) => {
            const valIds = selectedGenAttributes[attrId];
            if (valIds && valIds.length > 0) {
                selectedGroupedValues.push(valIds);
            }
        });

        if (selectedGroupedValues.length === 0) {
            alert('Please select attribute values below to auto-generate variant combinations.');
            return;
        }

        const cartesianProduct = (arrays) => {
            return arrays.reduce((acc, curr) => {
                return acc.flatMap((x) => curr.map((y) => [...x, y]));
            }, [[]]);
        };

        // Collect deselected attribute value IDs across all attributes for auto-pruning
        const deselectedValIds = new Set();
        attributes.forEach((attr) => {
            const selectedForAttr = selectedGenAttributes[attr.id] || [];
            attr.values?.forEach((val) => {
                if (!selectedForAttr.includes(val.id)) {
                    deselectedValIds.add(Number(val.id));
                }
            });
        });

        // 1. Prune existing variant rows that contain any deselected attribute value ID
        const keptVariants = formData.variants.filter((v) => {
            if (!v.attribute_value_ids?.length) return true; // Keep manual blank variants
            const containsDeselected = v.attribute_value_ids.some((vId) => deselectedValIds.has(Number(vId)));
            return !containsDeselected;
        });

        // 2. Build set of remaining combination signatures to avoid duplicates
        const getComboSig = (valIds) => (valIds || []).slice().map(Number).sort((a, b) => a - b).join('-');
        const existingSigs = new Set(keptVariants.map((v) => getComboSig(v.attribute_value_ids)));
        const existingSkus = new Set(keptVariants.map((v) => (v.sku ? v.sku.toUpperCase() : '')));

        // 3. Generate missing Cartesian combinations
        const combinations = cartesianProduct(selectedGroupedValues);
        const filteredCombinations = combinations.filter((comboVals) => {
            const sig = getComboSig(comboVals);
            return !existingSigs.has(sig);
        });

        const newVariantRows = filteredCombinations.map((comboVals, idx) => {
            const codeParts = comboVals
                .map((vId) => valueLookup[vId]?.valName || vId)
                .map((name) => String(name).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6));

            let generatedSku = `${baseSku}-${codeParts.join('-')}`;
            if (existingSkus.has(generatedSku.toUpperCase())) {
                generatedSku = `${generatedSku}-${idx + 1}`;
            }

            return {
                sku: generatedSku,
                price: formData.price || '',
                sale_price: formData.sale_price || '',
                cost_price: formData.cost_price || '',
                stock_qty: 10,
                image: '',
                download_url: formData.download_url || '',
                download_limit: formData.download_limit || '',
                download_expiry_days: formData.download_expiry_days || '',
                attribute_value_ids: comboVals,
            };
        });

        setFormData((prev) => ({
            ...prev,
            variants: [...keptVariants, ...newVariantRows]
        }));
    };

    const handleToggleGenAttributeVal = (attrId, valId) => {
        setSelectedGenAttributes((prev) => {
            const current = prev[attrId] || [];
            const exists = current.includes(valId);
            const updated = exists ? current.filter((id) => id !== valId) : [...current, valId];
            return { ...prev, [attrId]: updated };
        });
    };

    const selectedShippingMethod = shippingMethods.find(
        (s) => String(s.id) === String(formData.shipping_class_id)
    );

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
            tax_class_id: formData.tax_class_id ? parseInt(formData.tax_class_id) : null,
            category_ids: formData.category_ids,
            primary_category_id: formData.primary_category_id ? parseInt(formData.primary_category_id) : (formData.category_ids[0] || null),
            price: parseFloat(formData.price),
            sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
            cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
            short_description: formData.short_description || null,
            description: formData.description || null,

            requires_shipping: formData.requires_shipping,
            is_free_shipping: formData.is_free_shipping,
            shipping_class_id: formData.shipping_class_id ? parseInt(formData.shipping_class_id) : null,
            shipping_fee: formData.shipping_fee ? parseFloat(formData.shipping_fee) : null,
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

        if (formData.type === 'variable' && formData.variants.length > 0) {
            payload.variants = formData.variants;
        }

        try {
            let res;
            if (mode === 'edit' && initialData?.id) {
                res = await axios.put(`/api/v1/admin/products/${initialData.id}`, payload);
            } else {
                res = await axios.post('/api/v1/admin/products', payload);
            }

            const savedProduct = res.data?.data;
            const productId = savedProduct?.id || initialData?.id;

            if (productId) {
                // Attach Main Image
                if (formData.main_image?.id) {
                    try {
                        await axios.post('/api/v1/admin/media/attach', {
                            media_id: formData.main_image.id,
                            model_type: 'product',
                            model_id: productId,
                            type: 'main',
                        });
                    } catch (mErr) {
                        console.error('Failed to attach main image:', mErr);
                    }
                }

                // Attach Gallery Images
                if (Array.isArray(formData.gallery) && formData.gallery.length > 0) {
                    for (const gItem of formData.gallery) {
                        const mediaId = typeof gItem === 'object' ? gItem?.id : null;
                        if (mediaId) {
                            try {
                                await axios.post('/api/v1/admin/media/attach', {
                                    media_id: mediaId,
                                    model_type: 'product',
                                    model_id: productId,
                                    type: 'gallery',
                                });
                            } catch (gErr) {
                                console.error('Failed to attach gallery item:', gErr);
                            }
                        }
                    }
                }

                // Detach removed images if in edit mode
                if (mode === 'edit' && initialData?.media) {
                    const currentMainId = formData.main_image?.id || null;
                    const currentGalleryIds = (formData.gallery || [])
                        .map((g) => (typeof g === 'object' ? g?.id : null))
                        .filter(Boolean);

                    const removedItems = initialData.media.filter((m) => {
                        if (m.type === 'main' && currentMainId && m.id !== currentMainId) return true;
                        if (m.type === 'gallery' && !currentGalleryIds.includes(m.id)) return true;
                        return false;
                    });

                    for (const rm of removedItems) {
                        try {
                            await axios.post('/api/v1/admin/media/detach', { media_id: rm.id });
                        } catch (dErr) {
                            console.error('Failed to detach media:', dErr);
                        }
                    }
                }
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
            <div
                className="modal-card"
                style={{
                    maxWidth: '940px',
                    width: '95%',
                    maxHeight: '92vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    boxShadow: '0 24px 64px -12px rgba(0,0,0,0.25), 0 0 0 1px var(--admin-border)',
                    padding: 0,
                    backgroundColor: 'var(--admin-card-bg, #fff)'
                }}
            >
                {/* Modal Header */}
                <div
                    style={{
                        padding: '18px 24px',
                        borderBottom: '1px solid var(--admin-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                        borderTopLeftRadius: '16px',
                        borderTopRightRadius: '16px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: 'var(--admin-primary-light, rgba(79, 70, 229, 0.1))',
                                color: 'var(--admin-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Package size={22} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                {mode === 'edit' ? 'Edit Product Specification' : 'Create Complete Product'}
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                {mode === 'edit' ? `Modifying Catalog Item #${initialData?.id || ''}` : 'Configure pricing, media, attributes, shipping & SEO metadata'}
                            </span>
                        </div>
                    </div>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ borderRadius: '50%', width: '34px', height: '34px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Main Scrollable Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {error && (
                        <div
                            style={{
                                padding: '12px 16px',
                                backgroundColor: 'var(--admin-danger-light, rgba(239, 68, 68, 0.1))',
                                color: 'var(--admin-danger)',
                                border: '1px solid var(--admin-danger)',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Tabbed Navigation Bar */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            borderBottom: '1px solid var(--admin-border)',
                            marginBottom: '24px',
                            paddingBottom: '8px',
                            overflowX: 'auto',
                            scrollbars: 'none'
                        }}
                    >
                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'general' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('general')}
                            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Tag size={14} />
                            <span>General</span>
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'pricing' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('pricing')}
                            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <DollarSign size={14} />
                            <span>Pricing & Tax</span>
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'media' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('media')}
                            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <ImageIcon size={14} />
                            <span>Media & Images</span>
                            {formData.gallery.length > 0 && (
                                <span style={{ backgroundColor: activeTab === 'media' ? '#fff' : 'var(--admin-primary)', color: activeTab === 'media' ? 'var(--admin-primary)' : '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                                    {formData.gallery.length}
                                </span>
                            )}
                        </button>

                        {(formData.type === 'variable' || formData.type === 'digital') && (
                            <button
                                type="button"
                                className={`btn btn-sm ${activeTab === 'variants' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('variants')}
                                style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Layers size={14} />
                                <span>Variants & Attributes</span>
                                {formData.variants.length > 0 && (
                                    <span style={{ backgroundColor: activeTab === 'variants' ? '#fff' : 'var(--admin-primary)', color: activeTab === 'variants' ? 'var(--admin-primary)' : '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                                        {formData.variants.length}
                                    </span>
                                )}
                            </button>
                        )}

                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'shipping' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('shipping')}
                            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Truck size={14} />
                            <span>Shipping & Specs</span>
                        </button>

                        <button
                            type="button"
                            className={`btn btn-sm ${activeTab === 'seo' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setActiveTab('seo')}
                            style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Search size={14} />
                            <span>SEO</span>
                        </button>

                        {formData.type === 'digital' && (
                            <button
                                type="button"
                                className={`btn btn-sm ${activeTab === 'digital' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab('digital')}
                                style={{ borderRadius: '20px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <Download size={14} />
                                <span>Digital File</span>
                            </button>
                        )}
                    </div>

                    <form id="productForm" onSubmit={handleSubmit}>
                        {/* Tab 1: General & Catalog */}
                        {activeTab === 'general' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                        <Tag size={18} style={{ color: 'var(--admin-primary)' }} />
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>General Information</h4>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Product Title / Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                placeholder="e.g. Premium Wireless Noise-Cancelling Headphones"
                                                value={formData.name}
                                                onChange={handleChange}
                                                style={{ fontSize: '0.95rem', fontWeight: 600 }}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                SKU (Stock Keeping Unit)
                                            </label>
                                            <input
                                                type="text"
                                                name="sku"
                                                className="form-control"
                                                placeholder="PRD-AUDIO-100"
                                                value={formData.sku}
                                                onChange={handleChange}
                                            />
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Auto-generated if left blank</span>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Product Classification Type *
                                            </label>
                                            <select name="type" className="form-select" value={formData.type} onChange={handleChange} style={{ fontWeight: 600 }}>
                                                <option value="simple">Simple Product (Single Item)</option>
                                                <option value="variable">Variable Product (Multiple Variants)</option>
                                                <option value="digital">Digital Product (Downloadable)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Publication Status *
                                            </label>
                                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                                <option value="active">Active (Visible on Storefront)</option>
                                                <option value="draft">Draft (Hidden)</option>
                                                <option value="inactive">Inactive</option>
                                                <option value="archived">Archived</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Manufacturer Brand
                                            </label>
                                            <select name="brand_id" className="form-select" value={formData.brand_id} onChange={handleChange}>
                                                <option value="">Select Brand (Optional)</option>
                                                {brands.map((b) => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Category Assignments *
                                            </label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)', borderRadius: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                                                {categories.length ? categories.map((cat) => {
                                                    const isSelected = formData.category_ids.includes(cat.id);
                                                    return (
                                                        <label
                                                            key={cat.id}
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.82rem',
                                                                cursor: 'pointer',
                                                                padding: '5px 12px',
                                                                borderRadius: '20px',
                                                                border: isSelected ? '1px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                                backgroundColor: isSelected ? 'var(--admin-primary-light, rgba(79, 70, 229, 0.1))' : 'var(--admin-card-bg)',
                                                                color: isSelected ? 'var(--admin-primary)' : 'var(--admin-text)',
                                                                fontWeight: isSelected ? 600 : 400,
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleCategoryToggle(cat.id)}
                                                            />
                                                            <span>{cat.name}</span>
                                                        </label>
                                                    );
                                                }) : (
                                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>No categories available in catalog.</span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                                <input
                                                    type="checkbox"
                                                    name="featured"
                                                    checked={formData.featured}
                                                    onChange={handleChange}
                                                />
                                                <span style={{ fontWeight: 600 }}>Mark as Featured Product (Highlights item on homepage showcase)</span>
                                            </label>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Short Description
                                            </label>
                                            <input
                                                type="text"
                                                name="short_description"
                                                className="form-control"
                                                placeholder="Brief 1-liner summary displayed on product cards..."
                                                value={formData.short_description}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Detailed Product Description
                                            </label>
                                            <textarea
                                                name="description"
                                                className="form-control"
                                                rows={4}
                                                placeholder="Write full product specifications, features, and warranty details..."
                                                value={formData.description}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Pricing & Tax */}
                        {activeTab === 'pricing' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <DollarSign size={18} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Pricing & Tax Setup</h4>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', padding: '3px 10px', borderRadius: '12px', backgroundColor: 'var(--admin-primary-light)', color: 'var(--admin-primary)', fontWeight: 600 }}>
                                            Base Currency: INR (₹)
                                        </span>
                                    </div>

                                    {formData.price && (
                                        <div style={{ padding: '10px 14px', backgroundColor: 'var(--admin-bg)', borderRadius: '8px', border: '1px solid var(--admin-border)', marginBottom: '16px', fontSize: '0.82rem' }}>
                                            <span style={{ color: 'var(--admin-muted)' }}>Multi-Currency Live Preview: </span>
                                            <strong style={{ color: 'var(--admin-primary)', marginLeft: '6px' }}>
                                                {formatCurrency(formData.price, displayCurrency, true)}
                                            </strong>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Regular Price (₹ INR) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="price"
                                                className="form-control"
                                                placeholder="1999.00"
                                                value={formData.price}
                                                onChange={handleChange}
                                                style={{ fontSize: '0.95rem', fontWeight: 700 }}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Sale / Discount Price (₹ INR)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="sale_price"
                                                className="form-control"
                                                placeholder="1499.00"
                                                value={formData.sale_price}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Cost Price (₹ INR - Internal)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="cost_price"
                                                className="form-control"
                                                placeholder="850.00"
                                                value={formData.cost_price}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Margin & Profit Calculation Indicator */}
                                        {formData.price && formData.cost_price && (
                                            <div style={{ gridColumn: '1 / -1', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--admin-primary-light, rgba(79,70,229,0.08))', border: '1px solid var(--admin-primary)', display: 'flex', gap: '20px', fontSize: '0.82rem' }}>
                                                <div>
                                                    <span style={{ color: 'var(--admin-muted)', display: 'block' }}>Estimated Profit</span>
                                                    <strong style={{ color: 'var(--admin-success)', fontSize: '0.9rem' }}>
                                                        ₹{(parseFloat(formData.sale_price || formData.price) - parseFloat(formData.cost_price)).toFixed(2)}
                                                    </strong>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--admin-muted)', display: 'block' }}>Profit Margin %</span>
                                                    <strong style={{ color: 'var(--admin-primary)', fontSize: '0.9rem' }}>
                                                        {(((parseFloat(formData.sale_price || formData.price) - parseFloat(formData.cost_price)) / parseFloat(formData.sale_price || formData.price)) * 100).toFixed(1)}%
                                                    </strong>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Tax Class / GST Tier
                                            </label>
                                            <select name="tax_class_id" className="form-select" value={formData.tax_class_id} onChange={handleChange}>
                                                <option value="">Default Standard 18% GST</option>
                                                {taxClasses.map((t) => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Centralized Media & Gallery */}
                        {activeTab === 'media' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                        <ImageIcon size={18} style={{ color: 'var(--admin-primary)' }} />
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Main Product Cover Photo</h4>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                        {(() => {
                                            const mainSrc = typeof formData.main_image === 'object'
                                                ? (formData.main_image?.url || (formData.main_image?.file_path ? `/storage/${formData.main_image.file_path}` : ''))
                                                : (typeof formData.main_image === 'string' ? formData.main_image : '');
                                            return (
                                                <>
                                                    <div
                                                        style={{
                                                            width: '130px',
                                                            height: '130px',
                                                            borderRadius: '12px',
                                                            border: mainSrc ? '2px solid var(--admin-primary)' : '2px dashed var(--admin-border)',
                                                            backgroundColor: 'var(--admin-bg)',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative',
                                                            boxShadow: mainSrc ? 'var(--shadow-sm)' : 'none'
                                                        }}
                                                    >
                                                        {mainSrc ? (
                                                            <>
                                                                <img src={mainSrc} alt="Main product cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                <span style={{ position: 'absolute', bottom: '6px', left: '6px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                                                                    COVER
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <div style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>
                                                                <ImageIcon size={34} style={{ color: 'var(--admin-subtle)' }} />
                                                                <span style={{ display: 'block', fontSize: '0.72rem', marginTop: '4px', fontWeight: 600 }}>No Cover Photo</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary"
                                                                onClick={() => handleOpenMediaPicker('main')}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                                            >
                                                                <ImageIcon size={16} />
                                                                <span>{mainSrc ? 'Change Cover Photo' : 'Select Main Cover Photo'}</span>
                                                            </button>

                                                            {mainSrc && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary"
                                                                    style={{ color: 'var(--admin-danger)' }}
                                                                    onClick={() => setFormData((prev) => ({ ...prev, main_image: null }))}
                                                                >
                                                                    <Trash2 size={16} />
                                                                    <span>Remove</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>
                                                            Primary cover image featured on product listings & storefront catalog (Min 800×800 px).
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Layers size={18} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                                                Product Photo Gallery ({formData.gallery.length} Photos)
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleOpenMediaPicker('gallery')}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Plus size={14} />
                                            <span>Add Gallery Photos</span>
                                        </button>
                                    </div>

                                    {formData.gallery.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                                            {formData.gallery.map((img, idx) => {
                                                const src = typeof img === 'object' ? (img.url || (img.file_path ? `/storage/${img.file_path}` : '')) : img;
                                                return (
                                                    <div key={idx} style={{ position: 'relative', height: '110px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                                        <img src={src} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(15,23,42,0.75)', color: '#ffffff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '3px', fontWeight: 600 }}>
                                                            #{idx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveGalleryPhoto(idx)}
                                                            style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '4px', padding: '3px', cursor: 'pointer', color: 'var(--admin-danger)', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
                                                            title="Remove gallery photo"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '30px', border: '2px dashed var(--admin-border)', borderRadius: '10px', textAlign: 'center', color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
                                            No additional gallery photos attached yet. Click "Add Gallery Photos" to select from Media Library.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Variants & Attributes */}
                        {activeTab === 'variants' && (formData.type === 'variable' || formData.type === 'digital') && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Auto-Generate Combinations Tool */}
                                <div
                                    style={{
                                        padding: '20px',
                                        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.12))',
                                        border: '1px solid var(--admin-primary)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Wand2 size={18} />
                                                <span>Auto-Generate Variant Combinations Tool</span>
                                            </h4>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>Select attribute values below to auto-generate all possible matrix combinations</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleAutoGenerateCombinations}
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                                        >
                                            <Wand2 size={16} />
                                            <span>Generate Combinations Matrix</span>
                                        </button>
                                    </div>

                                    {attributes.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                                            {attributes.map((attr) => {
                                                const selectedCount = (selectedGenAttributes[attr.id] || []).length;
                                                const totalCount = attr.values?.length || 0;
                                                return (
                                                    <div key={attr.id} style={{ fontSize: '0.8rem', backgroundColor: 'var(--admin-card-bg, #fff)', padding: '12px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                            <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{attr.name} ({selectedCount}/{totalCount})</span>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    type="button"
                                                                    style={{ border: 'none', background: 'none', color: 'var(--admin-primary)', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, padding: 0 }}
                                                                    onClick={() => handleSelectAllAttrValues(attr.id)}
                                                                >
                                                                    All
                                                                </button>
                                                                <span style={{ color: 'var(--admin-border)' }}>|</span>
                                                                <button
                                                                    type="button"
                                                                    style={{ border: 'none', background: 'none', color: 'var(--admin-muted)', cursor: 'pointer', fontSize: '0.72rem', padding: 0 }}
                                                                    onClick={() => handleClearAttrValues(attr.id)}
                                                                >
                                                                    Clear
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                                                            {attr.values?.length ? (
                                                                attr.values.map((val) => {
                                                                    const checked = (selectedGenAttributes[attr.id] || []).includes(val.id);
                                                                    return (
                                                                        <label key={val.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={checked}
                                                                                onChange={() => handleToggleGenAttributeVal(attr.id, val.id)}
                                                                            />
                                                                            <span>{val.value || val.name}</span>
                                                                        </label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>No values found</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>No catalog attributes (Color, Size, RAM) defined yet. Configure attributes in /admin/attributes first.</span>
                                    )}
                                </div>

                                {/* Variant Matrix Table Section */}
                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                                            Variant Matrix Table ({formData.variants.length} Rows)
                                        </h4>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleApplyBatchPriceAndStock}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <DollarSign size={14} />
                                                <span>Apply Base Prices & Stock to All</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleAddVariantRow}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <Plus size={14} />
                                                <span>Add Blank Variant</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="admin-table" style={{ fontSize: '0.8rem', border: '1px solid var(--admin-border)' }}>
                                            <thead>
                                                <tr>
                                                    <th>Image</th>
                                                    <th>SKU</th>
                                                    <th>Assigned Attributes</th>
                                                    <th>Reg. Price (₹)</th>
                                                    <th>Sale Price (₹)</th>
                                                    <th>Cost Price (₹)</th>
                                                    <th>Stock</th>
                                                    <th style={{ textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.variants.map((v, vIdx) => {
                                                    const SVG_VARIANT_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                                                    const vImgSrc = v.image || formData.main_image?.url || SVG_VARIANT_PLACEHOLDER;

                                                    const valueLookup = {};
                                                    attributes.forEach((attr) => {
                                                        attr.values?.forEach((val) => {
                                                            valueLookup[val.id] = {
                                                                attrName: attr.name,
                                                                valName: val.value || val.name,
                                                            };
                                                        });
                                                    });

                                                    return (
                                                        <tr key={vIdx}>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <img src={vImgSrc} alt="Variant" style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-secondary btn-sm"
                                                                        onClick={() => handleOpenMediaPicker('variant', vIdx)}
                                                                        style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                                                                    >
                                                                        Pick
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={v.sku}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'sku', e.target.value)}
                                                                    style={{ padding: '4px 8px', fontSize: '0.8rem', width: '130px' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                                                                    {v.attribute_value_ids?.length ? (
                                                                        v.attribute_value_ids.map((valId) => {
                                                                            const info = valueLookup[valId];
                                                                            return (
                                                                                <span
                                                                                    key={valId}
                                                                                    style={{
                                                                                        fontSize: '0.72rem',
                                                                                        padding: '3px 8px',
                                                                                        borderRadius: '4px',
                                                                                        backgroundColor: 'var(--admin-primary)',
                                                                                        color: '#fff',
                                                                                        fontWeight: 600,
                                                                                        display: 'inline-flex',
                                                                                        alignItems: 'center',
                                                                                        gap: '4px'
                                                                                    }}
                                                                                >
                                                                                    <span>{info ? `${info.attrName}: ${info.valName}` : `Val #${valId}`}</span>
                                                                                </span>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>No attributes assigned</span>
                                                                    )}
                                                                </div>
                                                                {formData.type === 'digital' && (
                                                                    <div style={{ marginTop: '4px' }}>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            placeholder="Variant File Download URL"
                                                                            value={v.download_url || ''}
                                                                            onChange={(e) => handleUpdateVariantRow(vIdx, 'download_url', e.target.value)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control"
                                                                    value={v.price}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'price', e.target.value)}
                                                                    placeholder={formData.price || '0.00'}
                                                                    style={{ padding: '4px 6px', fontSize: '0.8rem', width: '85px' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control"
                                                                    value={v.sale_price || ''}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'sale_price', e.target.value)}
                                                                    placeholder={formData.sale_price || 'Optional'}
                                                                    style={{ padding: '4px 6px', fontSize: '0.8rem', width: '85px' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control"
                                                                    value={v.cost_price || ''}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'cost_price', e.target.value)}
                                                                    placeholder={formData.cost_price || 'Optional'}
                                                                    style={{ padding: '4px 6px', fontSize: '0.8rem', width: '85px' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={v.stock_qty}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'stock_qty', e.target.value)}
                                                                    style={{ padding: '4px 6px', fontSize: '0.8rem', width: '70px' }}
                                                                />
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary btn-sm"
                                                                    style={{ color: 'var(--admin-danger)' }}
                                                                    onClick={() => handleRemoveVariantRow(vIdx)}
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 5: Shipping & Specifications */}
                        {activeTab === 'shipping' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                        <Truck size={18} style={{ color: 'var(--admin-primary)' }} />
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Shipping & Physical Package Specs</h4>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '24px', padding: '14px', backgroundColor: 'var(--admin-bg)', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                <input
                                                    type="checkbox"
                                                    name="requires_shipping"
                                                    checked={formData.requires_shipping}
                                                    onChange={handleChange}
                                                />
                                                <span style={{ fontWeight: 600 }}>Requires Physical Shipping</span>
                                            </label>

                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                <input
                                                    type="checkbox"
                                                    name="is_free_shipping"
                                                    checked={formData.is_free_shipping}
                                                    onChange={handleChange}
                                                />
                                                <span style={{ fontWeight: 600, color: 'var(--admin-success)' }}>Eligible for Free Shipping</span>
                                            </label>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Shipping Class / Carrier Method Tier
                                            </label>
                                            <select
                                                name="shipping_class_id"
                                                className="form-select"
                                                value={formData.shipping_class_id}
                                                onChange={handleChange}
                                                disabled={!formData.requires_shipping}
                                            >
                                                <option value="">Default Surface Delivery (Zone Rate Calculation)</option>
                                                {shippingMethods.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name} {s.type ? `(${s.type})` : ''} {s.estimated_days ? `• Est. ${s.estimated_days} days` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Per-Product Custom Shipping Fee Override (₹ INR)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="shipping_fee"
                                                className="form-control"
                                                placeholder="e.g. 75.00 (Leave empty to use zone rates)"
                                                value={formData.shipping_fee}
                                                onChange={handleChange}
                                                disabled={!formData.requires_shipping || formData.is_free_shipping}
                                            />
                                        </div>

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
                                                disabled={!formData.requires_shipping}
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
                                                disabled={!formData.requires_shipping}
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
                                                disabled={!formData.requires_shipping}
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
                                                disabled={!formData.requires_shipping}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 6: SEO Metadata */}
                        {activeTab === 'seo' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                        <Search size={18} style={{ color: 'var(--admin-primary)' }} />
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Search Engine Optimization (SEO)</h4>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                SEO Meta Title
                                            </label>
                                            <input
                                                type="text"
                                                name="seo_title"
                                                className="form-control"
                                                placeholder="Buy Premium Headphones Online | Best Price"
                                                value={formData.seo_title}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                                                Meta Keywords (Comma Separated)
                                            </label>
                                            <input
                                                type="text"
                                                name="meta_keywords"
                                                className="form-control"
                                                placeholder="headphones, audio, wireless, bluetooth"
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
                                                placeholder="Discover high fidelity wireless headphones with active noise cancellation..."
                                                value={formData.seo_description}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 7: Digital File Parameters */}
                        {activeTab === 'digital' && formData.type === 'digital' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ padding: '20px', border: '1px solid var(--admin-border)', borderRadius: '12px', backgroundColor: 'var(--admin-card-bg)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
                                        <Download size={18} style={{ color: 'var(--admin-primary)' }} />
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Digital File Download Parameters</h4>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
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
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Sticky Action Footer */}
                <div
                    style={{
                        padding: '16px 24px',
                        borderTop: '1px solid var(--admin-border)',
                        backgroundColor: 'var(--admin-bg, #f8fafc)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '12px',
                        borderBottomLeftRadius: '16px',
                        borderBottomRightRadius: '16px'
                    }}
                >
                    <button type="button" className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="productForm"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px', fontWeight: 600 }}
                    >
                        <Check size={16} />
                        <span>{submitting ? 'Saving Specification...' : mode === 'edit' ? 'Update Product' : 'Create Product'}</span>
                    </button>
                </div>

                {/* Centralized Media Picker Dialog */}
                <MediaLibraryModal
                    isOpen={isMediaModalOpen}
                    isMultiSelect={mediaPickerTarget === 'gallery'}
                    onClose={() => setIsMediaModalOpen(false)}
                    onSelect={handleMediaSelected}
                />
            </div>
        </div>
    );
}
