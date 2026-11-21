"use client";

import React from 'react';
import Link from 'next/link';
import { Scale, ArrowRight } from 'lucide-react';

export default function EmptyCompare() {
  return (
    <div className="w-full max-w-xl mx-auto py-16 px-6 text-center bg-white border border-stone-200 rounded-3xl shadow-xs my-8 space-y-6">
      <div className="w-20 h-20 bg-stone-100 text-stone-700 rounded-3xl flex items-center justify-center mx-auto border border-stone-200">
        <Scale className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Your Comparison List is Empty
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          You haven&apos;t selected any products to compare yet. Browse our catalog and click the compare icon on product cards to analyze items side-by-side.
        </p>
      </div>

      <Link
        href="/products"
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
      >
        <span>Explore Catalog</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
