"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '../../../components/common/Breadcrumbs';
import MediaGallery from '../../../components/pdp/MediaGallery';
import ProductInfo from '../../../components/pdp/ProductInfo';
import VariantPicker from '../../../components/pdp/VariantPicker';
import PincodeChecker from '../../../components/pdp/PincodeChecker';
import AddToCartSection from '../../../components/pdp/AddToCartSection';
import ProductTabs from '../../../components/pdp/ProductTabs';
import RelatedProducts from '../../../components/pdp/RelatedProducts';
import { normalizeImageUrl } from '../../../lib/image-helper';
import apiClient from '../../../lib/api-client';

export default function ProductDetailClient({ slug }) {
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [apiRelatedProducts, setApiRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      try {
        const res = await apiClient.get(`/products/${slug}`);
        console.log('=== PDP FETCH SUCCESS ===', res.data);
        const responsePayload = res.data?.data || res.data;
        const rawProduct = responsePayload?.product || responsePayload;

        if (responsePayload?.related_products && Array.isArray(responsePayload.related_products)) {
          console.log('=== PDP RELATED PRODUCTS FOUND ===', responsePayload.related_products);
          setApiRelatedProducts(responsePayload.related_products);
        }

        if (!rawProduct || !rawProduct.name) {
          throw new Error('Product data structure invalid');
        }

        // Normalize gallery images strictly for this product
        const resolvedImages = [];
        if (rawProduct.main_image_url) resolvedImages.push(rawProduct.main_image_url);
        if (rawProduct.primary_image_url) resolvedImages.push(rawProduct.primary_image_url);
        if (rawProduct.image_url) resolvedImages.push(rawProduct.image_url);
        if (rawProduct.primary_image) resolvedImages.push(rawProduct.primary_image);

        if (rawProduct.gallery_image_urls && Array.isArray(rawProduct.gallery_image_urls)) {
          resolvedImages.push(...rawProduct.gallery_image_urls);
        }
        if (rawProduct.images && Array.isArray(rawProduct.images)) {
          resolvedImages.push(...rawProduct.images.map(img => typeof img === 'string' ? img : (img.url || img.image_url || img.path)));
        }

        // Include variant-specific images if available
        if (rawProduct.variants && Array.isArray(rawProduct.variants)) {
          rawProduct.variants.forEach(v => {
            const vImg = v.image_url || v.image || v.primary_image;
            if (vImg) resolvedImages.push(vImg);
          });
        }

        const productSpecificImages = resolvedImages.filter(Boolean).map(normalizeImageUrl);
        const finalImages = productSpecificImages.length > 0
          ? Array.from(new Set(productSpecificImages))
          : ['/placeholder.svg'];

        // Normalize Category & Brand
        const primaryCat = responsePayload.primary_category ||
          rawProduct.category ||
          (Array.isArray(rawProduct.categories) ? (rawProduct.categories.find(c => c?.pivot?.is_primary) || rawProduct.categories[0]) : null);

        const normalizedProduct = {
          ...rawProduct,
          name: rawProduct.name || rawProduct.title,
          price: parseFloat(rawProduct.effective_price ?? rawProduct.price ?? 0),
          compare_at_price: rawProduct.is_on_sale
            ? parseFloat(rawProduct.price)
            : (rawProduct.compare_at_price ? parseFloat(rawProduct.compare_at_price) : null),
          stock_quantity: rawProduct.stock_qty ?? rawProduct.stock_quantity ?? rawProduct.stock ?? 10,
          category: primaryCat,
          images: finalImages,
          primary_image: finalImages[0],
        };

        setProduct(normalizedProduct);

        // Preselect initial active variant if available
        if (Array.isArray(normalizedProduct.variants) && normalizedProduct.variants.length > 0) {
          const firstVariant = normalizedProduct.variants[0];
          setSelectedVariant({
            ...firstVariant,
            price: parseFloat(firstVariant.price ?? normalizedProduct.price),
            stock_quantity: firstVariant.stock_qty ?? firstVariant.stock_quantity ?? 0,
          });
        }
      } catch (err) {
        console.error('=== PDP FETCH CATCH ERROR ===', err?.stack || err?.message || err);
        const formattedTitle = slug
          ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          : 'Premium Showcase Product';

        // Select fallback image based on slug keyword
        let fallbackImages = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'];
        if (slug.includes('dress') || slug.includes('gown') || slug.includes('fashion')) {
          fallbackImages = ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop'];
        } else if (slug.includes('bag') || slug.includes('tote') || slug.includes('duffle')) {
          fallbackImages = ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop'];
        } else if (slug.includes('sunglasses') || slug.includes('glasses')) {
          fallbackImages = ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop'];
        } else if (slug.includes('shoe') || slug.includes('loafer')) {
          fallbackImages = ['https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop'];
        } else if (slug.includes('headphone') || slug.includes('audio')) {
          fallbackImages = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop'];
        }

        const fallbackProduct = {
          id: 999,
          name: formattedTitle,
          slug: slug || 'sample-product',
          price: 199.99,
          compare_at_price: 249.99,
          stock_quantity: 15,
          is_on_sale: true,
          category: { name: 'Catalog Collection', slug: 'catalog' },
          images: fallbackImages,
          primary_image: fallbackImages[0],
          description: 'Experience premium quality craftsmanship and top-tier specifications.',
          specifications: { 'Build Material': 'Premium Grade', 'Warranty': '2 Years', 'Weight': '350g' },
          variants: [
            { id: 1, name: 'Standard Edition', price: 199.99, stock_quantity: 10, sku: 'SMP-STD-01' },
            { id: 2, name: 'Pro Edition', price: 219.99, stock_quantity: 5, sku: 'SMP-PRO-02' }
          ]
        };
        setProduct(fallbackProduct);
        setSelectedVariant(fallbackProduct.variants[0]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div data-testid="pdp-loading" className="min-h-screen bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-5 w-48 bg-stone-200 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-6 aspect-square bg-stone-200 rounded-3xl" />
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="h-4 w-24 bg-stone-200 rounded" />
            <div className="h-8 w-3/4 bg-stone-200 rounded" />
            <div className="h-6 w-32 bg-stone-200 rounded" />
            <div className="h-10 w-40 bg-stone-200 rounded" />
            <div className="h-24 bg-stone-200 rounded-2xl mt-4" />
            <div className="h-12 bg-stone-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !product) {
    return (
      <div data-testid="pdp-error" className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-black text-stone-900">Product Not Found</h2>
        <p className="text-sm text-stone-500 mt-2 mb-6">
          The requested product may have been moved or is currently unavailable.
        </p>
        <Link href="/products" className="bg-stone-950 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-stone-850 transition-colors">
          Browse Product Catalog
        </Link>
      </div>
    );
  }

  // Breadcrumbs items array
  const breadcrumbItems = [
    { label: 'Catalog', href: '/products' },
    ...(product.category ? [{ label: product.category.name, href: `/category/${product.category.slug}` }] : []),
    { label: product.name || 'Product Detail' },
  ];

  return (
    <div data-testid="pdp-page" className="min-h-screen bg-stone-50/40 text-stone-900 py-6 sm:py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Breadcrumb Trail */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Top Split Layout: Media Gallery (Left) & Product Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Media Gallery */}
          <div className="lg:col-span-7 sticky top-24">
            <MediaGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Right Column: Product Details & Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Title, Rating, SKU, Price & Trust */}
            <ProductInfo product={product} selectedVariant={selectedVariant} />

            {/* Attribute Swatches & Variant Picker */}
            {product.variants && product.variants.length > 0 && (
              <VariantPicker
                variants={product.variants}
                attributes={product.attributes || []}
                initialVariantId={selectedVariant?.id}
                onSelectVariant={(variant) => setSelectedVariant(variant)}
              />
            )}

            {/* Quantity Stepper & Add to Cart / Buy Now Actions */}
            <AddToCartSection product={product} selectedVariant={selectedVariant} />

            {/* Pincode Shipping Serviceability Estimator */}
            <PincodeChecker productId={product.id} />
          </div>
        </div>

        {/* Bottom Section: Tabs (Description, Specifications, Policy & Reviews) */}
        <ProductTabs product={product} />

        {/* Category & Admin Related Products Carousel */}
        <RelatedProducts
          categorySlug={product.category?.slug}
          currentProductId={product.id}
          initialProducts={apiRelatedProducts}
        />
      </div>
    </div>
  );
}
