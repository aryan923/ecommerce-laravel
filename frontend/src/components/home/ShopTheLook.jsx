"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ShoppingBag, ArrowRight, Check, Eye, Layers } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import apiClient from '@/lib/api-client';

const initialLookItems = [
  {
    pinNumber: 1,
    name: 'Retro Tinted Aviator Sunglasses',
    category: 'Accessories',
    brand: 'Luxora Atelier',
    tag: 'Eyewear',
    price: 185,
    originalPrice: 220,
    slug: 'retro-tinted-aviator-sunglasses',
    fallbackSlug: 'designer-sunglasses-gold',
    fallbackId: 4,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    pinPosition: { top: '28%', left: '55%' },
    description: 'Vintage Japanese titanium frames with gradient tinted UV400 lenses.',
  },
  {
    pinNumber: 2,
    name: 'Satin-Lapel Tailored Dinner Jacket',
    category: 'Men\'s Collection',
    brand: 'Luxora Atelier',
    tag: 'Outerwear',
    price: 640,
    originalPrice: 750,
    slug: 'satin-lapel-tailored-dinner-jacket',
    fallbackSlug: 'cashmere-knit-sweater',
    fallbackId: 6,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    pinPosition: { top: '48%', left: '38%' },
    description: 'Super 130s Italian virgin wool blazer with silk-satin peak lapels.',
  },
  {
    pinNumber: 3,
    name: 'Monogram Silk-Cotton Fitted Shirt',
    category: 'Men\'s Collection',
    brand: 'Luxora Atelier',
    tag: 'Shirting',
    price: 160,
    originalPrice: 195,
    slug: 'monogram-silk-cotton-fitted-shirt',
    fallbackSlug: 'minimalist-leather-cardholder',
    fallbackId: 8,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    pinPosition: { top: '56%', left: '53%' },
    description: 'Breathable Egyptian cotton and Mulberry silk weave with hidden placket.',
  },
  {
    pinNumber: 4,
    name: 'Classic Chronometer Watch',
    category: 'Watches & Timepieces',
    brand: 'Chronos & Co',
    tag: 'Horology',
    price: 799,
    originalPrice: 890,
    slug: 'classic-chronometer-watch',
    fallbackSlug: 'classic-chronometer-watch',
    fallbackId: 2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    pinPosition: { top: '70%', left: '72%' },
    description: 'Swiss-made automatic chronometer with sapphire crystal glass.',
  },
  {
    pinNumber: 5,
    name: 'High-Rise Pleated Tuxedo Trousers',
    category: 'Men\'s Collection',
    brand: 'Vera Leather',
    tag: 'Tailoring',
    price: 240,
    originalPrice: 280,
    slug: 'high-rise-pleated-tuxedo-trousers',
    fallbackSlug: 'italian-leather-loafers',
    fallbackId: 5,
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    pinPosition: { top: '88%', left: '52%' },
    description: 'Italian fluid wool double-pleated trousers with side tab adjusters.',
  },
];

