"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '../product/ProductCard';

export default function RecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recently_viewed_products');
      if (stored) {
        setRecentProducts(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Recently viewed storage notice:', e);
    }
  }, []);

  if (!recentProducts || recentProducts.length === 0) return null;

  return (
    <section className="py-16 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight mb-8">
          Recently Viewed
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
