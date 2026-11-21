"use client";

import React from 'react';
import Link from 'next/link';
import { HeartHandshake, ArrowRight } from 'lucide-react';

export default function EmptyWishlist() {
  return (
    <div
      data-testid="empty-wishlist-view"
      className="bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto my-4 shadow-xs flex flex-col items-center justify-center"
    >
      <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4">
        <HeartHandshake className="w-8 h-8 stroke-[1.5]" />
      </div>

      <h2 className="text-lg font-bold text-stone-900 mb-1">
        Your Wishlist is Empty
      </h2>

      <p className="text-xs text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
        You haven't saved any items to your wishlist yet. Explore our products and tap the heart icon on any item to save your favorites.
      </p>

      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-xs"
      >
        <span>Explore Products</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

