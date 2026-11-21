"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Timer, Zap, ShoppingBag, ArrowRight, Star, ShieldCheck, Flame } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function FlashSaleSection() {
  const { addItemToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Time remaining state (8 hours, 42 minutes, 15 seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProduct = {
    id: 991,
    name: 'Artisan Chronograph Watch Edition V',
    slug: 'artisan-chronograph-watch',
    category: 'Timepieces & Luxury',
    price: 3499,
    originalPrice: 5999,
    discountPercentage: 42,
    rating: 4.95,
    reviewsCount: 128,
    stockClaimedPercentage: 78,
    stockRemaining: 8,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
  };

  const handleQuickAdd = async () => {
    setIsAdding(true);
    try {
      if (addItemToCart) {
        await addItemToCart({
          id: dealProduct.id,
          product_id: dealProduct.id,
          name: dealProduct.name,
          price: dealProduct.price,
          unit_price: dealProduct.price,
          quantity: 1,
          image: dealProduct.image,
        });
      }
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch (e) {
      console.warn("Flash sale add notice:", e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-stone-100 rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden shadow-2xl border border-stone-800">
          
          {/* Subtle Accent Glow Background */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Product Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-stone-800/80 border border-stone-700/60 group">
                <Image
                  src={dealProduct.image}
                  alt={dealProduct.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-lg">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{dealProduct.discountPercentage}% OFF TODAY</span>
                </div>
              </div>
            </div>

            {/* Right Column: Deal Details & Timer */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Top Tag & Live Countdown */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Daily Flash Deal</span>
                </div>

                {/* Countdown Timer Blocks */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1 mr-1">
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ends In:</span>
                  </span>
                  {[
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Mins', val: timeLeft.minutes },
                    { label: 'Secs', val: timeLeft.seconds },
                  ].map((unit, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className="bg-stone-800/90 border border-stone-700/80 px-2.5 py-1 rounded-lg text-center min-w-[38px]">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-white">
                          {String(unit.val).padStart(2, '0')}
                        </span>
                      </div>
                      {i < 2 && <span className="text-stone-500 font-bold">:</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Title & Category */}
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">
                  {dealProduct.category}
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-white tracking-tight">
                  {dealProduct.name}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-stone-300 font-bold">
                    {dealProduct.rating} ({dealProduct.reviewsCount} verified reviews)
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                  ₹{dealProduct.price.toLocaleString()}
                </span>
                <span className="text-lg text-stone-500 line-through">
                  ₹{dealProduct.originalPrice.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Save ₹{(dealProduct.originalPrice - dealProduct.price).toLocaleString()}
                </span>
              </div>

              {/* Stock Claimed Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-stone-300">
                    🔥 Hurry! Only <span className="text-amber-400">{dealProduct.stockRemaining} units</span> remaining
                  </span>
                  <span className="text-stone-400">{dealProduct.stockClaimedPercentage}% Claimed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-1000"
                    style={{ width: `${dealProduct.stockClaimedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={handleQuickAdd}
                  disabled={isAdding}
                  className={`w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950 active:scale-95'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedSuccess ? '✓ Added to Cart!' : isAdding ? 'Adding...' : 'Claim Deal & Add to Cart'}</span>
                </button>

                <Link
                  href="/products"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs text-stone-300 hover:text-white border border-stone-700/80 hover:border-stone-500 transition-colors uppercase tracking-wider"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center gap-4 pt-2 text-[11px] text-stone-400 border-t border-stone-800/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Year Manufacturer Warranty</span>
                </span>
                <span>•</span>
                <span>Free Insured Express Delivery</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
