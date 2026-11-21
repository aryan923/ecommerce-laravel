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
    <section className="py-10 sm:py-14 bg-white/70 border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-amber-700/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-900 shrink-0 shadow-xs group-hover:scale-110 group-hover:bg-amber-200 transition-all duration-300">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-stone-900 tracking-tight group-hover:text-amber-900 transition-colors">
                    {badge.title}
                  </h5>
                  <p className="text-[11px] text-stone-500 mt-1 leading-relaxed font-medium">
                    {badge.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
