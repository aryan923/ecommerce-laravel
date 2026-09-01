"use client";

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function StockBadge({ stockQuantity = 10, isAvailable = true }) {
  const stock = typeof stockQuantity === 'number' ? stockQuantity : (isAvailable ? 10 : 0);

  if (stock <= 0 || !isAvailable) {
    return (
      <div
        data-testid="stock-badge"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80"
      >
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Out of Stock</span>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div
        data-testid="stock-badge"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Only {stock} left in stock - order soon</span>
      </div>
    );
  }

  return (
    <div
      data-testid="stock-badge"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80"
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>In Stock</span>
    </div>
  );
}
