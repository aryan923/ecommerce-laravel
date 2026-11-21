"use client";

import React from 'react';
import Link from 'next/link';
import { Scale, Trash2, Share2, Sparkles } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { useToast } from '../../context/ToastContext';

export default function CompareHeader({ highlightDiffs, setHighlightDiffs }) {
  const { compareCount, clearCompare } = useCompare();
  const { showToast } = useToast();

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Comparison matrix link copied to clipboard!', 'success');
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
      <div>
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-stone-900" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Product Comparison Matrix
          </h1>
          <span data-testid="compare-count-badge" className="px-2.5 py-0.5 bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold rounded-full">
            {compareCount} Items
          </span>
        </div>
        <p className="text-stone-500 text-xs sm:text-sm mt-1">
          Compare specifications, pricing, ratings, and features side-by-side.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Highlight Differences Toggle */}
        <label className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={highlightDiffs}
            onChange={(e) => setHighlightDiffs(e.target.checked)}
            className="w-4 h-4 rounded text-stone-900 focus:ring-stone-900"
          />
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Highlight Differences Only</span>
        </label>

        {/* Share CTA */}
        <button
          type="button"
          onClick={handleShare}
          className="px-3.5 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* Clear All CTA */}
        <button
          type="button"
          onClick={clearCompare}
          className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
}
