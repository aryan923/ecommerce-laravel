"use client";

import React, { useState, useEffect, Suspense, use } from 'react';
import apiClient from '../../../lib/api-client';
import CatalogLayout from '../../../components/catalog/CatalogLayout';
import BrandHeader from '../../../components/catalog/BrandHeader';

function BrandContent({ slug }) {
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchBrand = async () => {
      try {
        const res = await apiClient.get(`/brands/${slug}`);
        const data = res.data.data || res.data;
        setBrand(data);
      } catch (err) {
        console.warn('Brand fetch notice:', err);
        setBrand({
          name: slug.replace(/-/g, ' ').toUpperCase(),
          slug,
          description: `Discover luxury items by ${slug.replace(/-/g, ' ')}.`,
        });
      }
    };
    fetchBrand();
  }, [slug]);

  const breadcrumbs = [
    { label: 'Shop Catalog', href: '/products' },
    { label: brand?.name || slug },
  ];

  return (
    <CatalogLayout
      pageTitle={brand?.name || 'Brand'}
      fixedBrand={slug}
      breadcrumbsItems={breadcrumbs}
      headerBanner={<BrandHeader brand={brand || { name: slug }} />}
    />
  );
}

export default function BrandPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? use(params) : params;
  const slug = resolvedParams?.slug || '';

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-8">
        <div className="text-stone-500 text-xs font-semibold animate-pulse">Loading brand storefront...</div>
      </div>
    }>
      <BrandContent slug={slug} />
    </Suspense>
  );
}
