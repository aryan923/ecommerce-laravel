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
    <section className="my-14 sm:my-20 lg:my-24">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-200/80 border border-stone-300/60 mb-8 shadow-xs">
          <span className="text-[10px] font-extrabold tracking-widest text-stone-700 uppercase">
            Official Partner Brands
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 items-stretch">
          {brands.slice(0, 6).map((brand, idx) => (
            <Link
              key={brand.id || brand.slug || idx}
              href={`/brand/${brand.slug || 'luxora'}`}
              className="p-4 sm:p-5 rounded-2xl border border-stone-300/70 bg-gradient-to-b from-white to-stone-50/90 hover:from-amber-50/50 hover:to-white hover:border-amber-800/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center min-h-[76px] sm:min-h-[88px] h-full group backdrop-blur-md text-center"
            >
              <span className="font-serif font-bold text-xs sm:text-sm tracking-widest text-stone-800 group-hover:text-amber-900 transition-colors uppercase truncate max-w-full leading-none">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
