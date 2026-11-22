"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ArrowUpRight } from 'lucide-react';

const capsules = [
  {
    id: 'evening-edit',
    numeral: 'CAPSULE // 01',
    season: 'Evening Couture',
    badge: 'New Season',
    title: 'The Velvet & Silk Evening Edit',
    description: 'Floor-sweeping silhouettes, French Mulberry silks, and hand-embroidered evening pieces tailored for midnight galas.',
    itemCount: '24 Curated Pieces',
    href: '/products?category=women',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80',
    accent: 'from-amber-500/20 via-transparent to-stone-950/80',
    cta: 'Explore The Edit',
  },
  {
    id: 'horology-suite',
    numeral: 'CAPSULE // 02',
    season: 'Swiss Horology',
    badge: 'Certified Atelier',
    title: 'The Precision Horology Suite',
    description: 'Masterfully engineered automatic chronometers with scratch-resistant sapphire crystal and genuine alligator leather straps.',
    itemCount: '12 Exclusive Models',
    href: '/products?category=watches',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    accent: 'from-blue-500/20 via-transparent to-stone-950/80',
    cta: 'Discover Timepieces',
  },
  {
    id: 'leathercraft-edit',
    numeral: 'CAPSULE // 03',
    season: 'Artisanal Workshop',
    badge: 'Heritage Series',
    title: 'The Hand-Burnished Leather Edit',
    description: 'Vegetable-tanned full-grain Tuscan calfskin totes, luggage, and Blake-stitched loafers crafted in historic Florentine workshops.',
    itemCount: '18 Handcrafted Goods',
    href: '/products?category=handbags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
    accent: 'from-amber-600/20 via-transparent to-stone-950/80',
    cta: 'Inspect Leathercraft',
  },
];

export default function EditorialCapsules() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] border-b border-stone-200/60">
      <div className="max-w-7xl lg:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/5 border border-amber-900/10 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span className="text-[10px] font-extrabold tracking-widest text-amber-900 uppercase">
                Seasonal Capsules • Edition 2026
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              The Curated Edits
            </h2>
            <p className="text-xs text-stone-500 max-w-lg mt-1 font-medium">
              Three distinct aesthetic narratives crafted by our in-house atelier. Explore signature wardrobe and horology edits defining contemporary luxury.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-900 hover:text-amber-800 transition-colors uppercase tracking-wider group"
            >
              <span>View All Collections</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3-Column Editorial Capsule Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {capsules.map((capsule) => (
            <Link
              key={capsule.id}
              href={capsule.href}
              className="group relative h-[480px] sm:h-[540px] lg:h-[580px] rounded-3xl overflow-hidden border border-stone-300/80 shadow-md hover:shadow-2xl transition-all duration-700 flex flex-col justify-between p-6 sm:p-8 bg-stone-950"
            >
              {/* Background Photo with Smooth Parallax-like Zoom */}
              <Image
                src={capsule.image}
                alt={capsule.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center filter brightness-[0.88] contrast-[1.05] group-hover:scale-105 group-hover:brightness-[0.92] transition-all duration-1000 ease-out"
              />

              {/* Multi-layered Cinematic Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-stone-950/20 pointer-events-none" />
              <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />

              {/* Top Card Row: Numeral & Badge */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300 bg-stone-950/70 backdrop-blur-md border border-white/10 shadow-sm">
                  {capsule.numeral}
                </span>

                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase text-white bg-white/15 backdrop-blur-md border border-white/20">
                  {capsule.badge}
                </span>
              </div>

              {/* Bottom Card Content: Typography & Action */}
              <div className="relative z-10 space-y-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                      {capsule.season}
                    </span>
                    <span className="text-stone-400 text-xs">•</span>
                    <span className="text-[10px] font-mono text-stone-300 tracking-wide">
                      {capsule.itemCount}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-snug mt-1 group-hover:text-amber-100 transition-colors">
                    {capsule.title}
                  </h3>
                </div>

                <p className="text-xs text-stone-300/90 font-light leading-relaxed line-clamp-2">
                  {capsule.description}
                </p>

                {/* Call to Action Button */}
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-stone-950 text-xs font-bold uppercase tracking-wider group-hover:bg-amber-400 transition-colors shadow-lg">
                    <span>{capsule.cta}</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