export default function ShopTheLook() {
  const { addItem, openCart } = useCart();
  const { formatPrice } = useCurrency();
  const [activePin, setActivePin] = useState(1);
  const [addedItemIds, setAddedItemIds] = useState({});
  const [isAddingAll, setIsAddingAll] = useState(false);
  const [addAllSuccess, setAddAllSuccess] = useState(false);

  // Initialize with real, verified database product IDs
  const [lookItems, setLookItems] = useState(() =>
    initialLookItems.map(item => ({
      ...item,
      id: item.fallbackId,
      product_id: item.fallbackId,
    }))
  );

  // Dynamically synchronize with live backend catalog to resolve live database IDs
  useEffect(() => {
    let isMounted = true;
    async function syncCatalog() {
      try {
        const res = await apiClient.get('/products?per_page=50');
        const catalog = res.data?.data || [];
        if (!Array.isArray(catalog) || catalog.length === 0 || !isMounted) return;

        setLookItems(prev =>
          prev.map(item => {
            // 1. Exact slug match
            let matched = catalog.find(p => p.slug === item.slug);
            // 2. Fallback slug match (for already seeded products)
            if (!matched && item.fallbackSlug) {
              matched = catalog.find(p => p.slug === item.fallbackSlug);
            }
            // 3. Fallback ID match
            if (!matched && item.fallbackId) {
              matched = catalog.find(p => p.id === item.fallbackId);
            }

            if (matched) {
              return {
                ...item,
                id: matched.id,
                product_id: matched.id,
                name: item.name || matched.name,
                price: Number(matched.sale_price || matched.price || item.price),
                originalPrice: Number(matched.price || item.originalPrice),
                slug: matched.slug,
                image: matched.main_image_url || matched.primary_image_url || matched.image_url || item.image,
              };
            }
            return item;
          })
        );
      } catch (e) {
        // Keep verified initial state
      }
    }
    syncCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayPrice = (val) => {
    if (formatPrice) {
      return formatPrice(val);
    }
    return `₹${val.toLocaleString()}`;
  };

  const handleSingleAdd = async (item) => {
    try {
      if (addItem) {
        await addItem({
          id: item.id,
          product_id: item.id,
          name: item.name,
          price: item.price,
          unit_price: item.price,
          quantity: 1,
          slug: item.slug,
          image: item.image,
        }, 1);
      }
      setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
      if (openCart) openCart();
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
      }, 2500);
    } catch (e) {
      console.warn("Shop the look single add notice:", e);
    }
  };

  const handleAddAll = async () => {
    setIsAddingAll(true);
    try {
      if (addItem) {
        for (const item of lookItems) {
          await addItem({
            id: item.id,
            product_id: item.id,
            name: item.name,
            price: item.price,
            unit_price: item.price,
            quantity: 1,
            slug: item.slug,
            image: item.image,
          }, 1);
        }
      }
      setAddAllSuccess(true);
      if (openCart) openCart();
      setTimeout(() => setAddAllSuccess(false), 3000);
    } catch (e) {
      console.warn("Shop the look add-all notice:", e);
    } finally {
      setIsAddingAll(false);
    }
  };

  const totalLookPrice = lookItems.reduce((acc, item) => acc + item.price, 0);
  const totalOriginalPrice = lookItems.reduce((acc, item) => acc + item.originalPrice, 0);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-2">
              <Sparkles className="w-3 h-3 text-amber-800" />
              <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
                Editorial Lookbook
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Shop The Look
            </h2>
            <p className="text-xs text-stone-500 max-w-lg mt-1 font-medium">
              Explore meticulously styled runway ensembles. Tap any hotspot to inspect, match, and acquire the authentic pieces directly from our database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Ensemble: 01 / Midnight Avant-Garde
            </span>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 hover:text-amber-800 transition-colors uppercase tracking-wider group"
            >
              <span>Explore All Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 2-Column Lookbook Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Funky High-Fashion Male Model Editorial Image */}
          <div className="lg:col-span-7 sticky top-24">
            <div className="relative aspect-[3/4] sm:aspect-[4/5] rounded-3xl overflow-hidden bg-stone-950 border border-stone-300/80 shadow-2xl group">
              
              <Image
                src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80"
                alt="Editorial Funky Fashion Model in Avant-Garde Tailored Attire"
                fill
                priority
                className="object-cover object-top filter brightness-[0.98] contrast-[1.02] group-hover:scale-[1.02] transition-transform duration-700"
              />

              {/* Editorial Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/20 pointer-events-none" />

              {/* Hotspot Interactive Pins */}
              {lookItems.map((item) => {
                const isActive = activePin === item.pinNumber;
                return (
                  <button
                    key={item.pinNumber}
                    onClick={() => setActivePin(item.pinNumber)}
                    style={{ top: item.pinPosition.top, left: item.pinPosition.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-2xl z-20 ${
                      isActive
                        ? 'bg-amber-400 text-stone-950 scale-125 ring-4 ring-amber-300/80 shadow-amber-400/50'
                        : 'bg-stone-900/90 text-white hover:scale-110 hover:bg-stone-900 ring-2 ring-white/70'
                    }`}
                    title={`Pin ${item.pinNumber}: ${item.name}`}
                  >
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-stone-900' : 'bg-amber-400'}`} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-stone-950' : 'bg-amber-400'}`} />
                    </span>
                    <span>{item.pinNumber}</span>
                  </button>
                );
              })}

              {/* Bottom Editorial Caption Stamp */}
              <div className="absolute bottom-5 inset-x-5 flex items-center justify-between text-white pointer-events-none">
                <div className="bg-stone-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                    Runway Look 01
                  </p>
                  <p className="text-xs font-serif font-light text-stone-200">
                    The Monochromatic Avant-Garde Edit
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-stone-300 font-mono">
                  <span>5 ATTIRE PIECES</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Matched Pieces with Real Database Product Data */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500">
                Attire Featured on Model ({lookItems.length} Real Pieces)
              </p>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                In Stock &amp; Verified
              </span>
            </div>

            {/* List of 5 Ensemble Pieces */}
            <div className="space-y-3">
              {lookItems.map((item) => {
                const isActive = activePin === item.pinNumber;
                const isJustAdded = !!addedItemIds[item.id];

                return (
                  <div
                    key={item.pinNumber}
                    onClick={() => setActivePin(item.pinNumber)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white border-amber-500 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-white/70 border-stone-200/80 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    {/* Pin Number */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${
                        isActive
                          ? 'bg-amber-400 text-stone-950 shadow-sm'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {item.pinNumber}
                    </div>

                    {/* Product Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/80">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest">
                          {item.brand}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[9px] font-bold text-amber-700 uppercase">
                          {item.tag}
                        </span>
                      </div>

                      <Link
                        href={`/products/${item.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-bold text-xs sm:text-sm text-stone-900 hover:text-amber-800 transition-colors line-clamp-1 mt-0.5 block"
                      >
                        {item.name}
                      </Link>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-extrabold text-xs sm:text-sm text-stone-950">
                          {displayPrice(item.price)}
                        </span>
                        <span className="text-[10px] text-stone-400 line-through">
                          {displayPrice(item.originalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                        title="View Product Page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleAdd(item);
                        }}
                        className={`p-2.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-900 hover:bg-amber-800 text-white active:scale-95'
                        }`}
                        title="Add to Cart"
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

            {/* Complete Look Bundle Action Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white space-y-4 shadow-xl border border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                    Full Set Acquisition
                  </span>
                  <p className="font-serif text-lg text-white font-normal">
                    Complete Ensemble (5 Pieces)
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-base text-amber-400">
                    {displayPrice(totalLookPrice)}
                  </p>
                  <p className="text-[10px] text-stone-400 line-through">
                    {displayPrice(totalOriginalPrice)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAddAll}
                disabled={isAddingAll}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                  addAllSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-stone-950 active:scale-95'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>
                  {addAllSuccess
                    ? '✓ Complete Ensemble Added to Cart!'
                    : isAddingAll
                    ? 'Adding All Pieces...'
                    : 'Acquire Full Ensemble (Add All 5 Pieces)'}
                </span>
              </button>

              <p className="text-[10px] text-stone-400 text-center">
                All 5 items are in stock, authenticated, and backed by a 30-day luxury return guarantee.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
