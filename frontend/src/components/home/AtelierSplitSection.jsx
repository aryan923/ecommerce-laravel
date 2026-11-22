"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShoppingBag, Check, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function AtelierSplitSection() {
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Featured Icon of the Week (backed by seeded database product)
  const featuredProduct = {
    id: 2,
    product_id: 2,
    name: 'Classic Chronometer Watch',
    brand: 'Chronos & Co',
    category: 'Watches & Timepieces',
    price: 890,
    originalPrice: 980,
    slug: 'classic-chronometer-watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Swiss-made automatic chronometer with scratch-resistant sapphire crystal glass and alligator leather strap.',
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      if (addItem) {
        await addItem({
          id: featuredProduct.id,
          product_id: featuredProduct.id,
          name: featuredProduct.name,
          price: featuredProduct.price,
          unit_price: featuredProduct.price,
          quantity: 1,
          slug: featuredProduct.slug,
          image: featuredProduct.image,
        }, 1);
      }
      setIsAdded(true);
      if (openCart) openCart();
      setTimeout(() => setIsAdded(false), 2500);
    } catch (err) {
      console.warn("Atelier split quick add error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const displayPrice = (val) => {
    if (formatPrice) return formatPrice(val);
    return `₹${val.toLocaleString()}`;
  };

  return (
    <section className="py-10 sm:py-14 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 60/40 Asymmetrical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column (60% / 7 cols): High-Impact Atelier Campaign Banner */}
          <div className="lg:col-span-7">
            <Link
              href="/products?category=men"
              className="group relative h-full min-h-[440px] sm:min-h-[480px] rounded-3xl overflow-hidden border border-stone-300/80 shadow-md hover:shadow-2xl transition-all duration-700 flex flex-col justify-between p-6 sm:p-10 bg-stone-950 block"
            >
              {/* Background Campaign Photograph */}
              <Image
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"
                alt="The Monochromatic Atelier Campaign"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center filter brightness-[0.82] contrast-[1.05] group-hover:scale-105 group-hover:brightness-[0.88] transition-all duration-1000 ease-out"
              />

              {/* Multi-layered Cinematic Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20 pointer-events-none" />

              {/* Top Tag Row */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md border border-white/15 text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-extrabold tracking-widest uppercase">
                    Autumn / Winter 2026 Atelier
                  </span>
                </div>

                <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-stone-300 bg-white/10 backdrop-blur-md border border-white/15">
                  Limited Batch // Florence
                </span>
              </div>

              {/* Bottom Editorial Content */}
              <div className="relative z-10 space-y-4 max-w-xl">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 block mb-1">
                    Signature Runway Campaign
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-tight tracking-tight group-hover:text-amber-100 transition-colors">
                    The Monochromatic Atelier
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-stone-200/90 font-light leading-relaxed line-clamp-2">
                  Masterfully tailored from Super 130s Italian virgin wool and Mulberry silk weaves. Structured shoulders and lustrous peak lapels crafted for timeless formal poise.
                </p>

                {/* Call to Action Button */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-stone-950 text-xs font-bold uppercase tracking-wider group-hover:bg-amber-400 transition-colors shadow-xl">
                    <span>Explore Atelier Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

            </Link>
          </div>

          {/* Right Column (40% / 5 cols): Stacked Icon Product + Maison Privileges */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            
            {/* Top Card: Featured Icon of the Week */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex-1 flex flex-col justify-between">
              
              {/* Header Label */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                    Iconic Arrival of the Week
                  </span>
                </div>

                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Certified In Stock
                </span>
              </div>

              {/* Product Body */}
              <div className="flex items-center gap-4">
                
                {/* Product Thumbnail */}
                <Link
                  href={`/products/${featuredProduct.slug}`}
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 group/thumb"
                >
                  <Image
                    src={featuredProduct.image}
                    alt={featuredProduct.name}
                    fill
                    sizes="112px"
                    className="object-cover object-center group-hover/thumb:scale-105 transition-transform duration-500"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-400 block">
                    {featuredProduct.brand} • {featuredProduct.category}
                  </span>

                  <Link
                    href={`/products/${featuredProduct.slug}`}
                    className="font-serif text-base sm:text-lg text-stone-900 hover:text-amber-800 transition-colors font-normal line-clamp-1 mt-0.5 block"
                  >
                    {featuredProduct.name}
                  </Link>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-stone-500 ml-1">
                      (4.9 • Swiss COSC)
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-base sm:text-lg font-black text-stone-950">
                      {displayPrice(featuredProduct.price)}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      {displayPrice(featuredProduct.originalPrice)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-4 mt-3 border-t border-stone-100">
                <Link
                  href={`/products/${featuredProduct.slug}`}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-center text-xs font-bold text-stone-800 hover:bg-stone-50 transition-colors uppercase tracking-wider"
                >
                  View Details
                </Link>

                <button
                  onClick={handleQuickAdd}
                  disabled={isAdding}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 hover:bg-amber-800 text-white active:scale-95'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isAdding ? 'Adding...' : 'Quick Add'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Bottom Card: Maison Privileges & Guarantees */}
            <div className="bg-stone-900 rounded-3xl p-5 text-white border border-stone-800 shadow-md space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                The Maison Guarantee
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-stone-100">Concierge Express</p>
                    <p className="text-[9px] text-stone-400 leading-tight mt-0.5">Free insured global courier</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-stone-100">100% Authentic</p>
                    <p className="text-[9px] text-stone-400 leading-tight mt-0.5">Serialized proof of origin</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-stone-100">Atelier Returns</p>
                    <p className="text-[9px] text-stone-400 leading-tight mt-0.5">30-day effortless returns</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
