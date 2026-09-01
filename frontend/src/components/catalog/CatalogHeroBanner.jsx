"use client";

import React from 'react';
import { ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';

export default function CatalogHeroBanner({
  title = "THE CATALOG COLLECTION",
  subtitle = "Discover an exquisite selection of haute couture apparel, fine jewelry, precision timepieces, and artisanal leather goods.",
  tagline = "AUTUMN / WINTER 2024",
  heroImage = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop"
}) {
  return (
    <div className="relative w-full bg-gradient-to-r from-[#F4F0EA] via-[#FAF9F6] to-[#EFEAE3] border-b border-stone-200/90 text-stone-900 overflow-hidden">
      
      {/* Soft Ambient Warm Glow Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-stone-300/20 blur-3xl" />
      </div>

      {/* Main Content Container Aligned with Layout Grid */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Typography & Luxury Badges */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-950 text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>{tagline}</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight leading-[1.12]">
              {title}
            </h1>

            {/* Subtitle Description */}
            <p className="text-stone-600 text-xs sm:text-sm lg:text-base leading-relaxed max-w-xl font-normal">
              {subtitle}
            </p>

            {/* Highlights Bar */}
            <div className="pt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-800">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-stone-200/90 px-3.5 py-2 rounded-xl shadow-xs">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span>100% Certified Authentic</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-stone-200/90 px-3.5 py-2 rounded-xl shadow-xs">
                <Truck className="w-4 h-4 text-amber-800" />
                <span>Complimentary Express Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-stone-200/90 px-3.5 py-2 rounded-xl shadow-xs">
                <Award className="w-4 h-4 text-amber-800" />
                <span>Hand-Curated Artisanal Goods</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Fashion Editorial Hero Graphic */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Backing Frame */}
              <div className="absolute inset-0 rounded-2xl bg-amber-900/10 transform rotate-2 scale-95 transition-transform" />
              
              {/* Main Editorial Image Card */}
              <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 shadow-md bg-white">
                <img
                  src={heroImage}
                  alt={title}
                  className="w-full h-56 sm:h-64 lg:h-72 object-cover object-center filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-300 block mb-0.5">
                    Haute Couture Selection
                  </span>
                  <p className="font-serif text-sm font-light text-stone-100">
                    Crafted by World-Renowned Designers & Master Craftsmen
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
