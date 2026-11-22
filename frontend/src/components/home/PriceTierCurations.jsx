"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Tag, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const tiers = [
  {
    id: 'tier-1',
    tier: 'TIER I',
    badge: 'Accessible Luxury',
    title: 'Curated Under ₹2,500',
    maxPrice: 2500,
    subtitle: 'Italian Nappa cardholders, Japanese titanium sunglasses, and silk accessories.',
    href: '/products?max_price=2500',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=80',
    itemsCount: '14 Pieces Available',
  },
  {
    id: 'tier-2',
    tier: 'TIER II',
    badge: 'Atelier Core',
    title: 'Curated Under ₹5,000',
    maxPrice: 5000,
    subtitle: 'Grade-A Mongolian cashmere knits, Mulberry cotton evening shirts, and artisanal footwear.',
    href: '/products?min_price=2500&max_price=5000',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=700&q=80',
    itemsCount: '22 Pieces Available',
  },
  {
    id: 'tier-3',
    tier: 'TIER III',
    badge: 'Statement Atelier',
    title: 'Curated Under ₹10,000',
    maxPrice: 10000,
    subtitle: 'Satin-lapel tailored dinner blazers, Tuscan calfskin totes, and pure silk gowns.',
    href: '/products?min_price=5000&max_price=10000',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=700&q=80',
    itemsCount: '18 Pieces Available',
  },
  {
    id: 'tier-4',
    tier: 'TIER IV',
    badge: 'Collector\'s Vault',
    title: 'Fine Investment Pieces',
    maxPrice: null,
    subtitle: 'Swiss-made automatic chronometers with sapphire crystal and 18k solid gold diamond jewelry.',
    href: '/products?min_price=10000',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80',
    itemsCount: 'Masterpiece Series',
  },
];

export default function PriceTierCurations() {
  const { formatPrice } = useCurrency();

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-2">
              <Tag className="w-3.5 h-3.5 text-amber-800" />
              <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
                Acquisition by Spending Tier
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Curated by Price Threshold
            </h2>
            <p className="text-xs text-stone-500 max-w-lg mt-1 font-medium">
              Explore authentic luxury pieces tailored to your preferred acquisition tier. Meticulously handcrafted by our partner maisons.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 hover:text-amber-800 transition-colors uppercase tracking-wider group"
            >
              <span>Explore All Tiers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 4-Column Tier Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className="group relative h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-stone-300/80 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between p-6 bg-stone-950 block"
            >
              {/* Background Product Image */}
              <Image
                src={t.image}
                alt={t.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center filter brightness-[0.82] contrast-[1.05] group-hover:scale-105 group-hover:brightness-[0.88] transition-all duration-700 ease-out"
              />

              {/* Multi-layer Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20 pointer-events-none" />

              {/* Top Row: Tier Tag & Badge */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase text-amber-300 bg-stone-950/80 backdrop-blur-md border border-white/10">
                  {t.tier}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase text-white bg-white/15 backdrop-blur-md border border-white/20">
                  {t.badge}
                </span>
              </div>

              {/* Bottom Row: Typography & Action */}
              <div className="relative z-10 space-y-2.5">
                <div>
                  <span className="text-[10px] font-mono text-stone-300 tracking-wide block">
                    {t.itemsCount}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-normal leading-snug group-hover:text-amber-200 transition-colors">
                    {t.title}
                  </h3>
                </div>

                <p className="text-[11px] text-stone-300/90 font-light leading-relaxed line-clamp-2">
                  {t.subtitle}
                </p>

                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-950 text-[11px] font-bold uppercase tracking-wider group-hover:bg-amber-400 transition-colors shadow-md">
                    <span>Inspect Tier</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
