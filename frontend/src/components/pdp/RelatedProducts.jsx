"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '../product/ProductCard';
import apiClient from '../../lib/api-client';

export default function RelatedProducts({ categorySlug, currentProductId, initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (initialProducts && initialProducts.length > 0) {
      const filtered = initialProducts.filter((p) => p.id !== currentProductId).slice(0, 4);
      setProducts(filtered);
      return;
    }

    async function fetchRelated() {
      if (!categorySlug) return;
      setIsLoading(true);
      try {
        const res = await apiClient.get('/products', {
          params: {
            category: categorySlug,
            limit: 6,
          },
        });
        if (isCancelled) return;
        const data = res.data.data || res.data;
        const list = Array.isArray(data) ? data : (data.products || []);
        // Exclude current product from related list
        const filtered = list.filter((p) => p.id !== currentProductId).slice(0, 4);
        setProducts(filtered);
      } catch (err) {
        if (!isCancelled) setProducts([]);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchRelated();

    return () => {
      isCancelled = true;
    };
  }, [categorySlug, currentProductId, initialProducts]);

  if (!products || products.length === 0) return null;

  return (
    <div data-testid="related-products" className="my-12 border-t border-stone-200/80 pt-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            You May Also Like
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Discover complementary items curated from this collection
          </p>
        </div>
      </div>

      <div
        data-testid="related-products-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}
