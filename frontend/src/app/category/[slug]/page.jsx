"use client";

import React, { useState, useEffect, Suspense, use } from 'react';
import apiClient from '../../../lib/api-client';
import CatalogLayout from '../../../components/catalog/CatalogLayout';
import CategoryHeader from '../../../components/catalog/CategoryHeader';

function CategoryContent({ slug }) {
  const [category, setCategory] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchCategory = async () => {
      try {
        const res = await apiClient.get(`/categories/${slug}`);
        const data = res.data.data || res.data;
        setCategory(data);
      } catch (err) {
        console.warn('Category fetch notice:', err);
        setCategory({
          name: slug.replace(/-/g, ' ').toUpperCase(),
          slug,
          description: `Browse our luxury collection for ${slug.replace(/-/g, ' ')}.`,
        });
      }
    };
    fetchCategory();
  }, [slug]);

  const breadcrumbs = [
    { label: 'Shop Catalog', href: '/products' },
    { label: category?.name || slug },
  ];

  return (
    <CatalogLayout
      pageTitle={category?.name || 'Category'}
      fixedCategory={slug}
      breadcrumbsItems={breadcrumbs}
      headerBanner={<CategoryHeader category={category || { name: slug }} />}
    />
  );
}

export default function CategoryPage({ params }) {
  const resolvedParams = params && typeof params.then === 'function' ? use(params) : params;
  const slug = resolvedParams?.slug || '';

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-8">
        <div className="text-stone-500 text-xs font-semibold animate-pulse">Loading category...</div>
      </div>
    }>
      <CategoryContent slug={slug} />
    </Suspense>
  );
}
