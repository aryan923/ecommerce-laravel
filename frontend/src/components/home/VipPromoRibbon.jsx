"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VipPromoRibbon() {
  const [isCopied, setIsCopied] = useState(false);
  const promoCode = 'WELCOME20';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(promoCode).catch(() => {});
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="bg-stone-950 text-white border-y border-amber-900/40 relative overflow-hidden">
      {/* Subtle Ambient Gold Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-amber-400/5 to-amber-600/10 pointer-events-none" />

      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Offer Callout with Pulsing Amber Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>

          <p className="text-[11px] sm:text-xs text-stone-200 font-medium truncate">
            <span className="font-extrabold uppercase tracking-widest text-amber-400 mr-1.5">
              Privilege Pass:
            </span>
            <span>Enjoy </span>
            <strong className="text-white font-black">20% OFF</strong>
            <span className="hidden md:inline"> your inaugural luxury acquisition</span>
            <span className="mx-1.5 text-stone-600">•</span>
            <span className="text-stone-300">Free Express White-Glove Courier</span>
          </p>
        </div>

        {/* Right: Copyable Coupon Code Pill & CTA */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <div className="flex items-center bg-stone-900/90 rounded-full border border-amber-400/30 p-0.5 pl-3">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-300 tracking-wider select-all mr-2">
              {promoCode}
            </span>

            <button
              onClick={handleCopy}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 inline-flex items-center gap-1 ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950 active:scale-95'
              }`}
              title="Copy promo code"
            >
              {isCopied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <Link
            href="/products"
            className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold text-stone-400 hover:text-amber-300 transition-colors uppercase tracking-wider pl-2"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>
    </div>
  );
}
