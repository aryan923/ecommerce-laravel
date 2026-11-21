"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import apiClient from '../../lib/api-client';

const sampleProducts = [
  {
    id: 101,
    name: 'Premium Cotton Shirt',
    slug: 'premium-cotton-shirt',
    price: 49.99,
    compare_at_price: 69.99,
    primary_image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    category: { name: 'Fashion' },
    rating: 4.9,
    is_featured: true,
  },
  {
    id: 102,
    name: 'Minimalist Leather Bag',
    slug: 'minimalist-leather-bag',
    price: 89.99,
    compare_at_price: 119.99,
    primary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    category: { name: 'Accessories' },
    rating: 4.8,
    is_featured: true,
  },
  {
    id: 103,
    name: 'Ceramic Vase Set',
    slug: 'ceramic-vase-set',
    price: 34.99,
    primary_image_url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
    category: { name: 'Home & Living' },
    rating: 5.0,
    is_featured: true,
  },
  {
    id: 104,
    name: 'Classic White Sneakers',
    slug: 'classic-white-sneakers',
    price: 59.99,
    compare_at_price: 79.99,
    primary_image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    category: { name: 'Footwear' },
    rating: 4.7,
    is_featured: true,
  },
];

export default function ProductSection({ title = "Curated For You", subtitle = "Handpicked favorites, just for you." }) {
  const [activeTab, setActiveTab] = useState('featured');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let endpoint = '/products?per_page=8';
        if (activeTab === 'featured') endpoint += '&featured=1';
        if (activeTab === 'latest') endpoint += '&sort_by=latest';
        if (activeTab === 'popular') endpoint += '&sort_by=latest';

        const res = await apiClient.get(endpoint);
        const data = res.data.data || res.data;
        const list = Array.isArray(data) ? data : data.data || [];
        if (isMounted) {
          setProducts(list.length > 0 ? list : sampleProducts);
        }
      } catch (err) {
        console.warn('Products fetch notice:', err);
        if (isMounted) {
          setProducts(sampleProducts);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProducts();
    return () => { isMounted = false; };
  }, [activeTab]);

  return (
    <section className="py-14 my-14 sm:my-20 lg:my-24 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-stone-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-widest text-amber-800 uppercase mb-1">
              <span>Curated Selection</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Glassmorphic Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-200/50 p-1 rounded-2xl border border-stone-300/60 backdrop-blur-md">
            {[
              { id: 'featured', label: 'Featured' },
              { id: 'latest', label: 'New Arrivals' },
              { id: 'popular', label: 'Best Sellers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-stone-950 text-white shadow-md shadow-stone-950/20'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-4/5 bg-stone-200/60 animate-pulse rounded-2xl" />
              ))
            : products.map((product) => (
                <ProductCard key={product.id || product.slug} product={product} />
              ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-stone-950 hover:bg-amber-800 text-white font-extrabold text-xs py-3.5 px-8 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
