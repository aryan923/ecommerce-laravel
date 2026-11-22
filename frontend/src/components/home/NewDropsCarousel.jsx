"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Check, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import apiClient from '@/lib/api-client';

const initialDrops = [
  {
    id: 1,
    name: 'Luxury Silk Evening Dress',
    brand: 'Aura Paris',
    category: 'Women\'s Fashion',
    price: 380,
    originalPrice: 450,
    slug: 'luxury-silk-evening-dress',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop',
    badge: 'PARIS COUTURE',
    rating: 4.9,
    memberPrice: 304, // 20% off with WELCOME20
  },
  {
    id: 2,
    name: 'Classic Chronometer Watch',
    brand: 'Chronos & Co',
    category: 'Watches & Horology',
    price: 890,
    originalPrice: 980,
    slug: 'classic-chronometer-watch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
    badge: 'SWISS COSC',
    rating: 5.0,
    memberPrice: 712,
  },
  {
    id: 3,
    name: 'Satin-Lapel Tailored Dinner Jacket',
    brand: 'Luxora Atelier',
    category: 'Men\'s Collection',
    price: 640,
    originalPrice: 750,
    slug: 'satin-lapel-tailored-dinner-jacket',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    badge: 'SUPER 130s WOOL',
    rating: 4.8,
    memberPrice: 512,
  },
  {
    id: 4,
    name: 'Retro Tinted Aviator Sunglasses',
    brand: 'Luxora Atelier',
    category: 'Accessories',
    price: 185,
    originalPrice: 220,
    slug: 'retro-tinted-aviator-sunglasses',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    badge: 'JAPANESE TITANIUM',
    rating: 4.9,
    memberPrice: 148,
  },
  {
    id: 5,
    name: 'Artisanal Leather Tote',
    brand: 'Vera Leather',
    category: 'Handbags & Totes',
    price: 275,
    originalPrice: 320,
    slug: 'artisanal-leather-tote',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop',
    badge: 'TUSCAN LEATHER',
    rating: 4.7,
    memberPrice: 220,
  },
  {
    id: 6,
    name: 'Cashmere Knit Sweater',
    brand: 'Luxora Atelier',
    category: 'Knitwear',
    price: 290,
    originalPrice: 340,
    slug: 'cashmere-knit-sweater',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
    badge: 'GRADE-A CASHMERE',
    rating: 4.9,
    memberPrice: 232,
  },
];

export default function NewDropsCarousel() {
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const scrollRef = useRef(null);
  const [items, setItems] = useState(initialDrops);
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function fetchDrops() {
      try {
        const res = await apiClient.get('/products?per_page=12&sort_by=latest');
        const list = res.data?.data || [];
        if (Array.isArray(list) && list.length > 0 && isMounted) {
          const mapped = list.map((p, idx) => {
            const price = Number(p.sale_price || p.price || 199);
            const originalPrice = Number(p.price || price * 1.2);
            return {
              id: p.id,
              name: p.name,
              brand: p.brand?.name || 'Luxora Atelier',
              category: p.category?.name || 'Luxury Edit',
              price,
              originalPrice,
              slug: p.slug,
              image: p.main_image_url || p.primary_image_url || p.image_url || initialDrops[idx % initialDrops.length].image,
              badge: idx % 3 === 0 ? 'NEW ARRIVAL' : idx % 3 === 1 ? 'ATELIER DROP' : 'LIMITED RUN',
              rating: 4.8 + ((p.id % 3) * 0.1),
              memberPrice: Math.round(price * 0.8),
            };
          });
          setItems(mapped);
        }
      } catch (e) {
        // Keep initial fallback
      }
    }
    fetchDrops();
    return () => { isMounted = false; };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = async (product) => {
    try {
      if (addItem) {
        await addItem({
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          unit_price: product.price,
          quantity: 1,
          slug: product.slug,
          image: product.image,
        }, 1);
      }
      setAddedIds(prev => ({ ...prev, [product.id]: true }));
      if (openCart) openCart();
      setTimeout(() => {
        setAddedIds(prev => ({ ...prev, [product.id]: false }));
      }, 2500);
    } catch (e) {
      console.warn("New drop quick add notice:", e);
    }
  };

  const displayPrice = (val) => {
    if (formatPrice) return formatPrice(val);
    return `₹${val.toLocaleString()}`;
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-stone-200/60 relative">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
                Runway Releases • Winter 2026
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Newest Drops of the Season
            </h2>
            <p className="text-xs text-stone-500 max-w-lg mt-1 font-medium">
              Freshly released capsule pieces. Swipe or use navigation arrows to inspect new creations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Left/Right Scroll Arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-700 hover:text-stone-950 hover:border-stone-400 transition-all active:scale-95"
                aria-label="Scroll carousel left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-9 h-9 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-700 hover:text-stone-950 hover:border-stone-400 transition-all active:scale-95"
                aria-label="Scroll carousel right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 hover:text-amber-800 transition-colors uppercase tracking-wider group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Horizontal Carousel Rail */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-5 overflow-x-auto scrollbar-none py-2 px-1 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => {
            const isJustAdded = !!addedIds[item.id];
            const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

            return (
              <div
                key={item.id}
                className="w-[280px] sm:w-[320px] shrink-0 bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
              >
                {/* Top Image Box */}
                <div className="relative aspect-[4/5] bg-stone-100 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="320px"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Micro Badges (Bewakoof pattern) */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase bg-stone-950/80 backdrop-blur-md text-amber-300 border border-white/10 shadow-sm">
                      {item.badge}
                    </span>

                    {discount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-600 text-white shadow-sm">
                        -{discount}%
                      </span>
                    )}
                  </div>

                  {/* Quick Add Floating Button on Image Hover */}
                  <button
                    onClick={() => handleQuickAdd(item)}
                    className={`absolute bottom-3 right-3 p-3 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white scale-105'
                        : 'bg-stone-950 text-white hover:bg-amber-400 hover:text-stone-950 active:scale-90'
                    }`}
                    title="Quick Add to Bag"
                  >
                    {isJustAdded ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Bottom Details Box */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    {/* Brand & Rating */}
                    <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1">
                      <span className="font-extrabold uppercase tracking-widest text-amber-900/80">
                        {item.brand}
                      </span>
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif text-base font-normal text-stone-900 hover:text-amber-800 transition-colors line-clamp-1 block"
                    >
                      {item.name}
                    </Link>

                    {/* Prices */}
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="font-black text-base text-stone-950">
                        {displayPrice(item.price)}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-stone-400 line-through">
                          {displayPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bewakoof-Style "Effective Member Price" Pill */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-stone-600 font-medium">With WELCOME20:</span>
                    <span className="font-black text-amber-900 font-mono">
                      {displayPrice(item.memberPrice)}
                    </span>
                  </div>

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
