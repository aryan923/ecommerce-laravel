"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Tag } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-[#F5F1E8] via-[#EFEAE0] to-[#E9E3D6] text-stone-950 border border-stone-300/80 rounded-3xl overflow-hidden p-10 sm:p-14 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-lg shadow-stone-900/5">
          
          {/* Content Left */}
          <div className="lg:col-span-7 space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-amber-900/10 border border-amber-900/20 text-amber-900 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-md">
              <Tag className="w-3.5 h-3.5 text-amber-800" />
              <span>Special Offer • Use Code WELCOME20</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight leading-tight">
              Elevate Your Everyday
            </h2>

            <p className="text-stone-700 text-xs sm:text-sm max-w-md leading-relaxed font-medium">
              Discover quality products designed to fit beautifully into your lifestyle. Enjoy an extra 20% off your first purchase today.
            </p>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-stone-950 hover:bg-amber-800 text-white text-xs font-extrabold py-3.5 px-7 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span>Shop the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Banner Image Right */}
          <div className="lg:col-span-5 relative aspect-16/9 sm:aspect-2/1 lg:aspect-4/3 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300/80 shadow-md group">
            <Image
              src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80"
              alt="Elevate Your Everyday Collection"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
