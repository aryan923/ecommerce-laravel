"use client";

import React from 'react';
import { Award } from 'lucide-react';

export default function BrandHeader({ brand = {} }) {
  const name = brand.name || 'Brand Collection';
  const description = brand.description || 'Discover luxury items crafted by renowned artisans and designers.';

  return (
    <div className="relative w-full bg-gradient-to-r from-[#F4F0EA] via-[#FAF9F6] to-[#EFEAE3] border-b border-stone-200/90 text-stone-900 overflow-hidden mb-6">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 flex flex-col md:flex-row items-start md:items-center gap-6">
        {brand.logo && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl p-3.5 flex items-center justify-center border border-stone-300/80 shrink-0 shadow-md">
            <img src={brand.logo} alt={name} className="max-w-full max-h-full object-contain" />
          </div>
        )}

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-950 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
            <Award className="w-3.5 h-3.5 text-amber-800" />
            <span>Official Brand Storefront</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight">
            {name}
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
