"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
}) {
  const validTotalPages = Number.isFinite(Number(totalPages)) ? Math.max(1, Math.floor(Number(totalPages))) : 1;
  if (validTotalPages <= 1) return null;

  const pages = Array.from({ length: validTotalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between pt-10 pb-6 border-t border-stone-200/80 mt-10">
      
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300/80 rounded-xl hover:bg-stone-100 hover:text-stone-950 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5">
        {pages.map((page) => {
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-stone-950 text-white shadow-md'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 hover:text-stone-950'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300/80 rounded-xl hover:bg-stone-100 hover:text-stone-950 disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-sm"
      >
        <span>Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>

    </div>
  );
}
