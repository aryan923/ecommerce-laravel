"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import apiClient from '../../lib/api-client';

const fallbackCategories = [
  { name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80' },
  { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80' },
  { name: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80' },
  { name: 'Beauty', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
  { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80' },
  { name: 'More Collections', slug: 'all', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' },
];

export default function CategoryBanners() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get('/categories');
        const data = res.data.data || res.data;
        const list = Array.isArray(data) ? data : data.data || [];
        setCategories(list.length > 0 ? list : fallbackCategories);
      } catch (err) {
        console.warn('Category fetch notice:', err);
        setCategories(fallbackCategories);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const displayList = categories.slice(0, 6);

  return (
    <section className="py-16 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
        {/* Section Header */}
        <span className="text-[11px] font-semibold tracking-widest text-stone-500 uppercase block">
          Shop by Category
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 mt-1 tracking-tight">
          Explore Our Collections
        </h2>
        <div className="w-12 h-0.5 bg-amber-700/60 mx-auto mt-3 mb-10" />

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {displayList.map((cat, idx) => {
            const imageSrc = cat.image || fallbackCategories[idx % fallbackCategories.length].image;
            const targetSlug = cat.slug || 'fashion';

            return (
              <Link
                key={cat.id || cat.slug || idx}
                href={`/category/${targetSlug}`}
                className="group flex flex-col bg-[#F7F6F2] border border-stone-200/80 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-4/5 w-full bg-stone-200 overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={cat.name || 'Category'}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Card Label */}
                <div className="p-3 text-center bg-[#F7F6F2]">
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                    {cat.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 group-hover:text-stone-900 mt-0.5 transition-colors">
                    <span>Explore Now</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
