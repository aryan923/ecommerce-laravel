import React, { Suspense } from 'react';
import CatalogLayout from '../../components/catalog/CatalogLayout';

export const metadata = {
  title: 'All Products Catalog | LUXORA Luxury Storefront',
  description: 'Explore the complete luxury collection of designer apparel, fine accessories, timepieces, and artisan footwear at LUXORA.',
};

function ProductsContent() {
  const breadcrumbs = [
    { label: 'Shop Catalog', href: '/products' },
  ];

  return (
    <CatalogLayout
      pageTitle="All Products Catalog"
      breadcrumbsItems={breadcrumbs}
    />
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-8">
        <div className="text-stone-500 text-xs font-semibold animate-pulse">Loading catalog...</div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
