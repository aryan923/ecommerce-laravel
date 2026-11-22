"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { Sparkles, Crown, Watch, ShoppingBag, Gem, Glasses, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Departments', href: '/products', icon: Layers, isAccent: true },
  { id: 'men', name: 'Men’s Tailoring', href: '/category/men', icon: Crown },
  { id: 'women', name: 'Women’s Couture', href: '/category/women', icon: Sparkles },
  { id: 'watches', name: 'Timepieces & Horology', href: '/category/watches', icon: Watch },
  { id: 'handbags', name: 'Tuscan Leather', href: '/category/handbags', icon: ShoppingBag },
  { id: 'jewelry', name: 'Fine Jewelry', href: '/category/jewelry', icon: Gem },
  { id: 'accessories', name: 'Designer Eyewear', href: '/category/accessories', icon: Glasses },
];

export default function CategoryChipsRail() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF9F6] border-b border-stone-200/60 py-3 sm:py-3.5 relative">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative group">
        
        {/* Left Arrow Button for Desktop Scroll */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-stone-300 shadow-sm items-center justify-center text-stone-700 hover:text-stone-950 transition-all z-10 opacity-0 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Right Arrow Button for Desktop Scroll */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-stone-300 shadow-sm items-center justify-center text-stone-700 hover:text-stone-950 transition-all z-10 opacity-0 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Scrollable Chip Rail */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 border ${
                  cat.isAccent
                    ? 'bg-stone-900 text-white border-stone-900 shadow-sm hover:bg-stone-850'
                    : 'bg-white text-stone-700 border-stone-200/90 hover:border-stone-400 hover:text-stone-950 hover:shadow-xs'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cat.isAccent ? 'text-amber-400' : 'text-stone-500'}`} />
                <span className="whitespace-nowrap tracking-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
