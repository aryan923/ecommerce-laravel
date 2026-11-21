"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

const announcements = [
  {
    icon: Sparkles,
    text: "Welcome Offer: Enjoy 20% off your first purchase with code",
    code: "WELCOME20",
    linkText: "Shop Now",
    linkUrl: "/products",
  },
  {
    icon: Truck,
    text: "Free Express Shipping on all orders above ₹999 across India",
    linkText: "Learn More",
    linkUrl: "/shipping-policy",
  },
  {
    icon: ShieldCheck,
    text: "30-Day Hassle-Free Returns & 100% Verified Authenticity Guarantee",
    linkText: "Our Promise",
    linkUrl: "/about",
  },
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = announcements[currentIndex];
  const Icon = current.icon;

  return (
    <div className="bg-stone-950 text-stone-200 text-[11px] font-medium tracking-wide py-2.5 px-4 border-b border-stone-800/80 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        
        {/* Left Indicator - Desktop Only */}
        <div className="hidden lg:flex items-center gap-2 text-stone-400 text-[10px] uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Storefront</span>
        </div>

        {/* Center Rotating Message */}
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <div className="flex items-center gap-2 animate-fade-in transition-all duration-500">
            <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{current.text}</span>
            {current.code && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px] tracking-wider uppercase border border-amber-400/30">
                {current.code}
              </span>
            )}
            {current.linkUrl && (
              <Link
                href={current.linkUrl}
                className="inline-flex items-center gap-0.5 underline hover:text-white font-bold ml-1 transition-colors"
              >
                <span>{current.linkText}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Right Help / Contact Link - Desktop Only */}
        <div className="hidden lg:flex items-center gap-4 text-stone-400 text-[11px]">
          <Link href="/track-order" className="hover:text-stone-200 transition-colors">
            Track Order
          </Link>
          <span className="text-stone-700">•</span>
          <Link href="/contact" className="hover:text-stone-200 transition-colors">
            Help Center
          </Link>
        </div>

      </div>
    </div>
  );
}
