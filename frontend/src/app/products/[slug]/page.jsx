import React from 'react';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';

  return <ProductDetailClient slug={slug} />;
}
