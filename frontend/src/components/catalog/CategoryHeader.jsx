"use client";

import React from 'react';
import Link from 'next/link';
import { Layers, Sparkles } from 'lucide-react';

export default function CategoryHeader({ category = {} }) {
  const title = category.name || 'Category Collection';
  const description = category.description || 'Explore our curated selection of premium products in this collection.';

  return (
    <div className="relative w-full bg-gradient-to-r from-[#F4F0EA] via-[#FAF9F6] to-[#EFEAE3] border-b border-stone-200/90 text-stone-900 overflow-hidden mb-6">
      
      {/* Background Soft Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-12">
        <div className="max-w-2xl space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-950 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase">
            <Layers className="w-3.5 h-3.5 text-amber-800" />
            <span>Category Collection</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight">
            {title}
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
            {description}
          </p>

          {category.children && category.children.length > 0 && (
            <div className="pt-3 flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Link
                  key={child.id || child.slug}
                  href={`/category/${child.slug}`}
                  className="px-3.5 py-1.5 bg-white/90 hover:bg-white text-stone-800 text-xs font-semibold rounded-lg border border-stone-300/80 transition-colors shadow-xs"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
