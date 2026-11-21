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
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-pulse" />
          <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
            Handpicked Collections
          </span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
          Explore Our Categories
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-8 font-medium">
          Curated essentials thoughtfully designed for every facet of life.
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {displayList.map((cat, idx) => {
            const imageSrc = cat.image || fallbackCategories[idx % fallbackCategories.length].image;
            const targetSlug = cat.slug || 'fashion';

            return (
              <Link
                key={cat.id || cat.slug || idx}
                href={`/category/${targetSlug}`}
                className="group flex flex-col bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400"
              >
                {/* Image Container */}
                <div className="relative aspect-4/5 w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={cat.name || 'Category'}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-stone-950/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                </div>

                {/* Card Label */}
                <div className="p-3 text-center bg-white/95 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                    {cat.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-400 group-hover:text-amber-700 mt-1 transition-colors">
                    <span>Discover</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
