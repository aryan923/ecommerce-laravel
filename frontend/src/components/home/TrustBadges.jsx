"use client";

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Truck,
      title: 'Fast Delivery',
      subtitle: 'Quick and reliable shipping at your doorstep.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Payments',
      subtitle: 'Your payments are safe with us.',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      subtitle: 'Hassle-free returns within 30 days.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      subtitle: 'We’re here to help you anytime.',
    },
  ];

  return (
    <section className="py-12 bg-[#FAF9F6] border-t border-stone-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-white/60 border border-stone-200/60 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-800 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-bold text-stone-900">{badge.title}</h5>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{badge.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
