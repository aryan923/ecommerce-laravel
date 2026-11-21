"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShoppingBag, Eye, ArrowRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const lookItems = [
  {
    id: 1,
    pinNumber: 1,
    name: 'Raw Linen Relaxed Overshirt',
    category: 'Apparel',
    price: 1899,
    originalPrice: 2499,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80',
    slug: 'raw-linen-relaxed-overshirt',
    pinPosition: { top: '35%', left: '48%' },
  },
  {
    id: 2,
    pinNumber: 2,
    name: 'Artisan Full-Grain Leather Tote',
    category: 'Leather Goods',
    price: 3299,
    originalPrice: 4299,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80',
    slug: 'artisan-leather-tote',
    pinPosition: { top: '65%', left: '72%' },
  },
  {
    id: 3,
    pinNumber: 3,
    name: 'Minimalist Handcrafted Sunglasses',
    category: 'Eyewear',
    price: 1299,
    originalPrice: 1799,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80',
    slug: 'minimalist-handcrafted-sunglasses',
    pinPosition: { top: '22%', left: '46%' },
  },
];

export default function ShopTheLook() {
  const { addItemToCart } = useCart();
  const [activePin, setActivePin] = useState(1);
  const [addedItemId, setAddedItemId] = useState(null);

  const handleAdd = async (item) => {
    try {
      if (addItemToCart) {
        await addItemToCart({
          id: item.id,
          product_id: item.id,
          name: item.name,
          price: item.price,
          unit_price: item.price,
          quantity: 1,
          image: item.image,
        });
      }
      setAddedItemId(item.id);
      setTimeout(() => setAddedItemId(null), 2500);
    } catch (e) {
      console.warn("Shop the look notice:", e);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-2">
              <Sparkles className="w-3 h-3 text-amber-800" />
              <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
                Curated Lookbook
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Shop The Look
            </h2>
            <p className="text-xs text-stone-500 max-w-md mt-1 font-medium">
              Explore meticulously styled ensembles. Click a hotspot to discover and shop the individual pieces.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 hover:text-amber-800 transition-colors uppercase tracking-wider group"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Styled Editorial Image with Interactive Pins */}
          <div className="lg:col-span-7">
            <div className="relative aspect-4/5 sm:aspect-16/11 lg:aspect-4/3 rounded-3xl overflow-hidden bg-stone-200 border border-stone-300/80 shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
                alt="Editorial Lifestyle Lookbook"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Hotspot Pins */}
              {lookItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePin(item.pinNumber)}
                  style={{ top: item.pinPosition.top, left: item.pinPosition.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-xl ${
                    activePin === item.pinNumber
                      ? 'bg-amber-400 text-stone-950 scale-125 ring-4 ring-white/80'
                      : 'bg-white/90 text-stone-900 hover:scale-110 hover:bg-white'
                  }`}
                  title={item.name}
                >
                  <span className="relative flex h-2 w-2 mr-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span>{item.pinNumber}</span>
                </button>
              ))}

              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-200/80 text-[11px] font-bold text-stone-800 shadow-sm">
                <span>The Contemporary Minimalist Edit — Autumn 2026</span>
              </div>
            </div>
          </div>

          {/* Right Column: Matched Look Items */}
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">
              Pieces Featured in This Look:
            </p>

            <div className="space-y-3">
              {lookItems.map((item) => {
                const isActive = activePin === item.pinNumber;
                const isJustAdded = addedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setActivePin(item.pinNumber)}
                    className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white/60 border-stone-200/80 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    {/* Pin Badge */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] shrink-0 ${
                        isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {item.pinNumber}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        {item.category}
                      </p>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-extrabold text-xs text-stone-900">
                          ₹{item.price.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-stone-400 line-through">
                          ₹{item.originalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdd(item);
                        }}
                        className={`p-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1 ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-900 hover:bg-amber-800 text-white active:scale-95'
                        }`}
                        title="Add to Bag"
                      >
                        {isJustAdded ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-bold text-stone-900 transition-colors"
              >
                <span>View More Lookbooks & Curations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
