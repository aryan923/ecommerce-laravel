"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function EmptyCartView() {
  return (
    <div data-testid="empty-cart-view" className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-stone-200/80 shadow-xs max-w-xl mx-auto my-8">
      <div className="w-20 h-20 rounded-full bg-stone-100 border border-stone-200/60 flex items-center justify-center mb-6">
        <ShoppingBag className="w-10 h-10 text-stone-400" />
      </div>

      <h2 className="text-2xl font-black text-stone-900 tracking-tight">
        Your Shopping Cart is Empty
      </h2>

      <p className="text-xs text-stone-500 max-w-md mt-2 mb-8 leading-relaxed">
        Explore our curated store collections, discover trending items, and add your favorite products to your cart.
      </p>

      <Link
        href="/products"
        className="px-8 py-3.5 bg-stone-950 hover:bg-stone-850 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-stone-950/20 flex items-center gap-2"
      >
        <span>Browse Products Catalog</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
