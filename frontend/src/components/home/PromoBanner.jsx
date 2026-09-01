"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Tag } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="py-16 bg-[#FAF9F6]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative bg-[#F4F1EA] border border-stone-300/60 rounded-2xl overflow-hidden p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
          
          {/* Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-900/10 text-amber-900 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase">
              <Tag className="w-3.5 h-3.5" />
              <span>Special Offer • Use Code WELCOME20</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight leading-tight">
              Elevate Your Everyday
            </h2>

            <p className="text-stone-600 text-xs sm:text-sm max-w-md leading-relaxed">
              Discover quality products designed to fit beautifully into your lifestyle. Enjoy an extra 20% off your first purchase.
            </p>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#18181B] hover:bg-stone-900 text-white text-xs font-semibold py-3.5 px-6 rounded-lg transition-all shadow-md"
              >
                <span>Shop the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Banner Image */}
          <div className="lg:col-span-5 relative aspect-16/9 sm:aspect-2/1 lg:aspect-4/3 rounded-xl overflow-hidden bg-stone-200 border border-stone-300/40">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"
              alt="Elevate Your Everyday Collection"
              fill
              className="object-cover object-center"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
