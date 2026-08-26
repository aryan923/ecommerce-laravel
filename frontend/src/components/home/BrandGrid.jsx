"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '../../lib/api-client';

const fallbackBrands = [
  { name: 'LUXORA', slug: 'luxora' },
  { name: 'AURA', slug: 'aura' },
  { name: 'MODERNA', slug: 'moderna' },
  { name: 'NORDIC', slug: 'nordic' },
  { name: 'ELEMENTS', slug: 'elements' },
  { name: 'ESSENCE', slug: 'essence' },
];

export default function BrandGrid() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await apiClient.get('/brands');
        const data = res.data.data || res.data;
        const list = Array.isArray(data) ? data : data.data || [];
        setBrands(list.length > 0 ? list : fallbackBrands);
      } catch (err) {
        console.warn('Brands fetch notice:', err);
        setBrands(fallbackBrands);
      }
    };
    fetchBrands();
  }, []);

  return (
    <section className="py-12 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase block mb-6">
          Featured Partner Brands
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
          {brands.slice(0, 6).map((brand, idx) => (
            <Link
              key={brand.id || brand.slug || idx}
              href={`/brand/${brand.slug || 'luxora'}`}
              className="p-4 rounded-xl border border-stone-200/60 bg-white/70 hover:bg-white hover:shadow-md transition-all flex items-center justify-center h-16 group"
            >
              <span className="font-serif font-bold text-sm tracking-widest text-stone-600 group-hover:text-stone-900 transition-colors uppercase">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
