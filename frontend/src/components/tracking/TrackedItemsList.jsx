"use client";

import React from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';

export default function TrackedItemsList({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm my-6">
      <h3 className="font-serif text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-stone-700" />
        <span>Items in This Package ({items.length})</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 rounded-xl border border-stone-200 bg-stone-50/50">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-200">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title || 'Product Thumbnail'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">
                  <Package className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-stone-900 truncate">
                {item.title}
              </h4>
              {item.sku && (
                <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                  SKU: {item.sku}
                </p>
              )}
              <p className="text-[11px] font-semibold text-stone-700 mt-1">
                Qty: {item.quantity || 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
