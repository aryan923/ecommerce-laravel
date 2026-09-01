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
    Scale,
    Sparkles,
    Globe,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    UploadCloud,
    Maximize2,
    Eye,
    Link2
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
    const [availableProducts, setAvailableProducts] = useState([]);

    // Category search filter
    const [categoryFilter, setCategoryFilter] = useState('');

    // Related products search & filters state
    const [relSearch, setRelSearch] = useState('');
    const [relCategory, setRelCategory] = useState('');
    const [relBrand, setRelBrand] = useState('');
    const [relStatus, setRelStatus] = useState('');

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
        shipping_fee: '',
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

        // Related Products State
        related_products: [],
        related_product_ids: [],
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            setCategoryFilter('');
            setRelSearch('');
            setRelCategory('');
            setRelBrand('');
            setRelStatus('');
            fetchDropdownData();

            if (mode === 'edit' && initialData) {
                const catIds = initialData.categories ? initialData.categories.map((c) => c.id) : [];
                const primCat = initialData.categories ? initialData.categories.find((c) => c.pivot?.is_primary)?.id : '';

                // Extract media cleanly from product_images or media pivot
                const mainMedia = initialData.product_images
                    ? initialData.product_images.find((pi) => pi.type === 'main')?.media || null
                    : (initialData.media?.find((m) => m.pivot?.type === 'main' || m.type === 'main') || null);

                const galleryMedia = initialData.product_images
                    ? initialData.product_images.filter((pi) => pi.type === 'gallery').map((pi) => pi.media).filter(Boolean)
                    : (initialData.media?.filter((m) => (m.pivot ? m.pivot.type === 'gallery' : m.type === 'gallery')) || []);

                const initialRelated = initialData.related_products || initialData.relatedProducts || [];

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
                    related_products: initialRelated,
                    related_product_ids: initialRelated.map((p) => p.id),
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
                    related_products: [],
                    related_product_ids: [],
                });
            }
        }
    }, [isOpen, mode, initialData]);

    const fetchDropdownData = async () => {
        try {
            const [bRes, cRes, tRes, aRes, sRes, pRes] = await Promise.all([
                axios.get('/api/v1/admin/brands?per_page=100').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/categories?per_page=100').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/tax-classes').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/attributes?per_page=100').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/shipping-methods').catch(() => ({ data: { data: [] } })),
                axios.get('/api/v1/admin/products?per_page=100').catch(() => ({ data: { data: [] } })),
            ]);

            setBrands(bRes.data?.data?.data || bRes.data?.data || []);
            setCategories(cRes.data?.data?.data || cRes.data?.data || []);
            setTaxClasses(tRes.data?.data?.data || tRes.data?.data || []);
            setAttributes(aRes.data?.data?.data || aRes.data?.data || []);
            setShippingMethods(sRes.data?.data?.data || sRes.data?.data || []);
            setAvailableProducts(pRes.data?.data?.data || pRes.data?.data || []);
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

    const handleAddRelatedProduct = (productToAdd) => {
        if (!formData.related_products.some((p) => p.id === productToAdd.id)) {
            setFormData((prev) => ({
                ...prev,
                related_products: [...prev.related_products, productToAdd],
                related_product_ids: [...prev.related_product_ids, productToAdd.id],
            }));
        }
    };

    const handleRemoveRelatedProduct = (productId) => {
        setFormData((prev) => ({
            ...prev,
            related_products: prev.related_products.filter((p) => p.id !== productId),
            related_product_ids: prev.related_product_ids.filter((id) => id !== productId),
        }));
    };

    const filteredAvailableProducts = availableProducts.filter((p) => {
        if (initialData?.id && String(p.id) === String(initialData.id)) return false;
        if (formData.related_product_ids.includes(p.id)) return false;

        if (relSearch) {
            const q = relSearch.toLowerCase();
            const matchesName = p.name?.toLowerCase().includes(q);
            const matchesSku = p.sku?.toLowerCase().includes(q);
            if (!matchesName && !matchesSku) return false;
        }

        if (relCategory) {
            const hasCat = p.categories?.some((c) => String(c.id) === String(relCategory));
            if (!hasCat) return false;
        }

        if (relBrand) {
            if (String(p.brand_id) !== String(relBrand)) return false;
        }

        if (relStatus) {
            if (p.status !== relStatus) return false;
        }

        return true;
    });

    const selectedShippingMethod = shippingMethods.find(
        (s) => String(s.id) === String(formData.shipping_class_id)
    );

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categoryFilter.toLowerCase())
    );

    const tabsList = [
        { id: 'general', label: 'General', icon: Tag },
        { id: 'pricing', label: 'Pricing & Tax', icon: DollarSign },
        { id: 'media', label: 'Media & Gallery', icon: ImageIcon, count: (formData.main_image ? 1 : 0) + formData.gallery.length },
        ...(formData.type === 'variable' || formData.type === 'digital' ? [{ id: 'variants', label: 'Variants & Matrix', icon: Layers, count: formData.variants.length }] : []),
        { id: 'shipping', label: 'Shipping & Specs', icon: Truck },
        { id: 'related', label: 'Related Products', icon: Link2, count: formData.related_products?.length || 0 },
        { id: 'seo', label: 'SEO & SERP', icon: Search },
        ...(formData.type === 'digital' ? [{ id: 'digital', label: 'Digital Download', icon: Download }] : []),
    ];

    const currentTabIndex = tabsList.findIndex((t) => t.id === activeTab);

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
            related_product_ids: (formData.related_products || []).map((p) => p.id),
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
                if (mode === 'edit' && initialData) {
                    const mediaList = initialData.product_images
                        ? initialData.product_images.map((pi) => ({ id: pi.media_id, type: pi.type }))
                        : ((initialData.media || []).map((m) => ({ id: m.id, type: m.pivot?.type || m.type })));

                    const currentMainId = formData.main_image?.id || null;
                    const currentGalleryIds = (formData.gallery || [])
                        .map((g) => (typeof g === 'object' ? g?.id : null))
                        .filter(Boolean);

                    const removedItems = mediaList.filter((m) => {
                        if (m.type === 'main' && currentMainId && m.id !== currentMainId) return true;
                        if (m.type === 'gallery' && !currentGalleryIds.includes(m.id)) return true;
                        return false;
                    });

                    for (const rm of removedItems) {
                        try {
                            await axios.post('/api/v1/admin/media/detach', {
                                media_id: rm.id,
                                model_type: 'product',
                                model_id: productId,
                                type: rm.type,
                            });
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
                    maxWidth: '1020px',
                    width: '96%',
                    maxHeight: '90vh',
                }}
            >
                {/* Modal Header */}
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                color: 'var(--admin-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Package size={20} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--admin-text)' }}>
                                    {mode === 'edit' ? 'Edit Product Specification' : 'Create New Product'}
                                </h3>
                                <span style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    textTransform: 'uppercase',
                                    backgroundColor: mode === 'edit' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                    color: mode === 'edit' ? 'var(--admin-primary)' : '#10b981',
                                    border: `1px solid ${mode === 'edit' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
                                }}>
                                    {mode === 'edit' ? `Item #${initialData?.id || ''}` : 'New Catalog Item'}
                                </span>
                            </div>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--admin-muted)' }}>
                                {mode === 'edit' ? 'Update SKU, prices, inventory variants, photos & shipping specs' : 'Configure pricing, media, attributes, shipping classes & SEO metadata'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        style={{ borderRadius: '8px', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Close Modal (Esc)"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Tabbed Navigation Bar */}
                <div className="modal-tabs-nav">
                    {tabsList.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                className={`modal-tab-pill ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={14} />
                                <span>{tab.label}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span
                                        className="badge-count"
                                        style={{
                                            fontSize: '0.68rem',
                                            padding: '1px 6px',
                                            borderRadius: '10px',
                                            fontWeight: 800,
                                            backgroundColor: isActive ? '#ffffff' : 'var(--admin-primary)',
                                            color: isActive ? 'var(--admin-primary)' : '#ffffff'
                                        }}
                                    >
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Main Scrollable Content Area */}
                <div className="modal-body">
                    {error && (
                        <div
                            style={{
                                padding: '10px 14px',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                marginBottom: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 600
                            }}
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form id="productForm" onSubmit={handleSubmit}>
                        {/* Tab 1: General & Catalog */}
                        {activeTab === 'general' && (
                            <div>
                                {/* Basic Details Card */}
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <h4 className="form-section-title">
                                            <Tag size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <span>Product Classification & Identifiers</span>
                                        </h4>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)', fontWeight: 600 }}>Step 1 of Catalog Entry</span>
                                    </div>

                                    <div className="form-section-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Product Title / Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    className="form-control"
                                                    placeholder="e.g. Sony WH-1000XM5 Wireless Noise-Cancelling Headphones"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    style={{ fontSize: '0.92rem', fontWeight: 700 }}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    SKU (Stock Keeping Unit)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="sku"
                                                    className="form-control"
                                                    placeholder="PRD-AUDIO-100"
                                                    value={formData.sku}
                                                    onChange={handleChange}
                                                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                                                />
                                                <span style={{ fontSize: '0.7rem', color: 'var(--admin-muted)' }}>Auto-generated if left blank</span>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Product Type *
                                                </label>
                                                <select name="type" className="form-select" value={formData.type} onChange={handleChange} style={{ fontWeight: 700 }}>
                                                    <option value="simple">Simple Product (Single Item)</option>
                                                    <option value="variable">Variable Product (Multiple Variants)</option>
                                                    <option value="digital">Digital Product (Downloadable File)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Publication Status *
                                                </label>
                                                <select name="status" className="form-select" value={formData.status} onChange={handleChange} style={{ fontWeight: 600 }}>
                                                    <option value="active">Active (Published on Storefront)</option>
                                                    <option value="draft">Draft (Hidden from Catalog)</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="archived">Archived</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Manufacturer Brand
                                                </label>
                                                <select name="brand_id" className="form-select" value={formData.brand_id} onChange={handleChange}>
                                                    <option value="">Select Brand (Optional)</option>
                                                    {brands.map((b) => (
                                                        <option key={b.id} value={b.id}>{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Assignments Card */}
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Layers size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">
                                                Category Assignments ({formData.category_ids.length} Selected) *
                                            </h4>
                                        </div>
                                        {categories.length > 8 && (
                                            <div style={{ width: '180px' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Filter categories..."
                                                    value={categoryFilter}
                                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                                    style={{ padding: '2px 8px', fontSize: '0.74rem' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-section-body">
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '130px', overflowY: 'auto', padding: '4px' }}>
                                            {filteredCategories.length ? filteredCategories.map((cat) => {
                                                const isSelected = formData.category_ids.includes(cat.id);
                                                const isPrimary = String(formData.primary_category_id) === String(cat.id);
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => handleCategoryToggle(cat.id)}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '0.78rem',
                                                            cursor: 'pointer',
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            border: isSelected ? '1px solid var(--admin-primary)' : '1px solid var(--admin-border)',
                                                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--admin-card-hover)',
                                                            color: isSelected ? 'var(--admin-primary)' : 'var(--admin-text)',
                                                            fontWeight: isSelected ? 700 : 500,
                                                            transition: 'all 0.15s ease',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '14px',
                                                            height: '14px',
                                                            borderRadius: '4px',
                                                            border: isSelected ? 'none' : '1px solid var(--admin-border)',
                                                            backgroundColor: isSelected ? 'var(--admin-primary)' : 'transparent',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#fff'
                                                        }}>
                                                            {isSelected && <Check size={10} strokeWidth={3} />}
                                                        </div>
                                                        <span>{cat.name}</span>
                                                        {isPrimary && (
                                                            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--admin-primary)', color: '#fff', padding: '0 4px', borderRadius: '4px' }}>
                                                                Primary
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            }) : (
                                                <span style={{ fontSize: '0.78rem', color: 'var(--admin-muted)' }}>No matching categories.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Showcase & Descriptions Card */}
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <h4 className="form-section-title">
                                            <Sparkles size={15} style={{ color: '#f59e0b' }} />
                                            <span>Showcase Badging & Content Copy</span>
                                        </h4>
                                    </div>

                                    <div className="form-section-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                            {/* Featured Switch */}
                                            <label style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: formData.featured ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--admin-border)',
                                                backgroundColor: formData.featured ? 'rgba(245, 158, 11, 0.08)' : 'var(--admin-card-hover)',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <Sparkles size={16} style={{ color: formData.featured ? '#f59e0b' : 'var(--admin-muted)' }} />
                                                    <div>
                                                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                                                            Homepage Featured Product
                                                        </div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>
                                                            Highlight this product in the homepage hero carousel and trending showcases
                                                        </div>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    name="featured"
                                                    checked={formData.featured}
                                                    onChange={handleChange}
                                                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                />
                                            </label>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Short Summary (Teaser description on catalog cards)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="short_description"
                                                    className="form-control"
                                                    placeholder="Brief 1-liner summary displayed below title..."
                                                    value={formData.short_description}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Detailed Specifications & Full Description
                                                </label>
                                                <textarea
                                                    name="description"
                                                    className="form-control"
                                                    rows={4}
                                                    placeholder="Write comprehensive product features, technical specifications, and warranty details..."
                                                    value={formData.description}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 2: Pricing & Tax */}
                        {activeTab === 'pricing' && (
                            <div>
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <DollarSign size={15} style={{ color: '#10b981' }} />
                                            <h4 className="form-section-title">Pricing Architecture & Valuation</h4>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 800 }}>
                                            Currency: INR (₹)
                                        </span>
                                    </div>

                                    <div className="form-section-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Regular Price (₹ INR) *
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)', fontWeight: 700, fontSize: '0.84rem' }}>₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        name="price"
                                                        className="form-control"
                                                        placeholder="1999.00"
                                                        value={formData.price}
                                                        onChange={handleChange}
                                                        style={{ paddingLeft: '24px', fontSize: '0.92rem', fontWeight: 800 }}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Sale / Discount Price (₹ INR)
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)', fontWeight: 700, fontSize: '0.84rem' }}>₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        name="sale_price"
                                                        className="form-control"
                                                        placeholder="1499.00"
                                                        value={formData.sale_price}
                                                        onChange={handleChange}
                                                        style={{ paddingLeft: '24px', fontSize: '0.92rem', fontWeight: 800, color: '#10b981' }}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Cost Price (₹ INR - COGS)
                                                </label>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-muted)', fontWeight: 700, fontSize: '0.84rem' }}>₹</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        name="cost_price"
                                                        className="form-control"
                                                        placeholder="850.00"
                                                        value={formData.cost_price}
                                                        onChange={handleChange}
                                                        style={{ paddingLeft: '24px', fontSize: '0.92rem', fontWeight: 700 }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Dynamic Margin & Profit Preview Box */}
                                            {formData.price && formData.cost_price && (
                                                <div style={{
                                                    gridColumn: '1 / -1',
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    backgroundColor: 'rgba(99, 102, 241, 0.06)',
                                                    border: '1px solid rgba(99, 102, 241, 0.25)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    flexWrap: 'wrap',
                                                    gap: '12px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                        <div>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--admin-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                                                                Estimated Gross Profit
                                                            </span>
                                                            <strong style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 800 }}>
                                                                ₹{(parseFloat(formData.sale_price || formData.price) - parseFloat(formData.cost_price)).toFixed(2)}
                                                            </strong>
                                                        </div>

                                                        <div style={{ borderLeft: '1px solid var(--admin-border)', paddingLeft: '20px' }}>
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--admin-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                                                                Gross Profit Margin
                                                            </span>
                                                            <strong style={{ color: 'var(--admin-primary)', fontSize: '1.1rem', fontWeight: 800 }}>
                                                                {(((parseFloat(formData.sale_price || formData.price) - parseFloat(formData.cost_price)) / parseFloat(formData.sale_price || formData.price)) * 100).toFixed(1)}%
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div style={{ fontSize: '0.74rem', color: 'var(--admin-muted)' }}>
                                                        Multi-Currency Preview: <strong style={{ color: 'var(--admin-text)' }}>{formatCurrency(formData.price, displayCurrency, true)}</strong>
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Tax Class / GST Tier
                                                </label>
                                                <select name="tax_class_id" className="form-select" value={formData.tax_class_id} onChange={handleChange}>
                                                    <option value="">Standard 18% GST (Default)</option>
                                                    {taxClasses.map((t) => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Centralized Media & Gallery */}
                        {activeTab === 'media' && (
                            <div>
                                {/* Main Cover Photo */}
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ImageIcon size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">Primary Cover Photo</h4>
                                        </div>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Recommended: 800×800px or 1:1 Aspect Ratio</span>
                                    </div>

                                    <div className="form-section-body">
                                        {(() => {
                                            const mainSrc = typeof formData.main_image === 'object'
                                                ? (formData.main_image?.url || (formData.main_image?.file_path ? `/storage/${formData.main_image.file_path}` : ''))
                                                : (typeof formData.main_image === 'string' ? formData.main_image : '');
                                            return (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                                    <div
                                                        style={{
                                                            width: '110px',
                                                            height: '110px',
                                                            borderRadius: '10px',
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
                                                                <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(15,23,42,0.85)', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 800 }}>
                                                                    COVER
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <div style={{ textAlign: 'center', color: 'var(--admin-muted)' }}>
                                                                <ImageIcon size={28} style={{ color: 'var(--admin-subtle)' }} />
                                                                <span style={{ display: 'block', fontSize: '0.68rem', marginTop: '2px', fontWeight: 600 }}>No Cover</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleOpenMediaPicker('main')}
                                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                                                            >
                                                                <UploadCloud size={14} />
                                                                <span>{mainSrc ? 'Change Cover Photo' : 'Select from Media Library'}</span>
                                                            </button>

                                                            {mainSrc && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary btn-sm"
                                                                    style={{ color: '#ef4444' }}
                                                                    onClick={() => setFormData((prev) => ({ ...prev, main_image: null }))}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    <span>Remove</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.74rem', color: 'var(--admin-muted)' }}>
                                                            Featured across all storefront cards, search listings, cart drawers, and order invoices.
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Gallery Photos */}
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Layers size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">
                                                Additional Photo Gallery ({formData.gallery.length} Photos)
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleOpenMediaPicker('gallery')}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                                        >
                                            <Plus size={14} />
                                            <span>Add Gallery Photos</span>
                                        </button>
                                    </div>

                                    <div className="form-section-body">
                                        {formData.gallery.length > 0 ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '8px' }}>
                                                {formData.gallery.map((img, idx) => {
                                                    const src = typeof img === 'object' ? (img.url || (img.file_path ? `/storage/${img.file_path}` : '')) : img;
                                                    return (
                                                        <div key={idx} style={{ position: 'relative', height: '95px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--admin-border)', backgroundColor: 'var(--admin-bg)' }}>
                                                            <img src={src} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(15,23,42,0.75)', color: '#ffffff', fontSize: '0.62rem', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                                                                #{idx + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveGalleryPhoto(idx)}
                                                                style={{ position: 'absolute', top: '3px', right: '3px', backgroundColor: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '4px', padding: '3px', cursor: 'pointer', color: '#ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
                                                                title="Remove gallery photo"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '24px', border: '1px dashed var(--admin-border)', borderRadius: '8px', textAlign: 'center', color: 'var(--admin-muted)', fontSize: '0.8rem' }}>
                                                No gallery photos attached yet. Click "Add Gallery Photos" to select showcase angles from Media Library.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 4: Variants & Attributes */}
                        {activeTab === 'variants' && (formData.type === 'variable' || formData.type === 'digital') && (
                            <div>
                                {/* Auto-Generate Combinations Tool */}
                                <div
                                    style={{
                                        padding: '14px 16px',
                                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(99, 102, 241, 0.12))',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '12px',
                                        marginBottom: '12px'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--admin-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Wand2 size={16} />
                                                <span>Variant Combination Generator Matrix</span>
                                            </h4>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--admin-muted)' }}>Select option values to auto-compute all Cartesian product combinations</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-sm"
                                            onClick={handleAutoGenerateCombinations}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                                        >
                                            <Wand2 size={14} />
                                            <span>Generate Combinations</span>
                                        </button>
                                    </div>

                                    {attributes.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                            {attributes.map((attr) => {
                                                const selectedCount = (selectedGenAttributes[attr.id] || []).length;
                                                const totalCount = attr.values?.length || 0;
                                                return (
                                                    <div key={attr.id} style={{ fontSize: '0.78rem', backgroundColor: 'var(--admin-card-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                            <span style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{attr.name} ({selectedCount}/{totalCount})</span>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    type="button"
                                                                    style={{ border: 'none', background: 'none', color: 'var(--admin-primary)', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, padding: 0 }}
                                                                    onClick={() => handleSelectAllAttrValues(attr.id)}
                                                                >
                                                                    All
                                                                </button>
                                                                <span style={{ color: 'var(--admin-border)' }}>|</span>
                                                                <button
                                                                    type="button"
                                                                    style={{ border: 'none', background: 'none', color: 'var(--admin-muted)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                                                                    onClick={() => handleClearAttrValues(attr.id)}
                                                                >
                                                                    Clear
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                                                            {attr.values?.length ? (
                                                                attr.values.map((val) => {
                                                                    const checked = (selectedGenAttributes[attr.id] || []).includes(val.id);
                                                                    return (
                                                                        <label key={val.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.76rem' }}>
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
                                                                <span style={{ color: 'var(--admin-muted)', fontSize: '0.72rem' }}>No values found</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.76rem', color: 'var(--admin-muted)' }}>No catalog attributes configured yet.</span>
                                    )}
                                </div>

                                {/* Variant Matrix Table Section */}
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Layers size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">
                                                Configured Variants ({formData.variants.length} Matrix Rows)
                                            </h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleApplyBatchPriceAndStock}
                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
                                                title="Sync price and stock from base product"
                                            >
                                                <DollarSign size={13} />
                                                <span>Apply Base Prices</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleAddVariantRow}
                                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
                                            >
                                                <Plus size={13} />
                                                <span>Add Blank Row</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="table-responsive">
                                        <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '60px' }}>Photo</th>
                                                    <th>Variant SKU</th>
                                                    <th>Option Badges</th>
                                                    <th>Price (₹)</th>
                                                    <th>Sale (₹)</th>
                                                    <th>Cost (₹)</th>
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
                                                                <div
                                                                    onClick={() => handleOpenMediaPicker('variant', vIdx)}
                                                                    style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--admin-border)', position: 'relative' }}
                                                                    title="Click to select variant photo"
                                                                >
                                                                    <img src={vImgSrc} alt="Variant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={v.sku}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'sku', e.target.value)}
                                                                    style={{ padding: '3px 6px', fontSize: '0.76rem', width: '120px', fontFamily: 'monospace' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '220px' }}>
                                                                    {v.attribute_value_ids?.length ? (
                                                                        v.attribute_value_ids.map((valId) => {
                                                                            const info = valueLookup[valId];
                                                                            return (
                                                                                <span
                                                                                    key={valId}
                                                                                    style={{
                                                                                        fontSize: '0.68rem',
                                                                                        padding: '1px 6px',
                                                                                        borderRadius: '4px',
                                                                                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                                                                                        color: 'var(--admin-primary)',
                                                                                        fontWeight: 700,
                                                                                        border: '1px solid rgba(99, 102, 241, 0.25)'
                                                                                    }}
                                                                                >
                                                                                    {info ? `${info.attrName}: ${info.valName}` : `Val #${valId}`}
                                                                                </span>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <span style={{ color: 'var(--admin-muted)', fontSize: '0.72rem' }}>No attributes</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control"
                                                                    value={v.price}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'price', e.target.value)}
                                                                    placeholder={formData.price || '0.00'}
                                                                    style={{ padding: '3px 6px', fontSize: '0.76rem', width: '80px', fontWeight: 700 }}
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
                                                                    style={{ padding: '3px 6px', fontSize: '0.76rem', width: '80px', color: '#10b981' }}
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
                                                                    style={{ padding: '3px 6px', fontSize: '0.76rem', width: '80px' }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={v.stock_qty}
                                                                    onChange={(e) => handleUpdateVariantRow(vIdx, 'stock_qty', e.target.value)}
                                                                    style={{ padding: '3px 6px', fontSize: '0.76rem', width: '65px', fontWeight: 700 }}
                                                                />
                                                            </td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary btn-sm"
                                                                    style={{ color: '#ef4444', padding: '2px 6px' }}
                                                                    onClick={() => handleRemoveVariantRow(vIdx)}
                                                                    title="Remove variant"
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
                            <div>
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Truck size={15} style={{ color: '#0ea5e9' }} />
                                            <h4 className="form-section-title">Physical Logistics & Dimension Specs</h4>
                                        </div>
                                    </div>

                                    <div className="form-section-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                                            {/* Shipping Toggles */}
                                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', padding: '10px 14px', backgroundColor: 'var(--admin-card-hover)', borderRadius: '8px', border: '1px solid var(--admin-border)', flexWrap: 'wrap' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="requires_shipping"
                                                        checked={formData.requires_shipping}
                                                        onChange={handleChange}
                                                    />
                                                    <span style={{ fontWeight: 700 }}>Requires Physical Shipping</span>
                                                </label>

                                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="is_free_shipping"
                                                        checked={formData.is_free_shipping}
                                                        onChange={handleChange}
                                                    />
                                                    <span style={{ fontWeight: 700, color: '#10b981' }}>Eligible for Free Shipping</span>
                                                </label>
                                            </div>

                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Shipping Class / Delivery Carrier Tier
                                                </label>
                                                <select
                                                    name="shipping_class_id"
                                                    className="form-select"
                                                    value={formData.shipping_class_id}
                                                    onChange={handleChange}
                                                    disabled={!formData.requires_shipping}
                                                >
                                                    <option value="">Standard Zone Rate Delivery (Default Calculation)</option>
                                                    {shippingMethods.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.name} {s.type ? `(${s.type})` : ''} {s.estimated_days ? `• Est. ${s.estimated_days} days` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Custom Flat Shipping Surcharge (₹ INR - Optional Override)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="shipping_fee"
                                                    className="form-control"
                                                    placeholder="e.g. 50.00 (Leave empty to use automatic zone rates)"
                                                    value={formData.shipping_fee}
                                                    onChange={handleChange}
                                                    disabled={!formData.requires_shipping || formData.is_free_shipping}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Weight (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="weight"
                                                    className="form-control"
                                                    placeholder="0.75"
                                                    value={formData.weight}
                                                    onChange={handleChange}
                                                    disabled={!formData.requires_shipping}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
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
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
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
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
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
                            </div>
                        )}

                        {/* Tab 6: SEO Metadata */}
                        {activeTab === 'seo' && (
                            <div>
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Globe size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">Search Engine Optimization & Live SERP Preview</h4>
                                        </div>
                                    </div>

                                    <div className="form-section-body">
                                        {/* Google SERP Live Snippet Box */}
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--admin-card-hover)',
                                            border: '1px solid var(--admin-border)',
                                            marginBottom: '14px',
                                            fontFamily: 'Arial, sans-serif'
                                        }}>
                                            <div style={{ fontSize: '0.72rem', color: '#10b981', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>https://store.example.com › products › {formData.sku ? formData.sku.toLowerCase() : 'product-title'}</span>
                                            </div>
                                            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#4f46e5', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {formData.seo_title || formData.name || 'Your Product Title | Online Store'}
                                            </div>
                                            <div style={{ fontSize: '0.76rem', color: 'var(--admin-muted)', lineHeight: 1.4 }}>
                                                {formData.seo_description || formData.short_description || 'Discover premium product details, specifications, and fast delivery at the best price online.'}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    SEO Meta Title Tag
                                                </label>
                                                <input
                                                    type="text"
                                                    name="seo_title"
                                                    className="form-control"
                                                    placeholder="Buy Premium Wireless Headphones Online | Best Price"
                                                    value={formData.seo_title}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Meta Keywords (Comma-Separated)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="meta_keywords"
                                                    className="form-control"
                                                    placeholder="headphones, noise cancelling, audio, wireless, bluetooth"
                                                    value={formData.meta_keywords}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    SEO Meta Description
                                                </label>
                                                <textarea
                                                    name="seo_description"
                                                    className="form-control"
                                                    rows={3}
                                                    placeholder="Discover high fidelity sound with active noise cancelling headphones. Shop with free shipping and official warranty..."
                                                    value={formData.seo_description}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Related Products */}
                        {activeTab === 'related' && (
                            <div>
                                {/* Selected Related Products Section */}
                                <div className="form-section-box" style={{ marginBottom: '16px' }}>
                                    <div className="form-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Link2 size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">
                                                Selected Related Products ({formData.related_products.length})
                                            </h4>
                                        </div>
                                        {formData.related_products.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => setFormData((prev) => ({ ...prev, related_products: [], related_product_ids: [] }))}
                                                style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>

                                    <div className="form-section-body">
                                        {formData.related_products.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '24px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                                <Link2 size={24} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                                                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
                                                    No related products linked yet.
                                                </p>
                                                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                                                    Use the filter controls below to search and link related cross-sell items.
                                                </span>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                                                {formData.related_products.map((relProd) => {
                                                    const img = relProd.main_image_url || relProd.image_url || '/placeholder.png';
                                                    return (
                                                        <div
                                                            key={relProd.id}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                padding: '10px',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '8px',
                                                                background: '#ffffff',
                                                            }}
                                                        >
                                                            <img
                                                                src={img}
                                                                alt={relProd.name}
                                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #f1f5f9' }}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/40?text=PRD'; }}
                                                            />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                    {relProd.name}
                                                                </div>
                                                                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <span>SKU: {relProd.sku || 'N/A'}</span>
                                                                    <span>•</span>
                                                                    <span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>{formatCurrency(relProd.price || 0, displayCurrency)}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-icon text-danger"
                                                                onClick={() => handleRemoveRelatedProduct(relProd.id)}
                                                                title="Remove Related Product"
                                                                style={{ padding: '4px' }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Catalog Product Selection with Filters */}
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Search size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">Catalog Product Picker & Filters</h4>
                                        </div>
                                    </div>

                                    <div className="form-section-body">
                                        {/* Multi-Filter Controls Bar */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                            {/* Search Filter */}
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search product name or SKU..."
                                                    value={relSearch}
                                                    onChange={(e) => setRelSearch(e.target.value)}
                                                    style={{ paddingLeft: '32px', fontSize: '0.8rem' }}
                                                />
                                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                            </div>

                                            {/* Category Filter */}
                                            <select
                                                className="form-select"
                                                value={relCategory}
                                                onChange={(e) => setRelCategory(e.target.value)}
                                                style={{ fontSize: '0.8rem' }}
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Brand Filter */}
                                            <select
                                                className="form-select"
                                                value={relBrand}
                                                onChange={(e) => setRelBrand(e.target.value)}
                                                style={{ fontSize: '0.8rem' }}
                                            >
                                                <option value="">All Brands</option>
                                                {brands.map((b) => (
                                                    <option key={b.id} value={b.id}>
                                                        {b.name}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Status Filter */}
                                            <select
                                                className="form-select"
                                                value={relStatus}
                                                onChange={(e) => setRelStatus(e.target.value)}
                                                style={{ fontSize: '0.8rem' }}
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="active">Active</option>
                                                <option value="draft">Draft</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        </div>

                                        {/* Filtered Products Table / List */}
                                        {filteredAvailableProducts.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                                No matching products found. Try adjusting your search query or filters.
                                            </div>
                                        ) : (
                                            <div className="table-responsive" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                                                <table className="admin-table" style={{ fontSize: '0.78rem' }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '48px' }}>Image</th>
                                                            <th>Product Name</th>
                                                            <th>SKU</th>
                                                            <th>Price</th>
                                                            <th>Status</th>
                                                            <th style={{ textAlign: 'right' }}>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredAvailableProducts.map((p) => {
                                                            const img = p.main_image_url || p.image_url || '/placeholder.png';
                                                            return (
                                                                <tr key={p.id}>
                                                                    <td>
                                                                        <img
                                                                            src={img}
                                                                            alt={p.name}
                                                                            style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32?text=PRD'; }}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                                                                    </td>
                                                                    <td>{p.sku || 'N/A'}</td>
                                                                    <td>
                                                                        <span style={{ fontWeight: 600, color: 'var(--admin-primary)' }}>
                                                                            {formatCurrency(p.price || 0, displayCurrency)}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`status-badge status-${p.status || 'draft'}`}>
                                                                            {p.status || 'draft'}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ textAlign: 'right' }}>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-primary"
                                                                            onClick={() => handleAddRelatedProduct(p)}
                                                                            style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                                        >
                                                                            <Plus size={12} /> Add Related
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 7: Digital File Parameters */}
                        {activeTab === 'digital' && formData.type === 'digital' && (
                            <div>
                                <div className="form-section-box">
                                    <div className="form-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Download size={15} style={{ color: 'var(--admin-primary)' }} />
                                            <h4 className="form-section-title">Digital File Download Link & Expiry Parameters</h4>
                                        </div>
                                    </div>

                                    <div className="form-section-body">
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Download URL / Protected Storage Key *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="download_url"
                                                    className="form-control"
                                                    placeholder="https://downloads.example.com/software-v2.0.zip"
                                                    value={formData.download_url}
                                                    onChange={handleChange}
                                                    style={{ fontFamily: 'monospace' }}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Maximum Download Limit
                                                </label>
                                                <input
                                                    type="number"
                                                    name="download_limit"
                                                    className="form-control"
                                                    placeholder="5 (Leave empty for unlimited downloads)"
                                                    value={formData.download_limit}
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--admin-muted)', display: 'block', marginBottom: '4px' }}>
                                                    Link Expiry Window (Days)
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
                            </div>
                        )}
                    </form>
                </div>

                {/* Sticky Action Footer */}
                <div className="modal-footer">
                    <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
                        {currentTabIndex > 0 && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setActiveTab(tabsList[currentTabIndex - 1].id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <ChevronLeft size={14} />
                                <span>Previous</span>
                            </button>
                        )}

                        {currentTabIndex < tabsList.length - 1 && (
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => setActiveTab(tabsList[currentTabIndex + 1].id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <span>Next: {tabsList[currentTabIndex + 1].label}</span>
                                <ChevronRight size={14} />
                            </button>
                        )}
                    </div>

                    <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                        Cancel
                    </button>

                    <button
                        type="submit"
                        form="productForm"
                        className="btn btn-primary btn-sm"
                        disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, padding: '7px 18px' }}
                    >
                        <Check size={15} />
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
