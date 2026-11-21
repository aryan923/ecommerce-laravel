"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

const categoryShowcases = [
  {
    id: 1,
    title: "Couture & Apparel",
    subtitle: "Timeless silhouettes and luxury fabrics crafted for effortless elegance.",
    categorySlug: "fashion",
    badge: "Featured Collection",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
    cols: "lg:col-span-7",
  },
  {
    id: 2,
    title: "Timepieces & Accessories",
    subtitle: "Precision engineering meets master horology and artisanal leather.",
    categorySlug: "accessories",
    badge: "New Arrivals",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    cols: "lg:col-span-5",
  },
];

export default function CategoryShowcaseBanners() {
  return (
    <section className="my-14 sm:my-20 lg:my-24">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/5 border border-amber-950/10 mb-2">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
                Curated Highlights
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Featured Category Spotlights
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 hover:text-amber-800 transition-colors shrink-0"
          >
            <span>Explore All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dual Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {categoryShowcases.map((banner) => (
            <div
              key={banner.id}
              className={`relative ${banner.cols} min-h-[340px] sm:min-h-[380px] rounded-3xl overflow-hidden border border-stone-300/60 shadow-xl group flex flex-col justify-end p-6 sm:p-10`}
            >
              {/* Background Image with Zoom */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
              />

              {/* Rich Multi-Stage Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-stone-950/10 group-hover:from-stone-950/95 transition-all duration-300" />

              {/* Banner Content Card */}
              <div className="relative z-10 space-y-3">
                <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {banner.badge}
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">
                  {banner.title}
                </h3>

                <p className="text-stone-300 text-xs sm:text-sm max-w-md line-clamp-2 font-medium leading-relaxed">
                  {banner.subtitle}
                </p>

                <div className="pt-2">
                  <Link
                    href={`/category/${banner.categorySlug}`}
                    className="inline-flex items-center gap-2 bg-white text-stone-950 hover:bg-amber-400 hover:text-stone-950 text-xs font-extrabold py-3 px-6 rounded-2xl transition-all duration-300 shadow-md group-hover:shadow-xl"
                  >
                    <span>Shop {banner.title.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
