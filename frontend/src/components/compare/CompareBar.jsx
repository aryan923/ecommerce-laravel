"use client";

import React from 'react';
import Link from 'next/link';
import { useCompare } from '../../context/CompareContext';
import { Scale, X, ArrowRight, Trash2 } from 'lucide-react';

export default function CompareBar() {
  const { comparedProducts, compareCount, maxCompareLimit, removeFromCompare, clearCompare } = useCompare();

  if (!comparedProducts || compareCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900 text-white shadow-2xl border-t border-stone-800 transition-all duration-300 animate-slide-up">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left: Info Counter & Thumbnail Pills */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
              {compareCount}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-100">
                Compare Items
              </p>
              <p className="text-[11px] text-stone-400">
                {compareCount} of {maxCompareLimit} products selected
              </p>
            </div>
          </div>

          {/* Thumbnail Pills */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-stone-800">
            {comparedProducts.map((product) => (
              <div
                key={product.id}
                className="relative group w-11 h-11 rounded-lg bg-stone-800 border border-stone-700 overflow-hidden shrink-0"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500 text-[10px]">
                    Image
                  </div>
                )}
                {/* Remove Overlay Button */}
                <button
                  type="button"
                  onClick={() => removeFromCompare(product.id)}
                  title={`Remove ${product.title}`}
                  className="absolute inset-0 bg-stone-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions (Compare Now CTA + Clear All) */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="px-3 py-2 text-stone-400 hover:text-stone-200 text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          <Link
            href="/compare"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>Compare Now ({compareCount})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
